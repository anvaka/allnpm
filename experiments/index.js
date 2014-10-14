var nodePositions = [];
var links = [];
download("/positions.bin", function(buffer) {
  var positions = new Int32Array(buffer);

  for (var i = 0; i < positions.length; i += 3) {
    nodePositions.push({
      x: positions[i],
      y: positions[i + 1],
      z: positions[i + 2]
    });
  }
  renderNodes(nodePositions);
});

download('./links.bin', function(buffer) {
  var results = [];
  var arr = new Int32Array(buffer);
  var lastFromId;
  for (var i = 0; i < arr.length; i++) {
    var id = arr[i];
    if (id < 0) {
      id *= -1;
      id -= 1;
      lastFromId = id;
    } else {
      var fromNode = nodePositions[lastFromId];
      var toNode = nodePositions[id];
      results.push([fromNode.x, fromNode.y, fromNode.z, toNode.x, toNode.y, toNode.z]);
    }
  }
  renderLinks(results);
});

var scene = new THREE.Scene();

function renderLinks(links) {
  var geometry = new THREE.BufferGeometry();
  var material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors
  });

  var positions = new Float32Array(links.length * 6);
  var colors = new Float32Array(links.length * 6);
  var r = 8000;
  for (var i = 0; i < links.length; ++i) {
    var link = links[i];

    positions[i * 6] = link[0];
    positions[i * 6 + 1] = link[1];
    positions[i * 6 + 2] = link[2];
    positions[i * 6 + 3] = link[3];
    positions[i * 6 + 4] = link[4];
    positions[i * 6 + 5] = link[5];

    colors[i * 6] = link[0] / r + 0.5;
    colors[i * 6 + 1] = link[1] / r + 0.5;
    colors[i * 6 + 2] = link[2] / r + 0.5;
    colors[i * 6 + 3] = link[3] / r + 0.5;
    colors[i * 6 + 4] = link[4] / r + 0.5;
    colors[i * 6 + 5] = link[5] / r + 0.5;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  mesh = new THREE.Line(geometry, material, THREE.LinePieces);
  scene.add(mesh);
}

function renderNodes(positions) {
  scene.sortObjects = false;
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  var lastAdded = 0;

  camera.position.z = 9000;
  camera.position.x = 9000;
  camera.position.y = 9000;
  camera.lookAt(new THREE.Vector3(1, 0, 0));

  var geometry = new THREE.BufferGeometry();

  var total = positions.length;
  var points = new Float32Array(total * 3);
  var colors = new Float32Array(total * 3);

  var color = new THREE.Color();
  for (var i = 0; i < total; i += 3) {
    points[i] = positions[i / 3].x;
    points[i + 1] = positions[i / 3].y;
    points[i + 2] = positions[i / 3].z;
    colors[i] = 0xff;
    colors[i + 1] = 0xff;
    colors[i + 2] = 0xff;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  var material = new THREE.PointCloudMaterial({
    size: 15,
    vertexColors: THREE.VertexColors
  });

  particleSystem = new THREE.PointCloud(geometry, material);
  scene.add(particleSystem);

  controls = new THREE.FirstPersonControls(camera);

  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;

  var clock = new THREE.Clock();
  animate();

  function animate() {
    requestAnimationFrame(animate);

    controls.update(clock.getDelta());
    renderer.render(scene, camera);
  }
}

function download(fileName, done) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", fileName, true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function(oEvent) {
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if (arrayBuffer) {
      done(arrayBuffer);

    }
  };

  oReq.send(null);
}

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function(object, domElement) {

  this.object = object;
  this.target = new THREE.Vector3(0, 0, 0);

  this.domElement = (domElement !== undefined) ? domElement : document;

  this.movementSpeed = 1.0;
  this.lookSpeed = 0.005;

  this.lookVertical = true;
  this.autoForward = false;
  // this.invertVertical = false;

  this.activeLook = true;

  this.heightSpeed = false;
  this.heightCoef = 1.0;
  this.heightMin = 0.0;
  this.heightMax = 1.0;

  this.constrainVertical = false;
  this.verticalMin = 0;
  this.verticalMax = Math.PI;

  this.autoSpeedFactor = 0.0;

  this.mouseX = 0;
  this.mouseY = 0;

  this.lat = 0;
  this.lon = 0;
  this.phi = 0;
  this.theta = 0;

  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.freeze = false;

  this.mouseDragOn = false;

  this.viewHalfX = 0;
  this.viewHalfY = 0;

  if (this.domElement !== document) {

    this.domElement.setAttribute('tabindex', -1);

  }

  //

  this.handleResize = function() {

    if (this.domElement === document) {

      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;

    } else {

      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;

    }

  };

  this.onMouseDown = function(event) {

    if (this.domElement !== document) {

      this.domElement.focus();

    }

    event.preventDefault();
    event.stopPropagation();

    if (this.activeLook) {

      switch (event.button) {

        case 0:
          this.moveForward = true;
          break;
        case 2:
          this.moveBackward = true;
          break;

      }

    }

    this.mouseDragOn = true;

  };

  this.onMouseUp = function(event) {

    event.preventDefault();
    event.stopPropagation();

    if (this.activeLook) {

      switch (event.button) {

        case 0:
          this.moveForward = false;
          break;
        case 2:
          this.moveBackward = false;
          break;

      }

    }

    this.mouseDragOn = false;

  };

  this.onMouseMove = function(event) {

    if (this.domElement === document) {

      this.mouseX = event.pageX - this.viewHalfX;
      this.mouseY = event.pageY - this.viewHalfY;

    } else {

      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

    }

  };

  this.onKeyDown = function(event) {

    //event.preventDefault();

    switch (event.keyCode) {

      case 38:
        /*up*/
      case 87:
        /*W*/
        this.moveForward = true;
        break;

      case 37:
        /*left*/
      case 65:
        /*A*/
        this.moveLeft = true;
        break;

      case 40:
        /*down*/
      case 83:
        /*S*/
        this.moveBackward = true;
        break;

      case 39:
        /*right*/
      case 68:
        /*D*/
        this.moveRight = true;
        break;

      case 82:
        /*R*/
        this.moveUp = true;
        break;
      case 70:
        /*F*/
        this.moveDown = true;
        break;

      case 81:
        /*Q*/
        this.freeze = !this.freeze;
        break;

    }

  };

  this.onKeyUp = function(event) {

    switch (event.keyCode) {

      case 38:
        /*up*/
      case 87:
        /*W*/
        this.moveForward = false;
        break;

      case 37:
        /*left*/
      case 65:
        /*A*/
        this.moveLeft = false;
        break;

      case 40:
        /*down*/
      case 83:
        /*S*/
        this.moveBackward = false;
        break;

      case 39:
        /*right*/
      case 68:
        /*D*/
        this.moveRight = false;
        break;

      case 82:
        /*R*/
        this.moveUp = false;
        break;
      case 70:
        /*F*/
        this.moveDown = false;
        break;

    }

  };

  this.update = function(delta) {

    if (this.freeze) {

      return;

    }

    if (this.heightSpeed) {

      var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
      var heightDelta = y - this.heightMin;

      this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);

    } else {

      this.autoSpeedFactor = 0.0;

    }

    var actualMoveSpeed = delta * this.movementSpeed;

    if (this.moveForward || (this.autoForward && !this.moveBackward)) this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
    if (this.moveBackward) this.object.translateZ(actualMoveSpeed);

    if (this.moveLeft) this.object.translateX(-actualMoveSpeed);
    if (this.moveRight) this.object.translateX(actualMoveSpeed);

    if (this.moveUp) this.object.translateY(actualMoveSpeed);
    if (this.moveDown) this.object.translateY(-actualMoveSpeed);

    var actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {

      actualLookSpeed = 0;

    }

    var verticalLookRatio = 1;

    if (this.constrainVertical) {

      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

    }

    this.lon += this.mouseX * actualLookSpeed;
    if (this.lookVertical) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.Math.degToRad(90 - this.lat);

    this.theta = THREE.Math.degToRad(this.lon);

    if (this.constrainVertical) {

      this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);

    }

    var targetPosition = this.target,
      position = this.object.position;

    targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
    targetPosition.y = position.y + 100 * Math.cos(this.phi);
    targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

    this.object.lookAt(targetPosition);

  };


  this.domElement.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  }, false);

  this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
  this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
  this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);

  window.addEventListener('keydown', bind(this, this.onKeyDown), false);
  window.addEventListener('keyup', bind(this, this.onKeyUp), false);

  function bind(scope, fn) {

    return function() {

      fn.apply(scope, arguments);

    };

  };

  this.handleResize();

};

function Trackball(object, domElement) {
  var _this = this;
  var STATE = {
    NONE: -1,
    ROTATE: 0,
    ZOOM: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_ZOOM: 4,
    TOUCH_PAN: 5
  };

  this.object = object;
  this.domElement = (domElement !== undefined) ? domElement : document;

  // API

  this.enabled = true;

  this.screen = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  };

  this.rotateSpeed = 1.0;
  this.zoomSpeed = 1.2;
  this.panSpeed = 0.3;

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;
  this.noRoll = false;

  this.staticMoving = false;
  this.dynamicDampingFactor = 0.2;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [65 /*A*/ , 83 /*S*/ , 68 /*D*/ ];

  // internals

  this.target = new THREE.Vector3();

  var EPS = 0.000001;

  var lastPosition = new THREE.Vector3();

  var _state = STATE.NONE,
    _prevState = STATE.NONE,

    _eye = new THREE.Vector3(),

    _rotateStart = new THREE.Vector3(),
    _rotateEnd = new THREE.Vector3(),

    _zoomStart = new THREE.Vector2(),
    _zoomEnd = new THREE.Vector2(),

    _touchZoomDistanceStart = 0,
    _touchZoomDistanceEnd = 0,

    _panStart = new THREE.Vector2(),
    _panEnd = new THREE.Vector2();

  // for reset

  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.up0 = this.object.up.clone();

  // events

  var changeEvent = {
    type: 'change'
  };
  var startEvent = {
    type: 'start'
  };
  var endEvent = {
    type: 'end'
  };


  // methods

  this.handleResize = function() {

    if (this.domElement === document) {

      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;

    } else {

      var box = this.domElement.getBoundingClientRect();
      // adjustments come from similar code in the jquery offset() function
      var d = this.domElement.ownerDocument.documentElement;
      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
      this.screen.top = box.top + window.pageYOffset - d.clientTop;
      this.screen.width = box.width;
      this.screen.height = box.height;

    }

  };

  this.handleEvent = function(event) {

    if (typeof this[event.type] == 'function') {

      this[event.type](event);

    }

  };

  this.getMouseOnScreen = function(pageX, pageY, vector) {

    return vector.set(
      (pageX - _this.screen.left) / _this.screen.width, (pageY - _this.screen.top) / _this.screen.height
    );

  };

  this.getMouseProjectionOnBall = (function() {

    var objectUp = new THREE.Vector3(),
      mouseOnBall = new THREE.Vector3();


    return function(pageX, pageY, projection) {

      mouseOnBall.set(
        (pageX - _this.screen.width * 0.5 - _this.screen.left) / (_this.screen.width * 0.5), (_this.screen.height * 0.5 + _this.screen.top - pageY) / (_this.screen.height * 0.5),
        0.0
      );

      var length = mouseOnBall.length();

      if (_this.noRoll) {

        if (length < Math.SQRT1_2) {

          mouseOnBall.z = Math.sqrt(1.0 - length * length);

        } else {
          mouseOnBall.z = 0.5 / length;
        }

      } else if (length > 1.0) {

        mouseOnBall.normalize();

      } else {

        mouseOnBall.z = Math.sqrt(1.0 - length * length);

      }

      _eye.copy(_this.object.position).sub(_this.target);

      projection.copy(_this.object.up).setLength(mouseOnBall.y);
      projection.add(objectUp.copy(_this.object.up).cross(_eye).setLength(mouseOnBall.x));
      projection.add(_eye.setLength(mouseOnBall.z));

      return projection;
    };

  }());

  this.rotateCamera = (function() {

    var axis = new THREE.Vector3(),
      quaternion = new THREE.Quaternion();


    return function() {

      var angle = Math.acos(_rotateStart.dot(_rotateEnd) / _rotateStart.length() / _rotateEnd.length());

      if (angle) {

        axis.crossVectors(_rotateStart, _rotateEnd).normalize();

        angle *= _this.rotateSpeed;

        quaternion.setFromAxisAngle(axis, -angle);

        _eye.applyQuaternion(quaternion);
        _this.object.up.applyQuaternion(quaternion);

        _rotateEnd.applyQuaternion(quaternion);

        if (_this.staticMoving) {

          _rotateStart.copy(_rotateEnd);

        } else {

          quaternion.setFromAxisAngle(axis, angle * (_this.dynamicDampingFactor - 1.0));
          _rotateStart.applyQuaternion(quaternion);

        }

      }
    };

  }());

  this.zoomCamera = function() {
    var factor;

    if (_state === STATE.TOUCH_ZOOM) {

      factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
      _touchZoomDistanceStart = _touchZoomDistanceEnd;
      _eye.multiplyScalar(factor);

    } else {

      factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;

      if (factor !== 1.0 && factor > 0.0) {

        _eye.multiplyScalar(factor);

        if (_this.staticMoving) {

          _zoomStart.copy(_zoomEnd);

        } else {

          _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;

        }

      }

    }

  };

  this.panCamera = (function() {

    var mouseChange = new THREE.Vector2(),
      objectUp = new THREE.Vector3(),
      pan = new THREE.Vector3();

    return function() {

      mouseChange.copy(_panEnd).sub(_panStart);

      if (mouseChange.lengthSq()) {

        mouseChange.multiplyScalar(_eye.length() * _this.panSpeed);

        pan.copy(_eye).cross(_this.object.up).setLength(mouseChange.x);
        pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));

        _this.object.position.add(pan);
        _this.target.add(pan);

        if (_this.staticMoving) {

          _panStart.copy(_panEnd);

        } else {

          _panStart.add(mouseChange.subVectors(_panEnd, _panStart).multiplyScalar(_this.dynamicDampingFactor));

        }

      }
    };

  }());

  this.checkDistances = function() {

    if (!_this.noZoom || !_this.noPan) {

      if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {

        _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));

      }

      if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {

        _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));

      }

    }

  };

  this.update = function() {

    _eye.subVectors(_this.object.position, _this.target);

    if (!_this.noRotate) {

      _this.rotateCamera();

    }

    if (!_this.noZoom) {

      _this.zoomCamera();

    }

    if (!_this.noPan) {

      _this.panCamera();

    }

    _this.object.position.addVectors(_this.target, _eye);

    _this.checkDistances();

    _this.object.lookAt(_this.target);

    if (lastPosition.distanceToSquared(_this.object.position) > EPS) {

      _this.dispatchEvent(changeEvent);

      lastPosition.copy(_this.object.position);

    }

  };

  this.reset = function() {

    _state = STATE.NONE;
    _prevState = STATE.NONE;

    _this.target.copy(_this.target0);
    _this.object.position.copy(_this.position0);
    _this.object.up.copy(_this.up0);

    _eye.subVectors(_this.object.position, _this.target);

    _this.object.lookAt(_this.target);

    _this.dispatchEvent(changeEvent);

    lastPosition.copy(_this.object.position);

  };

  // listeners

  function keydown(event) {

    if (_this.enabled === false) return;

    window.removeEventListener('keydown', keydown);

    _prevState = _state;

    if (_state !== STATE.NONE) {

      return;

    } else if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noRotate) {

      _state = STATE.ROTATE;

    } else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {

      _state = STATE.ZOOM;

    } else if (event.keyCode === _this.keys[STATE.PAN] && !_this.noPan) {

      _state = STATE.PAN;

    }

  }

  function keyup(event) {

    if (_this.enabled === false) return;

    _state = _prevState;

    window.addEventListener('keydown', keydown, false);

  }

  function mousedown(event) {

    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    if (_state === STATE.NONE) {

      _state = event.button;

    }

    if (_state === STATE.ROTATE && !_this.noRotate) {

      _this.getMouseProjectionOnBall(event.pageX, event.pageY, _rotateStart);
      _rotateEnd.copy(_rotateStart);

    } else if (_state === STATE.ZOOM && !_this.noZoom) {

      _this.getMouseOnScreen(event.pageX, event.pageY, _zoomStart);
      _zoomEnd.copy(_zoomStart);

    } else if (_state === STATE.PAN && !_this.noPan) {

      _this.getMouseOnScreen(event.pageX, event.pageY, _panStart);
      _panEnd.copy(_panStart);

    }

    document.addEventListener('mousemove', mousemove, false);
    document.addEventListener('mouseup', mouseup, false);
    _this.dispatchEvent(startEvent);
  }

  function mousemove(event) {

    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    if (_state === STATE.ROTATE && !_this.noRotate) {

      _this.getMouseProjectionOnBall(event.pageX, event.pageY, _rotateEnd);

    } else if (_state === STATE.ZOOM && !_this.noZoom) {

      _this.getMouseOnScreen(event.pageX, event.pageY, _zoomEnd);

    } else if (_state === STATE.PAN && !_this.noPan) {

      _this.getMouseOnScreen(event.pageX, event.pageY, _panEnd);

    }

  }

  function mouseup(event) {

    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    _state = STATE.NONE;

    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    _this.dispatchEvent(endEvent);

  }

  function mousewheel(event) {

    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    var delta = 0;

    if (event.wheelDelta) { // WebKit / Opera / Explorer 9

      delta = event.wheelDelta / 40;

    } else if (event.detail) { // Firefox

      delta = -event.detail / 3;

    }

    _zoomStart.y += delta * 0.01;
    _this.dispatchEvent(startEvent);
    _this.dispatchEvent(endEvent);

  }

  function touchstart(event) {

    if (_this.enabled === false) return;

    switch (event.touches.length) {

      case 1:
        _state = STATE.TOUCH_ROTATE;
        _rotateEnd.copy(_this.getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY, _rotateStart));
        break;

      case 2:
        _state = STATE.TOUCH_ZOOM;
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
        break;

      case 3:
        _state = STATE.TOUCH_PAN;
        _panEnd.copy(_this.getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY, _panStart));
        break;

      default:
        _state = STATE.NONE;

    }
    _this.dispatchEvent(startEvent);


  }

  function touchmove(event) {

    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {

      case 1:
        _this.getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY, _rotateEnd);
        break;

      case 2:
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
        break;

      case 3:
        _this.getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY, _panEnd);
        break;

      default:
        _state = STATE.NONE;

    }

  }

  function touchend(event) {

    if (_this.enabled === false) return;

    switch (event.touches.length) {

      case 1:
        _rotateStart.copy(_this.getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY, _rotateEnd));
        break;

      case 2:
        _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
        break;

      case 3:
        _panStart.copy(_this.getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY, _panEnd));
        break;

    }

    _state = STATE.NONE;
    _this.dispatchEvent(endEvent);

  }

  this.domElement.addEventListener('contextmenu', preventEvent, false);

  this.domElement.addEventListener('mousedown', mousedown, false);

  this.domElement.addEventListener('mousewheel', mousewheel, false);
  this.domElement.addEventListener('DOMMouseScroll', mousewheel, false); // firefox

  this.domElement.addEventListener('touchstart', touchstart, false);
  this.domElement.addEventListener('touchend', touchend, false);
  this.domElement.addEventListener('touchmove', touchmove, false);

  window.addEventListener('keydown', keydown, false);
  window.addEventListener('keyup', keyup, false);

  this.dispose = function() {
    var domElement = _this.domElement;
    domElement.removeEventListener('contextmenu', preventEvent);
    domElement.removeEventListener('mousedown', mousedown);
    domElement.removeEventListener('mousewheel', mousewheel);
    domElement.removeEventListener('DOMMouseScroll', mousewheel);
    domElement.removeEventListener('touchstart', touchstart);
    domElement.removeEventListener('touchend', touchend);
    domElement.removeEventListener('touchmove', touchmove);

    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
  };

  this.handleResize();

  // force an update at start
  this.update();
}

function preventEvent(event) {
  event.preventDefault();
}

Trackball.prototype = Object.create(THREE.EventDispatcher.prototype);

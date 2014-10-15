var nodePositions = [];
var links = [];
var scene = new THREE.Scene();
scene.sortObjects = false;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
var renderer = new THREE.WebGLRenderer();
var particleSystem;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 9000;
camera.position.x = 9000;
camera.position.y = 9000;
camera.lookAt(new THREE.Vector3(1, 0, 0));
var allLabels;

controls = new THREE.FirstPersonControls(camera);

controls.movementSpeed = 1000;
controls.lookSpeed = 0.125;
controls.lookVertical = true;
var mouse = {
  x: 0,
  y: 0
};
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
raycaster.params.PointCloud.threshold = 10;
var clock = new THREE.Clock();
document.addEventListener('mousemove', onDocumentMouseMove, false);
animate();

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

var seenPositions = {};

download("/positions.bin", function(buffer) {
  var positions = new Int32Array(buffer);

  for (var i = 0; i < positions.length; i += 3) {
    var pos = {
      x: positions[i],
      y: positions[i + 1],
      z: positions[i + 2]
    };
    nodePositions.push(pos);
    var key = pos.x + '' + pos.y + '' + pos.z;
    seenPositions[key] = 1;
  }
  //renderNodes(nodePositions);
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

  //renderLinks(results);
});

downloadJson('./labels.json', function(labels) {
  allLabels = labels;
  renderNodes(nodePositions)
});

function animate() {
  requestAnimationFrame(animate);

  controls.update(clock.getDelta());
  renderer.render(scene, camera);


  if (particleSystem) {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.1);
    projector.unprojectVector(vector, camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    intersects = raycaster.intersectObject(particleSystem);

    if (intersects.length > 0) {
      console.log('intersecti ', intersects[0].index);
    }
  }
}

function renderLinks(links) {
  var geometry = new THREE.BufferGeometry();
  var material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors
  });

  var positions = new Float32Array(links.length * 6);
  var colors = new Float32Array(links.length * 6);
  var r = 16000;
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
  var geometry = new THREE.BufferGeometry();

  var total = positions.length;
  var points = new Float32Array(total * 3);
  var colors = new Float32Array(total * 3);

  var color = new THREE.Color();
  debugger;
  for (var i = 0; i < total; i++) {
    var idx = i * 3;
    points[idx] = positions[i].x;
    points[idx + 1] = positions[i].y;
    points[idx + 2] = positions[i].z;
    colors[idx] = 0xff;
    colors[idx + 1] = 0xff;
    colors[idx + 2] = 0xff;
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

function downloadJson(filename, done) {
  var oreq = new XMLHttpRequest();
  oreq.open("get", filename, true);

  oreq.onload = function(oevent) {
    done(JSON.parse(oreq.responseText));
  };

  oreq.send(null);
}

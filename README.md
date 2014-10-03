# allnpm

Graph generator of entire npm registry. See actual visualization here: [NPM Universe](http://anvaka.github.io/allnpmviz.an/)

<a href="http://anvaka.github.io/allnpmviz.an/" target="_blank"><img src="https://raw.github.com/anvaka/allnpmviz.an/master/assets/npm_mar_2014.png" width='233px'/></a>

[![npm march 2014](https://raw.github.com/anvaka/allnpmviz.an/master/assets/all_npm_asteroids_field.png)](http://anvaka.github.io/allnpmviz.an/)

Use mouse wheel to zoom in/zoom out.

# how to use it?

1. Download npm metadata using `downloadGraph.sh` file. If you don't have wget simply save response to `byField` file. I do not list url directly here, since response is huge (~124MB).
2. Convert response to graph: `node convertToGraph.js byField > graph.out`
3. Run layouter: `node layout.js graph.out`. This will take you a while. Layouter saves each 60th iteration into a `.pos` file.
4. Once you get 100-200 iterations saved (takes approximately 3-4 hours) you can cancel layouter (ctrl + c).
5. Flatten the graph into data file: `node flatten.js byField 100.pos > graph.js`

Now `graph.js` contains information about graph nodes/positions. Each element in the array represents a node:

```
{"id":"pkgName","pos":{"x":-63,"y":681},"a":"Author","d":[dependency1, dependency2, ...]}
```

The format is targeted to miminize file size. It could be made even smaller via binary adjacency list. For now I keep it human readable.


# license

MIT

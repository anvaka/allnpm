# allnpm

Graph generator for entire npm registry. 

# how to use it?

1. Download npm metadata using `downloadGraph.sh` file. If you don't have wget simply save response to `byField` file. I do not list url directly here, since response is huge (~122MB).
2. Convert response to graph: `node convertToGraph.js byField > graph.out`
3. Run layouter: `node layout.js graph.out`. This will take you a while. Layouter saves each 60th iteration into a `.pos` file. **NOTE** Quad tree has [a bug](https://github.com/anvaka/ngraph.quadtreebh/issues/1) which makes it stuck in infinite loop. See referenced issue for a temporary workaround.
4. Once you get 100-200 iterations saved (takes approximately 3-4 hours) you can cancel layouter (ctrl + c).
5. Flatten the graph into data file: `node flatten.js byField 100.pos > graph.js`

Now `graph.js` contains information about graph nodes/positions. Each element in the array represents a node:

```
{"id":"pkgName","pos":{"x":-63,"y":681},"a":"Author","d":[dependency1, dependency2, ...]}
```

The format is target to miminize file size. It could be stored even smaller via binary adjacency list. For now I keep it human readable.


# license

MIT

# allnpm

Graph generator of entire npm registry.

You can see this data used in the [anvaka/allnpmviz3d](https://github.com/anvaka/allnpmviz3d)
and [anvaka/pm](https://github.com/anvaka/pm)

# indexing npm

```
git clone https://github.com/anvaka/allnpm
cd allnpm
npm install
```

This will set everything up. Now we are ready to index and layout:

1. Download npm metadata using `downloadGraph.sh` file. If you don't have wget
simply save response to `byField` file. I do not list url directly here, since
response is huge (more than 388MB).
2. Run the layouter: `node layout.js`. This will take a while (~1-2 hours).
3. Produced files `["labels.json", "links.bin", "positions.bin"]` could be placed into
[galactic-data](https://github.com/anvaka/pm#data-format).

# images

![Main cluster](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/npm-all.png)
![Main cluster - no links](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/mushrooms.png)


# license

MIT

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

## Downloading npm data

Unfortunately we can no longer access `https://skimdb.npmjs.com/registry/_design/scratch/_view/byField`
directly. This CouchDB view used to return every single package from npm, that could be used
to construct the graph.

To get all npm packages we have to replicate the entire npm repository using standalone
instance of CouchDB and following instructions from https://www.npmjs.com/package/npm-registry-couchapp.

The process took me ~2 days and ~300GB of hard drive, until local instance of CouchDB compacted
its views. After compaction the disk usage went down to ~100GB.

Note: it is not enough to just replicate, need to wait until all indexes are generated.

Once the replication is complete you can do 

```
wget http://admin:password@127.0.0.1:5984/registry/_design/scratch/_view/byField
```

In November 2020, this produced `3.3GB` of npm packages and saved it into `byField` file.

## Running layout

Now that we got the `byField` file, it's time for layout.

1. Run the layouter: `node layout.js`. This will take a while (I left it running overnight).
2. Produced files `["labels.json", "links.bin", "positions.bin"]` could be placed into
[galactic-data](https://github.com/anvaka/pm#data-format).

# images

![Main cluster](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/npm-all.png)
![Main cluster - no links](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/mushrooms.png)


# license

MIT

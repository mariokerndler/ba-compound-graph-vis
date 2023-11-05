# Visualizing Compound Graphs as Set-Typed Data 

Developed as part of my bachelor thesis. 

## Technical overview

Build with Svelte + Typescript + Vite. 

#### Install dependencies 
```shell
npm install
```

#### Run the application
```shell
npm run dev 
```

#### Run the tests
```shell
npm run test 
```

## Data format

The data consists of edge lists in form of csv-files. Each csv-file is representing one set. The title of the file is the set name. The data inside the csv should look like the following:
```csv
vertex_a,vertex_b,edge
11670,110695,3
11670,11669,3
11670,11671,3
11670,56752,3
11670,72535,3
621603,110695,3
```
`vertex_a` and `vertex_b` depict an edge going from one vertex to another. `edge` is the type of the edge (not yet in use).

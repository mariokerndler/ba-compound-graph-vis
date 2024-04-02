import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import type { IImport } from "./IImport";

export class MealDataImporter implements IImport {
  importData(data: Map<string, string>): Promise<Graph> {
    if (data.get("meals") === undefined)
      Error("Meal file for meal data is required.");

    const graph: Graph = {
      name: "Recipe-Graph",
      vertices: [],
      edges: [],
      sets: [],
    };

    const areaFile = data.get("areas");
    if (!areaFile) {
      console.error("Area file for meal data is required.");
      return new Promise((resolve) => resolve(graph));
    }
    const areas: string[] = JSON.parse(areaFile);

    const recipeFile = data.get("meals");
    if (!recipeFile) {
      console.error("Meals file for meal data is required.");
      return new Promise((resolve) => resolve(graph));
    }
    const recipeCollection: RecipeCollection = JSON.parse(recipeFile);

    const sets = this.parseSets(areas);
    sets.forEach((s) => graph.sets.push(s));

    // Create vertices
    const recipeArray: Recipe[] = [];
    for (const recipeName in recipeCollection) {
      if (recipeCollection.hasOwnProperty(recipeName)) {
        const r = recipeCollection[recipeName];
        this.parseRecipe(r, graph);
        recipeArray.push(r);
      }
    }

    this.parseEdges(recipeArray, graph);

    return new Promise((resolve) => {
      resolve(graph);
    });
  }

  private parseSets(areas: string[]): Graph[] {
    const graphs: Graph[] = [];

    areas.forEach((a) => {
      graphs.push({
        name: a,
        vertices: [],
        edges: [],
        sets: [],
      });
    });

    return graphs;
  }

  private parseRecipe(recipe: Recipe, graph: Graph) {
    // Create vertex from recipe
    const vertex: GraphVertex = {
      name: recipe.name,
      sets: [recipe.area],
      neighbours: [],
    };

    // Add vertex to set
    graph.sets.find((s) => s.name === recipe.area)?.vertices.push(vertex);

    // Add vertex to global graph
    graph.vertices.push(vertex);
  }

  private parseEdges(recipeArray: Recipe[], graph: Graph) {
    recipeArray.forEach((recipe) => {
      recipe.ingredients.forEach((i) => {
        //const foundOther = recipeArray.find((r) => this.recipeIncludesIngredient(r, i) && r.name !== recipe.name);

        const foundOthers = recipeArray.filter(
          (r) => this.recipeIncludesIngredient(r, i) && r.name !== recipe.name,
        );
        //if (i === "Soy Sauce" && recipe.area === "Japanese") console.log(foundOthers);

        foundOthers.forEach((foundOther) => {
          //if (i === "Soy Sauce" && recipe.area === "Japanese") console.log(recipe.name + " -> " + foundOther.name + ", Ing: " + i);

          if (!this.graphHasEdge(graph, recipe.name, foundOther.name)) {
            const source = graph.vertices.find((v) => v.name === recipe.name);
            const target = graph.vertices.find(
              (v) => v.name === foundOther.name,
            );

            if (!source || !target) {
              return;
            }

            const edge: GraphEdge = {
              source: source,
              target: target,
              edge: "",
              distance: Math.random(),
              set: recipe.area,
            };

            source.neighbours.push(target.name);
            target.neighbours.push(source.name);

            graph.edges.push(edge);

            graph.sets.find((s) => s.name === recipe.area)?.edges.push(edge);
            graph.sets
              .find((s) => s.name === foundOther.area)
              ?.edges.push(edge);
          }
        });
      });
    });
  }

  private recipeIncludesIngredient(
    recipe: Recipe,
    ingredient: string,
  ): boolean {
    let hasIngredient = false;

    recipe.ingredients.forEach((i) => {
      if (i === ingredient) {
        hasIngredient = true;
        return;
      }
    });

    return hasIngredient;
  }

  private graphHasEdge(graph: Graph, source: string, target: string): boolean {
    return (
      graph.edges.find(
        (e) =>
          (e.source.name === source && e.target.name === target) ||
          (e.source.name === target && e.target.name === source),
      ) !== undefined
    );
  }
}

interface Recipe {
  category: string;
  ingredients: string[];
  name: string;
  area: string;
}

interface RecipeCollection {
  [key: string]: Recipe;
}

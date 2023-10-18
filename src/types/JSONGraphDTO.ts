export interface JSONGraphDTO {
    vertices: Vertex[];
    edges: Edge[];
    sets: Set[];
}

export interface Vertex {
    id: number;
    data: any;
}

export interface Edge {
    source: number;
    target: number;
}

export interface Set {
    name: string;
    members: number[];
}

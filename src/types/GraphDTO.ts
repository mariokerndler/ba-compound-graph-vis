export namespace Import {
  export type NodeDTO = {
    id: string;
    group: number;
  };

  export type LinkDTO = {
    source: string;
    target: string;
    value: number;
  };

  export type GraphDTO = {
    nodes: NodeDTO[];
    links: LinkDTO[];
  };
}

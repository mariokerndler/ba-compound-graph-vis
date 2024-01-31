export interface EgoNetNode {
  readonly parent: EgoNetNode | null;
  readonly children: EgoNetNode[];
  readonly name: string;
  readonly distanceToParent: number;
  index?: number;
  x?: number;
}

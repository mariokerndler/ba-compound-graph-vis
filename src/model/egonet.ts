export interface EgoNetNode {
  readonly parent: EgoNetNode | null;
  readonly children: EgoNetNode[];
  readonly name: String;
}

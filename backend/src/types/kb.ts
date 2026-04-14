export interface KB {
  // different env has different namespace
  namespace: string;

  // name of the file ex: policy.pdf
  source: string;
  chunkId: number;
  text: string;

  //store in mongo atlas for vector search
  // dimenson 1536
  embedding: number[];
}

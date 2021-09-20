export interface Passage {
  source: string;
  text: string;
}

function PassageFromString(source: string): Passage | Error {
  const src = source;

  const textRows: string[] = [];
  for (const row of src.split("\n")) {
    if (row.startsWith("//")) {
      // a comment
      continue;
    }

    // TODO Annotation part

    // text part
    textRows.push(row.slice());
  }

  return { source: src, text: textRows.join("") };
}

export type Stlap = Passage[];

export function parse(source: string): Passage[] | Error {
  const output: Passage[] = [];
  for (const src of source.split(/\n\n*\n/)) {
    const passage = PassageFromString(src);
    if (passage instanceof Error) {
      return passage;
    }

    output.push(passage);
  }
  return output;
}

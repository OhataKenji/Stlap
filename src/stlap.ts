export interface Passage {
  source: string;
  text: string;
  lines: string;
}

function PassageFromString(source: string): Passage | Error {
  const src = source;

  const textRows: string[] = [];
  const lines: string[] = [];
  for (const row of src.split("\n")) {
    if (row.startsWith("//")) {
      // a comment
      continue;
    }

    // TODO Annotation part

    // text part
    textRows.push(row.slice());

    // line part
    if (row.startsWith("「")) {
      if (!row.endsWith("」")) {
        return Error("「」 Not match");
      }
      lines.push(row.slice(1, -1));
    }
  }

  return { source: src, text: textRows.join(""), lines: lines.join("") };
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

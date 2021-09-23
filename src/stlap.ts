export class Passage {
  source: string;
  text: string;

  constructor(source: string, text: string) {
    this.source = source;
    this.text = text;
  }

  static fromString(source: string): Passage | Error {
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
}

export class Stlap {
  story: Passage[];
  constructor(story: Passage[]) {
    this.story = story;
  }

  static fromString(source: string): Stlap | Error {
    const output: Passage[] = [];
    for (const src of source.split(/\n\n*\n/)) {
      const passage = Passage.fromString(src);
      if (passage instanceof Error) {
        return passage;
      }

      output.push(passage);
    }
    return new Stlap(output);
  }

  toText(): string {
    const key = "text";
    return this.story.map((p) => p[key]).join("\n\n");
  }
}

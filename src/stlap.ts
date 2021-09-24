export class Flag {
  readonly name: string;
  private type = "flag" as const;
  constructor(name: string) {
    this.name = name;
  }
}

export class Collect {
  readonly name: string;
  private type = "collect" as const;
  constructor(name: string) {
    this.name = name;
  }
}

export class Passage {
  source: string;
  text: string;
  readonly flags: Flag[];
  readonly collects: Collect[];

  constructor(
    source: string,
    text: string,
    flags: Flag[],
    collects: Collect[]
  ) {
    this.source = source;
    this.text = text;
    this.flags = flags;
    this.collects = collects;
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

    return new Passage(src, textRows.join(""), [], []);
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
    return this.story
      .map((p) => p[key])
      .filter((s) => s != "")
      .join("\n\n");
  }
}

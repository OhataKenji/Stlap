export class Flag {
  readonly name: string;
  private type = "flag" as const;
  constructor(name: string) {
    this.name = name;
  }
  static fromString(source: string): Flag | Error {
    const flagPattern = /^@flag[^\S\r\n]+([A-Za-z_]\w*)[^\S\r\n]*$/;
    const match = flagPattern.exec(source);
    if (match !== null) {
      const flagName = match[1];
      return new Flag(flagName);
    } else {
      return Error(`Parse Error: ${source}`);
    }
  }
}

export class Collect {
  readonly name: string;
  private type = "collect" as const;
  constructor(name: string) {
    this.name = name;
  }
  static fromString(source: string): Collect | Error {
    const collectPattern = /^@collect[^\S\r\n]+([A-Za-z_]\w*)[^\S\r\n]*$/;
    const match = collectPattern.exec(source);
    if (match !== null) {
      const collectName = match[1];
      return new Collect(collectName);
    } else {
      return Error(`Parse Error: ${source}`);
    }
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
    const flags: Flag[] = [];
    const collects: Collect[] = [];
    for (const row of src.split(/\r?\n/)) {
      if (row.startsWith("\\")) {
        //
        // espace
        //
        if (row.startsWith("\\@")) {
          textRows.push(row.slice(1));
        }
      } else if (row.startsWith("//")) {
        //
        // a comment
        //
      } else if (row.startsWith("@")) {
        //
        // Flag and Collect
        //
        if (row.startsWith("@flag")) {
          const f = Flag.fromString(row);
          if (f instanceof Error) {
            return f;
          }
          flags.push(f);
        } else if (row.startsWith("@collect")) {
          const c = Collect.fromString(row);
          if (c instanceof Error) {
            return c;
          }
          collects.push(c);
        } else {
          return Error(`Parse Error Invalid @ use: ${row}`);
        }
      } else {
        //
        // text part
        //
        textRows.push(row.slice());
      }
    }

    return new Passage(src, textRows.join(""), flags, collects);
  }
}

export class Stlap {
  story: Passage[];
  constructor(story: Passage[]) {
    this.story = story;
  }

  static fromString(source: string): Stlap | Error {
    const sourceLF = source.replace("\r\n", "\n");

    const output: Passage[] = [];
    for (const src of sourceLF.split(/\n\n*\n/)) {
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
    return (
      this.story
        .map((p) => p[key])
        .filter((s) => s != "")
        .join("\n\n") + "\n"
    );
  }

  /**
   * @returns true if flag and collect match.
   */
  isValid(): boolean {
    const remainFlags = new Set<string>();

    for (const p of this.story) {
      for (const f of p.flags) {
        remainFlags.add(f.name);
      }

      for (const c of p.collects) {
        if (!remainFlags.has(c.name)) {
          // Not made flag behorehand
          return false;
        }
        remainFlags.delete(c.name);
      }
    }

    return remainFlags.size === 0;
  }
}

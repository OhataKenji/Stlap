import { Range, Parser, Token, Vertex, Vertexkind } from "./parser";

export interface Diagnostic {
  range: Range;
  severity?: DiagnosticSeverity;
  message: string;
}

export namespace DiagnosticSeverity {
  export const Error: 1 = 1;
  export const Warning: 2 = 2;
  export const Information: 3 = 3;
  export const Hint: 4 = 4;
}

export type DiagnosticSeverity = 1 | 2 | 3 | 4;

export class Stlap {
  story: Vertex;
  source: string;
  numberOfCharUntilLine: number[];
  diagnostics: Diagnostic[];

  constructor(story: Vertex, source: string, n: number[]) {
    this.story = story;
    this.source = source;
    this.numberOfCharUntilLine = n;
    this.diagnostics = this.validate();
  }

  static fromString(source: string): Stlap | Error {
    const s = Parser.parse(source);
    if (s instanceof Error) {
      return s;
    }

    const charEachLine = source.split("\n").map((s) => s.length + 1);
    const numberOfCharUntilLine = Array<number>(charEachLine.length + 1).fill(
      0
    );
    for (let i = 0; i < charEachLine.length; i++) {
      numberOfCharUntilLine[i + 1] +=
        charEachLine[i] + numberOfCharUntilLine[i];
    }

    return new Stlap(s, source, numberOfCharUntilLine);
  }

  toText(): string {
    return this._toText(this.story);
  }

  _toText(v: Vertex, paragraphSeparater = "\n\n"): string {
    switch (v.kind) {
      case Vertexkind.Sentence:
        return v.children
          .filter<Token>((c): c is Token => c instanceof Token) // TODO Sentence can have Vertex in the future
          .map((c) => c.getTextRange())
          .filter<Range>((r): r is Range => r !== null)
          .map((r) => {
            const s = this.numberOfCharUntilLine[r.start.line];
            const e = this.numberOfCharUntilLine[r.end.line];
            return this.source.slice(s, e + 1);
          })
          .join("");
      case Vertexkind.Paragraph:
        return v.children
          .filter<Vertex>((v): v is Vertex => v instanceof Vertex) // TODO Paragraph can have Token in the future
          .map((c) => this._toText(c, paragraphSeparater))
          .filter((r) => r !== "")
          .join("");
        break;
      case Vertexkind.Story:
        return v.children
          .filter<Vertex>((v): v is Vertex => v instanceof Vertex) // TODO Story can have Token in the future
          .map((c) => this._toText(c, paragraphSeparater))
          .filter((r) => r !== "")
          .join("");
        break;

      default:
        return "";
    }
  }

  validate(): Diagnostic[] {
    return [];
  }

  /**
   * @returns true if flag and collect match.
   */
  isValid(): boolean {
    return (
      0 ===
      this.diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error)
        .length
    );
  }
}

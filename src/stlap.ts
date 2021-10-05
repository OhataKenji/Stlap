import { Range, Parser, Token, Vertex, Vertexkind, TokenKind } from "./parser";

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

  _toText(v: Vertex | Token, paragraphSeparater = "\n\n"): string {
    if (v instanceof Token) {
      if (v.kind === TokenKind.Words) {
        const r = v.getTextRange();
        if (r === null) {
          return ""; // TODO better error handling
        }
        const s = this.numberOfCharUntilLine[r.start.line] + r.start.charcter;
        const e = this.numberOfCharUntilLine[r.end.line] + r.end.charcter;
        return this.source.slice(s, e + 1);
      } else {
        return "";
      }
    } else {
      if (v.kind === Vertexkind.Sentence) {
        return v.children
          .map((c) => this._toText(c, paragraphSeparater))
          .join("");
      } else if (v.kind === Vertexkind.Paragraph) {
        return v.children
          .map((c) => this._toText(c, paragraphSeparater))
          .join("");
      } else if (v.kind === Vertexkind.ParagraphSeparater) {
        return paragraphSeparater;
      } else if (v.kind === Vertexkind.Story) {
        const textAndSeps = v.children.map((c) =>
          c.kind === Vertexkind.ParagraphSeparater
            ? c
            : this._toText(c, paragraphSeparater)
        );

        // ""を挟むようなparagraphSepapraterの片方を消去
        // [..., PS, "", PS, ...] -> [..., "", "", PS, ...]
        for (let i = 0; i < textAndSeps.length - 2; i++) {
          if (
            textAndSeps[i] instanceof Vertex &&
            textAndSeps[i + 1] === "" &&
            textAndSeps[i + 2] instanceof Vertex
          ) {
            textAndSeps[i] = "";
          }
        }

        // 先頭は""，末尾は"\n"
        if (textAndSeps[0] instanceof Vertex) {
          textAndSeps[0] = "";
        }
        if (textAndSeps[textAndSeps.length - 1] instanceof Vertex) {
          textAndSeps[textAndSeps.length - 1] = "\n";
        } else {
          textAndSeps.push("\n");
        }

        return textAndSeps
          .map((v) =>
            v instanceof Vertex ? this._toText(v, paragraphSeparater) : v
          )
          .join("");
      } else {
        return "";
      }
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

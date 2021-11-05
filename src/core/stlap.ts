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

  toText(separater = "\n\n"): string {
    return this._toTextArray(this.story).join(separater) + "\n";
  }

  _toTextArray(v: Vertex | Token): string[] {
    if (v instanceof Token) {
      if (v.kind === TokenKind.Words) {
        const r = v.getTextRange();
        if (r === null) {
          return []; // TODO better error handling
        }
        const s = this.numberOfCharUntilLine[r.start.line] + r.start.charcter;
        const e = this.numberOfCharUntilLine[r.end.line] + r.end.charcter;
        return [this.source.slice(s, e + 1)];
      } else {
        return [];
      }
    } else {
      if (v.kind === Vertexkind.Sentence) {
        return v.children.map((c) => this._toTextArray(c)).flat();
      } else if (v.kind === Vertexkind.Paragraph) {
        const textArray = v.children.map((c) => this._toTextArray(c)).flat();
        if (textArray.length > 0) {
          return [textArray.join("")];
        } else {
          return [];
        }
      } else if (v.kind === Vertexkind.ParagraphSeparater) {
        return [];
      } else if (v.kind === Vertexkind.Story) {
        const textArray = v.children
          .map((c) => this._toTextArray(c))
          .filter((a) => a.length > 0)
          .flat();

        return textArray;
      } else {
        return [];
      }
    }
  }

  validate(): Diagnostic[] {
    const completed = new Set<string>();
    const remainingFlag = new Map<string, Token>();
    const ds = this._validate(this.story, completed, remainingFlag);
    for (let [arg, t] of remainingFlag) {
      ds.push({
        range: new Range(t.fullStart, t.end),
        message:
          "Flag " +
          arg +
          " is not collected フラグ " +
          arg +
          " が回収されていません\n@collect " +
          arg +
          "\nをしてください",
        severity: DiagnosticSeverity.Error,
      });
    }
    return ds;
  }

  _validate(
    v: Vertex | Token,
    completed: Set<string>,
    remainingFlag: Map<string, Token>
  ): Diagnostic[] {
    if (v instanceof Token) {
      // TODO define another function to simplyfy this part?
      // Syntax and flag Errors
      if (v.kind === TokenKind.MissingToken) {
        return [
          {
            range: new Range(v.fullStart, v.end),
            message: v.message || "",
            severity: DiagnosticSeverity.Error,
          },
        ];
      } else if (v.kind === TokenKind.SkippedToken) {
        return [
          {
            range: new Range(v.fullStart, v.end),
            message: v.message || "",
            severity: DiagnosticSeverity.Error,
          },
        ];
      } else if (v.kind === TokenKind.FlagArg) {
        const s = this.numberOfCharUntilLine[v.start.line] + v.start.charcter;
        const e = this.numberOfCharUntilLine[v.end.line] + v.end.charcter;
        const arg = this.source.slice(s, e + 1);

        if (remainingFlag.has(arg) || completed.has(arg)) {
          return [
            {
              range: new Range(v.fullStart, v.end),
              message:
                arg +
                " is already used" +
                " フラグ" +
                arg +
                " はすでに使用されています",
              severity: DiagnosticSeverity.Error,
            },
          ];
        } else {
          remainingFlag.set(arg, v);
        }
      } else if (v.kind === TokenKind.CollectArg) {
        const s = this.numberOfCharUntilLine[v.start.line] + v.start.charcter;
        const e = this.numberOfCharUntilLine[v.end.line] + v.end.charcter;
        const arg = this.source.slice(s, e + 1);

        if (remainingFlag.has(arg) && !completed.has(arg)) {
          remainingFlag.delete(arg);
          completed.add(arg);
        } else if (completed.has(arg)) {
          return [
            {
              range: new Range(v.fullStart, v.end),
              message:
                arg +
                " is already completed" +
                " " +
                arg +
                " フラグはすでに回収されています\n@flag " +
                arg +
                "\nを消去してください",
              severity: DiagnosticSeverity.Error,
            },
          ];
        } else {
          return [
            {
              range: new Range(v.fullStart, v.end),
              message:
                arg +
                " is not flagged" +
                " " +
                arg +
                " フラグがありません\n@flag " +
                arg +
                "\nをしてください",
              severity: DiagnosticSeverity.Error,
            },
          ];
        }
      }
      return [];
    } else {
      return v.children
        .map((c) => this._validate(c, completed, remainingFlag))
        .flat();
    }
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

  getText(range?: Range): string {
    if (range === undefined) {
      return this.source;
    } else {
      const s =
        this.numberOfCharUntilLine[range.start.line] + range.start.charcter;
      const e = this.numberOfCharUntilLine[range.end.line] + range.end.charcter;
      return this.source.slice(s, e + 1);
    }
  }

  getLine(line: number): string | Error {
    const s = this.numberOfCharUntilLine[line];
    const e = this.numberOfCharUntilLine[line + 1] || this.source.length + 2;
    if (s === undefined) {
      return Error("Line number out of range");
    }
    return this.source.slice(s, e - 1);
  }
}

import {
  Position,
  Token,
  TokenKind,
  tokenizeNewLine,
  tokenizeCommand,
  tokenizeCommentLine,
  tokenizeSentenceLine,
  Vertex,
  Vertexkind,
  Parser,
  Tokenizer,
} from "../src/core/parser";
import fs from "fs";
import path from "path";

describe("Parser", () => {
  test("No error parse", () => {
    const fileNames = [
      "Duplicatedflag.txt",
      "3paragraphWithComment.txt",
      "SameFlagTwiceWhichIsInvalid.txt",
      "CareOrderInParagraph.txt",
    ];
    for (const file of fileNames) {
      const src = fs
        .readFileSync(path.join(__dirname, "example", file))
        .toString();
      const v = Parser.parse(src);
      expect(v).toBeInstanceOf(Vertex);
    }
  });

  test("One paragraph", () => {
    const source = "Hello World\nHave a good day\n";
    const ts = Tokenizer.tokenize(source);
    const v = Parser.parse(source);
    if (v instanceof Error) {
      throw Error();
    }
    const expected = new Vertex(Vertexkind.Story, null, []);
    const p = new Vertex(Vertexkind.Paragraph, expected, []);
    const s = [
      new Vertex(Vertexkind.Sentence, p, [
        new Token(
          TokenKind.Words,
          new Position(0, 0),
          new Position(0, 0),
          new Position(0, "Hello World".length - 1)
        ),
        new Token(
          TokenKind.Newline,
          new Position(0, "Hello World".length),
          new Position(0, "Hello World".length),
          new Position(0, "Hello World".length)
        ),
      ]),
      new Vertex(Vertexkind.Sentence, p, [
        new Token(
          TokenKind.Words,
          new Position(1, 0),
          new Position(1, 0),
          new Position(1, "Have a good day".length - 1)
        ),
        new Token(
          TokenKind.Newline,
          new Position(1, "Have a good day".length),
          new Position(1, "Have a good day".length),
          new Position(1, "Have a good day".length)
        ),
      ]),
    ];
    p.children.push(...s);
    expected.children.push(p);
    expect(v).toEqual(expected);
  });
});

describe("tokenizeNewLine", () => {
  test("empty", () => {
    const input = "";
    const i = 0;
    const o = tokenizeNewLine(input, i);
    const expected = [
      new Token(
        TokenKind.Newline,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("Proceeding half spaces", () => {
    const input = "  ";
    const i = 0;
    const o = tokenizeNewLine(input, i);
    const expected = [
      new Token(
        TokenKind.Newline,
        new Position(i, 0),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("Proceeding half and double spaces", () => {
    const input = "　　  　　   ";
    const i = 0;
    const o = tokenizeNewLine(input, i);
    const expected = [
      new Token(
        TokenKind.Newline,
        new Position(i, 0),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("empty", () => {
    const input = "";
    const i = 0;
    const o = tokenizeNewLine(input, i);
    const expected = [
      new Token(
        TokenKind.Newline,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
    ];
    expect(o).toEqual(expected);
  });
});

describe("tokenizeCommentLine", () => {
  test("empty", () => {
    const input = "//";
    const i = 0;
    const o = tokenizeCommentLine(input, i);
    const expected = [
      new Token(
        TokenKind.CommentPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 1)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, 2),
        new Position(i, 2),
        new Position(i, 2)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("basic comment", () => {
    const input = "//これはコメントです";
    const i = 0;
    const o = tokenizeCommentLine(input, i);
    const expected = [
      new Token(
        TokenKind.CommentPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 1)
      ),
      new Token(
        TokenKind.CommentBody,
        new Position(i, 2),
        new Position(i, 2),
        new Position(i, input.length - 1)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("white space comment", () => {
    const input = "//　　　  ";
    const i = 0;
    const o = tokenizeCommentLine(input, i);
    const expected = [
      new Token(
        TokenKind.CommentPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 1)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, 2),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });

  test("basic comment followed by spaces", () => {
    const input = "//これはコメントです　　　";
    const i = 0;
    const o = tokenizeCommentLine(input, i);
    const expected = [
      new Token(
        TokenKind.CommentPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 1)
      ),
      new Token(
        TokenKind.CommentBody,
        new Position(i, 2),
        new Position(i, 2),
        new Position(i, input.length - 1 - "　　　".length)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length - "　　　".length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
});

describe("tokenizeSentenceLine", () => {
  test("empty", () => {
    const input = "";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("white spaces", () => {
    const input = "    ";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("command", () => {
    const input = "@command name";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("comment", () => {
    const input = "// comment line";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("Japanese simple", () => {
    const input = "サンプル文章";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    const expected = [
      new Token(
        TokenKind.Words,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, input.length - 1)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("simple with ending single space", () => {
    const input = "THIS IS A SAMPLE SENTENCE FOLLOWED BY ONE SPACE ";
    const i = 0;
    const o = tokenizeSentenceLine(input, i);
    const expected = [
      new Token(
        TokenKind.Words,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, input.length - 1 - " ".length)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length - " ".length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
});

describe("tokenizeCommand", () => {
  test("simple flag", () => {
    const input = "@flag flagname";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Flag,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "flag".length)
      ),
      new Token(
        TokenKind.Space,
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1)
      ),
      new Token(
        TokenKind.FlagArg,
        new Position(i, "flag".length + 2),
        new Position(i, "flag".length + 2),
        new Position(i, "flag".length + 1 + "flagname".length)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("capture flag", () => {
    const input = "@flag flagname";
    const i = 0;
    const ts = tokenizeCommand(input, i);
    if (ts instanceof Error) {
      throw ts;
    }
    const t = ts.filter((t) => t.kind == TokenKind.Flag)[0];
    const expected = input.slice(t.fullStart.charcter, t.end.charcter + 1);
    expect(expected).toEqual("flag");
  });
  test("capture collect", () => {
    const input = "@collect flagname";
    const i = 0;
    const ts = tokenizeCommand(input, i);
    if (ts instanceof Error) {
      throw ts;
    }
    const t = ts.filter((t) => t.kind == TokenKind.Collect)[0];
    const expected = input.slice(t.fullStart.charcter, t.end.charcter + 1);
    expect(expected).toEqual("collect");
  });
  test("capture name", () => {
    const input = "@flag flagname";
    const i = 0;
    const ts = tokenizeCommand(input, i);
    if (ts instanceof Error) {
      throw ts;
    }
    const t = ts.filter((t) => t.kind == TokenKind.FlagArg)[0];
    const expected = input.slice(t.fullStart.charcter, t.end.charcter + 1);
    expect(expected).toEqual("flagname");
  });
  test("simple collect", () => {
    const input = "@collect flagname";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Collect,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "collect".length)
      ),
      new Token(
        TokenKind.Space,
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1)
      ),
      new Token(
        TokenKind.CollectArg,
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 1 + "flagname".length)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("broken collect", () => {
    const input = "@ collect flagname";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.MissingToken,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0),
        "Expected Command Name:コマンド名(flagまたはcollect)がありません"
      ),
      new Token(
        TokenKind.Space,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, 1)
      ),
      new Token(
        TokenKind.SkippedToken,
        new Position(i, 2),
        new Position(i, 2),
        new Position(i, 2 + "collect".length - 1),
        "Unexpected Token: トークンを判別できませんでした"
      ),
      new Token(
        TokenKind.SkippedToken,
        new Position(i, "@ collect".length),
        new Position(i, "@ collect".length),
        new Position(i, input.length - 1),
        "Unexpected: 予期しない文字列です"
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("simple flag with some sapaces", () => {
    const input = "@flag  flagname  　　";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Flag,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "flag".length)
      ),
      new Token(
        TokenKind.Space,
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 2),
        new Position(i, "flag".length + 2)
      ),
      new Token(
        TokenKind.FlagArg,
        new Position(i, "flag".length + 3),
        new Position(i, "flag".length + 3),
        new Position(i, "flag".length + 2 + "flagname".length)
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length - "  　　".length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("collect with skipped part", () => {
    const input = "@collect flagname this is unused part ";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Collect,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "collect".length)
      ),
      new Token(
        TokenKind.Space,
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1)
      ),
      new Token(
        TokenKind.CollectArg,
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 1 + "flagname".length)
      ),
      new Token(
        TokenKind.SkippedToken,
        new Position(i, "collect".length + 1 + "flagname".length + 1),
        new Position(i, "collect".length + 1 + "flagname".length + 1),
        new Position(i, input.length - 2),
        "Unexpected: 予期しない文字列です"
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length - 1),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("command name withoud space and arg", () => {
    const input = "@flag";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Flag,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "flag".length)
      ),
      new Token(
        TokenKind.MissingToken,
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1),
        "Expected Space:スペースがありません"
      ),
      new Token(
        TokenKind.MissingToken,
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1),
        new Position(i, "flag".length + 1),
        "Expected Argument:フラグ名がありません"
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("command name without arg", () => {
    const input = "@collect ";
    const i = 0;
    const o = tokenizeCommand(input, i);
    const expected = [
      new Token(
        TokenKind.CommandPrefix,
        new Position(i, 0),
        new Position(i, 0),
        new Position(i, 0)
      ),
      new Token(
        TokenKind.Collect,
        new Position(i, 1),
        new Position(i, 1),
        new Position(i, "collect".length)
      ),
      new Token(
        TokenKind.Space,
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1),
        new Position(i, "collect".length + 1)
      ),
      new Token(
        TokenKind.MissingToken,
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 2),
        new Position(i, "collect".length + 2),
        "Expected Argument:フラグ名がありません"
      ),
      new Token(
        TokenKind.Newline,
        new Position(i, input.length),
        new Position(i, input.length),
        new Position(i, input.length)
      ),
    ];
    expect(o).toEqual(expected);
  });
  test("empty", () => {
    const input = "";
    const i = 0;
    const o = tokenizeCommand(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("comment-like", () => {
    const input = "// comment like";
    const i = 0;
    const o = tokenizeCommand(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("ordinary sentence", () => {
    const input = "just like a sentence";
    const i = 0;
    const o = tokenizeCommand(input, i);
    expect(o).toBeInstanceOf(Error);
  });
  test("", () => {
    const input = "just like a sentence";
    const i = 0;
    const o = tokenizeCommand(input, i);
    expect(o).toBeInstanceOf(Error);
  });
});

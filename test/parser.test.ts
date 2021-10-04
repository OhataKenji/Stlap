import {
  Position,
  Token,
  TokenKind,
  tokenizeNewLine,
  tokenizeCommand,
  tokenizeCommentLine,
  tokenizeSentenceLine,
} from "../src/parser";

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
        TokenKind.Name,
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
        TokenKind.Name,
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
        TokenKind.Name,
        new Position(i, 2),
        new Position(i, 2),
        new Position(i, 2 + "collect".length - 1)
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
        TokenKind.Name,
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
        TokenKind.Name,
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

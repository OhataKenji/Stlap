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

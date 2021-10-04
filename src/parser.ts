export class Position {
  line: number;
  charcter: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.charcter = character;
  }
}

export enum TokenKind {
  Newline,
  Space,
  CommandPrefix,
  CommentBody,
  Flag,
  Collect,
  Name,
  Words,
  CommentPrefix,
  MissingToken,
  SkippedToken,
}

export class Token {
  kind: TokenKind;
  fullStart: Position;
  start: Position;
  end: Position;
  message?: string;

  constructor(
    kind: TokenKind,
    fullStart: Position,
    start: Position,
    end: Position,
    message?: string
  ) {
    this.kind = kind;
    this.fullStart = fullStart;
    this.start = start;
    this.end = end;
    if (message !== null) {
      this.message = message;
    }
  }
}

enum Vertexkind {
  Story,
  Paragraph,
  Command,
  Comment,
  Sentence,
  ParagraphSeparater,
}

type VertexParent = Vertex | null;
type VertexChildren = Array<Vertex | Token>;

class Vertex {
  kind: Vertexkind;
  parent: VertexParent;
  children: VertexChildren;

  constructor(
    kind: Vertexkind,
    parent: VertexParent,
    children: VertexChildren
  ) {
    this.kind = kind;
    this.parent = parent;
    this.children = children;
  }
}

class Parser {
  /**
    story = (paragraph_sp? paragraph)? (paragraph_sp paragraph)*
    paragraph = (sentence | command | comment)+
    sentence = ^ words newline
    command = ^ @ command_name space name newline
    command_name = flag | collect
    name = [a-zA-Z][a-zA-Z0-9]*
    space = white space except for newline
    words = any words which doesn't begin with [@, //]
    newline = space \n
   */
}

function isNewLine(row: string): boolean {
  return /^[^\S\r\n]*$/.test(row);
}

function isCommentLine(row: string): boolean {
  return /^\/\/[^\r\n]*$/.test(row);
}
function mayBeCommandLine(row: string): boolean {
  return /^@[^\r\n]*$/.test(row);
}

/**
 They treat imput `line` have ending "\n", which is not in line itself.
*/
interface TokenizeLine {
  (line: string, lineNumber: number): Token[] | Error;
}

export const tokenizeNewLine: TokenizeLine = function (line, lineNumber) {
  const fullStart = new Position(lineNumber, 0);
  const start = new Position(lineNumber, line.length);
  const end = new Position(lineNumber, line.length);
  return [new Token(TokenKind.Newline, fullStart, start, end)];
};

export const tokenizeCommentLine: TokenizeLine = function (line, lineNumber) {
  const tokens: Token[] = [];

  // CommentPrefix: //
  const prefix = new Token(
    TokenKind.CommentPrefix,
    new Position(lineNumber, 0),
    new Position(lineNumber, 0),
    new Position(lineNumber, 1)
  );
  tokens.push(prefix);
  // Comment
  const match = line.match(/^\/\/(\S*)[^\S\r\n]*/);
  if (match === null || match[1] === null) {
    return Error("Tokenize Error: faital");
  }
  let commentLength = 0;

  const comment = match[1];
  if (comment != "") {
    commentLength = comment.length;
    const commentBody = new Token(
      TokenKind.CommentBody,
      new Position(lineNumber, 2),
      new Position(lineNumber, 2),
      new Position(lineNumber, 2 + commentLength - 1)
    );
    tokens.push(commentBody);
  }
  // newline token
  const newline = new Token(
    TokenKind.Newline,
    new Position(lineNumber, 2 + commentLength),
    new Position(lineNumber, line.length),
    new Position(lineNumber, line.length) // minus comment-prefix //
  );
  tokens.push(newline);

  return tokens;
};

export const tokenizeCommand: TokenizeLine = function (line, lineNumber) {
  const tokens: Token[] = [];
  const match = line.match(/^@(\S*)([^\S\r\n]*)(\S*)(.*?)([^\S\r\n]*)$/);
  if (
    match === null ||
    match[1] === null ||
    match[2] === null ||
    match[3] === null ||
    match[4] === null ||
    match[5] === null
  ) {
    return Error("Tokenize Error: faital");
  }

  //CommandPrefix
  tokens.push(
    new Token(
      TokenKind.CommandPrefix,
      new Position(lineNumber, 0),
      new Position(lineNumber, 0),
      new Position(lineNumber, 0)
    )
  );
  // CommandName
  const commandName = match[1];
  switch (commandName) {
    case "":
      tokens.push(
        new Token(
          TokenKind.MissingToken,
          new Position(lineNumber, 0),
          new Position(lineNumber, 0),
          new Position(lineNumber, 0),
          "Expected Command Name:コマンド名(flagまたはcollect)がありません"
        )
      );
      break;
    case "flag":
      break;
    case "collect":
      break;
    default:
      tokens.push(
        new Token(
          TokenKind.SkippedToken,
          new Position(lineNumber, 1),
          new Position(lineNumber, 1),
          new Position(lineNumber, commandName.length),
          "Unexpected Command Name:コマンド名(flagまたはcollect)ではありません"
        )
      );
  }

  return tokens;
};

export const tokenizeSentenceLine: TokenizeLine = function (line, lineNumber) {
  const match = line.match(/^(.*?)([^\S\r\n]*)$/);
  if (
    match === null ||
    match[1] === null ||
    match[1].startsWith("//") ||
    match[1].startsWith("@")
  ) {
    return Error("Tokenize Error: faital");
  }
  const sentence = match[1];
  if (sentence === "") {
    return Error("Tokenize Error: faital");
  }

  const words = new Token(
    TokenKind.Words,
    new Position(lineNumber, 0),
    new Position(lineNumber, 0),
    new Position(lineNumber, sentence.length - 1)
  );
  const newline = new Token(
    TokenKind.Newline,
    new Position(lineNumber, sentence.length),
    new Position(lineNumber, line.length),
    new Position(lineNumber, line.length)
  );

  return [words, newline];
};

export class Tokenizer {
  static tokenize(src: string): Token[] | Error {
    const tokens: Token[] = [];
    const lines = src.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let t: Token[] | Error;
      if (isNewLine(lines[i])) {
        t = tokenizeNewLine(lines[i], i);
      } else if (isCommentLine(lines[i])) {
        t = tokenizeCommentLine(lines[i], i);
      } else if (mayBeCommandLine(lines[i])) {
        t = tokenizeCommand(lines[i], i);
      } else {
        t = tokenizeSentenceLine(lines[i], i);
      }

      if (t instanceof Error) {
        return t;
      }
      tokens.push(...t);
    }

    // the case when source file doesn't have ending \n
    if (lines[lines.length - 1] !== "") {
      return tokens.slice(0, tokens.length - 1);
    }
    return tokens;
  }
}

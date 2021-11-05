import { Stlap } from "../src/core/stlap";
import fs from "fs";
import path from "path";
import { Range } from "../src/core/parser";

describe("toText", () => {
  test("One paragraph", () => {
    const source =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "Hello Worldthis is first test of stlapHave a good day\n";

    expect(output).toEqual<String>(expected);
  });

  test("Three paragraph", () => {
    const source =
      "//comment\nHello World\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();

    const expected =
      "Hello Worldthis is first test of stlap\n\nHave a good day\n\nTESTTESTTEST\n";
    expect(output).toEqual<string>(expected);
  });

  test("empty", () => {
    for (const source of ["", "\n"]) {
      const stlap = Stlap.fromString(source);
      if (stlap instanceof Error) {
        throw Error();
      }
      const output = stlap.toText();
      const expected = "\n";

      expect(output).toEqual<String>(expected);
    }
  });

  test("Comment Only", () => {
    const source = "//comment";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "\n";

    expect(output).toEqual<String>(expected);
  });

  test("Three paragraph with Comment only", () => {
    const source =
      "//comment\nHello World\nthis is first test of stlap\n\n\n\n//comment only\n\nTESTTESTTEST\n//comment2";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();

    const expected = "Hello Worldthis is first test of stlap\n\nTESTTESTTEST\n";
    expect(output).toEqual<string>(expected);
  });

  test("Three paragraph with 2 flags", () => {
    const src =
      "//comment\nHello World\n@flag flag1\n@flag sub_flag\nthis is first test of stlap\n\n\n\n@collect sub_flag\nHave a good day\n\nTESTTESTTEST\n//comment2\n@collect flag1";
    const stlap = Stlap.fromString(src);
    if (stlap instanceof Error) {
      throw Error;
    }
    const output = stlap.toText();
    const expected =
      "Hello Worldthis is first test of stlap\n\nHave a good day\n\nTESTTESTTEST\n";
    expect(output).toEqual(expected);
  });

  test("3paragraphWithComment", () => {
    const src = fs
      .readFileSync(
        path.join(__dirname, "example", "3paragraphWithComment.txt")
      )
      .toString();
    const expected = fs
      .readFileSync(
        path.join(__dirname, "example", "3paragraphWithComment_toText.txt")
      )
      .toString();

    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.toText();
    expect(output).toEqual(expected);
  });

  test("One paragraph with proceeding newlines", () => {
    const source =
      "\n\n\n\n//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "Hello Worldthis is first test of stlapHave a good day\n";

    expect(output).toEqual<String>(expected);
  });

  test("One paragraph end with newlines", () => {
    const source =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day\n\n\n";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "Hello Worldthis is first test of stlapHave a good day\n";

    expect(output).toEqual<String>(expected);
  });

  test("command and comment in the same paragraph", () => {
    const src = fs
      .readFileSync(
        path.join(__dirname, "example", "commandAndCommentInSameParagraph.txt")
      )
      .toString();
    const expected = fs
      .readFileSync(
        path.join(
          __dirname,
          "example",
          "commandAndCommentInSameParagraph_toText.txt"
        )
      )
      .toString();

    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.toText();
    expect(output).toEqual(expected);
  });

  test("begin with comment", () => {
    for (const fileName of ["beginWithComment", "endWithComment"]) {
      const src = fs
        .readFileSync(path.join(__dirname, "example", fileName + ".txt"))
        .toString();
      const expected = fs
        .readFileSync(path.join(__dirname, "example", fileName + "_toText.txt"))
        .toString();

      const s = Stlap.fromString(src);
      if (s instanceof Error) {
        throw Error;
      }
      const output = s.toText();
      expect(output).toEqual(expected);
    }
  });
});

describe("isValid", () => {
  test("valid with no flag", () => {
    const src =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(true);
  });

  test("Valid three paragraph with flag and collect", () => {
    const src =
      "//comment\nHello World\n@flag flag1\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2\n@collect flag1";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(true);
  });

  test("Invalid three paragraph with flag not closed", () => {
    const src =
      "//comment\nHello World\n@flag flag1\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("Invalid three paragraph with collect first", () => {
    const src =
      "//comment\nHello World\n@collect flag1\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("Valid three paragraph with 2 flags", () => {
    const src =
      "//comment\nHello World\n@flag flag1\n@flag sub_flag\nthis is first test of stlap\n\n\n\n@collect sub_flag\nHave a good day\n\nTESTTESTTEST\n//comment2\n@collect flag1";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(true);
  });

  test("Duplicatedflag", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "Duplicatedflag.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("DuplicatedCollect", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "DuplicatedCollect.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("CareOrderInParagraph", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "CareOrderInParagraph.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("SameFlagTwiceWhichIsInvalid.txt", () => {
    const src = fs
      .readFileSync(
        path.join(__dirname, "example", "SameFlagTwiceWhichIsInvalid.txt")
      )
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });

  test("brokenFlagCommand.txt", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "brokenFlagCommand.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const output = s.isValid();
    expect(output).toEqual(false);
  });
});

describe("getText", () => {
  test("full", () => {
    const src = fs
      .readFileSync(
        path.join(__dirname, "example", "3paragraphWithComment.txt")
      )
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const o = s.getText();
    expect(o).toEqual(src);
  });
  test("one line", () => {
    const src = "abcdefg";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const o = s.getText(
      new Range({ line: 0, charcter: 0 }, { line: 0, charcter: 2 })
    );
    expect(o).toEqual("abc");
  });
  test("multi line", () => {
    const src = "abcdefg\nABCDEFG";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const o = s.getText(
      new Range({ line: 0, charcter: 4 }, { line: 1, charcter: 5 })
    );
    expect(o).toEqual("efg\nABCDEF");
  });
  test("behave like string#slice() when out of range", () => {
    const src = "abcdefg";
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const o = s.getText(
      new Range({ line: 0, charcter: 0 }, { line: 0, charcter: 1000 })
    );
    expect(o).toEqual(src);
  });
});

describe("validate", () => {
  test("too many collect", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "tooManyCollect.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const o = s.diagnostics.filter(
      (d) => d.message.includes("already") && d.message.includes("completed")
    );
    expect(o.length > 0).toBe(true);
  });
});

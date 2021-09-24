import { Stlap, Flag, Collect } from "../src/stlap";

describe("fromString", () => {
  test("One paragraph", () => {
    const input =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const output = Stlap.fromString(input);

    const expected = new Stlap([
      {
        source: input,
        text: "Hello Worldthis is first test of stlapHave a good day",
        flags: [],
        collects: [],
      },
    ]);

    expect(output).toEqual<Stlap | Error>(expected);
  });

  test("Three paragraph", () => {
    const input =
      "//comment\nHello World\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2";
    const output = Stlap.fromString(input);

    const expected = new Stlap([
      {
        source: "//comment\nHello World\nthis is first test of stlap",
        text: "Hello Worldthis is first test of stlap",
        flags: [],
        collects: [],
      },
      {
        source: "Have a good day",
        text: "Have a good day",
        flags: [],
        collects: [],
      },
      {
        source: "TESTTESTTEST\n//comment2",
        text: "TESTTESTTEST",
        flags: [],
        collects: [],
      },
    ]);

    expect(output).toEqual<Stlap | Error>(expected);
  });

  test("One paragraph with flag", () => {
    const input =
      "//comment\n@flag the_first_flag\nHello World\nthis is first test of stlap\nHave a good day";
    const output = Stlap.fromString(input);

    const expected = new Stlap([
      {
        source: input,
        text: "Hello Worldthis is first test of stlapHave a good day",
        flags: [new Flag("the_first_flag")],
        collects: [],
      },
    ]);

    expect(output).toEqual<Stlap | Error>(expected);
  });

  test("Three paragraph with flag and collect", () => {
    const input =
      "//comment\nHello World\n@flag flag1\nthis is first test of stlap\n\n\n\nHave a good day\n\nTESTTESTTEST\n//comment2\n@collect flag1";
    const output = Stlap.fromString(input);

    const expected = new Stlap([
      {
        source: "//comment\nHello World\nthis is first test of stlap",
        text: "Hello Worldthis is first test of stlap",
        flags: [new Flag("flag1")],
        collects: [],
      },
      {
        source: "Have a good day",
        text: "Have a good day",
        flags: [],
        collects: [],
      },
      {
        source: "TESTTESTTEST\n//comment2",
        text: "TESTTESTTEST",
        flags: [],
        collects: [new Collect("flag1")],
      },
    ]);

    expect(output).toEqual<Stlap | Error>(expected);
  });
});

describe("toText", () => {
  test("One paragraph", () => {
    const source =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "Hello Worldthis is first test of stlapHave a good day";

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
      "Hello Worldthis is first test of stlap\n\nHave a good day\n\nTESTTESTTEST";
    expect(output).toEqual<string>(expected);
  });

  test("Comment Only", () => {
    const source = "//comment";
    const stlap = Stlap.fromString(source);
    if (stlap instanceof Error) {
      throw Error();
    }
    const output = stlap.toText();
    const expected = "";

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

    const expected = "Hello Worldthis is first test of stlap\n\nTESTTESTTEST";
    expect(output).toEqual<string>(expected);
  });
});

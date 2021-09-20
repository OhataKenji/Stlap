import { Stlap } from "../src/stlap";

describe("parse", () => {
  test("One paragraph", () => {
    const input =
      "//comment\nHello World\nthis is first test of stlap\nHave a good day";
    const output = Stlap.fromString(input);

    const expected = new Stlap([
      {
        source: input,
        text: "Hello Worldthis is first test of stlapHave a good day",
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
      },
      {
        source: "Have a good day",
        text: "Have a good day",
      },
      {
        source: "TESTTESTTEST\n//comment2",
        text: "TESTTESTTEST",
      },
    ]);

    expect(output).toEqual<Stlap | Error>(expected);
  });
});

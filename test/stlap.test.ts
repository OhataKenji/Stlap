import { parse, Stlap } from "../src/stlap";

describe("parse", () => {
  test("small", () => {
    const input =
      "//comment\nHello World\nthis is first test of stlap\n「Have a good day」";
    const output = parse(input);

    const expected = [
      {
        source: input,
        text: "Hello Worldthis is first test of stlap「Have a good day」",
        lines: "Have a good day",
      },
    ];

    expect(output).toEqual<Stlap | Error>(expected);
  });
});

import {
  getFilename,
  getBuffer,
  getDiagnosticsAsPrettyString,
} from "../src/cli/util";
import { Stlap } from "../src/main";
import fs from "fs";
import path from "path";

describe("getFilename", () => {
  test("No arguments", () => {
    const input: string[] = [];
    const output = getFilename(input);
    expect(output).toEqual<null>(null);
  });

  test("One file", () => {
    const filename = "testfile.txt";
    const input: string[] = [filename];
    const output = getFilename(input);
    expect(output).toEqual<string>(filename);
  });

  test("Multiple files", () => {
    const input: string[] = ["filename.txt", "filename2.txt"];
    const output = getFilename(input);
    expect(output).toBeInstanceOf(Error);
  });
});

describe("getBuffer", () => {
  {
    test("Wrong file naem", async () => {
      const output = await getBuffer("NOT_EXITING_FILE.NOT_EXIT");
      expect(output).toBeInstanceOf(Error);
    });
  }
});

describe("pretty print", () => {
  test("simple", () => {
    const src = fs
      .readFileSync(path.join(__dirname, "example", "Duplicatedflag.txt"))
      .toString();
    const s = Stlap.fromString(src);
    if (s instanceof Error) {
      throw Error;
    }
    const expected = `error: toBeDuplicated is already used フラグtoBeDuplicated はすでに使用されています
 |
7| @flag toBeDuplicated
 |       ^^^^^^^^^^^^^^
 |`;
    expect(getDiagnosticsAsPrettyString(s)).toBe(expected);
  });
});

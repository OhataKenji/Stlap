import { getFilename, getBuffer } from "../src/util";

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

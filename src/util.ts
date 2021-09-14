import fs from "fs";

export function getFilename(args: string[]): string | null {
  switch (args.length) {
    case 0:
      return null;
      break;

    case 1:
      return args[0];
      break;

    default:
      throw new Error(
        "Invalid number of arguments ファイルは一つ指定してください"
      );
  }
}

export function getBuffer(fileName: string | null): Buffer {
  if (fileName === null) {
    return fs.readFileSync(process.stdin.fd);
  }

  let b: Buffer;
  switch (fileName) {
    case "-":
      b = fs.readFileSync(process.stdin.fd);
      break;

    default:
      b = fs.readFileSync(fileName);
  }
  return b;
}

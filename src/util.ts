import fs from "fs";

export function getFilename(args: string[]): string | null | Error {
  switch (args.length) {
    case 0:
      return null;
      break;

    case 1:
      return args[0];
      break;

    default:
      return new Error(
        "Invalid number of arguments ファイルは一つ指定してください"
      );
  }
}

export async function getBuffer(fileName: string | null): Promise<Buffer> {
  if (fileName === null) {
    const buffers = [];
    for await (const chunk of process.stdin) buffers.push(chunk);
    return Promise.resolve(Buffer.concat(buffers));
  }

  let b: Buffer;
  switch (fileName) {
    case "-":
      const buffers = [];
      for await (const chunk of process.stdin) buffers.push(chunk);
      b = Buffer.concat(buffers);
      break;

    default:
      b = fs.readFileSync(fileName);
  }
  return Promise.resolve(b);
}

import fs from "fs";
import { Diagnostic, Stlap } from "../main";

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

export async function getBuffer(
  fileName: string | null
): Promise<Buffer | Error> {
  if (fileName === null) {
    const buffers = [];
    for await (const chunk of process.stdin) buffers.push(chunk);
    return Promise.resolve(Buffer.concat(buffers));
  }

  let b: Buffer | Error;
  switch (fileName) {
    case "-":
      const buffers = [];
      for await (const chunk of process.stdin) buffers.push(chunk);
      b = Buffer.concat(buffers);
      break;

    default:
      if (fs.existsSync(fileName)) {
        b = fs.readFileSync(fileName);
      } else {
        b = Error("File not found ファイルが見つかりません");
      }
  }
  return Promise.resolve(b);
}

export function DiagnosticAsPrettyString(
  d: Diagnostic,
  s: Stlap
): string | Error {
  // refer definition of Error severity
  const errorkind = new Map<number, string>();
  errorkind.set(1, "error");
  errorkind.set(2, "warning");
  errorkind.set(3, "information");
  errorkind.set(4, "hint");

  const header = `${errorkind.get(d.severity || 1)}: ${d.message}\n`;
  const lineDigit = d.range.end.line.toString().length;
  const segment: string[] = [" ".repeat(lineDigit) + "|"];

  // TODO might need to accept multiline version
  if (d.range.start.line === d.range.end.line) {
    const line = s.getLine(d.range.start.line);
    if (line instanceof Error) {
      return Error(`Message Construction Error ${line.message}`);
    }
    segment.push(`${d.range.start.line}| ${line}`);
    segment.push(
      `${" ".repeat(lineDigit)}| ${" ".repeat(
        d.range.start.charcter
      )}${"^".repeat(d.range.end.charcter - d.range.start.charcter + 1)}`
    );
    segment.push(" ".repeat(lineDigit) + "|");
  }

  return header + segment.join("\n");
}

export function getDiagnosticsAsPrettyString(
  s: Stlap,
  limit: number = 5
): string | Error {
  const messages: string[] = [];
  for (const d of s.diagnostics.slice(0, limit)) {
    const msg = DiagnosticAsPrettyString(d, s);
    if (msg instanceof Error) {
      return msg;
    }
    messages.push(msg);
  }
  return messages.join("\n\n");
}

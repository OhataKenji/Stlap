import { version } from "../package.json";
import { Command } from "commander";
import { getFilename, getBuffer } from "./util";
import { Stlap } from "./stlap";

async function main() {
  const program = new Command();
  program.version(version).usage("[options] <file>").parse(process.argv);

  const fileName = getFilename(program.args);
  if (fileName instanceof Error) {
    console.error(fileName.message);
    return;
  }

  const b = await getBuffer(fileName);
  if (b instanceof Error) {
    console.error(b.message);
    return;
  }

  const stlap = Stlap.fromString(b.toString("utf8"));
  if (stlap instanceof Error) {
    console.error(stlap.message);
    return;
  }

  process.stdout.write(stlap.toText());
}

main();

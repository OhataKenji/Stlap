import { Command } from "commander";
import { getFilename, getBuffer } from "./util";

async function main() {
  const program = new Command();
  program
    .version("0.0.1")
    .usage("[options] <file>")
    .option("-l, --line", "Output lines セリフを出力")
    .parse(process.argv);

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

  const text = b.toString();
  console.log("OUTPUT");
  console.log(text);
}

main();

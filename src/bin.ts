import { Command } from "commander";
import fs from "fs";
import { getFilename, getBuffer } from "./util";

const program = new Command();
program
  .version("0.0.1")
  .usage("[options] <file>")
  .option("-l, --line", "Output lines セリフを出力")
  .parse(process.argv);

try {
  const fileName = getFilename(program.args);
  getBuffer(fileName).then((b) => {
    const text = b.toString();
    console.log("OUTPUT");
    console.log(text);
  });
} catch (err) {
  console.error(err);
}

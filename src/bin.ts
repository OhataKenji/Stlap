const { Command } = require("commander");
const program = new Command();

program
  .version("0.0.1")
  .usage("[options] <file>")
  .option("-l, --line", "Output lines セリフを出力")
  .parse(process.argv);

const options = program.opts();

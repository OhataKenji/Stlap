import { version } from "../package.json";
import { Command } from "commander";
import { getFilename, getBuffer, getDiagnosticsAsPrettyString } from "./util";
import { Stlap } from "./stlap";

type ExitStatus = number;

async function main(): Promise<ExitStatus> {
  const program = new Command();
  program
    .version(version)
    .usage("[options] <file>")
    .option(
      "-c, --check",
      "Validate input file 入力に構文などのエラーがないか確かめます"
    )
    .option("-f, --force", "Force to output エラーを無視して強制的に出力します")
    .parse(process.argv);

  const fileName = getFilename(program.args);
  if (fileName instanceof Error) {
    console.error(fileName.message);
    return 1;
  }

  const b = await getBuffer(fileName);
  if (b instanceof Error) {
    console.error(b.message);
    return 1;
  }

  //
  // Analysis Part
  //
  const stlap = Stlap.fromString(b.toString());
  if (stlap instanceof Error) {
    console.error(stlap.message);
    return 1;
  }

  //
  // Output Part
  //
  const opt = program.opts();
  if (opt.check) {
    const o = getDiagnosticsAsPrettyString(stlap);
    if (!(o instanceof Error)) {
      console.log(o);
      return 0;
    }
  } else if (opt.force || stlap.isValid()) {
    process.stdout.write(stlap.toText());
    return 0;
  } else if (!stlap.isValid()) {
    const o = getDiagnosticsAsPrettyString(stlap);
    if (!(o instanceof Error)) {
      console.log(o);
      return 1;
    }
  }

  console.error("Unexpected Beheivior");
  return 1;
}

main().then((exitStatus) => process.exit(exitStatus));

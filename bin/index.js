#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runServerBenchmark } from "../lib/server-benchmark.js";
import { runBrowserBenchmark } from "../lib/browser-benchmark.js";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 --urls <url> [paths...] [options]")
  .option("urls", {
    alias: "u",
    type: "array",
    demandOption: true,
    describe: "List of base URLs or full URLs to benchmark",
  })
  .option("delay", {
    alias: "d",
    type: "number",
    default: 2000,
    describe: "Delay between requests in milliseconds",
  })
  .option("output", {
    alias: "o",
    type: "string",
    default: "benchmark_results.csv",
    describe: "CSV output file name",
  })
  .option("mode", {
    alias: "m",
    choices: ["server", "browser"],
    default: "server",
    describe:
      'Benchmark mode: "server" for backend only, "browser" for full page load',
  })
  .example(
    `$0 -u http://localhost:${process.env.PORT} /about /contact --mode browser`,
    "Run browser-based full page load benchmark"
  )
  .help()
  .alias("h", "help")
  .parse();

(async () => {
  if (argv.mode === "browser") {
    await runBrowserBenchmark(argv.urls, argv.delay, argv.output);
  } else {
    await runServerBenchmark(argv.urls, argv.delay, argv.output);
  }
})();

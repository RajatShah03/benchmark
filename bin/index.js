#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runBenchmark } from "../lib/benchmark.js";

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
  .example(
    "$0 -u http://localhost:4200 /about /contact",
    "Benchmark local routes"
  )
  .help().argv;

runBenchmark(argv.urls, argv.delay, argv.output);

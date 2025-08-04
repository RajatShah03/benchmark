import fs from "fs";
import http from "http";
import https from "https";
import { performance } from "perf_hooks";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetchWithMetrics(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const startMem = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();
    const startPerf = performance.now();

    let ttfb = null;

    const req = lib.get(url, (res) => {
      res.once("data", () => {
        if (ttfb === null) ttfb = performance.now() - startPerf;
      });

      res.on("data", () => {}); // consume
      res.on("end", () => {
        const endPerf = performance.now();
        const endMem = process.memoryUsage().heapUsed;
        const cpu = process.cpuUsage(startCpu);
        resolve({
          url,
          status: res.statusCode,
          responseTime: endPerf - startPerf,
          ttfb: ttfb ?? 0,
          memoryUsedKB: (endMem - startMem) / 1024,
          cpuUsedMs: (cpu.user + cpu.system) / 1000,
        });
      });
    });

    req.on("error", (err) => {
      resolve({ url, status: "ERR", error: err.message });
    });

    req.end();
  });
}

export async function runBenchmark(
  urls,
  delay = 2000,
  csvFile = "benchmark_results.csv"
) {
  const fullUrls = urls.map((u) =>
    u.startsWith("http") ? u : `http://localhost:4200${u}`
  );

  console.log(
    `🧪 Benchmarking ${fullUrls.length} URLs with ${delay}ms delay...\n`
  );
  const results = [];

  for (const url of fullUrls) {
    console.log(`🔗 Requesting: ${url}`);
    const result = await fetchWithMetrics(url);

    if (result.responseTime) {
      console.log(
        `✅ ${result.status} | ${result.responseTime.toFixed(
          2
        )}ms | TTFB ${result.ttfb.toFixed(
          2
        )}ms | CPU ${result.cpuUsedMs.toFixed(
          2
        )}ms | Mem ${result.memoryUsedKB.toFixed(2)}KB`
      );
    } else {
      console.log(`❌ ${result.error}`);
    }

    results.push(result);
    await sleep(delay);
  }

  // Save to CSV
  const header =
    "URL,Status,ResponseTime(ms),TTFB(ms),CPUTime(ms),MemoryUsed(KB)\n";
  const rows = results.map(
    (r) =>
      `${r.url},${r.status},${r.responseTime?.toFixed(2) ?? "N/A"},${
        r.ttfb?.toFixed(2) ?? "N/A"
      },${r.cpuUsedMs?.toFixed(2) ?? "N/A"},${
        r.memoryUsedKB?.toFixed(2) ?? "N/A"
      }`
  );
  fs.writeFileSync(csvFile, header + rows.join("\n"));
  console.log(`\n📁 Results saved to ${csvFile}`);

  // Average time
  const valid = results.filter((r) => r.responseTime != null);
  const avg = valid.reduce((sum, r) => sum + r.responseTime, 0) / valid.length;
  console.log(`\n📊 Avg Response Time: ${avg.toFixed(2)} ms`);
}

import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function runBrowserBenchmark(
  urls,
  delay = 2000,
  outputFile = "browser-benchmark-results.csv"
) {
  const results = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const pathOrUrl of urls) {
    const fullUrl = pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `http://localhost:${process.env.PORT}${pathOrUrl}`;
    console.log(`\nTesting ${fullUrl}...`);

    const startTime = performance.now();

    await page._client.send("Profiler.enable");
    await page._client.send("Profiler.start");

    await page.goto(fullUrl, { waitUntil: "networkidle0" });

    const cpuProfile = await page._client.send("Profiler.stop");
    await page._client.send("Profiler.disable");

    const endTime = performance.now();

    const perf = await page.evaluate(() => {
      const t = performance.timing;
      return {
        ttfb: t.responseStart - t.requestStart,
        loadTime: t.loadEventEnd - t.navigationStart,
      };
    });

    const metrics = await page.metrics();
    const cpuTime = cpuProfile.profile.nodes.reduce(
      (acc, node) => acc + (node.hitCount || 0),
      0
    );

    results.push({
      url: pathOrUrl,
      ttfb: perf.ttfb.toFixed(2),
      loadTime: perf.loadTime.toFixed(2),
      totalTime: (endTime - startTime).toFixed(2),
      jsHeapUsed: (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2),
      cpuTime: cpuTime.toFixed(2),
    });

    await sleep(delay);
  }

  await browser.close();

  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: "url", title: "URL" },
      { id: "ttfb", title: "TTFB (ms)" },
      { id: "loadTime", title: "Load Time (ms)" },
      { id: "totalTime", title: "Total Time (ms)" },
      { id: "jsHeapUsed", title: "JS Heap (MB)" },
      { id: "cpuTime", title: "CPU Time (ms)" },
    ],
  });

  await csvWriter.writeRecords(results);
  console.log(`\n✅ Browser benchmark complete! Output saved to ${outputFile}`);
}

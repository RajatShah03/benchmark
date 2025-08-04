# 📊 benchmark

**`benchmark`** is a CLI tool to benchmark response time, TTFB (Time To First Byte), CPU usage, and memory utilization of routes in a Next.js app.

Useful for measuring cold starts, DB call performance, route caching, or comparing performance before/after optimizations.

---

## 🚀 Features

- ⏱ Measures response time and TTFB
- 🧠 Tracks CPU and memory usage per request
- 🧾 Outputs results to a CSV file
- 🧪 Ideal for local or CI benchmarking

---

## 📦 Installation (using pnpm)

```bash
pnpm install
pnpm link --global
```

## Usage

```
$ yarn start --urls / /about /contact --delay 2000
```

## Options

| Option     | Alias | Description                        | Default                 |
| ---------- | ----- | ---------------------------------- | ----------------------- |
| `--urls`   | `-u`  | List of URLs or paths to benchmark | _(required)_            |
| `--delay`  | `-d`  | Delay between requests (ms)        | `2000`                  |
| `--output` | `-o`  | Output CSV file name               | `benchmark_results.csv` |

## Output

```
URL,Status,ResponseTime(ms),TTFB(ms),CPUTime(ms),MemoryUsed(KB)
http://localhost:4200/,200,78.45,21.10,0.56,3.29
...
```

## Notes

- Ensure your Next.js app is running locally at http://localhost:4200
- All timings are approximate but useful for dev benchmarking
- Ideal for comparing route performance or caching effectiveness

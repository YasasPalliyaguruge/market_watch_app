# Market Watch

![Market Watch project cover](assets/recruiter/cover.png)

> **Portfolio lens:** A considered interface foundation for market monitoring, with its current boundaries stated plainly before live data and alerts are introduced.

Market Watch is the beginning of a market-monitoring interface built with Next.js. It currently provides the application shell and UI foundation; live prices, watchlists, alerts, and a data provider have not been wired in yet.

That distinction is deliberate: this repository is the place to build the interface before presenting it as a live market-analysis product.

## Start locally

```bash
npm ci
npm run dev
```

Visit `http://localhost:3000` after Next.js starts. The stack is Next.js, React, TypeScript, Tailwind CSS, and Radix UI primitives.

Use `npm run lint` before a change and `npm run build` to create a production build. `npm run start` serves an existing production build.

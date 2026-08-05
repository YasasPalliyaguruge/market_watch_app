# Market Watch

![Market Watch project cover](assets/recruiter/cover.png)

> **Current status:** Initial Next.js interface scaffold. Live market-monitoring functionality has not yet been implemented.

Market Watch is a starting point for a future market-monitoring application using Next.js, React, TypeScript, Tailwind CSS, and Radix UI primitives. The current root page is only a basic button, with no connected price provider, charts, watchlists, alerts, portfolio data, or market-analysis workflow.

## Run locally

```bash
npm ci
npm run dev
```

Visit `http://localhost:3000` after Next.js starts.

Use the existing project commands before sharing changes:

```bash
npm run lint
npm run build
npm run start
```

## Minimum scope before portfolio use

- Connect a documented market-data provider.
- Add symbol search and a persistent watchlist.
- Display price history with loading and error states.
- Add clear data timestamps and delayed-data disclosures.
- Include automated type-checking and build validation.
- Add screenshots or a deployed demonstration of the actual workflow.

## Portfolio recommendation

Archive this repository until at least one end-to-end market-monitoring workflow is functional. A polished README or interface shell should not be presented as a working market product.

## Financial-information boundary

Any future implementation should distinguish informational market data from personalised financial advice and clearly document data delays, provider limitations, and the absence of guaranteed outcomes.

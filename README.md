# Market Watch

![Market Watch project cover](assets/recruiter/cover.png)

Market Watch is a browser-local portfolio workspace built with Next.js, React and TypeScript. It lets a user record symbols, entry prices, manually observed current prices, quantities and target prices without requiring an account or a market-data provider.

## Implemented workflow

- Add and remove watchlist items.
- Store the list in browser `localStorage`.
- Edit current price, quantity and target price directly from each card.
- Calculate cost basis, current position value and unrealized result.
- Calculate target distance and total portfolio value at entered targets.
- Validate symbols and numeric values.
- Recover safely when saved local data is malformed or unavailable.
- Clear all locally stored items with confirmation.
- Responsive empty, form, summary and watchlist states.

## Important boundary

The application does **not** fetch live or delayed market prices. Every value is entered manually, all totals are displayed in USD without currency conversion, and the interface does not provide investment advice.

This boundary keeps the project honest and usable while leaving a clear path for a future server-side market-data integration.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs the same checks on pull requests and pushes to `main`.

## Technology

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React icons
- Browser local storage

## Current limitations

- No live-price API, authentication or cloud synchronisation.
- No currency conversion, dividends, fees or tax calculations.
- Data remains in the current browser profile and can be cleared by the user or browser.
- A production market-data version would need a licensed provider, server-side credential handling, caching, rate limiting and timestamped price provenance.

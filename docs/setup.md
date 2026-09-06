# Local Development Setup

## Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x / 10.x

## Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/dnyxtech/dnyx-draft.git
   cd dnyx-draft
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

From the monorepo root:

```bash
pnpm test          # run all tests once
pnpm test:watch    # watch mode
pnpm bench         # performance benchmarks
```

See [docs/testing.md](testing.md) for the full test structure and what each suite covers.

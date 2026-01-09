# DevSignals

DevSignals is a small analysis tool that visualizes how explicitly a web page communicates its structure and semantics to machines.

It focuses on **interpretability**, not ranking, quality, or optimization.


## What DevSignals Does

DevSignals analyzes a web document from a machine perspective and surfaces:

- whether the document structure is **deterministic** across repeated reads
- how much meaning is encoded **explicitly in markup**
- where machines must rely on **inference or heuristics**

The tool deliberately avoids scores, grades, or recommendations.


## What DevSignals Is *Not*

DevSignals is **not**:

- an SEO audit tool
- a Lighthouse replacement
- an accessibility checker
- a ranking or optimization engine

It does not answer *“Is this good or bad?”*  
It answers *“What does a machine actually see?”*

## Core Concepts

### Structural Signals

Structural signals describe whether repeated fetches of a page produce the same structural representation.

**This includes:**

- DOM stability across requests
- consistent node ordering
- absence of request-dependent structural variance

**Classification:**

- `deterministic`
- `mostly-deterministic`
- `unstable`

### Semantic Signals

Semantic signals describe how much meaning is encoded directly in markup, rather than inferred from presentation or heuristics.

**Examples:**

- heading hierarchy (`<h1>` usage, skipped levels)
- landmark elements (`<main>`, `<nav>`, etc.)
- reliance on generic containers (`div`, `span`)
- link text clarity without surrounding context

**Classification:**

- `explicit`
- `partial`
- `opaque`

### Observation → Interpretation

DevSignals always separates:

- **What was observed**
- **What this means for machines**

There are no hidden weights or aggregate scores. Every output is explainable.

## Design Principles

- Descriptive, not evaluative
- No numeric scoring
- No optimization advice
- No “best practices” framing
- Clear separation between observation and interpretation

The tool intentionally leaves judgment to the user.

## Architecture Overview

DevSignals is designed as a **deterministic analysis pipeline** with a UI.

- Analysis runs client-side
- HTML is fetched multiple times
- DOM is normalized and compared
- Results are classified and rendered

There is no backend dependency required for core logic.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

No UI frameworks or component libraries are used.

## Development

```bash
npm install
npm run dev

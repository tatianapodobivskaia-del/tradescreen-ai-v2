# TradeScreen AI

**AI-Powered Multi-List Sanctions Screening with Cyrillic-Latin Transliteration**

An academic research prototype exploring how artificial intelligence and multi-script transliteration can improve international compliance screening accuracy.

🔗 **Research Prototype:** [tradescreenai.com](https://tradescreenai.com)

---

## Research Problem

Traditional sanctions screening tools rely on exact-match or basic fuzzy matching, which fails to detect name variants across writing systems. A sanctioned entity written in Cyrillic may have dozens of valid Latin transliterations — most screening tools check only one.

This prototype investigates a novel approach: generating multiple transliteration variants across recognized standards and combining fuzzy matching with AI-powered contextual analysis to reduce both false negatives and false positives.

## Key Research Contributions

- **Multi-Script Transliteration Engine** — Generates multiple Latin variants from Cyrillic input using established transliteration standards with context-sensitive rules
- **Multi-Stage Screening Pipeline** — Automated pipeline from input normalization through AI-powered deep analysis
- **Multi-Agent Document Processing** — Intelligent document-level entity extraction and screening pipeline
- **Multi-List Coverage** — Screens against OFAC SDN, EU Consolidated, UN Security Council, and UK OFSI sanctions lists (45,000+ entities)
- **Composite Scoring System** — Weighted scoring model combining multiple risk signals for accurate match assessment

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Input  │────▶│  Transliteration  │────▶│  Multi-List     │
│  (Name/Doc)  │     │  Engine           │     │  Fuzzy Matching │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                    ┌──────────────────┐     ┌─────────▼────────┐
                    │  AI Deep Analysis │◀────│  Risk Assessment  │
                    │                   │     │                   │
                    └──────────────────┘     └──────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite, Framer Motion |
| UI Components | Radix UI, shadcn/ui |
| Backend | Azure Functions (Node.js), Azure OpenAI |
| Data Sources | OFAC SDN (CSV), EU Consolidated (XML), UN Security Council (XML), UK OFSI (CSV) |
| Deployment | Vercel |

## Performance (Controlled Test Dataset)

| Metric | Result |
|--------|--------|
| Detection Rate | Up to 97%* |
| False Positive Rate | ~8%* |
| Sanctions Lists | 4 (45,000+ entities) |
| Transliteration Standards | 4 |

*\*Results based on a controlled test dataset. Performance may vary with different data distributions.*

## Prototype Features

- **Screening Dashboard** — Manual name entry and batch file upload (CSV, Excel, Word, TXT)
- **AI Deep Analysis** — LLM-powered contextual risk assessment with structured reasoning
- **Document Scanner** — Multi-agent pipeline for document-level entity extraction and screening
- **Watchlist Explorer** — Browse and search across all 4 sanctions databases
- **Architecture Documentation** — Pipeline and system design documentation

## Academic Context

This prototype was developed as part of graduate research in Business Intelligence & Data Analytics at Atlantis University, Miami, FL. It explores the intersection of natural language processing, multi-script transliteration, and AI-powered compliance screening.

**Researcher:** Tatiana Podobivskaia
- [LinkedIn](https://linkedin.com/in/tatiana-podobivskaia)
- [GitHub](https://github.com/tatianapodobivskaia-del)

## Disclaimer

This is an academic research prototype and is not intended for production compliance use. It does not constitute legal, regulatory, or compliance advice. Organizations should use commercially licensed screening tools for actual sanctions compliance obligations. All sanctions data is sourced from publicly available government databases.

## License

© 2026 Tatiana Podobivskaia. All rights reserved.

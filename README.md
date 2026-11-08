# BriefMeet AI — Pre-Meeting Research Assistant (Phase 1)

> **Phase 1: Frontend Only Prototype** with simulated research intelligence and verifiable citations.

BriefMeet AI helps professionals prepare for critical meetings with prospective clients, partners, executives, and candidates by generating an executive, one-page briefing containing recent news from the last 30 days, key executive hires, product launches, suggested high-impact meeting questions, and verifiable source citations.

---

## 🎨 Design & Aesthetic

- **Primary Background**: Warm Beige (`#F5F0E6`)
- **Surfaces & Cards**: Warm White (`#FFFFFF` / `#FAF7F2`)
- **Typography & Structure**: Deep Charcoal (`#1D1A18` & `#2C2724`) with classic serif accents (`Newsreader` / `Merriweather`)
- **Accents**: Muted Gold (`#C29B48` / `#F8F1DE`) and Soft Brown (`#725E4B`)
- **Philosophy**: Minimalist, distraction-free SaaS interface optimized for readable executive preparation and single-page A4 printable briefings.

---

## 🚀 Quick Start (Running Locally in VS Code)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation & Run

1. **Open the project in VS Code:**
   ```bash
   cd "d:\Downloads\BriefMeet AI"
   code .
   ```

2. **Open the integrated terminal in VS Code (`Ctrl + \`` or `Terminal -> New Terminal`).**

3. **Install dependencies (already installed):**
   ```bash
   npm install
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Run production build:**
   ```bash
   npm run build
   ```

---

## 📁 Project Architecture & Components

```
BriefMeet AI/
├── public/
│   ├── logo.svg               # Local project brand asset
│   └── logo.png               # Local project image asset slot
├── .env.example               # Environment variables template for future APIs (Tavily, Gemini, Supabase)
├── index.html                 # HTML entry point with Google Fonts (Inter & Newsreader)
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Custom beige, warm brown, and gold SaaS theme
├── vite.config.js             # Vite configuration (port 3000)
├── src/
│   ├── main.jsx               # React 18 root mounting
│   ├── App.jsx                # Main state container & view routing
│   ├── index.css              # Custom styling, accessible focus rings & A4 print stylesheet
│   ├── data/
│   │   ├── mockBriefings.js   # Fictional demo entities, preset shortcuts, & initial history
│   │   └── mockUser.js        # Mock user profile data (prepared for Supabase Auth migration)
│   ├── services/
│   │   └── briefingService.js # 3-stage async pipeline simulation (Searching -> Analyzing -> Generating)
│   └── components/
│       ├── Logo.jsx           # Brand logo component loading local asset with graceful fallback
│       ├── Sidebar.jsx        # Navigation with hover effects & 1-click test presets
│       ├── UserProfileMenu.jsx# User avatar, dropdown menu, click-outside dismissal & Escape close
│       ├── Header.jsx         # Header branding, "Simulate Error" test toggle, & quick actions
│       ├── BriefingForm.jsx   # Input validation, date/time pickers, & entity type switcher
│       ├── BriefingViewToggle.jsx # Switcher between Detailed View and One-Page View
│       ├── OnePageBriefing.jsx# Compact executive briefing document styled for single-page A4 print
│       ├── BriefingProgress.jsx# 3-stage loading animation with percentage bar & stage indicators
│       ├── LoadingState.jsx   # Backward-compatible wrapper for BriefingProgress
│       ├── BriefingResults.jsx# Results controller rendering OnePage or Detailed views
│       ├── NewsCard.jsx       # 30-day news items with dates, sentiment, & [1] citation badges
│       ├── CitationBadge.jsx  # Numbered citation buttons with hover effects & click-to-highlight
│       ├── SourceCitation.jsx # Verifiable citations with mock publisher and publication dates
│       ├── ExportModal.jsx    # Export dialog with browser print engine & text copy
│       ├── EmptyState.jsx     # Friendly zero-results screen for unrecognized queries
│       ├── ErrorMessage.jsx   # Graceful error banner with troubleshooting and retry actions
│       └── BriefingHistory.jsx# Session history of past pre-meeting research briefs
```

---

## 💡 Key Phase 1 Improvements

1. **Brand Logo Integration**:
   - Centralized `Logo.jsx` component that loads local image assets (`/logo.svg` / `/logo.png`) with clean typography fallback.
2. **Interactive Hover Effects**:
   - 150–250ms smooth color transitions, subtle elevations (`hover:-translate-y-0.5`), warm shadow enhancements, and accessible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-gold-muted`).
3. **One-Page Briefing View (`OnePageBriefing.jsx`)**:
   - Toggle seamlessly between the comprehensive Detailed Dashboard and the compact One-Page Executive Briefing.
   - Styled with `@media print` and `@page { size: A4 portrait; margin: 12mm 15mm; }` for clean single-page printing.
4. **Enhanced Citation Grounding**:
   - Interactive numbered citation badges (`[1]`, `[2]`, `[3]`) appear directly beside factual developments, leadership changes, and product releases.
   - Clicking any citation smoothly scrolls to and highlights the corresponding source entry.
5. **3-Stage Loading Experience (`BriefingProgress.jsx`)**:
   - Clear visual progression: **Stage 1: Searching Sources** $\rightarrow$ **Stage 2: Analyzing Information** $\rightarrow$ **Stage 3: Generating Briefing** with animated progress indicator.
6. **User Profile Section (`UserProfileMenu.jsx`)**:
   - Replaced temporary hackathon branding in the sidebar with a professional SaaS user profile ("Demo User", initials "DU").
   - Clickable dropdown menu with "My Profile", "Settings", and "Help & Support" placeholders, fully keyboard-accessible with `Escape` key and outside-click dismissal.
7. **Transparent Export Workflow**:
   - Clean A4 PDF export using the browser's native print engine (styled specifically for the one-page view) and formatted clipboard copying.

---

## 🔮 Phase 2 Integration Blueprint

The service layer in `src/services/briefingService.js` is isolated so connecting real APIs will require **zero changes** to UI components:

| Service / Tool | Planned Responsibility in Phase 2 | Components Connected |
| :--- | :--- | :--- |
| **Tavily Search API** | Real-time web intelligence querying news from the last 30 days, press releases, and executive appointments. | `briefingService.js` $\rightarrow$ feeds `newsLast30Days` & `sources` into `NewsCard.jsx`, `OnePageBriefing.jsx`, and `SourceCitation.jsx`. |
| **Google Gemini API** | Natural language synthesis, extracting key developments, generating targeted executive questions, and summarizing company priorities. | `briefingService.js` $\rightarrow$ populates `executiveSummary` & `suggestedQuestions` in `BriefingResults.jsx` and `OnePageBriefing.jsx`. |
| **Supabase Database & Auth** | User authentication, persistent user profiles, and cloud storage of past briefings. | Replaces mock user in `UserProfileMenu.jsx` and session history in `BriefingHistory.jsx`. |

---

## 📄 License

Released under the MIT License.

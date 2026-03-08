# 🌰 Regulatory Pulse

**AI-Powered Crypto Regulation Intelligence Dashboard**

Track global cryptocurrency regulation, compliance actions, and enforcement activity — analyzed by AI, delivered weekly to a clean static dashboard.

## 🌰 What It Does

Regulatory Pulse monitors the crypto regulatory landscape across the US, EU, and Asia-Pacific, using the CPW API to fetch real-time events and GitHub Models (gpt-4o-mini) to generate structured intelligence briefs with jurisdiction breakdowns and impact assessments.

## 🌰 How It Works

```
CPW API → events.json → GitHub Models AI → brief.json → Dashboard
```

1. **Fetch** — `scripts/api-call.js` pulls the latest regulation/compliance/enforcement events from the CPW Tracker API (7-day window)
2. **Analyze** — `scripts/generate-brief.js` sends events to GitHub Models for AI-powered categorization by jurisdiction and impact level
3. **Display** — `index.html` renders a professional intelligence dashboard on GitHub Pages

The GitHub Actions workflow runs weekly (Sunday 12:00 UTC) and on manual trigger.

## 🌰 Setup

1. **Fork** this repository
2. **Add secrets** in Settings → Secrets → Actions:
   - `RAPIDAPI_KEY` — Subscribe to [CPW API](https://rapidapi.com/CPWatch/api/cpw-tracker) (Basic plan, 100 free requests/month)
   - `GITHUB_TOKEN` — Automatically available (used for GitHub Models AI analysis)
3. **Enable GitHub Pages** in Settings → Pages → Source: GitHub Actions
4. **Run workflow** — Go to Actions → "🌰 Regulatory Pulse Deploy" → Run workflow

## 🌰 Dashboard Preview

<!-- Screenshot placeholder: replace with actual screenshot after deployment -->
> Deploy to GitHub Pages to see the live dashboard with regulatory events organized by jurisdiction (US/EU/Asia/Global) and color-coded impact levels.

## 🌰 Tech Stack

| Component | Technology |
|-----------|-----------|
| Data Source | [CPW Tracker API](https://rapidapi.com/CPWatch/api/cpw-tracker) |
| AI Analysis | [GitHub Models](https://docs.github.com/en/github-models) (gpt-4o-mini) |
| Hosting | GitHub Pages |
| Frontend | Vanilla HTML/CSS/JS |
| Automation | GitHub Actions (weekly cron) |

## 🌰 File Structure

```
├── .github/workflows/deploy.yml   # CI/CD + GitHub Pages deployment
├── scripts/
│   ├── api-call.js                 # CPW API data fetcher
│   └── generate-brief.js          # AI brief generator
├── data/
│   ├── events.json                 # Raw regulatory events
│   └── brief.json                  # AI-analyzed intelligence brief
├── index.html                      # Dashboard (single-file, no dependencies)
├── package.json
└── README.md
```

## 🌰 License

MIT

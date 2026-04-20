# Decision Intelligence Engine

> Transform raw meeting transcripts into structured decision intelligence — automatically.

This is **not a summarization tool**. It is a full decision intelligence pipeline that reads a messy meeting transcript and produces a structured report containing the problem statement, business goals, explicit and implicit requirements, risks, ambiguities, root cause analysis, team-wise action items, and solution suggestions — all in strict JSON format.

---

## What it does

Most meeting summaries just compress text. This engine **reasons** about text. It runs a 7-step prompt pipeline powered by Groq's ultra-fast LLM inference and extracts the kind of structured intelligence that a senior product manager or solutions architect would produce after deeply analyzing a meeting.

**Input:** A raw meeting transcript (Google Meet, Microsoft Teams, Zoom, or manual notes)

**Output:** A fully structured intelligence report with:

| Section | Description |
|---|---|
| Problem statement | Precise 2–3 sentence description of the core issue and its business impact |
| Business goals | Explicit and implicit goals, each with priority level |
| Explicit requirements | Things clearly stated by participants, with source quotes |
| Implicit requirements | Things assumed but never said — the engine catches these |
| Ambiguities | Unanswered questions and what clarification is needed |
| Missing information | Topics nobody discussed that could cause problems later |
| Risks | Every potential failure, with severity, likelihood, and mitigation |
| Root cause analysis | Full 5-Whys chain down to the systemic root cause |
| Action items | Tasks grouped by team, with owner, priority, effort, and deadline |
| Solutions | 2–3 concrete approaches with pros, cons, tech stack, and a recommendation |

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| LLM inference | Groq API (llama3-70b-8192 / mixtral-8x7b) |
| Prompt pipeline | 7-step modular prompt chain |
| Frontend | React 18, Vite |
| Styling | Pure CSS with CSS variables |
| Deployment — backend | Render (free tier) |
| Deployment — frontend | Vercel (free tier) |

---

## Why Groq?

Groq runs open-source LLMs (LLaMA 3, Mixtral) at extremely fast inference speeds — often 10–20x faster than standard OpenAI API calls. The free tier is generous enough to run the full 7-step pipeline on a single transcript without hitting limits. No credit card required.

---

## Project structure

```
ba_auto/
├── backend/
│   ├── main.py              # FastAPI app — POST /analyze endpoint
│   ├── pipeline.py          # Orchestrates all 7 prompt steps
│   ├── prompts.py           # All 7 prompt templates
│   ├── llm_client.py        # Groq API integration layer
│   ├── models.py            # Pydantic request and response models
│   ├── config.py            # Environment variable loader
│   ├── utils.py             # JSON parsing helpers
│   ├── requirements.txt     # Python dependencies
│   ├── render.yaml          # Render deployment config
│   └── .env                 # Your secrets (never committed to git)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                          # Root component + state management
│   │   ├── index.css                        # Full stylesheet
│   │   └── components/
│   │       ├── TranscriptInput.jsx          # Input screen
│   │       ├── LoadingPipeline.jsx          # Animated loading screen
│   │       └── AnalysisReport.jsx           # 6-tab results report
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/Mukeshdas303/decision-intelligence-engine.git
cd decision-intelligence-engine
```

### 2. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```bash
touch .env
```

Add your Groq API key:

```
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama3-70b-8192
MAX_TOKENS=2000
TEMPERATURE=0.2
DEBUG=true
```

Start the backend:

```bash
cd ..
uvicorn backend.main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`.
Visit `http://localhost:8000/docs` to see the interactive API documentation.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

The frontend runs at `http://localhost:3000`.

---

## How to use it

1. Open `http://localhost:3000` in your browser
2. Paste your meeting transcript into the large text area
3. Optionally add a meeting title
4. Click **"Analyze transcript →"**
5. Wait 20–40 seconds while the 7-step pipeline runs
6. Read your structured intelligence report across 6 tabs

To test without a real transcript, click **"Load sample transcript"** — it fills in a demo meeting about a checkout performance issue.

---

## The 7-step prompt pipeline

Each step uses a purpose-built prompt and returns strict JSON. Steps run in sequence — the output of earlier steps feeds into later ones.

```
Step 1 → Transcript cleaning
         Removes filler words, fixes speaker labels, normalises formatting

Step 2 → Problem + goal extraction
         Identifies the core problem and business goals (explicit + implicit)

Step 3 → Requirements extraction
         Splits into explicit (stated) and implicit (assumed) requirements

Step 4 → Ambiguity + risk detection
         Flags unanswered questions, missing information, and potential risks

Step 5 → Root cause analysis
         Builds a 5-Whys chain to find the systemic root cause

Step 6 → Action item generation
         Produces team-wise tasks with owner, priority, effort, and deadline

Step 7 → Solution suggestions
         Recommends 2–3 concrete approaches with tradeoffs and a top recommendation
```

---

## API reference

### POST /analyze

Analyzes a meeting transcript and returns the full intelligence report.

**Request body:**

```json
{
  "transcript": "John: We need to fix the checkout. Sara: Agreed, it's too slow...",
  "meeting_title": "Q3 Checkout Review",
  "meeting_date": "2024-07-15"
}
```

**Response:** Full structured JSON with all 7 pipeline outputs. See the example below.

### GET /health

Returns server status.

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## Example output (abbreviated)

```json
{
  "success": true,
  "meeting_title": "Q3 Checkout Performance Review",
  "pipeline_steps_completed": 7,
  "problem_statement": "The checkout payment flow takes 8-12 seconds to complete, causing a 23% cart abandonment rate and approximately $40,000 per week in lost revenue...",
  "business_goals": [
    { "goal": "Reduce checkout latency to under 2 seconds", "type": "explicit", "priority": "high" },
    { "goal": "Recover lost revenue from cart abandonment before Q3", "type": "implicit", "priority": "high" }
  ],
  "requirements": {
    "explicit_requirements": [...],
    "implicit_requirements": [...]
  },
  "risks": [...],
  "root_cause_analysis": {
    "root_cause": "The payment gateway was integrated synchronously with no async handling or timeout logic...",
    "why_chain": [...]
  },
  "action_items": {
    "action_items": [...],
    "summary_by_team": { "Engineering": 3, "Product": 2, "DevOps": 1 }
  },
  "solutions": {
    "overall_recommendation": {
      "recommended_solution_id": "SOL-001",
      "reasoning": "..."
    }
  }
}
```

---

## Deployment

The app is deployed with the backend on Render and the frontend on Vercel — both free.

### Backend — Render

1. Push code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Connect your repository
4. Add environment variable `GROQ_API_KEY` in the Render dashboard
5. Render uses `render.yaml` for all other settings automatically

### Frontend — Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Import your repository
3. Set root directory to `frontend`
4. Add environment variable `VITE_BACKEND_URL` pointing to your Render URL
5. Deploy

**Live URLs:**
- Frontend: `https://decision-intelligence-engine.vercel.app`
- Backend: `https://decision-intelligence-backend.onrender.com`
- API docs: `https://decision-intelligence-backend.onrender.com/docs`

> Note: Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes 30–50 seconds to wake up. This is normal behaviour for the free plan.

---

## Environment variables

### Backend `.env`

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key from console.groq.com | Required |
| `GROQ_MODEL` | Model to use | `llama3-70b-8192` |
| `MAX_TOKENS` | Max tokens per LLM call | `2000` |
| `TEMPERATURE` | LLM temperature (0 = deterministic) | `0.2` |
| `DEBUG` | Enable debug logging | `false` |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | URL of the deployed backend |

---

## Key design decisions

**Why a multi-step pipeline instead of one big prompt?**
Each step uses a specialised prompt optimised for one task. This produces significantly better output than a single "do everything" prompt, allows individual steps to be retried or upgraded, and makes the system easier to debug.

**Why Groq instead of OpenAI?**
Groq offers free, fast inference on powerful open-source models. For a portfolio project that needs to demonstrate capabilities without ongoing cost, it is the ideal choice. The LLM layer is fully modular — switching to OpenAI, Gemini, or Anthropic requires changing only `llm_client.py` and `config.py`.

**Why FastAPI?**
FastAPI auto-generates interactive API documentation at `/docs`, has built-in request validation via Pydantic, and is one of the fastest Python web frameworks available. It makes the backend easy to test and extend.

**Why strict JSON outputs?**
Every pipeline step returns structured JSON, not free-form text. This makes the output machine-readable, consistent, and directly usable by downstream tools like Jira, Notion, or Slack integrations.

---

## Future improvements

- **Jira integration** — auto-create tickets from action items with one click
- **Slack integration** — post the intelligence report to a Slack channel after analysis
- **Notion integration** — save reports as Notion pages in your workspace
- **Real-time meeting integration** — connect directly to Google Meet or Teams via their APIs
- **Requirement version tracking** — compare requirements across multiple meetings on the same project
- **Export to PDF** — download the full report as a formatted PDF
- **Multi-language support** — analyse transcripts in Hindi, Spanish, French, and other languages
- **Speaker analytics** — track who made which decisions and action item completion rates
- **History dashboard** — view and search all past analyses

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Mukesh Das**
- GitHub: [@Mukeshdas303](https://github.com/Mukeshdas303)

---

> Built as a portfolio project demonstrating production-grade AI/ML engineering with FastAPI, Groq LLM inference, React, and a multi-step prompt pipeline architecture.

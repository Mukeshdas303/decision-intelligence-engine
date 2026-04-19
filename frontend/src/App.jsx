import { useState } from "react";
import TranscriptInput from "./components/TranscriptInput";
import AnalysisReport from "./components/AnalysisReport";
import LoadingPipeline from "./components/LoadingPipeline";
import "./index.css";

const SAMPLE_TRANSCRIPT = `John (Product Manager): Alright everyone, let's get started. The main reason we're here today is our checkout page is performing terribly. Sara, can you share the numbers?

Sara (Engineering Lead): Sure. So we're seeing average load times of about 8 to 12 seconds on the payment step. Our monitoring shows the payment gateway calls are synchronous and blocking the entire UI thread. Last week we had a 23% cart abandonment rate directly at the payment screen.

John: That's costing us real money. Finance estimated we're losing roughly 40,000 dollars a week from this alone. We need this fixed before the Q3 investor review which is in 6 weeks.

Mike (Backend Engineer): I've looked at the code. The payment gateway integration was built two years ago and it's making synchronous API calls. There's no timeout handling, no retry logic, and the entire request waits for the gateway to respond before rendering anything to the user.

Sara: And we're not caching any of the session data either, so every page load re-fetches everything from the database.

John: Okay so what are our options?

Mike: Option one is we make the payment calls asynchronous and add a loading state. That's probably a week of work. Option two is we switch to a faster payment gateway like Stripe, their median response time is under 800ms compared to our current gateway at 6 seconds.

Sara: I'd recommend we do both. Short term, add async handling and timeout fallbacks. Long term, evaluate Stripe or Adyen.

John: Agreed. Mike, can you own the async fix? Sara, can you do a proper evaluation of Stripe versus our current provider and bring numbers to next week's meeting?

Sara: Yes, I'll have a comparison doc ready by Thursday.

Mike: I can have the async fix in staging by Wednesday.

John: Perfect. Also, we should add proper monitoring so we catch these things earlier. Do we have anyone who can set up Datadog or similar?

Sara: I'll ask the DevOps team. Priya usually handles that.

John: Great. Let's make sure QA tests the payment flow end to end before we ship. I don't want any surprises.`;

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const PIPELINE_STEPS = [
    "Cleaning transcript",
    "Extracting problem & goals",
    "Identifying requirements",
    "Detecting risks & ambiguities",
    "Running root cause analysis",
    "Generating action items",
    "Suggesting solutions",
  ];

  async function analyze() {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);

    // Simulate step-by-step progress while waiting for real API
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1800);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          meeting_title: meetingTitle || undefined,
        }),
      });

      clearInterval(stepInterval);
      setCurrentStep(PIPELINE_STEPS.length);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      clearInterval(stepInterval);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setCurrentStep(0);
    setTranscript("");
    setMeetingTitle("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark">
            <div className="logo-icon">
              <span className="logo-dot d1" />
              <span className="logo-dot d2" />
              <span className="logo-dot d3" />
            </div>
            <div>
              <h1 className="app-title">Decision Intelligence Engine</h1>
              <p className="app-subtitle">Transform meeting transcripts into structured intelligence</p>
            </div>
          </div>
          {result && (
            <button className="btn-ghost" onClick={reset}>
              ← New analysis
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {!result && !loading && (
          <TranscriptInput
            transcript={transcript}
            setTranscript={setTranscript}
            meetingTitle={meetingTitle}
            setMeetingTitle={setMeetingTitle}
            onAnalyze={analyze}
            onLoadSample={() => {
              setTranscript(SAMPLE_TRANSCRIPT);
              setMeetingTitle("Q3 Checkout Performance Review");
            }}
          />
        )}

        {loading && (
          <LoadingPipeline steps={PIPELINE_STEPS} currentStep={currentStep} />
        )}

        {error && !loading && (
          <div className="error-card">
            <div className="error-icon">!</div>
            <div>
              <p className="error-title">Analysis failed</p>
              <p className="error-msg">{error}</p>
              <p className="error-hint">Make sure your backend is running on <code>localhost:8000</code></p>
            </div>
            <button className="btn-primary" onClick={reset}>Try again</button>
          </div>
        )}

        {result && !loading && <AnalysisReport data={result} />}
      </main>
    </div>
  );
}

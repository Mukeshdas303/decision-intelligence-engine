export default function LoadingPipeline({ steps, currentStep }) {
  return (
    <div className="loading-page">
      <div className="loading-header">
        <div className="spinner" />
        <h2 className="loading-title">Analyzing your transcript</h2>
        <p className="loading-sub">Running {steps.length}-step decision intelligence pipeline</p>
      </div>

      <div className="pipeline-steps">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={step}
              className={`pipeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}
            >
              <div className="step-indicator">
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#1D9E75" />
                    <path d="M4.5 8l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <div className="step-pulse" />
                ) : (
                  <div className="step-empty">{i + 1}</div>
                )}
              </div>
              <div className="step-content">
                <span className="step-label">{step}</span>
                {active && <span className="step-running">Running...</span>}
                {done && <span className="step-done-label">Complete</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="loading-note">
        This usually takes 20–40 seconds depending on transcript length and your LLM plan.
      </p>
    </div>
  );
}

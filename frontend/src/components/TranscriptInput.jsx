export default function TranscriptInput({
  transcript,
  setTranscript,
  meetingTitle,
  setMeetingTitle,
  onAnalyze,
  onLoadSample,
}) {
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const canAnalyze = transcript.trim().length >= 50;

  return (
    <div className="input-page">
      <div className="input-hero">
        <h2 className="hero-heading">
          Drop your meeting transcript.<br />
          <span className="hero-accent">We'll do the thinking.</span>
        </h2>
        <p className="hero-desc">
          Paste any transcript from Google Meet, Microsoft Teams, Zoom, or manual notes.
          The engine extracts problems, requirements, risks, action items, and solutions automatically.
        </p>
      </div>

      <div className="input-card">
        <div className="input-row">
          <div className="field">
            <label className="field-label">Meeting title <span className="optional">(optional)</span></label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. Q3 Checkout Performance Review"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <div className="field-label-row">
            <label className="field-label">Transcript</label>
            <span className="word-count">{wordCount > 0 ? `${wordCount} words` : ""}</span>
          </div>
          <textarea
            className="transcript-area"
            placeholder="Paste your meeting transcript here...&#10;&#10;Example format:&#10;John: We need to fix the checkout page.&#10;Sara: Agreed, the payment gateway is too slow."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={14}
          />
        </div>

        <div className="input-actions">
          <button className="btn-ghost" onClick={onLoadSample}>
            Load sample transcript
          </button>
          <button
            className="btn-primary"
            onClick={onAnalyze}
            disabled={!canAnalyze}
          >
            Analyze transcript →
          </button>
        </div>

        {transcript.length > 0 && transcript.length < 50 && (
          <p className="input-hint">Transcript is too short — paste a real meeting transcript for best results.</p>
        )}
      </div>

      <div className="feature-grid">
        {[
          { icon: "◆", label: "Problem extraction", desc: "Surfaces the core issue and business impact clearly" },
          { icon: "◈", label: "Implicit requirements", desc: "Catches what teams assumed but never said out loud" },
          { icon: "◉", label: "Risk detection", desc: "Flags every gap, ambiguity, and potential failure" },
          { icon: "◇", label: "Root cause analysis", desc: "Builds a why-chain to the origin of the problem" },
          { icon: "◎", label: "Team action items", desc: "Tasks grouped by team with owner and priority" },
          { icon: "○", label: "Solution suggestions", desc: "Concrete approaches with tech stack and tradeoffs" },
        ].map((f) => (
          <div className="feature-card" key={f.label}>
            <span className="feature-icon">{f.icon}</span>
            <p className="feature-label">{f.label}</p>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

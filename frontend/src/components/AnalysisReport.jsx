import { useState } from "react";

const PRIORITY_COLORS = {
  "P0-critical": { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  "P1-high":     { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  "P2-medium":   { bg: "#E6F1FB", text: "#0C447C", border: "#B5D4F4" },
  "P3-low":      { bg: "#F1EFE8", text: "#444441", border: "#D3D1C7" },
  "high":        { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  "medium":      { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  "low":         { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" },
  "critical":    { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  "must-have":   { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  "should-have": { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  "nice-to-have":{ bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" },
};

function Badge({ label, colorKey }) {
  const c = PRIORITY_COLORS[colorKey] || PRIORITY_COLORS["low"];
  return (
    <span style={{
      background: c.bg, color: c.text,
      border: `0.5px solid ${c.border}`,
      borderRadius: 6, padding: "2px 8px",
      fontSize: 11, fontWeight: 500, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function Section({ id, title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="report-section">
      <button className="section-header" onClick={() => setOpen(!open)}>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        <span className="section-toggle">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function StatBar({ label, value, max = 5 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 80 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "var(--color-border-tertiary)", borderRadius: 2 }}>
        <div style={{
          height: 4, borderRadius: 2,
          width: `${(value / max) * 100}%`,
          background: "#1D9E75"
        }} />
      </div>
    </div>
  );
}

export default function AnalysisReport({ data }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview",     label: "Overview" },
    { id: "requirements", label: "Requirements" },
    { id: "risks",        label: "Risks & Gaps" },
    { id: "rootcause",   label: "Root Cause" },
    { id: "actions",      label: "Action Items" },
    { id: "solutions",    label: "Solutions" },
  ];

  const totalReqs =
    (data.requirements?.explicit_requirements?.length || 0) +
    (data.requirements?.implicit_requirements?.length || 0);

  return (
    <div className="report-page">
      {/* Top summary bar */}
      <div className="report-hero">
        <div>
          <h2 className="report-title">
            {data.meeting_title || "Meeting Analysis"}
          </h2>
          <p className="report-meta">
            {data.pipeline_steps_completed}/7 steps completed
            {data.meeting_date ? ` · ${data.meeting_date}` : ""}
            {data.solutions?.meeting_intent ? ` · ${data.solutions.meeting_intent}` : ""}
          </p>
        </div>
        <div className="report-stats">
          <div className="stat-pill">{totalReqs} requirements</div>
          <div className="stat-pill">{data.risks?.length || 0} risks</div>
          <div className="stat-pill">{data.action_items?.action_items?.length || 0} tasks</div>
          <div className="stat-pill">{data.solutions?.solutions?.length || 0} solutions</div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* ── OVERVIEW ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="tab-panel">
            <div className="overview-grid">
              <div className="overview-main">
                <Section title="Problem statement" icon="◉" defaultOpen>
                  <p className="problem-text">{data.problem_statement}</p>
                </Section>

                <Section title="Business goals" icon="◆" defaultOpen>
                  <div className="goals-list">
                    {data.business_goals?.map((g, i) => (
                      <div key={i} className="goal-item">
                        <div className="goal-row">
                          <span className="goal-text">{g.goal}</span>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <Badge label={g.type} colorKey={g.type === "explicit" ? "must-have" : "should-have"} />
                            <Badge label={g.priority} colorKey={g.priority} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              <div className="overview-side">
                <div className="side-card">
                  <p className="side-card-title">Pipeline summary</p>
                  <StatBar label="Steps done" value={data.pipeline_steps_completed} max={7} />
                  <StatBar label="Requirements" value={Math.min(totalReqs, 10)} max={10} />
                  <StatBar label="Risks found" value={Math.min(data.risks?.length || 0, 8)} max={8} />
                  <StatBar label="Tasks created" value={Math.min(data.action_items?.action_items?.length || 0, 10)} max={10} />
                </div>

                {data.solutions?.meeting_intent && (
                  <div className="side-card">
                    <p className="side-card-title">Meeting intent</p>
                    <div className="intent-badge">
                      {data.solutions.meeting_intent}
                    </div>
                  </div>
                )}

                {data.action_items?.summary_by_team && (
                  <div className="side-card">
                    <p className="side-card-title">Tasks by team</p>
                    {Object.entries(data.action_items.summary_by_team).map(([team, count]) => (
                      <div key={team} className="team-row">
                        <span className="team-name">{team}</span>
                        <span className="team-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {data.errors?.length > 0 && (
                  <div className="side-card warn-card">
                    <p className="side-card-title">Pipeline warnings</p>
                    {data.errors.map((e, i) => (
                      <p key={i} className="warn-text">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REQUIREMENTS ──────────────────────────────────────────── */}
        {activeTab === "requirements" && (
          <div className="tab-panel">
            <Section title={`Explicit requirements (${data.requirements?.explicit_requirements?.length || 0})`} icon="◈" defaultOpen>
              <p className="section-desc">Clearly and directly stated by participants during the meeting.</p>
              <div className="req-list">
                {data.requirements?.explicit_requirements?.map((r) => (
                  <div key={r.id} className="req-card">
                    <div className="req-header">
                      <span className="req-id">{r.id}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Badge label={r.category} colorKey="low" />
                        <Badge label={r.priority} colorKey={r.priority} />
                      </div>
                    </div>
                    <p className="req-desc">{r.description}</p>
                    {r.source && (
                      <div className="req-source">
                        <span className="source-label">Source: </span>
                        <span className="source-text">"{r.source}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Implicit requirements (${data.requirements?.implicit_requirements?.length || 0})`} icon="◇" defaultOpen>
              <p className="section-desc">Implied by context or industry standards — never explicitly stated, but clearly expected.</p>
              <div className="req-list">
                {data.requirements?.implicit_requirements?.map((r) => (
                  <div key={r.id} className="req-card implicit">
                    <div className="req-header">
                      <span className="req-id">{r.id}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Badge label={r.category} colorKey="low" />
                        <Badge label={r.priority} colorKey={r.priority} />
                      </div>
                    </div>
                    <p className="req-desc">{r.description}</p>
                    {r.rationale && (
                      <div className="req-source">
                        <span className="source-label">Why implied: </span>
                        <span className="source-text">{r.rationale}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── RISKS & GAPS ──────────────────────────────────────────── */}
        {activeTab === "risks" && (
          <div className="tab-panel">
            <Section title={`Risks (${data.risks?.length || 0})`} icon="⚑" defaultOpen>
              <div className="risk-list">
                {data.risks?.map((r) => (
                  <div key={r.id} className={`risk-card sev-${r.severity}`}>
                    <div className="risk-header">
                      <span className="req-id">{r.id}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Badge label={r.risk_type} colorKey="low" />
                        <Badge label={`${r.severity} severity`} colorKey={r.severity} />
                        <Badge label={`${r.likelihood} likelihood`} colorKey={r.likelihood === "high" ? "high" : "medium"} />
                      </div>
                    </div>
                    <p className="req-desc">{r.description}</p>
                    <div className="mitigation-box">
                      <span className="mitigation-label">Mitigation: </span>
                      <span>{r.mitigation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Ambiguities (${data.ambiguities?.length || 0})`} icon="?" defaultOpen>
              <div className="req-list">
                {data.ambiguities?.map((a) => (
                  <div key={a.id} className="req-card">
                    <span className="req-id">{a.id}</span>
                    <p className="req-desc">{a.description}</p>
                    <div className="req-source">
                      <span className="source-label">Clarification needed: </span>
                      <span className="source-text">{a.clarification_needed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Missing information (${data.missing_information?.length || 0})`} icon="○" defaultOpen>
              <div className="req-list">
                {data.missing_information?.map((m, i) => (
                  <div key={i} className="req-card">
                    <p className="req-desc" style={{ fontWeight: 500 }}>{m.topic}</p>
                    <p className="req-desc" style={{ marginTop: 4 }}>{m.why_it_matters}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── ROOT CAUSE ────────────────────────────────────────────── */}
        {activeTab === "rootcause" && (
          <div className="tab-panel">
            <Section title="Root cause analysis" icon="◉" defaultOpen>
              <div className="rca-surface">
                <span className="rca-label">Surface problem</span>
                <p className="rca-text">{data.root_cause_analysis?.surface_problem}</p>
              </div>

              <div className="why-chain">
                <p className="why-chain-title">5 Whys chain</p>
                {data.root_cause_analysis?.why_chain?.map((w) => (
                  <div key={w.level} className="why-item">
                    <div className="why-level">Why {w.level}</div>
                    <div className="why-content">
                      <p className="why-question">{w.why}</p>
                      <p className="why-because">→ {w.because}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="root-cause-box">
                <span className="root-cause-label">Root cause</span>
                <p className="root-cause-text">{data.root_cause_analysis?.root_cause}</p>
              </div>

              {data.root_cause_analysis?.contributing_factors?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p className="sub-section-title">Contributing factors</p>
                  <ul className="factor-list">
                    {data.root_cause_analysis.contributing_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.root_cause_analysis?.systemic_issues?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p className="sub-section-title">Systemic issues</p>
                  <ul className="factor-list systemic">
                    {data.root_cause_analysis.systemic_issues.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── ACTION ITEMS ──────────────────────────────────────────── */}
        {activeTab === "actions" && (
          <div className="tab-panel">
            {data.action_items?.summary_by_team && (
              <div className="team-summary-bar">
                {Object.entries(data.action_items.summary_by_team).map(([team, count]) => (
                  <div key={team} className="team-chip">
                    <span className="team-chip-name">{team}</span>
                    <span className="team-chip-count">{count}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="task-list">
              {data.action_items?.action_items?.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div className="task-left">
                      <span className="req-id">{task.id}</span>
                      <span className="task-team">{task.team}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge label={task.priority} colorKey={task.priority} />
                      <Badge label={task.effort} colorKey={task.effort === "small" ? "low" : task.effort === "large" ? "high" : "medium"} />
                    </div>
                  </div>
                  <p className="task-title">{task.title}</p>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-footer">
                    <span className="task-owner">Owner: <strong>{task.owner}</strong></span>
                    {task.deadline !== "Not specified" && (
                      <span className="task-deadline">Due: {task.deadline}</span>
                    )}
                  </div>
                  {task.depends_on?.length > 0 && (
                    <div className="task-deps">
                      Depends on: {task.depends_on.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOLUTIONS ─────────────────────────────────────────────── */}
        {activeTab === "solutions" && (
          <div className="tab-panel">
            {data.solutions?.overall_recommendation && (
              <div className="recommendation-card">
                <div className="rec-header">
                  <span className="rec-badge">Recommended</span>
                  <span className="rec-id">{data.solutions.overall_recommendation.recommended_solution_id}</span>
                </div>
                <p className="rec-reasoning">{data.solutions.overall_recommendation.reasoning}</p>
                {data.solutions.overall_recommendation.first_steps?.length > 0 && (
                  <div>
                    <p className="sub-section-title" style={{ marginBottom: 8 }}>First steps</p>
                    <ol className="first-steps-list">
                      {data.solutions.overall_recommendation.first_steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="solutions-grid">
              {data.solutions?.solutions?.map((sol) => {
                const isRecommended = sol.id === data.solutions?.overall_recommendation?.recommended_solution_id;
                return (
                  <div key={sol.id} className={`solution-card ${isRecommended ? "recommended" : ""}`}>
                    <div className="sol-header">
                      <div>
                        <span className="req-id">{sol.id}</span>
                        <Badge
                          label={sol.approach_type}
                          colorKey={sol.approach_type === "quick-win" ? "low" : sol.approach_type === "long-term" ? "must-have" : "should-have"}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="complexity-badge">complexity: {sol.complexity}</span>
                        <span className="impact-badge">impact: {sol.impact}</span>
                      </div>
                    </div>

                    <p className="sol-title">{sol.title}</p>
                    <p className="sol-desc">{sol.description}</p>

                    {sol.tech_stack?.length > 0 && (
                      <div className="tech-stack">
                        {sol.tech_stack.map((t) => (
                          <span key={t} className="tech-tag">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="pros-cons">
                      <div className="pros">
                        <p className="pros-title">Pros</p>
                        <ul>{sol.pros?.map((p, i) => <li key={i}>{p}</li>)}</ul>
                      </div>
                      <div className="cons">
                        <p className="cons-title">Cons</p>
                        <ul>{sol.cons?.map((c, i) => <li key={i}>{c}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

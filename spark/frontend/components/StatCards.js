// Summary tiles showing open vs resolved counts.
export default function StatCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Requests", value: stats.total, tone: "neutral" },
    { label: "Pending", value: stats.by_status.Pending, tone: "pending" },
    { label: "In Progress", value: stats.by_status["In Progress"], tone: "progress" },
    { label: "Resolved", value: stats.resolved, tone: "resolved" },
  ];

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div key={c.label} className={`card stat-card stat-${c.tone}`}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

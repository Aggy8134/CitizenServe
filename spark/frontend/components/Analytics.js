// Simple CSS-only charts: open vs resolved split and requests per category.
export default function Analytics({ stats }) {
  if (!stats || stats.total === 0) return null;

  const pct = (n) => (n / stats.total) * 100;
  const maxCategory = Math.max(...stats.by_category.map((c) => c.n));

  return (
    <div className="analytics-grid">
      <div className="card">
        <h3 className="card-title">Open vs Resolved</h3>
        <div className="split-bar" role="img" aria-label="Status breakdown">
          <span className="seg seg-pending" style={{ width: `${pct(stats.by_status.Pending)}%` }} />
          <span className="seg seg-progress" style={{ width: `${pct(stats.by_status["In Progress"])}%` }} />
          <span className="seg seg-resolved" style={{ width: `${pct(stats.resolved)}%` }} />
        </div>
        <ul className="legend">
          <li><i className="dot seg-pending" /> Pending · {stats.by_status.Pending}</li>
          <li><i className="dot seg-progress" /> In Progress · {stats.by_status["In Progress"]}</li>
          <li><i className="dot seg-resolved" /> Resolved · {stats.resolved}</li>
        </ul>
        <div className="big-metric">
          <strong>{stats.open}</strong> open · <strong>{stats.resolution_rate}%</strong> resolution rate
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Requests by Category</h3>
        <ul className="bar-list">
          {stats.by_category.map((c) => (
            <li key={c.category}>
              <span className="bar-label">{c.category}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(c.n / maxCategory) * 100}%` }} />
              </span>
              <span className="bar-value">{c.n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

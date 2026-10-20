const CLASS_BY_STATUS = {
  Pending: "badge-pending",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASS_BY_STATUS[status] || ""}`}>{status}</span>;
}

export default function HistoryPanel({ history, onSelect }) {
  return (
    <aside className="history">
      <h3>Previously generated</h3>
      {history.length === 0 && (
        <p className="hint" style={{ color: "var(--text-muted)" }}>
          Your generated courses will show up here.
        </p>
      )}
      {history.map((item) => (
        <button className="history-item" key={item._id} onClick={() => onSelect(item._id)}>
          <strong>{item.title}</strong>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </button>
      ))}
    </aside>
  );
}

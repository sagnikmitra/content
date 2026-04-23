export default function Filters({ value, onChange }) {
  return (
    <section className="flex flex-wrap items-center gap-2 py-2">
      <input
        placeholder="Search…"
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        className="border rounded px-2 py-1"
      />
      <select
        value={value.channel}
        onChange={(e) => onChange({ ...value, channel: e.target.value })}
        className="border rounded px-2 py-1"
      >
        <option value="all">All channels</option>
        <option value="instagram">Instagram</option>
        <option value="x">X</option>
        <option value="linkedin">LinkedIn</option>
      </select>
    </section>
  );
}

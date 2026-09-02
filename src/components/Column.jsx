export default function Column({ title, count, accent, height, children }) {
  return (
    <section className="flex flex-col bg-white/60 rounded-2xl border border-brown-900/10 overflow-hidden">
      <header className={`px-5 py-4 border-b border-brown-900/10 flex items-center justify-between ${accent}`}>
        <h2 className="font-display text-xl text-brown-900">{title}</h2>
        <span className="text-sm text-brown-900/60">{count}</span>
      </header>
      <div className="p-3 space-y-2 overflow-y-auto" style={{ height }}>
        {children}
      </div>
    </section>
  );
}

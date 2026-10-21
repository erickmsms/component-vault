type StatCardProps = {
  label: string;
  value: string;
  /** Variação percentual em relação ao período anterior. */
  change: number;
};

export function StatCard({ label, value, change }: StatCardProps) {
  const positive = change >= 0;

  return (
    <div className="w-56 rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-lg backdrop-blur">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p
        className={`mt-2 text-sm font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}
      >
        {positive ? "▲" : "▼"} {Math.abs(change)}%{" "}
        <span className="font-normal text-zinc-500">vs. mês anterior</span>
      </p>
    </div>
  );
}

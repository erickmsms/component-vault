import { StatCard } from "./stat-card";

export default function StatCardDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <StatCard label="Receita" value="R$ 48,2 mil" change={12.4} />
      <StatCard label="Cancelamentos" value="37" change={-3.1} />
    </div>
  );
}

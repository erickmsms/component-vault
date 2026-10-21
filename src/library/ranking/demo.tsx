import { Ranking } from "./Ranking";

export default function RankingDemo() {
  return (
    <div className="w-full">
      <Ranking
        destacados={["sul"]}
        rotuloDoDestaque="sua equipe"
        itens={[
          { id: "norte", nome: "Equipe Norte", complemento: "AM", valor: 91.4, cor: "var(--series-1)", detalhe: "Vendas 95 · Retenção 88 · NPS 90" },
          { id: "sul", nome: "Equipe Sul", complemento: "RS", valor: 84.2, cor: "var(--series-2)", detalhe: "Vendas 80 · Retenção 91 · NPS 82" },
          { id: "leste", nome: "Equipe Leste", complemento: "BA", valor: 72.8, cor: "var(--series-3)", detalhe: "Vendas 70 · Retenção 77 · NPS 71" },
          { id: "oeste", nome: "Equipe Oeste", complemento: "MT", valor: 58.1, cor: "var(--series-4)", detalhe: "Vendas 52 · Retenção 66 · NPS 57" },
        ]}
      />
    </div>
  );
}

import { QuadroMetricas } from "./QuadroMetricas";

export default function QuadroMetricasDemo() {
  return (
    <div className="w-full">
      <QuadroMetricas
        grupos={[
          {
            titulo: "Vendas",
            linhas: [
              { rotulo: "Receita", valor: "R$ 48.210" },
              { rotulo: "Pedidos", valor: "1.284" },
              { rotulo: "Ticket médio", valor: "R$ 37,55", dica: "Receita dividida pelo número de pedidos." },
            ],
          },
          {
            titulo: "Clientes",
            linhas: [
              { rotulo: "Novos", valor: "412" },
              { rotulo: "Recorrentes", valor: "68%" },
              { rotulo: "NPS", valor: "+64", dica: "O quanto os clientes recomendariam a loja, de −100 a 100." },
            ],
          },
          {
            titulo: "Operação",
            linhas: [
              { rotulo: "Entrega média", valor: "2,4 dias" },
              { rotulo: "Devoluções", valor: "1,8%" },
            ],
          },
          {
            titulo: "Site",
            linhas: [
              { rotulo: "Visitas", valor: "40.125" },
              { rotulo: "Conversão", valor: "3,2%" },
              { rotulo: "Carrinhos abandonados", valor: "71%" },
            ],
          },
        ]}
      />
    </div>
  );
}

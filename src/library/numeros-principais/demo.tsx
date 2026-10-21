import { NumerosPrincipais } from "./NumerosPrincipais";

export default function NumerosPrincipaisDemo() {
  return (
    <div className="w-full">
      <NumerosPrincipais
        itens={[
          { valor: "R$ 48 mil", texto: "de receita em outubro." },
          { valor: "1.284", texto: "pedidos pagos no mês." },
          { valor: "3,2%", texto: "dos visitantes compraram algo." },
          { valor: "4,7", texto: "de nota média nas avaliações." },
        ]}
      />
    </div>
  );
}

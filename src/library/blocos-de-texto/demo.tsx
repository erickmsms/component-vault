import { BlocosDeTexto } from "./BlocosDeTexto";

export default function BlocosDeTextoDemo() {
  return (
    <div className="w-full">
      <BlocosDeTexto
        blocos={[
          {
            titulo: "Como medimos",
            conteudo: "Somamos os pedidos pagos de cada dia e comparamos com o mesmo período do mês anterior.",
          },
          {
            titulo: "Limitações",
            conteudo: "Pedidos cancelados depois de 7 dias ainda aparecem como vendas no mês em que foram feitos.",
          },
          {
            titulo: "Próximos passos",
            conteudo: "Separar as vendas por campanha e incluir as devoluções no cálculo da receita.",
          },
        ]}
      />
    </div>
  );
}

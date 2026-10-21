import { ListaDeIndicadores } from "./ListaDeIndicadores";

export default function ListaDeIndicadoresDemo() {
  return (
    <div className="w-full max-w-xs">
      <ListaDeIndicadores
        titulo="Saúde da conta"
        dica="Indicadores dos últimos 30 dias, comparados com o período anterior."
        itens={[
          { rotulo: "Conversão", valor: "3,2%", descricao: "acima da meta de 2,5%" },
          { rotulo: "Cancelamentos", valor: "−12%", descricao: "menos clientes saíram" },
          { rotulo: "NPS", valor: "+64", descricao: "clientes recomendam bastante" },
        ]}
      />
    </div>
  );
}

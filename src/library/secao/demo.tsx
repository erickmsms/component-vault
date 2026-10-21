import { Secao } from "./Secao";

export default function SecaoDemo() {
  return (
    <div className="w-full max-w-2xl">
      <Secao titulo="Vendas por região" dica="Soma dos pedidos pagos, sem cancelamentos e devoluções.">
        <p className="text-ink-2">O conteúdo da seção vem aqui: tabela, gráfico, texto...</p>
      </Secao>
    </div>
  );
}

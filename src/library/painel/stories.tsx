import { defineStories } from "@/registry/stories";
import { Botao } from "@/library/botao/Botao";
import { Painel, type TomDePainel } from "./Painel";

const PEDIDOS = [
  { cliente: "Padaria Bom Dia", valor: "R$ 1.240", situacao: "Pago" },
  { cliente: "Mercado Central", valor: "R$ 3.890", situacao: "Pendente" },
  { cliente: "Café da Praça", valor: "R$ 760", situacao: "Pago" },
];

function Tabela() {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-y border-rule bg-surface text-xs text-muted">
        <tr>
          <th className="px-5 py-2 font-medium">Cliente</th>
          <th className="px-5 py-2 text-right font-medium">Valor</th>
          <th className="px-5 py-2 font-medium">Situação</th>
        </tr>
      </thead>
      <tbody>
        {PEDIDOS.map((p) => (
          <tr key={p.cliente} className="border-b border-rule last:border-b-0">
            <td className="px-5 py-3">{p.cliente}</td>
            <td className="px-5 py-3 text-right tabular-nums">{p.valor}</td>
            <td className="px-5 py-3 text-ink-2">{p.situacao}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TONS: { tom: TomDePainel; titulo: string; texto: string }[] = [
  { tom: "padrao", titulo: "Padrão", texto: "O cartão de conteúdo comum." },
  { tom: "sutil", titulo: "Sutil", texto: "Fundo de superfície, para agrupar dentro de outro cartão." },
  { tom: "destaque", titulo: "Destaque", texto: "Informação que merece um olhar." },
  { tom: "sucesso", titulo: "Sucesso", texto: "Importação concluída sem erros." },
  { tom: "alerta", titulo: "Alerta", texto: "Três notas aguardam revisão." },
  { tom: "perigo", titulo: "Perigo", texto: "A sincronização parou há dois dias." },
];

export default defineStories({
  args: {
    titulo: "Pedidos do mês",
    descricao: "Os pedidos fechados desde o dia 1º.",
    comAcoes: true,
    tom: "padrao",
    semEspaco: false,
    nivel: 2,
  },
  controls: {
    titulo: { type: "text" },
    descricao: { type: "text" },
    comAcoes: { type: "boolean", label: "acoes" },
    tom: { type: "select", options: ["padrao", "sutil", "destaque", "sucesso", "alerta", "perigo"] },
    semEspaco: { type: "boolean" },
    nivel: { type: "number", min: 1, max: 4 },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <Painel
        titulo={a.titulo || undefined}
        descricao={a.descricao || undefined}
        acoes={a.comAcoes ? <Botao tamanho="sm">Exportar</Botao> : undefined}
        tom={a.tom as TomDePainel}
        semEspaco={a.semEspaco}
        nivel={a.nivel as 1 | 2 | 3 | 4}
      >
        {a.semEspaco ? (
          <Tabela />
        ) : (
          <p className="text-sm text-ink-2">48 pedidos, R$ 52.300 no total. A média por pedido subiu 8% em relação ao mês passado.</p>
        )}
      </Painel>
    </div>
  ),
  stories: [
    {
      name: "Tela com cabeçalho e tabela",
      render: () => (
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <Painel
            como="section"
            nivel={1}
            titulo="Vendas"
            descricao="Pedidos, clientes e faturamento da loja."
            acoes={
              <>
                <Botao>Exportar</Botao>
                <Botao variante="primaria">Novo pedido</Botao>
              </>
            }
          />
          <Painel como="section" titulo="Pedidos recentes" acoes={<Botao variante="fantasma" tamanho="sm">Ver todos</Botao>} semEspaco>
            <Tabela />
          </Painel>
        </div>
      ),
    },
    { name: "Playground" },
    {
      name: "Tons",
      render: () => (
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TONS.map((t) => (
            <Painel key={t.tom} tom={t.tom} titulo={t.titulo} nivel={3}>
              <p className="text-sm text-ink-2">{t.texto}</p>
            </Painel>
          ))}
        </div>
      ),
    },
    {
      name: "Só conteúdo",
      render: () => (
        <div className="w-full max-w-md">
          <Painel>
            <p className="text-sm text-muted">Faturamento</p>
            <p className="mt-1 font-display text-4xl font-bold">R$ 52,3 mil</p>
            <p className="mt-2 text-sm text-success">+8% sobre o mês anterior</p>
          </Painel>
        </div>
      ),
    },
  ],
});

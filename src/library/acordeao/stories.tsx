import { defineStories } from "@/registry/stories";
import { Acordeao, type ItemDoAcordeao } from "./Acordeao";

const SELO = {
  pago: "bg-success/15 text-success",
  pendente: "bg-warning/15 text-warning",
  atrasado: "bg-critical/10 text-critical",
} as const;

function Selo({ tipo, children }: { tipo: keyof typeof SELO; children: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SELO[tipo]}`}>{children}</span>;
}

const PEDIDOS: ItemDoAcordeao[] = [
  {
    titulo: "Pedido #1042 · Café Aurora",
    subtitulo: "12 itens · entregue em 14/09",
    extra: (
      <>
        <span className="hidden tabular-nums sm:inline">R$ 1.284,00</span>
        <Selo tipo="pago">Pago</Selo>
      </>
    ),
    conteudo: (
      <ul className="flex flex-col gap-1.5">
        <li>6 × Café especial 250 g — R$ 534,00</li>
        <li>4 × Filtro de papel (100 un.) — R$ 36,00</li>
        <li>2 × Prensa francesa — R$ 714,00</li>
      </ul>
    ),
  },
  {
    titulo: "Pedido #1043 · Padaria Ponto Doce",
    subtitulo: "Aguardando o comprovante",
    extra: (
      <>
        <span className="hidden tabular-nums sm:inline">R$ 486,50</span>
        <Selo tipo="pendente">Pendente</Selo>
      </>
    ),
    conteudo: <p>Boleto emitido em 10/09, vence em 20/09. O cliente já foi lembrado uma vez.</p>,
  },
  {
    titulo: "Pedido #1044 · Mercado Bom Preço",
    subtitulo: "Vencido há 5 dias",
    extra: (
      <>
        <span className="hidden tabular-nums sm:inline">R$ 2.910,00</span>
        <Selo tipo="atrasado">Atrasado</Selo>
      </>
    ),
    conteudo: <p>Sem resposta aos dois últimos contatos. Próximo passo: ligar para o financeiro.</p>,
  },
];

const BOTAO =
  "inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-rule bg-page px-3 text-xs font-medium text-ink outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2";

const VERSOES: ItemDoAcordeao[] = [
  {
    titulo: "21/10/2026, 09:42",
    subtitulo: "por Marina Lopes · ajuste do frete",
    extra: (
      <button type="button" className={BOTAO}>
        Restaurar
      </button>
    ),
    conteudo: <p>Frete por região: Sul passa de 8% para 9,5% do subtotal.</p>,
  },
  {
    titulo: "02/10/2026, 17:15",
    subtitulo: "por Rafael Dias",
    extra: (
      <button type="button" className={BOTAO}>
        Restaurar
      </button>
    ),
    conteudo: <p>Desconto progressivo a partir de 50 unidades.</p>,
  },
  {
    titulo: "18/09/2026, 11:03",
    subtitulo: "por Marina Lopes · versão inicial",
    conteudo: <p>Primeira versão da tabela de preços.</p>,
    desativado: true,
  },
];

const PERGUNTAS: ItemDoAcordeao[] = [
  { titulo: "Qual o prazo de entrega?", conteudo: <p>De 2 a 5 dias úteis nas capitais e até 10 dias no interior.</p> },
  { titulo: "Posso trocar um produto?", conteudo: <p>Sim, em até 30 dias, com a embalagem original.</p> },
  { titulo: "Quais as formas de pagamento?", conteudo: <p>Pix, boleto e cartão em até 6 vezes sem juros.</p> },
];

export default defineStories({
  args: { modo: "varios", aparencia: "linhas", primeiroAberto: true },
  controls: {
    modo: { type: "select", options: ["um", "varios"] },
    aparencia: { type: "select", options: ["linhas", "cartoes"] },
    primeiroAberto: { type: "boolean", label: "primeiro item aberto" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <Acordeao
        key={`${a.modo}-${a.primeiroAberto}`}
        itens={PEDIDOS}
        modo={a.modo as "um" | "varios"}
        aparencia={a.aparencia as "linhas" | "cartoes"}
        abertosIniciais={a.primeiroAberto ? [0] : []}
      />
    </div>
  ),
  stories: [
    { name: "Linhas com valores" },
    { name: "Cartões", args: { aparencia: "cartoes" } },
    {
      name: "Histórico com ações",
      render: () => (
        <div className="w-full max-w-2xl">
          <Acordeao itens={VERSOES} aparencia="cartoes" modo="um" />
        </div>
      ),
    },
    {
      name: "Perguntas frequentes (um por vez)",
      render: () => (
        <div className="w-full max-w-2xl">
          <Acordeao itens={PERGUNTAS} modo="um" abertosIniciais={[0]} nivelDoTitulo={2} />
        </div>
      ),
    },
  ],
});

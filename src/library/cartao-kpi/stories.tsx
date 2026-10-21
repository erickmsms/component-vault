import { defineStories } from "@/registry/stories";
import { CartaoKpi, IndicadorDeVariacao, Sparkline, type TipoDeSerie } from "./CartaoKpi";

const VENDAS = [38, 42, 40, 47, 45, 52, 49, 55, 58, 54, 61, 64];
const TICKET = [212, 205, 219, 214, 208, 201, 198, 204, 196, 191, 188, 186];
const CHAMADOS = [14, 9, 12, 7, 11, 6, 8, 5, 9, 4, 6, 3];
const ACESSOS = [820, 910, null, 1040, 990, 1120, 1180, 1090, 1240, 1310, 1280, 1360];

const icone = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONES = {
  vendas: icone("M3 3v18h18M7 15l4-4 3 3 6-6"),
  ticket: icone("M4 7h16v10H4zM8 12h.01M16 12h.01M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5"),
  chamados: icone("M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"),
  acessos: icone("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"),
};

export default defineStories({
  args: {
    rotulo: "Vendas no mês",
    valor: "R$ 64,2 mil",
    sufixo: "",
    dica: "Soma dos pedidos pagos no mês, sem frete.",
    comIcone: true,
    variacao: 12.4,
    semComparativo: false,
    positivoEhBom: true,
    tipoDeSerie: "area",
    comSerie: true,
    rodape: "Meta do mês: R$ 70 mil",
  },
  controls: {
    rotulo: { type: "text" },
    valor: { type: "text" },
    sufixo: { type: "text", label: "sufixo (vazio = sem)" },
    dica: { type: "text", label: "dica (vazio = sem)" },
    comIcone: { type: "boolean", label: "ícone (exemplo)" },
    variacao: { type: "number", label: "variacao.valor (%)", min: -50, max: 50, step: 0.1 },
    semComparativo: { type: "boolean", label: "sem comparativo (variacao.valor = null)" },
    positivoEhBom: { type: "boolean", label: "variacao.positivoEhBom" },
    tipoDeSerie: { type: "select", options: ["area", "linha", "barras"] },
    comSerie: { type: "boolean", label: "série (exemplo)" },
    rodape: { type: "text", label: "rodape (vazio = sem)" },
  },
  render: (a) => (
    <div className="w-full max-w-sm">
      <CartaoKpi
        rotulo={a.rotulo}
        valor={a.valor}
        sufixo={a.sufixo || undefined}
        dica={a.dica || undefined}
        icone={a.comIcone ? ICONES.vendas : undefined}
        variacao={{ valor: a.semComparativo ? null : a.variacao, positivoEhBom: a.positivoEhBom }}
        serie={a.comSerie ? VENDAS : undefined}
        tipoDeSerie={a.tipoDeSerie as TipoDeSerie}
        descricaoDaSerie="Vendas nos últimos 12 meses, de R$ 38 mil para R$ 64 mil."
        rodape={a.rodape || undefined}
      />
    </div>
  ),
  stories: [
    { name: "Completo" },
    {
      name: "Painel de indicadores",
      render: () => (
        <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CartaoKpi
            rotulo="Vendas no mês"
            valor="R$ 64,2 mil"
            icone={ICONES.vendas}
            variacao={{ valor: 12.4 }}
            serie={VENDAS}
            descricaoDaSerie="Vendas nos últimos 12 meses, de R$ 38 mil para R$ 64 mil."
          />
          <CartaoKpi
            rotulo="Ticket médio"
            dica="Valor médio por pedido pago."
            valor="R$ 186"
            icone={ICONES.ticket}
            variacao={{ valor: -3.2 }}
            serie={TICKET}
            tipoDeSerie="linha"
          />
          <CartaoKpi
            rotulo="Chamados abertos"
            valor="3"
            sufixo="/ 14 no início"
            icone={ICONES.chamados}
            variacao={{ valor: -50, positivoEhBom: false, rotulo: "vs. semana passada" }}
            serie={CHAMADOS}
            tipoDeSerie="barras"
          />
          <CartaoKpi
            rotulo="Acessos por dia"
            valor="1.360"
            icone={ICONES.acessos}
            variacao={{ valor: null }}
            serie={ACESSOS}
            rodape={
              <>
                <span>média: 1.125</span>
                <span>pico: 1.360</span>
              </>
            }
          />
        </div>
      ),
    },
    { name: "Custo (subir é ruim)", args: { rotulo: "Custo por pedido", valor: "R$ 8,40", variacao: 6.1, positivoEhBom: false, tipoDeSerie: "linha", dica: "", rodape: "" } },
    { name: "Mínimo", args: { comIcone: false, comSerie: false, dica: "", rodape: "", semComparativo: true } },
    {
      name: "Peças avulsas",
      render: () => (
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-5">
            <Sparkline serie={VENDAS} tipo="area" rotulo="Tendência de vendas: alta" />
            <Sparkline serie={TICKET} tipo="linha" cor="var(--series-2)" />
            <Sparkline serie={CHAMADOS} tipo="barras" cor="var(--series-3)" />
            <Sparkline serie={ACESSOS} tipo="linha" largura={160} altura={40} />
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <IndicadorDeVariacao valor={8.5} />
            <IndicadorDeVariacao valor={-4} />
            <IndicadorDeVariacao valor={0} />
            <IndicadorDeVariacao valor={12} positivoEhBom={false} />
            <IndicadorDeVariacao valor={-1500} formato={(n) => `R$ ${n.toLocaleString("pt-BR")}`} />
            <IndicadorDeVariacao valor={null} />
          </div>
        </div>
      ),
    },
  ],
});

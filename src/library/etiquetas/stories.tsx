import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { Chip, ContadorNumerico, Etiqueta, type TomDeEtiqueta } from "./Etiquetas";

const STATUS: { tom: TomDeEtiqueta; texto: string }[] = [
  { tom: "neutro", texto: "Rascunho" },
  { tom: "destaque", texto: "Em andamento" },
  { tom: "sucesso", texto: "Concluído" },
  { tom: "alerta", texto: "Revisar" },
  { tom: "perigo", texto: "Atrasado" },
];

const CATEGORIAS = ["Vendas", "Marketing", "Financeiro", "Suporte", "Produto"];

function Relogio() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function Cadeado() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Filtros() {
  const [ativos, setAtivos] = useState<string[]>(["Vendas", "Suporte"]);
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <p className="text-sm text-ink-2">Equipes</p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c, i) => (
          <Chip
            key={c}
            ativo={ativos.includes(c)}
            aoAlternar={(on) => setAtivos((atual) => (on ? [...atual, c] : atual.filter((x) => x !== c)))}
            cor={`var(--series-${i + 1})`}
          >
            {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export default defineStories({
  args: {
    texto: "Em andamento",
    tom: "destaque",
    variante: "suave",
    ponto: true,
    maiuscula: false,
    contador: 12,
    maximo: 9,
  },
  controls: {
    texto: { type: "text", label: "children" },
    tom: { type: "select", options: ["neutro", "destaque", "sucesso", "alerta", "perigo"] },
    variante: { type: "select", options: ["suave", "contorno"] },
    ponto: { type: "boolean" },
    maiuscula: { type: "boolean" },
    contador: { type: "number", label: "ContadorNumerico: valor", min: 0, max: 200 },
    maximo: { type: "number", label: "ContadorNumerico: maximo", min: 1, max: 999 },
  },
  render: (a) => (
    <div className="flex items-center gap-4">
      <Etiqueta tom={a.tom as TomDeEtiqueta} variante={a.variante as "suave" | "contorno"} ponto={a.ponto} maiuscula={a.maiuscula}>
        {a.texto}
      </Etiqueta>
      <ContadorNumerico valor={a.contador} maximo={a.maximo} rotulo={`${a.contador} notificações não lidas`} />
    </div>
  ),
  stories: [
    {
      name: "Status",
      render: () => (
        <div className="flex max-w-xl flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <Etiqueta key={s.tom} tom={s.tom} ponto>
                {s.texto}
              </Etiqueta>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <Etiqueta key={s.tom} tom={s.tom} variante="contorno" maiuscula>
                {s.texto}
              </Etiqueta>
            ))}
          </div>
        </div>
      ),
    },
    { name: "Playground" },
    {
      name: "Com ícone e cor de categoria",
      render: () => (
        <div className="flex max-w-xl flex-wrap gap-2">
          <Etiqueta tom="alerta" icone={<Relogio />}>
            Vence amanhã
          </Etiqueta>
          <Etiqueta tom="perigo" variante="contorno" icone={<Cadeado />}>
            Bloqueado
          </Etiqueta>
          {CATEGORIAS.slice(0, 3).map((c, i) => (
            <Etiqueta key={c} cor={`var(--series-${i + 1})`} ponto>
              {c}
            </Etiqueta>
          ))}
        </div>
      ),
    },
    { name: "Chips de filtro", render: () => <Filtros /> },
    {
      name: "Contadores",
      render: () => (
        <div className="flex flex-wrap items-center gap-6 text-sm text-ink-2">
          <span className="inline-flex items-center gap-2">
            Notificações <ContadorNumerico valor={3} rotulo="3 não lidas" />
          </span>
          <span className="inline-flex items-center gap-2">
            Mensagens <ContadorNumerico valor={27} rotulo="27 não lidas" />
          </span>
          <span className="inline-flex items-center gap-2">
            A fazer <ContadorNumerico valor={12} maximo={99} tom="neutro" />
          </span>
          <span className="inline-flex items-center gap-2">
            Novidades <ContadorNumerico valor={5} tom="destaque" />
          </span>
          <span className="inline-flex items-center gap-2">
            Zero não aparece: <ContadorNumerico valor={0} />
          </span>
        </div>
      ),
    },
  ],
});

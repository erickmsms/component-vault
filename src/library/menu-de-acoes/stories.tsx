import { useState, type ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { MenuDeAcoes, type AcaoDoMenu, type ItemDoMenu } from "./MenuDeAcoes";

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ICONES = {
  editar: (
    <Icone>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z" />
    </Icone>
  ),
  duplicar: (
    <Icone>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icone>
  ),
  arquivar: (
    <Icone>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4" />
    </Icone>
  ),
  excluir: (
    <Icone>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </Icone>
  ),
  sair: (
    <Icone>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
    </Icone>
  ),
  perfil: (
    <Icone>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icone>
  ),
};

const BOTAO_ICONE =
  "grid size-10 cursor-pointer place-items-center rounded-lg border border-rule bg-page text-ink-2 outline-accent hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 aria-expanded:bg-surface aria-expanded:text-ink";

function acoesDeTarefa({
  comIcones,
  comAtalhos,
  comGrupos,
  aoEscolher,
}: {
  comIcones: boolean;
  comAtalhos: boolean;
  comGrupos: boolean;
  aoEscolher: (rotulo: string) => void;
}): ItemDoMenu[] {
  const acao = (rotulo: string, icone: ReactNode, atalho: string, extra: Partial<AcaoDoMenu> = {}): AcaoDoMenu => ({
    rotulo,
    icone: comIcones ? icone : undefined,
    atalho: comAtalhos ? atalho : undefined,
    aoEscolher: () => aoEscolher(rotulo),
    ...extra,
  });
  return [
    ...(comGrupos ? [{ tipo: "grupo", titulo: "Tarefa" } as const] : []),
    acao("Editar", ICONES.editar, "E"),
    acao("Duplicar", ICONES.duplicar, "Ctrl+D"),
    acao("Arquivar", ICONES.arquivar, "A", { desativado: true }),
    { tipo: "separador" },
    ...(comGrupos ? [{ tipo: "grupo", titulo: "Zona de perigo" } as const] : []),
    acao("Excluir", ICONES.excluir, "Del", { perigo: true }),
  ];
}

function ExemploDeAcoes({
  rotulo,
  alinhamento,
  comIcones,
  comAtalhos,
  comGrupos,
}: {
  rotulo: string;
  alinhamento: "inicio" | "fim";
  comIcones: boolean;
  comAtalhos: boolean;
  comGrupos: boolean;
}) {
  const [ultima, setUltima] = useState<string | null>(null);
  return (
    <div
      className={`flex min-h-80 w-full max-w-md flex-col gap-4 in-data-miniatura:min-h-0 in-data-miniatura:items-center ${alinhamento === "fim" ? "items-end" : "items-start"}`}
    >
      <MenuDeAcoes
        gatilho={rotulo}
        alinhamento={alinhamento}
        itens={acoesDeTarefa({ comIcones, comAtalhos, comGrupos, aoEscolher: setUltima })}
      />
      <p className="text-sm text-muted" aria-live="polite">
        {ultima ? `Escolhida: ${ultima}` : "Nenhuma ação escolhida ainda."}
      </p>
    </div>
  );
}

const AGRUPAMENTOS = ["Sem agrupamento", "Responsável", "Projeto", "Prioridade"];
const ZOOMS = [70, 85, 100, 115, 130];

/** Escolha única com ✓, nos dois formatos do original: rótulo no botão e porcentagem. */
function ExemploDeEscolha() {
  const [grupo, setGrupo] = useState(AGRUPAMENTOS[2]);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="flex min-h-80 flex-wrap items-start justify-center gap-3">
      <MenuDeAcoes
        modo="escolha"
        gatilho={`Agrupar: ${grupo}`}
        larguraDoPainel="w-56"
        itens={[
          { tipo: "grupo", titulo: "Agrupar tarefas por" },
          ...AGRUPAMENTOS.map((g) => ({ rotulo: g, marcado: g === grupo, aoEscolher: () => setGrupo(g) })),
        ]}
      />
      <MenuDeAcoes
        modo="escolha"
        alinhamento="fim"
        larguraDoPainel="w-44"
        gatilho={`Zoom ${zoom}%`}
        itens={ZOOMS.map((z) => ({
          rotulo: z === 100 ? "100% (padrão)" : `${z}%`,
          marcado: z === zoom,
          aoEscolher: () => setZoom(z),
        }))}
      />
    </div>
  );
}

/** Gatilho próprio: botão só com ícone, e o menu da conta com cabeçalho. */
function ExemploDeGatilhos() {
  const [mostrarConcluidas, setMostrarConcluidas] = useState(true);
  return (
    <div className="flex min-h-80 w-full max-w-md items-start justify-between gap-3">
      <MenuDeAcoes
        itens={[
          {
            rotulo: "Mostrar concluídas",
            marcado: mostrarConcluidas,
            aoEscolher: () => setMostrarConcluidas((v) => !v),
          },
          { rotulo: "Exportar planilha", aoEscolher: () => {} },
        ]}
        gatilho={(props) => (
          <button {...props} aria-label="Mais opções" className={BOTAO_ICONE}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
        )}
      />
      <MenuDeAcoes
        alinhamento="fim"
        cabecalho={
          <>
            <p className="text-xs text-muted">Conectada como</p>
            <p className="truncate font-semibold">Ana Souza</p>
            <p className="truncate text-xs text-ink-2">Financeiro</p>
          </>
        }
        itens={[
          { rotulo: "Meu perfil", icone: ICONES.perfil, aoEscolher: () => {} },
          { tipo: "separador" },
          { rotulo: "Sair", icone: ICONES.sair, perigo: true, aoEscolher: () => {} },
        ]}
        gatilho={(props, aberto) => (
          <button
            {...props}
            aria-label="Conta de Ana Souza"
            className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold text-ink outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 ${aberto ? "bg-surface" : ""}`}
          >
            <span className="hidden sm:inline">Ana Souza</span>
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-page"
            >
              AS
            </span>
          </button>
        )}
      />
    </div>
  );
}

export default defineStories({
  args: { rotulo: "Ações", alinhamento: "inicio", comIcones: true, comAtalhos: true, comGrupos: false },
  controls: {
    rotulo: { type: "text", label: "gatilho (texto do botão)" },
    alinhamento: { type: "select", options: ["inicio", "fim"] },
    comIcones: { type: "boolean", label: "ícones" },
    comAtalhos: { type: "boolean", label: "atalhos" },
    comGrupos: { type: "boolean", label: "títulos de grupo" },
  },
  render: (a) => <ExemploDeAcoes {...a} alinhamento={a.alinhamento as "inicio" | "fim"} />,
  stories: [
    { name: "Ações" },
    {
      name: "Gatilhos",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <MenuDeAcoes
            gatilho="Ações"
            itens={acoesDeTarefa({ comIcones: true, comAtalhos: true, comGrupos: false, aoEscolher: () => {} })}
          />
          <MenuDeAcoes
            modo="escolha"
            gatilho="Agrupar: Projeto"
            itens={AGRUPAMENTOS.map((g) => ({ rotulo: g, marcado: g === "Projeto", aoEscolher: () => {} }))}
          />
          <MenuDeAcoes
            alinhamento="fim"
            itens={[
              { rotulo: "Mostrar concluídas", marcado: true, aoEscolher: () => {} },
              { rotulo: "Exportar planilha", aoEscolher: () => {} },
            ]}
            gatilho={(props) => (
              <button {...props} aria-label="Mais opções" className={BOTAO_ICONE}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
            )}
          />
        </div>
      ),
    },
    { name: "Com grupos, alinhado à direita", args: { comGrupos: true, alinhamento: "fim" } },
    { name: "Escolha única", render: () => <ExemploDeEscolha /> },
    { name: "Gatilho próprio e cabeçalho", render: () => <ExemploDeGatilhos /> },
  ],
});

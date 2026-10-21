import { defineStories } from "@/registry/stories";
import { NavegacaoFlutuante } from "./NavegacaoFlutuante";

const MARCA = { nome: "Painel Aurora", href: "#inicio" };

const LINKS = [
  { rotulo: "Início", href: "#inicio" },
  { rotulo: "Recursos", href: "#recursos" },
  { rotulo: "Preços", href: "#precos" },
  { rotulo: "Clientes", href: "#clientes" },
  { rotulo: "Blog", href: "#blog" },
  { rotulo: "Sobre", href: "#sobre" },
];

function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6">
      <circle cx="9" cy="12" r="6.5" fill="var(--series-1)" />
      <circle cx="15" cy="12" r="6.5" fill="var(--series-3)" fillOpacity={0.85} />
    </svg>
  );
}

function Contato() {
  return (
    <a
      href="#contato"
      className="flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-medium whitespace-nowrap text-page outline-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Contato
    </a>
  );
}

// Fundo colorido atrás da barra, para o vidro aparecer.
const FAIXA_COLORIDA = {
  background:
    "radial-gradient(60% 120% at 20% 0%, var(--series-1), transparent 70%), radial-gradient(50% 120% at 85% 100%, var(--series-5), transparent 70%), var(--surface)",
};

/** Página de mentira para a barra fixa ter o que rolar. */
function PaginaParaRolar() {
  return (
    <div className="w-full">
      <div className="flex h-[70vh] items-end rounded-3xl p-8" style={FAIXA_COLORIDA}>
        <p className="max-w-md font-display text-3xl font-bold">
          Role para baixo: o nome da marca colapsa e sobra só o logo.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {["Metas", "Funil", "Relatórios"].map((t) => (
          <div key={t} className="h-48 rounded-2xl bg-surface p-6">
            <p className="font-display text-xl font-bold">{t}</p>
            <p className="mt-2 text-sm text-ink-2">Conteúdo de exemplo para a página rolar.</p>
          </div>
        ))}
      </div>
      <div className="h-[120vh]" />
    </div>
  );
}

export default defineStories({
  args: { nome: "Painel Aurora", links: 6, comLogo: true, comAcao: true, atual: "", colapsarApos: 80, fixa: false },
  controls: {
    nome: { type: "text", label: "marca.nome" },
    links: { type: "number", label: "links (quantidade)", min: 0, max: 6 },
    comLogo: { type: "boolean", label: "marca.logo (sem logo, o nome não colapsa)" },
    comAcao: { type: "boolean", label: "acao (botão Contato)" },
    atual: { type: "select", options: ["", ...LINKS.map((l) => l.href)] },
    colapsarApos: { type: "number", label: "colapsarApos (px)", min: 0, max: 600, step: 20 },
    fixa: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full">
      <div className={a.fixa ? "" : "min-h-80 rounded-3xl p-6"} style={a.fixa ? undefined : FAIXA_COLORIDA}>
        <NavegacaoFlutuante
          marca={{ ...MARCA, nome: a.nome, logo: a.comLogo ? <Logo /> : undefined }}
          links={LINKS.slice(0, a.links)}
          acao={a.comAcao ? <Contato /> : undefined}
          atual={a.atual || undefined}
          colapsarApos={a.colapsarApos}
          fixa={a.fixa}
        />
      </div>
      {a.fixa && (
        <div className="pt-20">
          <PaginaParaRolar />
        </div>
      )}
    </div>
  ),
  stories: [
    { name: "No fluxo da página" },
    { name: "Fixa, ao rolar", args: { fixa: true } },
    { name: "Página atual marcada", args: { atual: "#precos" } },
    { name: "Sem logo e sem chamada", args: { comLogo: false, comAcao: false, links: 4 } },
  ],
});

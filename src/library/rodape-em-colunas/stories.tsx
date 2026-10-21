import { defineStories } from "@/registry/stories";
import { RodapeEmColunas, type RedeSocial } from "./RodapeEmColunas";

const GRUPOS = [
  {
    titulo: "Produto",
    links: [
      { rotulo: "Recursos", href: "#recursos" },
      { rotulo: "Preços", href: "#precos" },
      { rotulo: "Integrações", href: "#integracoes" },
      { rotulo: "Novidades", href: "#novidades" },
    ],
  },
  {
    titulo: "Empresa",
    links: [
      { rotulo: "Sobre", href: "#sobre" },
      { rotulo: "Clientes", href: "#clientes" },
      { rotulo: "Blog", href: "#blog" },
      { rotulo: "Trabalhe conosco", href: "#vagas" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { rotulo: "Termos de uso", href: "#termos" },
      { rotulo: "Privacidade", href: "#privacidade" },
      { rotulo: "Cookies", href: "#cookies" },
    ],
  },
];

const REDES: RedeSocial[] = [
  { nome: "Instagram", href: "#instagram", rede: "instagram" },
  { nome: "LinkedIn", href: "#linkedin", rede: "linkedin" },
  { nome: "YouTube", href: "#youtube", rede: "youtube" },
  { nome: "X", href: "#x", rede: "x" },
  { nome: "Facebook", href: "#facebook", rede: "facebook" },
  { nome: "GitHub", href: "#github", rede: "github" },
  { nome: "WhatsApp", href: "#whatsapp", rede: "whatsapp" },
];

const CONTATO = {
  endereco: ["Av. das Palmeiras, 1200, sala 4", "Campinas, SP, Brasil"],
  telefone: { rotulo: "+55 (19) 3000-0000", href: "tel:+551930000000" },
  email: "contato@painelaurora.com",
  extras: [{ rotulo: "WhatsApp", href: "#whatsapp" }],
};

function Marca() {
  return (
    <span className="flex items-center gap-3">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-10">
        <circle cx="9" cy="12" r="6.5" fill="var(--series-1)" />
        <circle cx="15" cy="12" r="6.5" fill="var(--series-3)" fillOpacity={0.85} />
      </svg>
      <span className="font-display text-2xl font-bold tracking-tight">Painel Aurora</span>
    </span>
  );
}

function Chamada() {
  return (
    <a
      href="#contato"
      className="inline-flex h-11 items-center rounded-2xl bg-accent px-6 text-sm font-medium text-page outline-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Falar com um especialista
    </a>
  );
}

export default defineStories({
  args: {
    frase: "Metas, funil e relatórios no mesmo lugar, para a equipe vender mais e melhor.",
    grupos: 2,
    redes: 4,
    comContato: true,
    comAcao: true,
    comMarca: true,
    direitos: "© 2026 Painel Aurora. Todos os direitos reservados.",
    subtitulo: "Software de gestão comercial.",
  },
  controls: {
    frase: { type: "text" },
    grupos: { type: "number", label: "grupos (quantidade)", min: 0, max: 3 },
    redes: { type: "number", label: "redes (quantidade)", min: 0, max: 7 },
    comContato: { type: "boolean", label: "contato" },
    comAcao: { type: "boolean", label: "acao (botão)" },
    comMarca: { type: "boolean", label: "marca" },
    direitos: { type: "text", label: "direitos (vazio = sem)" },
    subtitulo: { type: "text", label: "subtitulo (vazio = sem)" },
  },
  render: (a) => (
    <div className="w-full overflow-hidden rounded-2xl">
      <RodapeEmColunas
        frase={a.frase}
        acao={a.comAcao ? <Chamada /> : undefined}
        redes={REDES.slice(0, a.redes)}
        grupos={GRUPOS.slice(0, a.grupos)}
        contato={a.comContato ? CONTATO : undefined}
        marca={a.comMarca ? <Marca /> : undefined}
        direitos={a.direitos || undefined}
        subtitulo={a.subtitulo || undefined}
      />
    </div>
  ),
  stories: [
    { name: "Completo" },
    { name: "Todas as redes", args: { redes: 7, grupos: 3, comContato: false } },
    { name: "Enxuto", args: { grupos: 1, redes: 0, comContato: false, comAcao: false, subtitulo: "" } },
  ],
});

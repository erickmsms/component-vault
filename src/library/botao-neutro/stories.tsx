import { useState, type ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import {
  BotaoNeutro,
  classesDoBotaoNeutro,
  GrupoDeBotoes,
  type TamanhoDoBotaoNeutro,
  type VarianteDoBotaoNeutro,
} from "./BotaoNeutro";

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const Mais = () => (
  <Icone>
    <path d="M12 5v14M5 12h14" />
  </Icone>
);
const Seta = () => (
  <Icone>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icone>
);
const Voltar = () => (
  <Icone>
    <path d="m15 18-6-6 6-6" />
  </Icone>
);
const Avancar = () => (
  <Icone>
    <path d="m9 18 6-6-6-6" />
  </Icone>
);
const Negrito = () => (
  <Icone>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
  </Icone>
);
const Italico = () => (
  <Icone>
    <path d="M19 4h-9M14 20H5M15 4 9 20" />
  </Icone>
);
const Sublinhado = () => (
  <Icone>
    <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
  </Icone>
);

const VARIANTES: { variante: VarianteDoBotaoNeutro; rotulo: string }[] = [
  { variante: "padrao", rotulo: "Padrão" },
  { variante: "contorno", rotulo: "Contorno" },
  { variante: "secundario", rotulo: "Secundário" },
  { variante: "fantasma", rotulo: "Fantasma" },
  { variante: "destrutivo", rotulo: "Destrutivo" },
  { variante: "link", rotulo: "Link" },
];

/** Clica e fica "Salvando..." por dois segundos. */
function Salvar() {
  const [salvando, setSalvando] = useState(false);
  return (
    <BotaoNeutro
      variante="contorno"
      carregando={salvando}
      onClick={() => {
        setSalvando(true);
        setTimeout(() => setSalvando(false), 2000);
      }}
    >
      {salvando ? "Salvando..." : "Salvar (clique)"}
    </BotaoNeutro>
  );
}

export default defineStories({
  args: {
    texto: "Continuar",
    variante: "padrao",
    tamanho: "padrao",
    comIcone: false,
    soIcone: false,
    arredondado: false,
    carregando: false,
    desabilitado: false,
  },
  controls: {
    texto: { type: "text", label: "children" },
    variante: { type: "select", options: VARIANTES.map((v) => v.variante) },
    tamanho: { type: "select", options: ["xs", "sm", "padrao", "lg"] },
    comIcone: { type: "boolean", label: "iconeFinal" },
    soIcone: { type: "boolean", label: "soIcone (o texto vira aria-label)" },
    arredondado: { type: "boolean" },
    carregando: { type: "boolean" },
    desabilitado: { type: "boolean", label: "disabled" },
  },
  render: (a) => (
    <BotaoNeutro
      variante={a.variante as VarianteDoBotaoNeutro}
      tamanho={a.tamanho as TamanhoDoBotaoNeutro}
      soIcone={a.soIcone}
      arredondado={a.arredondado}
      icone={a.soIcone ? <Seta /> : undefined}
      iconeFinal={a.comIcone ? <Seta /> : undefined}
      carregando={a.carregando}
      disabled={a.desabilitado}
      aria-label={a.soIcone ? a.texto : undefined}
    >
      {a.soIcone ? null : a.texto}
    </BotaoNeutro>
  ),
  stories: [
    { name: "Botão neutro" },
    {
      name: "Variantes",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTES.map((v) => (
            <BotaoNeutro key={v.variante} variante={v.variante}>
              {v.rotulo}
            </BotaoNeutro>
          ))}
        </div>
      ),
    },
    {
      name: "Tamanhos",
      render: () => (
        <div className="flex items-center gap-3">
          <BotaoNeutro tamanho="xs">Extra pequeno</BotaoNeutro>
          <BotaoNeutro tamanho="sm">Pequeno</BotaoNeutro>
          <BotaoNeutro>Padrão</BotaoNeutro>
          <BotaoNeutro tamanho="lg">Grande</BotaoNeutro>
        </div>
      ),
    },
    {
      name: "Só ícone",
      render: () => (
        <div className="flex items-center gap-3">
          <BotaoNeutro soIcone tamanho="xs" variante="contorno" aria-label="Adicionar" icone={<Mais />} />
          <BotaoNeutro soIcone tamanho="sm" variante="contorno" aria-label="Adicionar" icone={<Mais />} />
          <BotaoNeutro soIcone variante="contorno" aria-label="Adicionar" icone={<Mais />} />
          <BotaoNeutro soIcone tamanho="lg" variante="contorno" aria-label="Adicionar" icone={<Mais />} />
        </div>
      ),
    },
    {
      name: "Arredondado",
      render: () => (
        <div className="flex items-center gap-3">
          <BotaoNeutro arredondado iconeFinal={<Seta />}>
            Começar agora
          </BotaoNeutro>
          <BotaoNeutro arredondado variante="contorno">
            Saiba mais
          </BotaoNeutro>
          <BotaoNeutro arredondado soIcone variante="secundario" aria-label="Adicionar" icone={<Mais />} />
        </div>
      ),
    },
    {
      name: "Carregando e desabilitado",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <BotaoNeutro carregando>Enviando...</BotaoNeutro>
          <Salvar />
          <BotaoNeutro disabled>Desabilitado</BotaoNeutro>
          <BotaoNeutro variante="contorno" disabled>
            Desabilitado
          </BotaoNeutro>
        </div>
      ),
    },
    {
      name: "Grupo de botões",
      render: () => (
        <div className="flex flex-col items-start gap-5">
          <GrupoDeBotoes rotulo="Navegação">
            <BotaoNeutro variante="contorno" icone={<Voltar />}>
              Anterior
            </BotaoNeutro>
            <BotaoNeutro variante="contorno" iconeFinal={<Avancar />}>
              Próximo
            </BotaoNeutro>
          </GrupoDeBotoes>
          <GrupoDeBotoes rotulo="Formatação do texto">
            <BotaoNeutro soIcone variante="contorno" aria-label="Negrito" icone={<Negrito />} />
            <BotaoNeutro soIcone variante="contorno" aria-label="Itálico" icone={<Italico />} />
            <BotaoNeutro soIcone variante="contorno" aria-label="Sublinhado" icone={<Sublinhado />} />
          </GrupoDeBotoes>
          <GrupoDeBotoes orientacao="vertical" rotulo="Ordenação">
            <BotaoNeutro variante="secundario">Mais recentes</BotaoNeutro>
            <BotaoNeutro variante="secundario">Mais antigos</BotaoNeutro>
            <BotaoNeutro variante="secundario">Nome (A–Z)</BotaoNeutro>
          </GrupoDeBotoes>
        </div>
      ),
    },
    {
      name: "Como link",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <a href="#documentacao" className={classesDoBotaoNeutro({ variante: "contorno" })}>
            Documentação
          </a>
          <a href="#termos" className={classesDoBotaoNeutro({ variante: "link" })}>
            Ler os termos de uso
          </a>
        </div>
      ),
    },
  ],
});

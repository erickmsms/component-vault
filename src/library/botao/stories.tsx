import { useState, type ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { GrupoDeBotoes } from "./GrupoDeBotoes";
import { Botao, classesDoBotao, type TamanhoDoBotao, type VarianteDoBotao } from "./Botao";

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
const Email = () => (
  <Icone>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icone>
);
const Lixeira = () => (
  <Icone>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icone>
);
const Engrenagem = () => (
  <Icone>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
  </Icone>
);
const Reticencias = () => (
  <Icone>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
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
const Clipe = () => (
  <Icone>
    <path d="m21 11-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" />
  </Icone>
);

const VARIANTES: { variante: VarianteDoBotao; rotulo: string }[] = [
  { variante: "primario", rotulo: "Primário" },
  { variante: "secundario", rotulo: "Secundário" },
  { variante: "terciario", rotulo: "Terciário" },
  { variante: "contorno", rotulo: "Contorno" },
  { variante: "fantasma", rotulo: "Fantasma" },
  { variante: "perigo", rotulo: "Perigo" },
  { variante: "perigo-suave", rotulo: "Perigo suave" },
  { variante: "link", rotulo: "Link" },
];

/** Clica e fica "Enviando..." por dois segundos, como num envio de verdade. */
function EnvioDeArquivo() {
  const [enviando, setEnviando] = useState(false);
  return (
    <Botao
      carregando={enviando}
      icone={<Clipe />}
      textoCarregando="Enviando..."
      onClick={() => {
        setEnviando(true);
        setTimeout(() => setEnviando(false), 2000);
      }}
    >
      Enviar arquivo
    </Botao>
  );
}

export default defineStories({
  args: {
    texto: "Salvar alterações",
    variante: "primario",
    tamanho: "md",
    comIcone: false,
    soIcone: false,
    arredondado: false,
    carregando: false,
    desabilitado: false,
    larguraTotal: false,
  },
  controls: {
    texto: { type: "text", label: "children" },
    variante: { type: "select", options: VARIANTES.map((v) => v.variante) },
    tamanho: { type: "select", options: ["xs", "sm", "md", "lg"] },
    comIcone: { type: "boolean", label: "icone" },
    soIcone: { type: "boolean", label: "soIcone (o texto vira aria-label)" },
    arredondado: { type: "boolean" },
    carregando: { type: "boolean" },
    desabilitado: { type: "boolean", label: "disabled" },
    larguraTotal: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-xs">
      <div className={a.larguraTotal ? "" : "flex justify-center"}>
        <Botao
          variante={a.variante as VarianteDoBotao}
          tamanho={a.tamanho as TamanhoDoBotao}
          soIcone={a.soIcone}
          arredondado={a.arredondado}
          icone={a.comIcone || a.soIcone ? <Mais /> : undefined}
          carregando={a.carregando}
          disabled={a.desabilitado}
          larguraTotal={a.larguraTotal}
          aria-label={a.soIcone ? a.texto : undefined}
        >
          {a.soIcone ? null : a.texto}
        </Botao>
      </div>
    </div>
  ),
  stories: [
    { name: "Botão" },
    {
      name: "Variantes",
      render: () => (
        <div className="flex flex-wrap gap-3">
          {VARIANTES.map((v) => (
            <Botao key={v.variante} variante={v.variante}>
              {v.rotulo}
            </Botao>
          ))}
        </div>
      ),
    },
    {
      name: "Tamanhos",
      render: () => (
        <div className="flex items-center gap-3">
          <Botao tamanho="xs">Extra pequeno</Botao>
          <Botao tamanho="sm">Pequeno</Botao>
          <Botao tamanho="md">Médio</Botao>
          <Botao tamanho="lg">Grande</Botao>
        </div>
      ),
    },
    {
      name: "Com ícones",
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Botao icone={<Mais />}>Adicionar membro</Botao>
          <Botao variante="secundario" icone={<Email />}>
            E-mail
          </Botao>
          <Botao variante="contorno" iconeFinal={<Email />}>
            Enviar
          </Botao>
          <Botao variante="perigo" icone={<Lixeira />}>
            Excluir
          </Botao>
        </div>
      ),
    },
    {
      name: "Só ícone",
      render: () => (
        <div className="flex items-center gap-3">
          <Botao soIcone variante="terciario" aria-label="Mais opções" icone={<Reticencias />} />
          <Botao soIcone variante="secundario" aria-label="Configurações" icone={<Engrenagem />} />
          <Botao soIcone variante="perigo" aria-label="Excluir" icone={<Lixeira />} />
          <Botao soIcone tamanho="sm" variante="fantasma" aria-label="Adicionar" icone={<Mais />} />
          <Botao soIcone tamanho="lg" variante="contorno" aria-label="Adicionar" icone={<Mais />} />
        </div>
      ),
    },
    {
      name: "Arredondado",
      render: () => (
        <div className="flex items-center gap-3">
          <Botao arredondado iconeFinal={<Avancar />}>
            Começar agora
          </Botao>
          <Botao arredondado variante="contorno">
            Saiba mais
          </Botao>
          <Botao arredondado soIcone variante="secundario" aria-label="Adicionar" icone={<Mais />} />
        </div>
      ),
    },
    { name: "Carregando (clique)", render: () => <EnvioDeArquivo /> },
    {
      name: "Grupo de botões",
      render: () => (
        <div className="flex flex-col items-start gap-5">
          <GrupoDeBotoes rotulo="Navegação">
            <Botao variante="contorno" icone={<Voltar />}>
              Anterior
            </Botao>
            <Botao variante="contorno" iconeFinal={<Avancar />}>
              Próximo
            </Botao>
          </GrupoDeBotoes>
          <GrupoDeBotoes rotulo="Formatação do texto">
            <Botao soIcone variante="contorno" aria-label="Negrito" icone={<Negrito />} />
            <Botao soIcone variante="contorno" aria-label="Itálico" icone={<Italico />} />
            <Botao soIcone variante="contorno" aria-label="Sublinhado" icone={<Sublinhado />} />
          </GrupoDeBotoes>
          <GrupoDeBotoes orientacao="vertical" rotulo="Ordenação">
            <Botao variante="secundario">Mais recentes</Botao>
            <Botao variante="secundario">Mais antigos</Botao>
            <Botao variante="secundario">Nome (A–Z)</Botao>
          </GrupoDeBotoes>
        </div>
      ),
    },
    {
      name: "Desabilitados",
      render: () => (
        <div className="flex flex-wrap gap-3">
          {VARIANTES.slice(0, 6).map((v) => (
            <Botao key={v.variante} variante={v.variante} disabled>
              {v.rotulo}
            </Botao>
          ))}
        </div>
      ),
    },
    {
      name: "Largura total",
      render: () => (
        <div className="w-80 space-y-3">
          <Botao larguraTotal>Continuar</Botao>
          <Botao larguraTotal variante="contorno" icone={<Mais />}>
            Criar projeto
          </Botao>
        </div>
      ),
    },
    {
      name: "Como link",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Botao href="#documentacao">Documentação</Botao>
          <Botao href="https://example.com" novaAba variante="contorno">
            Abrir em nova aba
          </Botao>
          {/* Qualquer elemento pode ganhar o visual do botão */}
          <a href="#classes" className={classesDoBotao({ variante: "terciario" })}>
            Link com classesDoBotao
          </a>
        </div>
      ),
    },
  ],
});

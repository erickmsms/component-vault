import { defineStories } from "@/registry/stories";
import { Botao } from "./Botao";
import { classesDeBotao, type TamanhoDeBotao, type VarianteDeBotao } from "./classesDeBotao";

function Icone({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const MAIS = "M12 5v14M5 12h14";
const BAIXAR = "M12 4v11m-5-5 5 5 5-5M5 20h14";
const LIXEIRA = "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13";
const LAPIS = "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4";
const OLHO = "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z";

const VARIANTES: VarianteDeBotao[] = ["primaria", "secundaria", "perigo", "fantasma", "contorno"];
const TAMANHOS: TamanhoDeBotao[] = ["sm", "md", "lg", "icone", "icone-sm"];

export default defineStories({
  args: {
    texto: "Salvar alterações",
    variante: "primaria",
    tamanho: "md",
    comIcone: false,
    carregando: false,
    desabilitado: false,
    bloco: false,
  },
  controls: {
    texto: { type: "text", label: "children" },
    variante: { type: "select", options: VARIANTES },
    tamanho: { type: "select", options: TAMANHOS },
    comIcone: { type: "boolean", label: "icone" },
    carregando: { type: "boolean" },
    desabilitado: { type: "boolean", label: "disabled" },
    bloco: { type: "boolean" },
  },
  render: (a) => {
    const soIcone = a.tamanho === "icone" || a.tamanho === "icone-sm";
    return (
      <div className={a.bloco ? "w-full max-w-sm" : ""}>
        <Botao
          variante={a.variante as VarianteDeBotao}
          tamanho={a.tamanho as TamanhoDeBotao}
          icone={a.comIcone || soIcone ? <Icone d={MAIS} /> : undefined}
          carregando={a.carregando}
          disabled={a.desabilitado}
          bloco={a.bloco}
          aria-label={soIcone ? a.texto : undefined}
        >
          {soIcone ? null : a.texto}
        </Botao>
      </div>
    );
  },
  stories: [
    {
      name: "Variantes",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Botao variante="primaria" icone={<Icone d={MAIS} />}>
            Nova tarefa
          </Botao>
          <Botao variante="secundaria">Cancelar</Botao>
          <Botao variante="contorno" icone={<Icone d={OLHO} />}>
            Pré-visualizar
          </Botao>
          <Botao variante="fantasma">Ver detalhes</Botao>
          <Botao variante="perigo" icone={<Icone d={LIXEIRA} />}>
            Excluir
          </Botao>
        </div>
      ),
    },
    { name: "Playground" },
    {
      name: "Tamanhos",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Botao tamanho="sm">Pequeno</Botao>
          <Botao tamanho="md">Médio</Botao>
          <Botao tamanho="lg">Grande</Botao>
          <Botao tamanho="icone" aria-label="Editar" icone={<Icone d={LAPIS} />} />
          <Botao tamanho="icone-sm" variante="fantasma" aria-label="Excluir" icone={<Icone d={LIXEIRA} />} />
        </div>
      ),
    },
    {
      name: "Carregando",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Botao variante="primaria" carregando>
            Salvando...
          </Botao>
          <Botao carregando>Enviando</Botao>
          <Botao tamanho="icone" aria-label="Atualizando" carregando />
        </div>
      ),
    },
    {
      name: "Link com classesDeBotao()",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <a href="#relatorio" className={classesDeBotao({ variante: "primaria" })}>
            <Icone d={BAIXAR} />
            Baixar relatório
          </a>
          <a href="#inicio" className={classesDeBotao({ variante: "secundaria" })}>
            Voltar ao início
          </a>
          <a aria-disabled="true" className={classesDeBotao({ variante: "contorno" })}>
            Link desabilitado
          </a>
        </div>
      ),
    },
    { name: "Bloco", args: { bloco: true, texto: "Continuar" } },
  ],
});

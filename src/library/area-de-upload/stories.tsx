import { useEffect, useState } from "react";
import { defineStories } from "@/registry/stories";
import { AreaDeUpload } from "./AreaDeUpload";
import { MiniaturaDeArquivo } from "./MiniaturaDeArquivo";

/** Imagem de exemplo em SVG (as cores são do "conteúdo" do arquivo, não da interface). */
function imagem(nome: string, matiz: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="hsl(${matiz} 55% 72%)"/><circle cx="84" cy="34" r="14" fill="hsl(${matiz + 40} 80% 88%)"/><path d="M0 120 45 62l30 34 18-18 27 42z" fill="hsl(${matiz} 45% 42%)"/></svg>`;
  return new File([svg], nome, { type: "image/svg+xml", lastModified: 1 });
}

/** Arquivo de exemplo com o tamanho informado (conteúdo vazio repetido). */
function arquivo(nome: string, tipo: string, bytes: number) {
  return new File([new Uint8Array(bytes)], nome, { type: tipo, lastModified: 1 });
}

let cache: File[] | null = null;

/** Criados uma vez só (o PDF de exemplo tem 1,8 MB de conteúdo vazio). */
function exemplos() {
  return (cache ??= [
    arquivo("relatorio-trimestral.pdf", "application/pdf", 1_843_200),
    imagem("foto-da-vitrine.svg", 200),
    arquivo("vendas-por-loja.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 284_000),
    arquivo("contrato-assinado.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 96_500),
  ]);
}

function Exemplo({
  multiplos,
  exibicao,
  aceitar,
  tamanhoMaximoMb,
  comProgresso,
  desabilitado,
  comArquivos,
}: {
  multiplos: boolean;
  exibicao: string;
  aceitar: string;
  tamanhoMaximoMb: number;
  comProgresso: boolean;
  desabilitado: boolean;
  comArquivos: boolean;
}) {
  const [arquivos, setArquivos] = useState<File[]>(() => (comArquivos ? exemplos().slice(0, multiplos ? 4 : 1) : []));
  // Progresso fixo de exemplo: um enviado, um no meio, um começando.
  const [progresso] = useState(() => new Map(arquivos.map((a, i) => [a, [100, 64, 12, 100][i] ?? 0])));
  return (
    <div className="w-full max-w-xl">
      <AreaDeUpload
        arquivos={arquivos}
        aoMudar={setArquivos}
        multiplos={multiplos}
        exibicao={exibicao as "lista" | "grade"}
        aceitar={aceitar || undefined}
        tamanhoMaximo={tamanhoMaximoMb > 0 ? tamanhoMaximoMb * 1024 * 1024 : undefined}
        progresso={comProgresso ? progresso : undefined}
        desabilitado={desabilitado}
      />
    </div>
  );
}

/** Simula o envio: cada arquivo novo sobe de 0 a 100%. */
function ExemploComEnvio() {
  const [arquivos, setArquivos] = useState<File[]>(() => exemplos().slice(0, 2));
  const [progresso, setProgresso] = useState<Map<File, number>>(() => new Map());

  useEffect(() => {
    const t = window.setInterval(() => {
      setProgresso((atual) => {
        let mudou = false;
        const novo = new Map(atual);
        for (const a of arquivos) {
          const v = novo.get(a) ?? 0;
          if (v < 100) {
            novo.set(a, Math.min(100, v + 6 + (a.size % 7)));
            mudou = true;
          }
        }
        return mudou ? novo : atual;
      });
    }, 300);
    return () => window.clearInterval(t);
  }, [arquivos]);

  return (
    <div className="w-full max-w-xl">
      <AreaDeUpload
        arquivos={arquivos}
        aoMudar={setArquivos}
        multiplos
        maximoDeArquivos={5}
        tamanhoMaximo={10 * 1024 * 1024}
        aceitar=".pdf,.xlsx,.docx,image/*"
        progresso={progresso}
      />
    </div>
  );
}

export default defineStories({
  args: {
    multiplos: true,
    exibicao: "lista",
    aceitar: ".pdf,.xlsx,.docx,image/*",
    tamanhoMaximoMb: 5,
    comProgresso: true,
    desabilitado: false,
    comArquivos: true,
  },
  controls: {
    multiplos: { type: "boolean" },
    exibicao: { type: "select", options: ["lista", "grade"] },
    aceitar: { type: "text" },
    tamanhoMaximoMb: { type: "number", label: "tamanhoMaximo (MB, 0 = sem)", min: 0, max: 50 },
    comProgresso: { type: "boolean", label: "progresso (exemplo fixo)" },
    desabilitado: { type: "boolean" },
    comArquivos: { type: "boolean", label: "começar com arquivos" },
  },
  render: (a) => <Exemplo key={`${a.multiplos}-${a.comArquivos}`} {...a} />,
  stories: [
    { name: "Vários arquivos com progresso" },
    { name: "Um arquivo (PDF ou imagem)", args: { multiplos: false, aceitar: ".pdf,image/*", comProgresso: false } },
    { name: "Grade", args: { exibicao: "grade", comProgresso: false } },
    { name: "Vazia", args: { comArquivos: false } },
    { name: "Envio simulado", render: () => <ExemploComEnvio /> },
    {
      name: "Miniaturas",
      render: () => (
        <div className="flex flex-wrap items-end gap-4">
          {exemplos().map((a) => (
            <MiniaturaDeArquivo key={a.name} arquivo={a} />
          ))}
          <MiniaturaDeArquivo arquivo={{ nome: "backup.zip", tipo: "application/zip" }} />
          <MiniaturaDeArquivo arquivo={{ nome: "apresentacao.mp4" }} />
          <div className="w-32">
            <MiniaturaDeArquivo arquivo={{ nome: "planilha.csv" }} tamanho="grande" />
          </div>
        </div>
      ),
    },
  ],
});

"use client";

import { useCallback, useState } from "react";

/** Um arquivo escolhido agora (`File`) ou um já enviado, descrito por nome, tipo MIME e endereço. */
export type ArquivoExibido = File | { nome: string; tipo?: string; url?: string };

type Categoria = "imagem" | "pdf" | "planilha" | "documento" | "video" | "audio" | "compactado" | "outro";

/** `instanceof File` protegido para ambientes sem `File` (renderização no servidor antiga). */
export const ehFile = (a: unknown): a is File => typeof File !== "undefined" && a instanceof File;

/** Nome e tipo MIME de qualquer forma de arquivo. */
export function dadosDoArquivo(arquivo: ArquivoExibido) {
  return ehFile(arquivo)
    ? { nome: arquivo.name, tipo: arquivo.type, url: undefined }
    : { nome: arquivo.nome, tipo: arquivo.tipo ?? "", url: arquivo.url };
}

/** Extensão em maiúsculas ("PDF", "XLSX"), ou vazio. */
export function extensao(nome: string) {
  const ponto = nome.lastIndexOf(".");
  return ponto > 0 ? nome.slice(ponto + 1).toUpperCase() : "";
}

// O tipo MIME às vezes vem vazio (arquivo arrastado, extensão rara): a extensão é a segunda chance.
function categoria(nome: string, tipo: string): Categoria {
  const ext = extensao(nome).toLowerCase();
  if (tipo.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"].includes(ext)) return "imagem";
  if (tipo === "application/pdf" || ext === "pdf") return "pdf";
  if (tipo.startsWith("video/") || ["mp4", "mov", "webm", "mkv"].includes(ext)) return "video";
  if (tipo.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  if (["xls", "xlsx", "csv", "ods"].includes(ext) || tipo.includes("spreadsheet") || tipo === "text/csv") return "planilha";
  if (["zip", "rar", "7z", "gz", "tar"].includes(ext) || tipo.includes("zip") || tipo.includes("compressed")) return "compactado";
  if (["doc", "docx", "odt", "txt", "md", "rtf"].includes(ext) || tipo.startsWith("text/") || tipo.includes("word")) return "documento";
  return "outro";
}

const DESENHO: Record<Exclude<Categoria, "imagem">, string> = {
  pdf: "M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-5m6 5v-5h1a2.5 2.5 0 0 1 0 5h-1",
  planilha: "M8 12h8M8 16h8M12 12v6",
  documento: "M8 12h8M8 15h8M8 18h5",
  video: "m10 11.5 4 2.5-4 2.5z",
  audio: "M10 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1.5-1.5V11l3-1",
  compactado: "M11 4v2m2 0v2m-2 0v2m2 0v2m-2 3h2v3h-2z",
  outro: "",
};

const COR: Record<Categoria, string> = {
  imagem: "text-accent",
  pdf: "text-critical",
  planilha: "text-success",
  documento: "text-accent",
  video: "text-warning",
  audio: "text-warning",
  compactado: "text-ink-2",
  outro: "text-muted",
};

function IconeDoArquivo({ cat, className }: { cat: Categoria; className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      {cat === "imagem" ? <path d="m7 18 3.5-4 2.5 2.5 1.5-1.5L17 18zM10 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /> : <path d={DESENHO[cat]} />}
    </svg>
  );
}

/**
 * Miniatura de um arquivo: a própria imagem quando é imagem, senão um ícone pelo
 * tipo (PDF, planilha, documento, vídeo, áudio, compactado). Para `File`, a
 * prévia usa um endereço temporário (`URL.createObjectURL`) liberado ao desmontar.
 */
export function MiniaturaDeArquivo({
  arquivo,
  tamanho = "pequena",
}: {
  arquivo: ArquivoExibido;
  /** "pequena": quadrado de 48px para listas. "grande": ocupa a largura disponível, quadrada. */
  tamanho?: "pequena" | "grande";
}) {
  const { nome, tipo, url } = dadosDoArquivo(arquivo);
  const cat = categoria(nome, tipo);
  const [falhou, setFalhou] = useState<ArquivoExibido | null>(null);
  const mostrarImagem = cat === "imagem" && falhou !== arquivo && (ehFile(arquivo) || !!url);

  // Ref com limpeza (React 19): cria o endereço quando a <img> monta e o revoga quando ela sai ou o arquivo muda.
  const prender = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !ehFile(arquivo)) return;
      const endereco = URL.createObjectURL(arquivo);
      img.src = endereco;
      return () => URL.revokeObjectURL(endereco);
    },
    [arquivo],
  );

  const caixa =
    tamanho === "grande" ? "aspect-square w-full rounded-lg" : "size-12 rounded-md";

  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-rule bg-surface ${caixa}`}>
      {mostrarImagem ? (
        // eslint-disable-next-line @next/next/no-img-element -- a biblioteca não depende do next/image
        <img
          ref={ehFile(arquivo) ? prender : undefined}
          src={ehFile(arquivo) ? undefined : url}
          alt=""
          onError={() => setFalhou(arquivo)}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex flex-col items-center gap-1">
          <IconeDoArquivo cat={cat} className={`${tamanho === "grande" ? "size-10" : "size-6"} ${COR[cat]}`} />
          {tamanho === "grande" && extensao(nome) && <span className="text-xs font-semibold text-muted">{extensao(nome)}</span>}
        </span>
      )}
    </span>
  );
}

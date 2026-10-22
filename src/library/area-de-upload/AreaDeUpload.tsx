"use client";

import { Botao } from "@/library/botao/Botao";
import { useId, useRef, useState, type DragEvent } from "react";
import { extensao, MiniaturaDeArquivo } from "./MiniaturaDeArquivo";

/** 1536 → "1,5 KB"; 5242880 → "5 MB" (base 1024). */
export function formatarTamanho(bytes: number) {
  const unidades = ["B", "KB", "MB", "GB", "TB"];
  let valor = bytes;
  let u = 0;
  while (valor >= 1024 && u < unidades.length - 1) {
    valor /= 1024;
    u++;
  }
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: u === 0 || valor >= 100 ? 0 : 1 })} ${unidades[u]}`;
}

/** Testa o arquivo contra a lista do `accept` (".pdf", "image/*", "application/pdf"). */
function aceito(arquivo: File, aceitar: string | undefined) {
  if (!aceitar) return true;
  const nome = arquivo.name.toLowerCase();
  const tipo = arquivo.type.toLowerCase();
  return aceitar
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((t) => {
      if (t.startsWith(".")) return nome.endsWith(t);
      if (t.endsWith("/*")) return tipo.startsWith(t.slice(0, -1));
      return tipo === t;
    });
}

const NOME_DO_TIPO: Record<string, string> = {
  "image/*": "imagens",
  "video/*": "vídeos",
  "audio/*": "áudios",
  "application/pdf": "PDF",
  "text/csv": "CSV",
};

/** ".pdf,image/*" → "PDF ou imagens". */
function descreverTipos(aceitar: string) {
  const nomes = [
    ...new Set(
      aceitar
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .map((t) => NOME_DO_TIPO[t] ?? (t.startsWith(".") ? t.slice(1).toUpperCase() : t)),
    ),
  ];
  return nomes.length <= 1 ? (nomes[0] ?? "") : `${nomes.slice(0, -1).join(", ")} ou ${nomes[nomes.length - 1]}`;
}

const mesmoArquivo = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** Mensagens de erro e textos da área; troque para o contexto. */
export type MensagensDoUpload = {
  tipo: (nome: string) => string;
  tamanho: (nome: string, limite: string) => string;
  quantidade: (limite: number) => string;
  lista: string;
  remover: (nome: string) => string;
  enviando: string;
  enviado: string;
};

const MENSAGENS_PADRAO: MensagensDoUpload = {
  tipo: (nome) => `“${nome}” não é de um tipo aceito.`,
  tamanho: (nome, limite) => `“${nome}” passa do limite de ${limite}.`,
  quantidade: (limite) => (limite === 1 ? "Escolha só um arquivo." : `Escolha no máximo ${limite} arquivos.`),
  lista: "Arquivos escolhidos",
  remover: (nome) => `Remover ${nome}`,
  enviando: "Enviando",
  enviado: "Enviado",
};

/**
 * Área para escolher arquivos: arrastar e soltar ou clicar (e Enter/Espaço) para
 * abrir o seletor do sistema. Valida tipo, tamanho e quantidade com mensagens
 * claras, e lista os escolhidos com miniatura, nome, tamanho, botão de remover e,
 * se informado, o progresso do envio de cada um.
 *
 * Controlada: recebe `arquivos` e devolve a lista nova em `aoMudar`.
 */
export function AreaDeUpload({
  arquivos,
  aoMudar,
  aceitar,
  multiplos = false,
  tamanhoMaximo,
  maximoDeArquivos,
  progresso,
  exibicao = "lista",
  titulo,
  descricao,
  desabilitado = false,
  mensagens: mensagensParciais,
}: {
  arquivos: File[];
  aoMudar: (arquivos: File[]) => void;
  /** Tipos aceitos, no formato do `accept` do HTML: ".pdf,image/*". */
  aceitar?: string;
  /** Aceita vários arquivos (somando aos já escolhidos). Sem isso, um novo substitui o anterior. */
  multiplos?: boolean;
  /** Tamanho máximo de cada arquivo, em bytes (5 MB = 5 * 1024 * 1024). */
  tamanhoMaximo?: number;
  /** Quantidade máxima de arquivos com `multiplos`. */
  maximoDeArquivos?: number;
  /** Progresso do envio de cada arquivo, de 0 a 100. Arquivos fora do mapa não mostram barra. */
  progresso?: ReadonlyMap<File, number>;
  /** "lista": linhas com miniatura pequena. "grade": cartões com miniatura grande (bom para imagens). */
  exibicao?: "lista" | "grade";
  /** Texto principal da área. Padrão: "Arraste … ou clique para escolher". */
  titulo?: string;
  /** Linha de apoio. Padrão: tipos aceitos e tamanho máximo ("PDF ou imagens, até 5 MB"). */
  descricao?: string;
  desabilitado?: boolean;
  mensagens?: Partial<MensagensDoUpload>;
}) {
  const mensagens = { ...MENSAGENS_PADRAO, ...mensagensParciais };
  const idErros = useId();
  const seletor = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLButtonElement>(null);
  const [sobre, setSobre] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const limite = multiplos ? maximoDeArquivos : 1;
  const textoTitulo =
    titulo ?? (multiplos ? "Arraste arquivos até aqui ou clique para escolher" : "Arraste um arquivo até aqui ou clique para escolher");
  const textoDescricao =
    descricao ??
    [aceitar && descreverTipos(aceitar), tamanhoMaximo !== undefined && `até ${formatarTamanho(tamanhoMaximo)}`]
      .filter(Boolean)
      .join(", ");

  function receber(lista: FileList | null | undefined) {
    if (!lista || lista.length === 0 || desabilitado) return;
    const novos: File[] = [];
    const problemas: string[] = [];
    for (const f of Array.from(lista)) {
      if (!aceito(f, aceitar)) problemas.push(mensagens.tipo(f.name));
      else if (tamanhoMaximo !== undefined && f.size > tamanhoMaximo) problemas.push(mensagens.tamanho(f.name, formatarTamanho(tamanhoMaximo)));
      else novos.push(f);
    }

    let resultado: File[];
    if (!multiplos) {
      if (novos.length > 1) problemas.push(mensagens.quantidade(1));
      resultado = novos.length ? [novos[0]] : arquivos;
    } else {
      resultado = [...arquivos, ...novos.filter((n) => !arquivos.some((a) => mesmoArquivo(a, n)))];
      if (limite !== undefined && resultado.length > limite) {
        problemas.push(mensagens.quantidade(limite));
        resultado = resultado.slice(0, limite);
      }
    }

    setErros(problemas);
    if (novos.length) aoMudar(resultado);
  }

  function remover(indice: number) {
    aoMudar(arquivos.filter((_, i) => i !== indice));
    setErros([]);
    area.current?.focus();
  }

  const aoArrastarSobre = (e: DragEvent) => {
    if (desabilitado || !e.dataTransfer.types.includes("Files")) return;
    // Sem o preventDefault o navegador recusa o drop e abre o arquivo numa aba.
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!sobre) setSobre(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={seletor}
        type="file"
        hidden
        tabIndex={-1}
        accept={aceitar}
        multiple={multiplos}
        disabled={desabilitado}
        onChange={(e) => {
          receber(e.target.files);
          // Zera para o mesmo arquivo poder ser escolhido de novo depois de removido.
          e.target.value = "";
        }}
      />
      <button
        ref={area}
        type="button"
        disabled={desabilitado}
        aria-describedby={erros.length ? idErros : undefined}
        onClick={() => seletor.current?.click()}
        onDragEnter={aoArrastarSobre}
        onDragOver={aoArrastarSobre}
        onDragLeave={(e) => {
          // dragleave também dispara ao passar de um filho para outro: só apaga ao sair da área inteira.
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setSobre(false);
          receber(e.dataTransfer.files);
        }}
        className={`flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          sobre ? "border-accent bg-accent/5" : "border-rule-strong hover:border-accent hover:bg-surface"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-7 ${sobre ? "text-accent" : "text-muted"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 15V4m-4 4 4-4 4 4" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <span className="text-sm font-medium text-ink">{textoTitulo}</span>
        {textoDescricao && <span className="text-xs text-muted first-letter:uppercase">{textoDescricao}</span>}
      </button>

      {erros.length > 0 && (
        <ul id={idErros} role="alert" className="flex flex-col gap-1 text-sm text-critical">
          {erros.map((erro, i) => (
            <li key={i} className="flex items-start gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.5h.01" />
              </svg>
              {erro}
            </li>
          ))}
        </ul>
      )}

      {arquivos.length > 0 && (
        <ul
          aria-label={mensagens.lista}
          className={exibicao === "grade" ? "grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3" : "flex flex-col gap-2"}
        >
          {arquivos.map((arquivo, i) => {
            const pct = progresso?.get(arquivo);
            const meta = [extensao(arquivo.name), formatarTamanho(arquivo.size)].filter(Boolean).join(" · ");
            // O botão fica a 3 (grade) ou 4 (lista) unidades da borda do cartão: o raio acompanha essa folga
            const raioDoBotao = exibicao === "grade" ? "[--raio-do-botao:max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*3))]" : "[--raio-do-botao:max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*4))]";
            const botaoRemover = (
              <Botao
                variante="discreto-perigo"
                tamanho="sm"
                soIcone
                onClick={() => remover(i)}
                aria-label={mensagens.remover(arquivo.name)}
                title={mensagens.remover(arquivo.name)}
                className={raioDoBotao}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </Botao>
            );
            const barra = pct !== undefined && (
              <div className="mt-1.5 flex items-center gap-2">
                <div
                  role="progressbar"
                  aria-label={`${pct >= 100 ? mensagens.enviado : mensagens.enviando}: ${arquivo.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(pct)}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-track"
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-150 ${pct >= 100 ? "bg-success" : "bg-accent"}`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
                <span className={`text-xs tabular-nums ${pct >= 100 ? "text-success" : "text-muted"}`}>
                  {pct >= 100 ? mensagens.enviado : `${Math.round(pct)}%`}
                </span>
              </div>
            );

            return exibicao === "grade" ? (
              <li key={`${arquivo.name}-${arquivo.lastModified}-${i}`} className="relative flex flex-col gap-2 rounded-xl border border-rule bg-page p-2">
                <MiniaturaDeArquivo arquivo={arquivo} tamanho="grande" />
                <div className="min-w-0 px-1 pb-1">
                  <p className="truncate text-sm text-ink" title={arquivo.name}>
                    {arquivo.name}
                  </p>
                  <p className="text-xs text-muted">{formatarTamanho(arquivo.size)}</p>
                  {barra}
                </div>
                <span className={`absolute top-3 right-3 ${raioDoBotao} bg-page/90`}>{botaoRemover}</span>
              </li>
            ) : (
              <li key={`${arquivo.name}-${arquivo.lastModified}-${i}`} className="flex items-center gap-3 rounded-xl border border-rule bg-page p-2 pr-4">
                <MiniaturaDeArquivo arquivo={arquivo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink" title={arquivo.name}>
                    {arquivo.name}
                  </p>
                  <p className="text-xs text-muted">{meta}</p>
                  {barra}
                </div>
                {botaoRemover}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

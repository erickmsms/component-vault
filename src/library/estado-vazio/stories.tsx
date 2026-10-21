import type { ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { EstadoVazio, type VarianteDeEstadoVazio } from "./EstadoVazio";

function Mais() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Recarregar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function Bussola() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

const TEXTOS: Record<VarianteDeEstadoVazio, { titulo: string; descricao: string; acao: string }> = {
  vazio: {
    titulo: "Nenhum projeto ainda",
    descricao: "Crie o primeiro projeto para começar a organizar as tarefas da equipe.",
    acao: "Criar projeto",
  },
  busca: {
    titulo: "Nenhum resultado para “relatório anual”",
    descricao: "Confira a grafia ou tire alguns filtros.",
    acao: "Limpar filtros",
  },
  erro: {
    titulo: "Não foi possível carregar os pedidos",
    descricao: "Algo falhou do nosso lado. Tente de novo em instantes.",
    acao: "Tentar novamente",
  },
};

/** Botão simples só para estes exemplos (a biblioteca não depende de outro componente). */
function Botao({
  variante = "secundaria",
  tamanho = "md",
  icone,
  children,
}: {
  variante?: "primaria" | "secundaria";
  tamanho?: "sm" | "md";
  icone?: ReactNode;
  children: ReactNode;
}) {
  const cores = variante === "primaria" ? "bg-ink text-page" : "border border-rule text-ink hover:bg-surface";
  const medidas = tamanho === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button type="button" className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors ${cores} ${medidas}`}>
      {icone}
      {children}
    </button>
  );
}

export default defineStories({
  args: {
    variante: "vazio",
    tamanho: "md",
    titulo: TEXTOS.vazio.titulo,
    descricao: TEXTOS.vazio.descricao,
    comAcao: true,
    codigo: "",
  },
  controls: {
    variante: { type: "select", options: ["vazio", "busca", "erro"] },
    tamanho: { type: "select", options: ["sm", "md", "lg"] },
    titulo: { type: "text" },
    descricao: { type: "text" },
    comAcao: { type: "boolean", label: "acao" },
    codigo: { type: "text", label: "codigo (vazio = sem)" },
  },
  render: (a) => {
    const variante = a.variante as VarianteDeEstadoVazio;
    return (
      <div className="w-full max-w-xl">
        <EstadoVazio
          variante={variante}
          tamanho={a.tamanho as "sm" | "md" | "lg"}
          titulo={a.titulo}
          descricao={a.descricao || undefined}
          codigo={a.codigo || undefined}
          acao={
            a.comAcao ? (
              <Botao
                variante={variante === "vazio" ? "primaria" : "secundaria"}
                tamanho={a.tamanho === "sm" ? "sm" : "md"}
                icone={variante === "vazio" ? <Mais /> : variante === "erro" ? <Recarregar /> : undefined}
              >
                {TEXTOS[variante].acao}
              </Botao>
            ) : undefined
          }
        />
      </div>
    );
  },
  stories: [
    { name: "Padrão" },
    {
      name: "Vazio, busca e erro",
      render: () => (
        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <EstadoVazio
            titulo="Nenhum projeto ainda"
            descricao="Crie o primeiro para começar."
            acao={
              <Botao variante="primaria" tamanho="sm" icone={<Mais />}>
                Criar projeto
              </Botao>
            }
          />
          <EstadoVazio
            variante="busca"
            titulo="Nenhum resultado"
            descricao="Tire alguns filtros."
            acao={<Botao tamanho="sm">Limpar filtros</Botao>}
          />
          <EstadoVazio
            variante="erro"
            titulo="Falha ao carregar"
            descricao="Tente de novo em instantes."
            acao={
              <Botao tamanho="sm" icone={<Recarregar />}>
                Tentar novamente
              </Botao>
            }
          />
        </div>
      ),
    },
    {
      name: "Tela de erro (lg)",
      render: () => (
        <EstadoVazio
          variante="erro"
          tamanho="lg"
          nivel={1}
          titulo="Esta tela não carregou"
          descricao="Algo quebrou ao montar a página e o erro já foi registrado. Você pode tentar de novo; o resto do sistema segue funcionando."
          codigo="a3f9c21e"
          acao={
            <>
              <Botao variante="primaria" icone={<Recarregar />}>
                Tentar novamente
              </Botao>
              <Botao>Ir para o início</Botao>
            </>
          }
        />
      ),
    },
    {
      name: "Página não encontrada (lg)",
      render: () => (
        <EstadoVazio
          variante="busca"
          tamanho="lg"
          nivel={1}
          icone={<Bussola />}
          titulo="Esta página não existe"
          descricao="O endereço pode ter mudado, ou você não tem acesso a esta área."
          acao={<Botao variante="primaria">Voltar ao início</Botao>}
        />
      ),
    },
    {
      name: "Pequeno, dentro de uma lista",
      render: () => (
        <div className="w-full max-w-xs">
          <EstadoVazio tamanho="sm" titulo="Nenhum comentário" descricao="Seja o primeiro a comentar." />
        </div>
      ),
    },
  ],
});

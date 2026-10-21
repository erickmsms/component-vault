import { meta as abertura } from "@/library/abertura/meta";
import { meta as aviso } from "@/library/aviso/meta";
import { meta as blocosDeTexto } from "@/library/blocos-de-texto/meta";
import { meta as cabecalho } from "@/library/cabecalho/meta";
import { meta as dica } from "@/library/dica/meta";
import { meta as graficoComSeletor } from "@/library/grafico-com-seletor/meta";
import { meta as graficoLinhas } from "@/library/grafico-linhas/meta";
import { meta as listaDeIndicadores } from "@/library/lista-de-indicadores/meta";
import { meta as menuSuspenso } from "@/library/menu-suspenso/meta";
import { meta as numerosPrincipais } from "@/library/numeros-principais/meta";
import { meta as quadroMetricas } from "@/library/quadro-metricas/meta";
import { meta as ranking } from "@/library/ranking/meta";
import { meta as rodape } from "@/library/rodape/meta";
import { meta as secao } from "@/library/secao/meta";
import { meta as seletorMultiplo } from "@/library/seletor-multiplo/meta";
import { meta as seletorUnico } from "@/library/seletor-unico/meta";
import { meta as tabelaDados } from "@/library/tabela-dados/meta";
import type { ComponentMeta } from "./types";

// Metadados de todos os componentes. Ao adicionar um componente, registre-o
// aqui e em ./all-stories.tsx.
export const registry: ComponentMeta[] = [
  abertura,
  aviso,
  blocosDeTexto,
  cabecalho,
  dica,
  graficoComSeletor,
  graficoLinhas,
  listaDeIndicadores,
  menuSuspenso,
  numerosPrincipais,
  quadroMetricas,
  ranking,
  rodape,
  secao,
  seletorMultiplo,
  seletorUnico,
  tabelaDados,
].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function getComponent(slug: string) {
  return registry.find((component) => component.slug === slug);
}

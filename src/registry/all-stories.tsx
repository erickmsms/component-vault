import abertura from "@/library/abertura/stories";
import aviso from "@/library/aviso/stories";
import blocosDeTexto from "@/library/blocos-de-texto/stories";
import cabecalho from "@/library/cabecalho/stories";
import dica from "@/library/dica/stories";
import graficoComSeletor from "@/library/grafico-com-seletor/stories";
import graficoLinhas from "@/library/grafico-linhas/stories";
import listaDeIndicadores from "@/library/lista-de-indicadores/stories";
import menuSuspenso from "@/library/menu-suspenso/stories";
import numerosPrincipais from "@/library/numeros-principais/stories";
import quadroMetricas from "@/library/quadro-metricas/stories";
import ranking from "@/library/ranking/stories";
import rodape from "@/library/rodape/stories";
import secao from "@/library/secao/stories";
import seletorMultiplo from "@/library/seletor-multiplo/stories";
import seletorUnico from "@/library/seletor-unico/stories";
import tabelaDados from "@/library/tabela-dados/stories";
import type { StoriesModule } from "./stories";

// Exemplos de cada componente (src/library/<slug>/stories.tsx). Ficam separados dos
// metadados porque só são renderizados no cliente: nos cards e nos iframes de preview.
export const allStories: Record<string, StoriesModule> = {
  abertura,
  aviso,
  "blocos-de-texto": blocosDeTexto,
  cabecalho,
  dica,
  "grafico-com-seletor": graficoComSeletor,
  "grafico-linhas": graficoLinhas,
  "lista-de-indicadores": listaDeIndicadores,
  "menu-suspenso": menuSuspenso,
  "numeros-principais": numerosPrincipais,
  "quadro-metricas": quadroMetricas,
  ranking,
  rodape,
  secao,
  "seletor-multiplo": seletorMultiplo,
  "seletor-unico": seletorUnico,
  "tabela-dados": tabelaDados,
};

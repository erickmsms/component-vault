import type { ComponentType } from "react";
import AberturaDemo from "@/library/abertura/demo";
import AvisoDemo from "@/library/aviso/demo";
import BlocosDeTextoDemo from "@/library/blocos-de-texto/demo";
import CabecalhoDemo from "@/library/cabecalho/demo";
import DicaDemo from "@/library/dica/demo";
import GraficoComSeletorDemo from "@/library/grafico-com-seletor/demo";
import GraficoLinhasDemo from "@/library/grafico-linhas/demo";
import ListaDeIndicadoresDemo from "@/library/lista-de-indicadores/demo";
import MenuSuspensoDemo from "@/library/menu-suspenso/demo";
import NumerosPrincipaisDemo from "@/library/numeros-principais/demo";
import QuadroMetricasDemo from "@/library/quadro-metricas/demo";
import RankingDemo from "@/library/ranking/demo";
import RodapeDemo from "@/library/rodape/demo";
import SecaoDemo from "@/library/secao/demo";
import SeletorMultiploDemo from "@/library/seletor-multiplo/demo";
import SeletorUnicoDemo from "@/library/seletor-unico/demo";
import TabelaDadosDemo from "@/library/tabela-dados/demo";

// Demos ficam separadas dos metadados porque só são renderizadas no cliente
// (src/showcase/demo-preview.tsx), então podem usar hooks livremente.
export const demos: Record<string, ComponentType> = {
  abertura: AberturaDemo,
  aviso: AvisoDemo,
  "blocos-de-texto": BlocosDeTextoDemo,
  cabecalho: CabecalhoDemo,
  dica: DicaDemo,
  "grafico-com-seletor": GraficoComSeletorDemo,
  "grafico-linhas": GraficoLinhasDemo,
  "lista-de-indicadores": ListaDeIndicadoresDemo,
  "menu-suspenso": MenuSuspensoDemo,
  "numeros-principais": NumerosPrincipaisDemo,
  "quadro-metricas": QuadroMetricasDemo,
  ranking: RankingDemo,
  rodape: RodapeDemo,
  secao: SecaoDemo,
  "seletor-multiplo": SeletorMultiploDemo,
  "seletor-unico": SeletorUnicoDemo,
  "tabela-dados": TabelaDadosDemo,
};

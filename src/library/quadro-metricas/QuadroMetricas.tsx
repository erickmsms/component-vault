import { Termo } from "@/library/dica/Dica";

export type LinhaDeMetrica = {
  rotulo: string;
  /** Já formatado: "0,62 °C", "91,7%". */
  valor: string;
  /** Explicação do termo, mostrada num tooltip ao lado do rótulo. */
  dica?: string;
};

export type GrupoDeMetricas = { titulo: string; linhas: LinhaDeMetrica[] };

function Grupo({ titulo, linhas }: GrupoDeMetricas) {
  return (
    <div>
      <h3 className="border-b-2 border-rule-strong pb-2 font-display text-base font-bold">{titulo}</h3>
      <dl>
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex justify-between gap-4 border-b border-rule py-2.5 text-[15px]">
            <dt className="text-ink-2">{l.dica ? <Termo dica={l.dica}>{l.rotulo}</Termo> : l.rotulo}</dt>
            <dd className="font-medium tabular-nums">{l.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Grupos de métricas em listas "rótulo → valor", cada termo com a sua explicação.
 * Os grupos se distribuem em colunas conforme a largura disponível.
 */
export function QuadroMetricas({ grupos }: { grupos: GrupoDeMetricas[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-x-8 gap-y-10">
      {grupos.map((g) => (
        <Grupo key={g.titulo} {...g} />
      ))}
    </div>
  );
}

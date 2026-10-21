import type { ComponentDoc } from "@/registry/props";

/** Tabela de props gerada dos tipos TypeScript de cada componente exportado. */
export function PropsTable({ docs }: { docs: ComponentDoc[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="space-y-8">
      {docs.map((doc) => (
        <div key={doc.name} className="space-y-2">
          <h3 className="font-mono text-base font-semibold">{`<${doc.name}>`}</h3>
          {doc.description && <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{doc.description}</p>}
          {doc.nativas > 0 && (
            <p className="text-sm text-zinc-500">
              Também aceita os {doc.nativas} atributos nativos do elemento HTML (onClick, aria-*, disabled...), repassados
              ao elemento.
            </p>
          )}
          {doc.props.length === 0 ? (
            <p className="text-sm text-zinc-500">{doc.nativas > 0 ? "Sem props próprias." : "Sem props."}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[42rem] border-collapse text-sm">
                <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 font-medium">Prop</th>
                    <th className="px-4 py-2 font-medium">Tipo</th>
                    <th className="px-4 py-2 font-medium">Padrão</th>
                    <th className="px-4 py-2 font-medium">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.props.map((p) => (
                    <tr key={p.name} className="border-t border-zinc-200 align-top dark:border-zinc-800">
                      <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                        {p.name}
                        {p.required && (
                          <span className="ml-1.5 rounded bg-zinc-200 px-1 py-0.5 font-sans text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            obrigatória
                          </span>
                        )}
                      </td>
                      <td className="max-w-[22rem] px-4 py-2.5 font-mono text-xs break-words text-violet-700 dark:text-violet-300">
                        {p.type}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                        {p.defaultValue ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{p.description ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

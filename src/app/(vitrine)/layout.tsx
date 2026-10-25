import Link from "next/link";
import { FiltrosProvider, VitrineShell } from "@/showcase/filters";
import { SelecaoProvider } from "@/showcase/selecao";
import { VitrineHeader } from "@/showcase/vitrine-header";
import { THEME_ATTR } from "@/themes/tokens";

export default function VitrineLayout({ children }: LayoutProps<"/">) {
  return (
    <FiltrosProvider>
      {/* "contents" passa os tokens do tema sem criar uma caixa, para o sticky continuar
          valendo na página inteira. */}
      <div data-theme={THEME_ATTR} className="contents">
        <VitrineHeader />
        {/* Fundo sutil: duas cores do tema saindo dos cantos superior esquerdo e inferior direito */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 0% 0%, color-mix(in oklab, var(--accent) 21%, transparent), transparent 70%), radial-gradient(ellipse 70% 70% at 100% 100%, color-mix(in oklab, var(--series-2) 21%, transparent), transparent 70%)",
          }}
        />
      </div>
      <main className="w-full flex-1 px-6 py-8">
        <SelecaoProvider>
          <VitrineShell>{children}</VitrineShell>
        </SelecaoProvider>
      </main>
      <footer className="px-6 pb-8 text-center text-xs text-zinc-500">
        <Link href="/privacidade" className="underline-offset-4 hover:underline">
          Privacidade
        </Link>
      </footer>
    </FiltrosProvider>
  );
}

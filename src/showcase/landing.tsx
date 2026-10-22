"use client";

import { useEffect, useRef, useState } from "react";
import { Inter_Tight } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registry } from "@/registry";
import { LogoVault } from "./logo-vault";

// A landing é a marca do site: cores e fonte fixas, não seguem o tema da vitrine
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "700", "800"] });

const REPO = "https://github.com/erickmsms/component-vault";
const CATALOGO = "/componentes";
const DURACAO_MS = 700;
// Grade em que o bloco vermelho se desfaz ao ser clicado
const COLUNAS = 8;
const LINHAS = 6;
const ABERTURA_MS = 550;

const SELOS = ["Sem login", "Open source", "Aberto a contribuições"];

/** Página inicial (/): apresenta a biblioteca. "Ver componentes" desliza a tela para cima, como se descesse, e abre /componentes. */
export function Landing() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  // Com cacheComponents a página fica guardada ao sair; zera a animação para o "voltar" mostrar a tela inteira
  useEffect(() => () => setSaindo(false), []);

  /** Desliza a tela para cima e abre o catálogo; `antes` é o tempo de outra animação que roda primeiro. */
  function descer(antes = 0) {
    setTimeout(() => setSaindo(true), antes);
    setTimeout(() => router.push(CATALOGO), antes + DURACAO_MS);
  }

  function irParaCatalogo(e: React.MouseEvent<HTMLAnchorElement>) {
    // Ctrl/Cmd + clique abre em outra aba normalmente
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (semMovimento()) return router.push(CATALOGO);
    descer();
  }

  return (
    <section
      className={`${interTight.className} grid min-h-svh grid-cols-1 grid-rows-[auto_1fr_auto] gap-x-6 gap-y-10 bg-[#0A0A0A] px-4 py-8 text-[#F5F5F4] transition-transform ease-[cubic-bezier(0.7,0,0.2,1)] md:grid-cols-12 md:px-16 md:py-10 ${saindo ? "-translate-y-full" : ""}`}
      style={{ transitionDuration: `${DURACAO_MS}ms` }}
    >
      <nav className="flex items-center justify-between gap-6 md:col-span-12">
        <LogoVault piscar />
        <div className="flex gap-4 text-sm whitespace-nowrap md:gap-7">
          <Link href={CATALOGO} onClick={irParaCatalogo} className="flex min-h-11 items-center hover:text-white">
            Catálogo
          </Link>
          <a href={REPO} className="flex min-h-11 items-center hover:text-white">GitHub ↗</a>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-10 md:col-span-6">
        <p className="font-mono text-[13px] text-[#A8A29E]">Biblioteca de componentes React</p>
        <div>
          <h1 className="text-[clamp(44px,13vw,64px)] leading-[0.9] font-extrabold tracking-[-0.05em] md:text-[clamp(48px,6.5vw,104px)]">
            Componentes
            <br />
            prontos.
            <br />
            Código aberto.
          </h1>
          <p className="mt-7 max-w-[460px] text-lg leading-snug text-[#D6D3D1] md:text-[19px]">
            Preview, playground e código para copiar. Sem login. Quer somar? Abra um PR.
          </p>
        </div>
      </div>

      <BlocoCofre
        onAbrir={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return false;
          e.preventDefault();
          if (semMovimento()) {
            router.push(CATALOGO);
            return false;
          }
          descer(ABERTURA_MS);
          return true;
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-[#3A3A3A] pt-5 md:col-span-12">
        <ul className="flex flex-wrap gap-x-10 gap-y-2 text-[15px]">
          {SELOS.map((selo) => (
            <li key={selo}>
              <span aria-hidden="true" className="text-[#E5231B]">■</span> {selo}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <a
            href={`${REPO}/pulls`}
            className="flex min-h-13 items-center border border-[#57534E] px-[22px] font-bold hover:border-[#F5F5F4]"
          >
            Abrir um PR
          </a>
          <Link
            href={CATALOGO}
            onClick={irParaCatalogo}
            className="flex min-h-13 items-center bg-[#F5F5F4] px-[22px] font-bold text-[#0A0A0A] hover:bg-white"
          >
            Ver componentes ↓
          </Link>
        </div>
      </div>
    </section>
  );
}

function semMovimento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * O bloco vermelho: o ponto claro do gradiente segue o mouse, e ao clicar o bloco se desfaz
 * numa grade de quadrados (como o do logo) antes de descer para o catálogo.
 */
function BlocoCofre({ onAbrir }: { onAbrir: (e: React.MouseEvent<HTMLAnchorElement>) => boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const alvo = useRef({ x: 0, y: 0 });
  const [abrindo, setAbrindo] = useState(false);

  // Zera ao sair da página (cacheComponents guarda o estado para o "voltar")
  useEffect(() => () => setAbrindo(false), []);

  // Anima o ponto claro em direção ao alvo, sem re-renderizar o React
  useEffect(() => {
    const bloco = ref.current;
    if (!bloco || semMovimento()) return;
    const atual = { x: 0, y: 0 };
    let quadro = 0;
    const passo = () => {
      atual.x += (alvo.current.x - atual.x) * 0.08;
      atual.y += (alvo.current.y - atual.y) * 0.08;
      bloco.style.setProperty("--x", `${atual.x}%`);
      bloco.style.setProperty("--y", `${atual.y}%`);
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, []);

  function mover(e: React.PointerEvent<HTMLAnchorElement>) {
    const caixa = e.currentTarget.getBoundingClientRect();
    alvo.current = {
      x: ((e.clientX - caixa.left) / caixa.width) * 100,
      y: ((e.clientY - caixa.top) / caixa.height) * 100,
    };
  }

  return (
    <Link
      ref={ref}
      href={CATALOGO}
      aria-label="Ver componentes"
      onPointerMove={mover}
      onPointerLeave={() => (alvo.current = { x: 0, y: 0 })}
      onClick={(e) => {
        if (onAbrir(e)) setAbrindo(true);
      }}
      className="relative hidden min-h-80 cursor-pointer overflow-hidden outline-offset-4 outline-[#F5F5F4] focus-visible:outline-2 md:col-span-5 md:col-start-8 md:block"
      style={{
        background:
          // Luz que segue o mouse por cima do gradiente original (parada no canto já laranja)
          "radial-gradient(60% 60% at var(--x, 0%) var(--y, 0%), rgb(255 90 54 / 0.7), transparent), radial-gradient(120% 120% at 100% 100%, #3B0A2A 0%, #E5231B 55%, #FF5A36 100%)",
      }}
    >
      <span aria-hidden="true" className="absolute inset-x-6 bottom-6 flex items-end justify-between font-mono text-xs text-white">
        <span>■ {registry.length} componentes</span>
        <span>open source</span>
      </span>
      <span aria-hidden="true" className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLUNAS}, 1fr)` }}>
        {Array.from({ length: COLUNAS * LINHAS }, (_, i) => {
          const atraso = ((i % COLUNAS) + Math.floor(i / COLUNAS)) * (ABERTURA_MS / (COLUNAS + LINHAS));
          return (
            <span
              key={i}
              className={`bg-[#0A0A0A] transition-transform duration-300 ease-out ${abrindo ? "scale-100" : "scale-0"}`}
              style={{ transitionDelay: abrindo ? `${atraso}ms` : "0ms" }}
            />
          );
        })}
      </span>
    </Link>
  );
}

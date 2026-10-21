"use client";

import { useEffect, useRef } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Vídeo mudo, em loop, que só toca quando `tocando` é verdadeiro: quem usa
 * decide quando (por exemplo, só o item ativo e em tela). Preenche o contêiner
 * posicionado em que está, cortando as bordas como uma imagem de capa.
 *
 * Detalhes: `playbackRate` não existe como atributo HTML, então é aplicado por
 * script e reaplicado quando a fonte carrega; e com "reduzir movimento" o vídeo
 * fica parado no primeiro quadro (ou no `poster`).
 */
export function VideoControlado({
  src,
  tocando = true,
  velocidade = 1,
  poster,
  rotulo,
  className = "absolute inset-0 h-full w-full object-cover",
}: {
  /** Endereço do arquivo de vídeo. */
  src: string;
  /** Toca quando verdadeiro e pausa quando falso. */
  tocando?: boolean;
  /** Velocidade de reprodução (`playbackRate`): 0,5 é metade da velocidade. */
  velocidade?: number;
  /** Imagem mostrada antes de o vídeo carregar. */
  poster?: string;
  /** Descrição para leitores de tela. Sem ela, o vídeo é tratado como decorativo. */
  rotulo?: string;
  /** Classes do elemento `<video>` (o padrão cobre o contêiner posicionado). */
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const semMovimento = useSemMovimento();
  const deveTocar = tocando && !semMovimento;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const aplicar = () => {
      video.playbackRate = velocidade;
    };
    aplicar();
    video.addEventListener("loadedmetadata", aplicar);
    return () => video.removeEventListener("loadedmetadata", aplicar);
  }, [velocidade]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (deveTocar) {
      // play() rejeita se o vídeo for pausado antes de começar (trocar de item rápido faz isso).
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [deveTocar]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    />
  );
}

/**
 * One short glitch per entry. Tear slices reuse the displayed image only when
 * first needed, so decorative copies do not add initial image requests.
 */
export function bindCardGlitch(card: HTMLElement): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover: hover)');
  const durations = [1200, 1500, 1350, 1600];
  let previous = -1;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stop = () => {
    clearTimeout(timer);
    card.removeAttribute('data-card-glitch');
  };

  const play = () => {
    if (motion.matches) return;
    const frame = card.querySelector<HTMLElement>('[data-glitch-image]');
    const source = frame?.querySelector<HTMLImageElement>('img[data-main-image]')
      ?? frame?.querySelector<HTMLImageElement>('img');
    if (!frame || !source || !source.complete || !source.naturalWidth) return;

    const sourceStyle = getComputedStyle(source);
    frame.querySelectorAll<HTMLElement>('.card-glitch__slice').forEach((slice) => {
      let copy = slice.querySelector('img');
      if (!copy) {
        copy = document.createElement('img');
        copy.alt = '';
        copy.decoding = 'async';
        slice.append(copy);
      }
      const url = source.currentSrc || source.src;
      if (copy.getAttribute('src') !== url) copy.src = url;
      Object.assign(copy.style, {
        objectFit: sourceStyle.objectFit,
        objectPosition: sourceStyle.objectPosition,
        padding: sourceStyle.padding,
        backgroundColor: sourceStyle.backgroundColor,
      });
    });

    // Select freely on first entry; exclude the last variant on later entries.
    const next = previous < 0
      ? Math.floor(Math.random() * durations.length)
      : (previous + 1 + Math.floor(Math.random() * (durations.length - 1))) % durations.length;
    stop();
    void frame.offsetWidth;
    card.setAttribute('data-card-glitch', String(next));
    previous = next;
    timer = setTimeout(stop, durations[next]);
  };

  const enter = () => { if (hover.matches) play(); };
  const focus = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
    if ((event.target as Element).matches(':focus-visible')) play();
  };
  const blur = (event: FocusEvent) => {
    if (!(event.relatedTarget instanceof Node) || !card.contains(event.relatedTarget)) stop();
  };
  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focusin', focus);
  card.addEventListener('focusout', blur);
  motion.addEventListener('change', stop);
  return () => {
    stop();
    card.removeEventListener('pointerenter', enter);
    card.removeEventListener('pointerleave', stop);
    card.removeEventListener('focusin', focus);
    card.removeEventListener('focusout', blur);
    motion.removeEventListener('change', stop);
  };
}

/**
 * Ultra-smooth scrolling utility for Kroombox Landing Page.
 * Uses custom cubic-bezier easing interpolation (easeInOutCubic)
 * with requestAnimationFrame to ensure silky smooth continuous scrolling
 * across all mobile and desktop browsers and iframes.
 */

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const scrollToLandingSection = (id: string, customOffset: number = 0, duration: number = 550) => {
  if (id === 'hero') {
    smoothScrollToY(0, duration);
    return;
  }

  const element = document.getElementById(id);
  if (!element) return;

  const header = document.getElementById('kroombox-landing-header');
  const headerHeight = header ? header.getBoundingClientRect().height : (window.innerWidth < 1024 ? 64 : 68);
  
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const targetTop = Math.max(0, Math.round(elementTop - headerHeight - customOffset));

  smoothScrollToY(targetTop, duration);

  // Subtle focus pulse animation on destination section
  element.classList.add('transition-all', 'duration-500');
  element.style.willChange = 'transform, opacity';
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, duration + 200);
};

export const smoothScrollToY = (targetY: number, duration: number = 550) => {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;

  if (Math.abs(distance) < 5) {
    window.scrollTo(0, targetY);
    return;
  }

  let startTime: number | null = null;
  let animationFrameId: number;

  const step = (currentTime: number) => {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easeProgress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    }
  };

  // Cancel any prior listener conflict
  cancelAnimationFrame(window.__kroomboxScrollRafId || 0);
  animationFrameId = requestAnimationFrame(step);
  window.__kroomboxScrollRafId = animationFrameId;
};

// Global declaration for TS
declare global {
  interface Window {
    __kroomboxScrollRafId?: number;
  }
}

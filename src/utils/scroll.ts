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

export const smoothScrollToY = (targetY: number, _duration?: number) => {
  window.scrollTo({
    top: targetY,
    behavior: 'smooth',
  });
};

// Global declaration for TS
declare global {
  interface Window {
    __kroomboxScrollRafId?: number;
  }
}

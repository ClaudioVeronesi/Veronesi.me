// ---------- E-Mail-Verschleierung (gegen Scraper-Bots) ----------
// Adresse steht nirgends als Klartext im HTML — wird erst zur Laufzeit zusammengesetzt.
document.querySelectorAll('[data-email-user]').forEach(el => {
  const address = `${el.dataset.emailUser}@${el.dataset.emailDomain}`;
  el.href = `mailto:${address}`;
  if (el.dataset.emailShow === 'true') el.textContent = address;
  el.removeAttribute('data-email-user');
});

// ---------- Back-to-top ----------
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

// ---------- Nav: scrolled state + mobile toggle ----------
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.textContent = '☰';
  }));
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---------- Hero subtle parallax ----------
const heroBg = document.querySelector('.hero__bg');
if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `scale(1.08) translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
}

// ---------- Scroll progress bar ----------
const progress = document.querySelector('.progress');
if (progress) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + '%';
  }, { passive: true });
}

// ---------- Count-up stats ----------
const statNums = document.querySelectorAll('.stat__num[data-count]');
const countIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = el.dataset.count;
    const numeric = parseInt(target.replace(/\D/g, ''), 10);
    if (isNaN(numeric)) { el.textContent = target; countIo.unobserve(el); return; }
    const suffix = target.replace(/^[0-9]+/, '');
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(p * numeric) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countIo.unobserve(el);
  });
}, { threshold: 0.6 });
statNums.forEach(el => countIo.observe(el));

// ---------- Tilt on hover (cards / image frames) ----------
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---------- Journey-Linie: live durch Punktmitten zeichnen, Farbverlauf aus Punktfarben ----------
function drawJourneyLines() {
  document.querySelectorAll('.journey').forEach(journey => {
    let svg = journey.querySelector('.journey-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'journey-svg');
      svg.setAttribute('aria-hidden', 'true');
      journey.insertBefore(svg, journey.firstChild);
    }
    const dots = journey.querySelectorAll('.journey-dot');
    if (dots.length < 2) { svg.innerHTML = ''; return; }

    const rect = journey.getBoundingClientRect();
    const pts = Array.from(dots).map(dot => {
      const r = dot.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - rect.left,
        y: r.top + r.height / 2 - rect.top,
        color: getComputedStyle(dot).backgroundColor
      };
    });

    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const midY = (p0.y + p1.y) / 2;
      d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }

    const gradId = 'jgrad-' + Math.random().toString(36).slice(2, 9);
    const y0 = pts[0].y, y1 = pts[pts.length - 1].y;
    const stops = pts.map(p => {
      const off = ((p.y - y0) / (y1 - y0 || 1) * 100).toFixed(1);
      return `<stop offset="${off}%" stop-color="${p.color}"/>`;
    }).join('');

    svg.innerHTML = `<defs><linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">${stops}</linearGradient></defs>
      <path d="${d}" stroke="url(#${gradId})" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  });
}

window.addEventListener('load', drawJourneyLines);
document.addEventListener('DOMContentLoaded', () => {
  drawJourneyLines();
  setTimeout(drawJourneyLines, 350); // nach Web-Font-Swap neu berechnen
});
let journeyResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(journeyResizeTimer);
  journeyResizeTimer = setTimeout(drawJourneyLines, 150);
});
document.querySelectorAll('.daycard').forEach(card => {
  card.addEventListener('toggle', () => requestAnimationFrame(drawJourneyLines));
});

// ---------- Gallery lightbox ----------
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.lightbox__close');
  document.querySelectorAll('.masonry figure[data-full] img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.closest('figure').dataset.full;
      lbImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });
  const closeLb = () => lightbox.classList.remove('open');
  lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
}

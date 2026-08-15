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

const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.section, .hero').forEach(section => {
  section.querySelectorAll('.reveal').forEach((el, index) => {
    el.style.setProperty('--reveal-order', Math.min(index, 7));
    observer.observe(el);
  });
});

const progressBar = document.querySelector('.page-progress span');
const cursorGlow = document.querySelector('.cursor-glow');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let ticking = false;

const updatePageState = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  progressBar?.style.setProperty('--page-progress', progress);

  const marker = window.scrollY + window.innerHeight * 0.32;
  let currentSection = sections[0];
  sections.forEach(section => {
    if (section.offsetTop <= marker) currentSection = section;
  });

  navLinks.forEach(link => {
    const active = currentSection && link.getAttribute('href') === `#${currentSection.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  ticking = false;
};

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updatePageState);
    ticking = true;
  }
}, { passive: true });
updatePageState();

if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
  window.addEventListener('pointermove', event => {
    cursorGlow.style.setProperty('--pointer-x', `${event.clientX}px`);
    cursorGlow.style.setProperty('--pointer-y', `${event.clientY}px`);
    cursorGlow.classList.add('is-visible');
  }, { passive: true });

  document.querySelectorAll('.live-project-card, .ba-project-card, .project-card, .value-card, .skill-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
    });
  });
}

document.querySelectorAll('.section-toggle').forEach(button => {
  const target = document.getElementById(button.getAttribute('aria-controls'));
  if (!target) return;

  button.addEventListener('click', () => {
    const willExpand = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(willExpand));
    target.classList.toggle('is-condensed', !willExpand);
    target.classList.toggle('is-expanded', willExpand);
  });
});

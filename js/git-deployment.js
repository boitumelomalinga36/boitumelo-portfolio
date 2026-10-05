(() => {
  const sections = [...document.querySelectorAll('.doc-section[id]')];
  const toc = document.querySelector('.doc-toc');
  const tocLinks = [...document.querySelectorAll('.doc-toc a[href^="#"]')];
  const statusText = document.querySelector('.toc-status b');
  const progressBar = document.querySelector('.reading-progress span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const linksById = new Map(tocLinks.map(link => [link.hash.slice(1), link]));
  let activeId = '';

  function setActiveSection(id) {
    if (!id || id === activeId) return;
    activeId = id;
    tocLinks.forEach(link => {
      const current = link.hash === `#${id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    const activeLink = linksById.get(id);
    if (activeLink) {
      if (statusText) statusText.textContent = activeLink.textContent;
      if (window.innerWidth <= 850 && toc) {
        const nav = activeLink.parentElement;
        const targetLeft = activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2;
        nav.scrollTo({ left: Math.max(0, targetLeft), behavior: reduceMotion ? 'auto' : 'smooth' });
      } else {
        const linkTop = activeLink.offsetTop;
        const linkBottom = linkTop + activeLink.offsetHeight;
        const visibleTop = toc.scrollTop;
        const visibleBottom = visibleTop + toc.clientHeight;
        if (linkTop < visibleTop) toc.scrollTo({ top: linkTop - 12, behavior: reduceMotion ? 'auto' : 'smooth' });
        else if (linkBottom > visibleBottom) toc.scrollTo({ top: linkBottom - toc.clientHeight + 12, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
  }

  function updateReadingState() {
    const marker = window.scrollY + Math.min(window.innerHeight * .34, 260);
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.offsetTop <= marker) current = section.id;
      else break;
    }
    setActiveSection(current);

    const pageTop = document.querySelector('.doc-layout')?.offsetTop || 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight - pageTop;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, (window.scrollY - pageTop) / scrollable)) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateReadingState(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', updateReadingState);
  updateReadingState();

  document.querySelectorAll('.code-box').forEach((box, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.setAttribute('aria-label', `Copy code example ${index + 1}`);
    button.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
    box.append(button);

    button.addEventListener('click', async () => {
      const code = box.querySelector('code')?.innerText || '';
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        const area = document.createElement('textarea');
        area.value = code;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      button.classList.add('copied');
      button.innerHTML = '<span aria-hidden="true">✓</span> Copied';
      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
      }, 1800);
    });
  });

  if (!reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -7% 0px' });
    sections.forEach(section => revealObserver.observe(section));
  } else {
    sections.forEach(section => section.classList.add('in-view'));
  }

})();

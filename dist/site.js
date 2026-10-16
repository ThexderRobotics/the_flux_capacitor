(() => {
  document.documentElement.classList.add('js');

  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);

  const update = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${pageHeight > 0 ? window.scrollY / pageHeight : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  const revealItems = document.querySelectorAll('.page-intro, .home-intro, .services-preview, .feature, .content-card, .contact-direct, .price-list, .pricing-note, .pricing-actions, .hero-copy, .hero-visual, .service-section, .split-section, .process-v2, .final-cta');
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${Math.min(index * 55, 330)}ms`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();

(() => {
  const catalog = document.querySelector('.product-grid');
  if (!catalog) return;

  const cards = [...catalog.querySelectorAll('.product-card')];
  const filters = [...document.querySelectorAll('.catalog-filter')];
  const search = document.querySelector('#product-search');
  const quoteCount = document.querySelector('#quote-count');
  const quoteSummary = document.querySelector('#quote-summary');
  const quoteItems = new Set();

  const render = () => {
    const activeFilter = document.querySelector('.catalog-filter.is-active')?.dataset.filter || 'all';
    const query = (search?.value || '').trim().toLowerCase();
    cards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || card.dataset.name.includes(query);
      card.hidden = !(matchesFilter && matchesSearch);
    });
  };

  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.toggle('is-active', item === filter));
    render();
  }));
  search?.addEventListener('input', render);

  catalog.addEventListener('click', (event) => {
    const button = event.target.closest('.quote-button');
    if (!button) return;
    const item = button.dataset.item;
    quoteItems.add(item);
    button.classList.add('is-added');
    button.innerHTML = 'Added to quote <span aria-hidden="true">✓</span>';
    if (quoteCount) quoteCount.textContent = quoteItems.size;
    if (quoteSummary) quoteSummary.textContent = `${[...quoteItems].join(', ')} selected. Request a quote when you are ready.`;
  });
})();

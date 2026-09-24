(() => {
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
})();

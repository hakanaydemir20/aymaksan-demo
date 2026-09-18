/**
 * Aymaksan Stitch — animations.js
 * IntersectionObserver tabanlı scroll animasyonları
 * CSS Breakdance animasyonlarından bağımsız, sıfırdan yazıldı.
 */

(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  // Animasyon sınıfı eklenecek elementler
  const selectors = [
    '.value-card',
    '.bento-card',
    '.bento-feature',
    '.post-card',
    '.quality-content',
    '.quality-visual',
    '.services__header',
    '.contact-info',
    '.contact-form',
  ];

  const elements = document.querySelectorAll(selectors.join(','));

  // Viewport içinde görünür olanları hemen göster, dışındakileri scroll'da
  elements.forEach(function (el, i) {
    el.dataset.animated = '0';
    el.dataset.delay    = String(i * 0.05);
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.target.dataset.animated === '0') {
        var delay = parseFloat(entry.target.dataset.delay || 0);
        entry.target.style.transition = 'opacity .5s ease ' + delay + 's, transform .5s ease ' + delay + 's';
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        entry.target.dataset.animated = '1';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '200px 0px 0px 0px',  // Sayfanın üst kısmını erken tetikle
  });

  // Tüm elementleri doğrudan göster — animasyon sadece CSS hover/transition ile
  // (Headless ve JS-disabled ortamlarda içerik her zaman görünür olsun)
  elements.forEach(function (el) {
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';
    el.dataset.animated = '1';
    // Scroll ile ince bir fade efekti: IntersectionObserver sınıf eklesin
    observer.observe(el);
  });

})();

/**
 * Aymaksan Stitch — main.js
 * Sticky header + back-to-top
 */

(function () {
  'use strict';

  const headerWrap = document.getElementById('site-header-wrap');
  const backToTop  = document.getElementById('back-to-top');
  const bodyEl     = document.body;

  // ── Navbar gizle / göster (scroll yönüne göre) ───
  var scrollPrev    = window.scrollY;
  var navVisible    = true;
  var rafPending    = false;
  var COMPACT_AT    = 60;   // bu noktadan sonra topbar katlanır + header daralır
  var HIDE_DELTA    = 6;    // jitter önleyici eşik
  var HIDE_AFTER    = 240;  // bu noktadan önce asla gizleme

  function updateNav() {
    var scrollNow = window.scrollY;
    var delta     = scrollNow - scrollPrev;

    if (headerWrap) {
      // Daralma (topbar katlanır, header küçülür) + gövde boşluğu uyumu
      var compact = scrollNow > COMPACT_AT;
      headerWrap.classList.toggle('scrolled', compact);
      bodyEl.classList.toggle('nav-compact', compact);

      if (scrollNow < HIDE_AFTER) {
        // Üst bölgede — her zaman göster
        if (!navVisible) { navVisible = true; headerWrap.classList.remove('nav-hidden'); }
      } else if (delta > HIDE_DELTA && navVisible) {
        // Aşağı kaydırma — gizle
        navVisible = false; headerWrap.classList.add('nav-hidden');
      } else if (delta < -HIDE_DELTA && !navVisible) {
        // Yukarı kaydırma — anında göster
        navVisible = true; headerWrap.classList.remove('nav-hidden');
      }
    }

    if (backToTop) backToTop.classList.toggle('visible', scrollNow > 400);

    scrollPrev = scrollNow;
    rafPending = false;
  }

  window.addEventListener('scroll', function () {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateNav);
    }
  }, { passive: true });

  // ── Back to top ───────────────────────────────────
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Smooth scroll anchor'lar ──────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Desktop dropdown — JS ile yönetim (CSS hover yerine) ────────────────
  document.querySelectorAll('.primary-nav .nav-list > li.menu-item-has-children').forEach(function (li) {
    var timer;

    li.addEventListener('mouseenter', function () {
      clearTimeout(timer);
      // Diğer açık dropdown'ları kapat
      document.querySelectorAll('.primary-nav .nav-list > li.menu-item-has-children.is-open').forEach(function (other) {
        if (other !== li) other.classList.remove('is-open');
      });
      li.classList.add('is-open');
    });

    li.addEventListener('mouseleave', function () {
      timer = setTimeout(function () {
        li.classList.remove('is-open');
      }, 150); // 150 ms grace period
    });
  });

  // Sayfa başka yerine tıklayınca kapat
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.primary-nav')) {
      document.querySelectorAll('.primary-nav .nav-list > li.is-open').forEach(function (li) {
        li.classList.remove('is-open');
      });
    }
  });

  // ── FAQ Accordion ─────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item   = btn.closest('.faq-item');
      var answer = document.getElementById(btn.getAttribute('aria-controls'));
      var isOpen = item.classList.contains('is-open');

      // Diğerlerini kapat
      document.querySelectorAll('.faq-item.is-open').forEach(function (other) {
        other.classList.remove('is-open');
        var otherBtn = other.querySelector('.faq-question');
        var otherAns = document.getElementById(otherBtn.getAttribute('aria-controls'));
        otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAns) otherAns.hidden = true;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
      }
    });
  });

  // ── Gallery Slider ────────────────────────────────
  (function () {
    var track  = document.getElementById('gallery-track');
    if (!track) return;

    var slides   = track.querySelectorAll('.gallery-slide');
    var dots     = document.querySelectorAll('#gallery-dots .gallery-dot');
    var prevBtn  = document.getElementById('gallery-prev');
    var nextBtn  = document.getElementById('gallery-next');
    var total    = slides.length;
    var current  = 0;
    var autoTimer;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      // Preload high-res on active slide
      var img = slides[current].querySelector('.gallery-img');
      if (img && img.dataset.srcLg && !img.src.includes(img.dataset.srcLg)) {
        img.src = img.dataset.srcLg;
      }
    }

    function startAuto() {
      autoTimer = setInterval(function () { goTo(current + 1); }, 4500);
    }

    function stopAuto() { clearInterval(autoTimer); }

    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); goTo(current + 1); startAuto(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { stopAuto(); goTo(i); startAuto(); });
    });

    // Touch swipe
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    }, { passive: true });

    // Pause on hover
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    startAuto();
  })();

  // ── Progress Bars — scroll-triggered fill ─────────
  if ('IntersectionObserver' in window) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target;
          fill.style.width = fill.dataset.val + '%';
          barObserver.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.about-bar__fill').forEach(function (fill) {
      barObserver.observe(fill);
    });
  }

  // ── Lazy img observe ─────────────────────────────
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });

    lazyImgs.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity .4s';
      observer.observe(img);
    });
  }

})();

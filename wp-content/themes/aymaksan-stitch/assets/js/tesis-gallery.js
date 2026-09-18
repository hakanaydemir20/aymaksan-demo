/**
 * Aymaksan — Tesis Gallery (Stacked Card Deck)
 * Kartlar CSS data-pos attr ile konumlandırılır; JS sadece attr değiştirir.
 */
(function () {
  'use strict';

  function init() {
    var deck    = document.getElementById('tesis-deck');
    var prevBtn = document.getElementById('tg-prev');
    var nextBtn = document.getElementById('tg-next');
    var counter = document.getElementById('tg-current');
    var dotsWrap = document.getElementById('tg-dots');

    if (!deck) return;

    var cards = Array.from(deck.querySelectorAll('.tg-card'));
    var dots  = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.tg-dot')) : [];
    var total = cards.length;
    if (!total) return;

    var top = 0; // index of the card currently at the front
    var busy = false;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    /* Kartın transition'ını geçici olarak kapat, sonra aç */
    function instant(card, fn) {
      card.style.transition = 'none';
      void card.offsetHeight; // reflow zorunlu
      fn();
      card.style.transition = '';
    }

    function updateUI() {
      if (counter) counter.textContent = pad(top + 1);
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === top);
      });
    }

    /* Sonraki karta geç */
    function goNext() {
      if (busy) return;
      busy = true;

      var iTop = top;
      var iMid = (top + 1) % total;
      var iBot = (top + 2) % total;
      var iNew = (top + 3) % total; // gizliden gelecek kart

      /* 1. Üstteki kart sola fırlar */
      cards[iTop].setAttribute('data-pos', 'exit');

      /* 2. Ortadaki → Üst, Alttaki → Orta */
      cards[iMid].setAttribute('data-pos', 'top');
      cards[iBot].setAttribute('data-pos', 'mid');

      /* 3. Gizli kart anında "bot" konumuna taşınır, ardından görünür hale gelir */
      instant(cards[iNew], function () {
        cards[iNew].setAttribute('data-pos', 'hidden');
      });
      cards[iNew].setAttribute('data-pos', 'bot');

      top = iMid;
      updateUI();

      setTimeout(function () {
        /* Çıkan kartı sessizce gizle */
        instant(cards[iTop], function () {
          cards[iTop].setAttribute('data-pos', 'hidden');
        });
        busy = false;
      }, 560);
    }

    /* Önceki karta dön */
    function goPrev() {
      if (busy) return;
      busy = true;

      var iTop    = top;
      var iMid    = (top + 1) % total;
      var iBot    = (top + 2) % total;
      var iNewTop = (top - 1 + total) % total; // sol taraftan gelecek kart

      /* 1. Yeni kart anında "enter" konumuna (sol dışarı) taşınır */
      instant(cards[iNewTop], function () {
        cards[iNewTop].setAttribute('data-pos', 'enter');
      });
      /* 2. Transition başlar: sol dışarıdan "top" konumuna kayar */
      cards[iNewTop].setAttribute('data-pos', 'top');

      /* 3. Mevcut yığın bir adım aşağı kayar */
      cards[iTop].setAttribute('data-pos', 'mid');
      cards[iMid].setAttribute('data-pos', 'bot');

      /* 4. Alttaki kart gizlenir */
      setTimeout(function () {
        instant(cards[iBot], function () {
          cards[iBot].setAttribute('data-pos', 'hidden');
        });
      }, 560);

      top = iNewTop;
      updateUI();

      setTimeout(function () { busy = false; }, 560);
    }

    /* Belirli bir slayda doğrudan atla (nokta tıklama) */
    function jumpTo(target) {
      if (target === top || busy) return;
      busy = true;

      top = target;

      cards.forEach(function (card, i) {
        var offset = (i - top + total) % total;
        instant(card, function () {
          if      (offset === 0) card.setAttribute('data-pos', 'top');
          else if (offset === 1) card.setAttribute('data-pos', 'mid');
          else if (offset === 2) card.setAttribute('data-pos', 'bot');
          else                   card.setAttribute('data-pos', 'hidden');
        });
      });

      updateUI();
      busy = false;
    }

    /* Olaylar */
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { jumpTo(i); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    });

    /* Dokunmatik kaydırma */
    var touchX = 0;
    deck.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { if (dx < 0) goNext(); else goPrev(); }
    }, { passive: true });

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

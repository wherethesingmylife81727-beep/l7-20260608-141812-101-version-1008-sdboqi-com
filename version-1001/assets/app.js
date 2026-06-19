(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dot'));
      var current = 0;
      var showSlide = function (index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle('is-active', pos === current);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle('is-active', pos === current);
        });
      };
      dots.forEach(function (dot, pos) {
        dot.addEventListener('click', function () {
          showSlide(pos);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) return;
      var input = panel.querySelector('[data-filter-input]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var apply = function () {
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || '',
            card.dataset.region || '',
            card.dataset.type || '',
            card.dataset.tags || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !type || (card.dataset.type || '').indexOf(type) !== -1;
          var matchYear = !year || String(card.dataset.year || '') === year;
          card.classList.toggle('hidden-by-filter', !(matchQuery && matchType && matchYear));
        });
      };
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
      });
      apply();
    });
  });
}());

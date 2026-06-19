document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initFilters();
});

function initMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var header = document.querySelector('.site-header');
  if (!button || !header) {
    return;
  }
  button.addEventListener('click', function () {
    header.classList.toggle('mobile-menu-open');
  });
}

function initHero() {
  var slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
  var prev = slider.querySelector('[data-hero-prev]');
  var next = slider.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var scope = panel.closest('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-role="movie-card"]'));
    var textInput = panel.querySelector('[data-filter-text]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var emptyTip = scope.querySelector('[data-empty-tip]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var query = valueOf(textInput);
      var category = valueOf(categorySelect);
      var type = valueOf(typeSelect);
      var region = valueOf(regionSelect);
      var year = valueOf(yearSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.category,
          card.dataset.type,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();

        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (category && (card.dataset.category || '').toLowerCase() !== category) {
          matched = false;
        }
        if (type && (card.dataset.type || '').toLowerCase() !== type) {
          matched = false;
        }
        if (region && (card.dataset.region || '').toLowerCase().indexOf(region) === -1) {
          matched = false;
        }
        if (year && (card.dataset.year || '').toLowerCase() !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyTip) {
        emptyTip.style.display = visible ? 'none' : 'block';
      }
    }

    [textInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        [textInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (element) {
          if (element) {
            element.value = '';
          }
        });
        filterCards();
      });
    }

    filterCards();
  });
}

(function () {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(() => {
    setupMobileMenu();
    setupImageFallbacks();
    setupHeroCarousel();
    setupLocalFilters();
    setupRankingTableFilter();
    setupSiteSearch();
  });

  function setupMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('.poster-frame img').forEach((image) => {
      image.addEventListener('error', () => {
        const frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('image-missing');
        }
        image.remove();
      }, { once: true });
    });
  }

  function setupHeroCarousel() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        activate(index);
        start();
      });
    });

    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }

    activate(0);
    start();
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
      const searchInput = scope.querySelector('.local-search');
      const filters = Array.from(scope.querySelectorAll('.local-filter'));
      const cards = Array.from(scope.querySelectorAll('.movie-card'));
      const count = scope.querySelector('[data-visible-count]');

      const apply = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        let visible = 0;

        cards.forEach((card) => {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));

          const matchesQuery = !query || haystack.includes(query);
          const matchesFilters = filters.every((filter) => {
            const value = filter.value;
            const key = filter.dataset.filter;
            return !value || String(card.dataset[key] || '') === value;
          });

          const shouldShow = matchesQuery && matchesFilters;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      };

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }
      filters.forEach((filter) => filter.addEventListener('change', apply));
      apply();
    });
  }

  function setupRankingTableFilter() {
    document.querySelectorAll('[data-table-filter]').forEach((scope) => {
      const input = scope.querySelector('.table-search');
      const rows = Array.from(scope.querySelectorAll('tbody tr'));
      const count = scope.querySelector('[data-table-count]');

      if (!input) {
        return;
      }

      const apply = () => {
        const query = normalize(input.value);
        let visible = 0;

        rows.forEach((row) => {
          const haystack = normalize([
            row.dataset.title,
            row.dataset.region,
            row.dataset.type,
            row.dataset.year,
            row.dataset.genre,
            row.dataset.tags,
            row.textContent
          ].join(' '));
          const shouldShow = !query || haystack.includes(query);
          row.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      };

      input.addEventListener('input', apply);
      apply();
    });
  }

  function setupSiteSearch() {
    const root = document.querySelector('[data-site-search]');
    if (!root || !Array.isArray(window.MOVIE_INDEX)) {
      return;
    }

    const input = root.querySelector('#site-search-input');
    const regionSelect = root.querySelector('#site-region-filter');
    const typeSelect = root.querySelector('#site-type-filter');
    const yearSelect = root.querySelector('#site-year-filter');
    const button = root.querySelector('[data-search-button]');
    const results = root.querySelector('[data-search-results]');
    const count = root.querySelector('[data-search-count]');

    const regions = unique(window.MOVIE_INDEX.map((item) => item.region)).sort();
    const types = unique(window.MOVIE_INDEX.map((item) => item.type)).sort();
    const years = unique(window.MOVIE_INDEX.map((item) => item.year)).sort((a, b) => b - a);

    fillSelect(regionSelect, regions);
    fillSelect(typeSelect, types);
    fillSelect(yearSelect, years.slice(0, 40));

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    const render = () => {
      const query = normalize(input ? input.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      const filtered = window.MOVIE_INDEX.filter((item) => {
        const haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.description
        ].join(' '));
        return (!query || haystack.includes(query)) &&
          (!region || item.region === region) &&
          (!type || item.type === type) &&
          (!year || String(item.year) === String(year));
      }).slice(0, 120);

      if (count) {
        count.textContent = String(filtered.length);
      }

      if (results) {
        results.innerHTML = filtered.map(renderCard).join('');
        setupImageFallbacks();
      }
    };

    [input, regionSelect, typeSelect, yearSelect].forEach((element) => {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    if (button) {
      button.addEventListener('click', render);
    }

    render();
  }

  function renderCard(item) {
    const tags = item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<article class="movie-card compact" data-title="${escapeHtml(item.title)}" data-region="${escapeHtml(item.region)}" data-type="${escapeHtml(item.type)}" data-year="${escapeHtml(item.year)}" data-genre="${escapeHtml(item.genre)}" data-tags="${escapeHtml(item.tags.join(' '))}">
  <a class="poster-frame" href="${escapeHtml(item.url)}" data-initial="${escapeHtml(item.title.charAt(0))}">
    <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)} 海报" loading="lazy">
    <span class="rating-badge">${escapeHtml(item.rating)}</span>
  </a>
  <div class="movie-card-body">
    <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
    <p class="movie-desc">${escapeHtml(item.description)}</p>
    <div class="movie-meta">
      <span>${escapeHtml(item.region)}</span>
      <span>${escapeHtml(item.year)}</span>
      <span>${escapeHtml(item.type)}</span>
    </div>
    <div class="tag-list">${tags}</div>
  </div>
</article>`;
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();

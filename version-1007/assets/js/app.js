(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var carousel = document.getElementById("heroCarousel");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  var searchInput = document.getElementById("siteSearch");
  var yearFilter = document.getElementById("yearFilter");
  var categoryFilter = document.getElementById("categoryFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var category = normalize(categoryFilter ? categoryFilter.value : "");

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" "));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
      var matchCategory = !category || text.indexOf(category) !== -1;
      card.classList.toggle("is-hidden-by-filter", !(matchKeyword && matchYear && matchCategory));
    });
  }

  [searchInput, yearFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
})();

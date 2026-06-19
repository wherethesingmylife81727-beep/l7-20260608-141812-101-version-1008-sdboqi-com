(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function() {
        links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", links.classList.contains("is-open") ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    }

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        restartHero();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        restartHero();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = normalize(params.get("q"));
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));

    filterInputs.forEach(function(input) {
      if (queryValue && input.name === "q") {
        input.value = queryValue;
      }
      var targetSelector = input.getAttribute("data-target") || ".movie-list";
      var list = document.querySelector(targetSelector);
      var empty = document.querySelector(input.getAttribute("data-empty") || ".empty-state");
      var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-target='" + targetSelector + "']"));
      var activeFilter = "";

      function applyFilter() {
        if (!list) {
          return;
        }
        var query = normalize(input.value);
        var visible = 0;
        Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = !activeFilter || haystack.indexOf(activeFilter) !== -1;
          var visibleNow = matchesQuery && matchesFilter;
          card.classList.toggle("is-hidden", !visibleNow);
          if (visibleNow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      chips.forEach(function(chip) {
        chip.addEventListener("click", function() {
          var value = normalize(chip.getAttribute("data-filter"));
          if (activeFilter === value) {
            activeFilter = "";
            chip.classList.remove("is-active");
          } else {
            activeFilter = value;
            chips.forEach(function(item) {
              item.classList.remove("is-active");
            });
            chip.classList.add("is-active");
          }
          applyFilter();
        });
      });
      applyFilter();
    });
  });
})();

(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function filterCards(query) {
    var cards = selectAll(".movie-card");
    var value = normalize(query);

    if (!cards.length) {
      return false;
    }

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords"));
      card.classList.toggle("is-hidden-card", value.length > 0 && text.indexOf(value) === -1);
    });

    return true;
  }

  function initSearch() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var inputs = selectAll("[data-search-input]");
    var forms = selectAll("[data-search-form]");

    inputs.forEach(function (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }

      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });

    if (initialQuery) {
      filterCards(initialQuery);
    }

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("[data-search-input]");
        var query = input ? input.value.trim() : "";
        var handled = filterCards(query);

        if (handled) {
          event.preventDefault();
          return;
        }

        if (query) {
          event.preventDefault();
          window.location.href = form.getAttribute("action") + "?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-slide-to]", hero);
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  window.initializeMoviePlayer = function (videoUrl) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("movie-play-button");
    var shell = document.querySelector(".player-shell");
    var bound = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function bindVideo() {
      if (bound) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      bound = true;
    }

    function startPlayback() {
      bindVideo();

      if (button) {
        button.classList.add("is-hidden");
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }

        if (video.paused) {
          startPlayback();
        }
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && !video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initSearch();
    initHero();
  });
})();

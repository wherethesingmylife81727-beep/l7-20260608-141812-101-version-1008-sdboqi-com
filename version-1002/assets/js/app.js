(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = $("[data-nav-toggle]");
    var menu = $("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearch() {
    var grid = $("[data-search-grid]");
    if (!grid) {
      return;
    }
    var input = $("[data-search-input]");
    var region = $("[data-region-filter]");
    var type = $("[data-type-filter]");
    var year = $("[data-year-filter]");
    var empty = $("[data-empty-state]");
    var cards = $all("[data-movie-card]", grid);

    function valueOf(element) {
      return element ? element.value.trim() : "";
    }

    function apply() {
      var keyword = valueOf(input).toLowerCase();
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var show = matchesKeyword && matchesRegion && matchesType && matchesYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    $all("[data-player]").forEach(function (box) {
      var video = $("video", box);
      var overlay = $("[data-player-overlay]", box);
      var button = $("[data-player-start]", box);
      var message = $("[data-player-message]", box);
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hlsInstance = null;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("show");
        }
      }

      function attach() {
        if (!stream) {
          showMessage("暂时无法播放，请稍后再试");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              showMessage("暂时无法播放，请稍后再试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          showMessage("暂时无法播放，请稍后再试");
        }
      }

      function play() {
        if (overlay) {
          overlay.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && overlay) {
          overlay.classList.remove("hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      attach();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();

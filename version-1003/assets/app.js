(function () {
  var currentScript = document.currentScript;
  var assetBase = currentScript ? currentScript.src.replace(/[^/]+$/, "") : "./assets/";
  var hlsClassPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsClass() {
    if (!hlsClassPromise) {
      hlsClassPromise = import(assetBase + "hls-dru42stk.js")
        .then(function (module) {
          return module.H || module.default;
        })
        .catch(function () {
          return null;
        });
    }
    return hlsClassPromise;
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var currentIndex = 0;
    var timer = null;

    function show(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(currentIndex + 1);
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

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var searchInput = panel.querySelector("[data-search-input]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var categoryFilter = panel.querySelector("[data-category-filter]");
      var empty = section ? section.querySelector("[data-filter-empty]") : null;
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]")) : [];

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var keyword = normalize(searchInput && searchInput.value);
        var selectedYear = yearFilter ? yearFilter.value : "";
        var selectedCategory = categoryFilter ? categoryFilter.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var year = card.getAttribute("data-year") || "";
          var category = card.getAttribute("data-category") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || year === selectedYear;
          var matchCategory = !selectedCategory || category === selectedCategory;
          var visible = matchKeyword && matchYear && matchCategory;

          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [searchInput, yearFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && searchInput) {
        searchInput.value = query;
      }

      applyFilters();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var message = shell.querySelector("[data-video-message]");
      var source = shell.getAttribute("data-src");
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放器开始播放。");
          });
        }
      }

      function attachNative() {
        video.src = source;
        loaded = true;
        shell.classList.add("is-playing");
        playVideo();
      }

      function attachWithHls(HlsClass) {
        if (!HlsClass || !HlsClass.isSupported()) {
          setMessage("当前浏览器暂不支持该播放源，请更换浏览器或使用支持 HLS 的环境访问。");
          return;
        }

        hlsInstance = new HlsClass({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, function () {
          loaded = true;
          shell.classList.add("is-playing");
          setMessage("");
          playVideo();
        });
        hlsInstance.on(HlsClass.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
            setMessage("网络加载异常，正在尝试恢复播放。");
            hlsInstance.startLoad();
          } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
            setMessage("媒体解码异常，正在尝试恢复播放。");
            hlsInstance.recoverMediaError();
          } else {
            setMessage("播放源暂时无法加载，请稍后再试。");
            hlsInstance.destroy();
          }
        });
      }

      function start() {
        if (loaded) {
          shell.classList.add("is-playing");
          playVideo();
          return;
        }

        setMessage("正在加载播放源...");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          attachNative();
          return;
        }

        loadHlsClass().then(attachWithHls);
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var parent = image.parentElement;
        var fallback = parent ? parent.querySelector(".poster-fallback") : null;
        image.style.opacity = "0";
        if (fallback) {
          fallback.style.display = "flex";
        }
      }, { once: true });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
    initImageFallbacks();
  });
})();

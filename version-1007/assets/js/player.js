(function () {
  function setupPlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      load();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();

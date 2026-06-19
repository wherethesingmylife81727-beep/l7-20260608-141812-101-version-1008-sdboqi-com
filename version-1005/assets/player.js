(function() {
  window.setupMoviePlayer = function(playbackUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var trigger = shell.querySelector(".player-overlay");
    var message = document.querySelector(".player-message");
    var hlsInstance = null;
    var attached = false;

    function setMessage(visible) {
      if (message) {
        message.classList.toggle("is-visible", !!visible);
      }
    }

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
    }

    function play() {
      setMessage(false);
      attach();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          if (trigger) {
            trigger.classList.remove("is-hidden");
          }
          setMessage(true);
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("error", function() {
        setMessage(true);
      });
    }

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();

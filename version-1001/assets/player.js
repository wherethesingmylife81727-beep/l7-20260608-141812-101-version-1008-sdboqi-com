(function () {
  function setupPlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) return;

    var attached = false;
    var pendingPlay = false;
    var hls = null;

    function bindStream() {
      if (attached) return;
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay && video.paused) {
            video.play().catch(function () {});
          }
        });
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      pendingPlay = true;
      bindStream();
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      video.play().catch(function () {});
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.setupPlayer = setupPlayer;
}());

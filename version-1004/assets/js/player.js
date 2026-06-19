import { H as Hls } from './hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-hls]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var source = player.getAttribute('data-hls');
    var started = false;
    var hls = null;

    function startVideo() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        started = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
        } else if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else if (video.paused) {
        video.play().catch(function () {});
      }

      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          startVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
});

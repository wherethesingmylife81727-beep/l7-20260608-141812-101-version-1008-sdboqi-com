import { H as Hls } from './video-vendor-dru42stk.js';

export function setupVideoPlayer(videoUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    if (!video) {
        return;
    }

    var initialized = false;
    var hls = null;

    function attachSource() {
        if (initialized) {
            return Promise.resolve();
        }
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1200);
            });
        }

        video.src = videoUrl;
        return Promise.resolve();
    }

    function start() {
        attachSource().then(function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

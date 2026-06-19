import { H as Hls } from './hls-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

ready(() => {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});

function setupPlayer(container) {
  const video = container.querySelector('video');
  const button = container.querySelector('[data-play-button]');
  const status = container.querySelector('[data-player-status]');
  const source = container.dataset.src;
  let hls = null;
  let started = false;

  if (!video || !source) {
    updateStatus(status, '播放器缺少视频源。');
    return;
  }

  const startPlayback = async () => {
    if (!started) {
      started = true;
      updateStatus(status, '正在加载 HLS 播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          updateStatus(status, '播放源已加载，可开始观看。');
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            updateStatus(status, '播放加载失败，请刷新页面或稍后重试。');
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else {
        updateStatus(status, '当前浏览器不支持 HLS 播放。');
        return;
      }
    }

    container.classList.add('is-playing');
    video.controls = true;

    try {
      await video.play();
      updateStatus(status, '正在播放。');
    } catch (error) {
      container.classList.remove('is-playing');
      updateStatus(status, '浏览器阻止了自动播放，请再次点击播放按钮。');
    }
  };

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', () => {
    if (!started) {
      startPlayback();
    }
  });

  video.addEventListener('play', () => container.classList.add('is-playing'));
}

function updateStatus(status, message) {
  if (status) {
    status.textContent = message;
  }
}

(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var startButton = document.querySelector('[data-player-start]');
    var hlsInstance = null;
    var started = false;

    if (!video || !sourceUrl) {
      return;
    }

    function hideButton() {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (started) {
        hideButton();
        playVideo();
        return;
      }

      started = true;
      hideButton();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
        return;
      }

      video.src = sourceUrl;
      video.load();
      playVideo();
    }

    if (startButton) {
      startButton.addEventListener('click', attachSource);
    }

    video.addEventListener('click', function () {
      if (!started) {
        attachSource();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();

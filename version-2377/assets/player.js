function setupVideoPlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !button || !streamUrl) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function playVideo() {
    prepare();
    button.classList.add('hidden');
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });

  video.addEventListener('ended', function () {
    button.classList.remove('hidden');
  });
}

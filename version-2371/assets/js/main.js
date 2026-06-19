(function () {
  'use strict';

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var previous = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchAndSort() {
    var input = one('#pageSearch');
    var select = one('#sortSelect');
    var container = one('[data-sort-container]');
    var resultCount = one('[data-result-count]');

    if (!container) {
      return;
    }

    var items = all('[data-search-item]', container);

    function applyQuery() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      items.forEach(function (item) {
        var text = (item.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        item.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visible);
      }
    }

    function applySort() {
      if (!select) {
        return;
      }

      var mode = select.value;
      var sorted = items.slice().sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
      });

      sorted.forEach(function (item) {
        container.appendChild(item);
      });
      items = sorted;
      applyQuery();
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');
      if (queryValue) {
        input.value = queryValue;
      }
      input.addEventListener('input', applyQuery);
    }

    if (select) {
      select.addEventListener('change', applySort);
    }

    applySort();
    applyQuery();
  }

  function initPlayer() {
    var video = one('[data-hls-video]');
    var button = one('[data-play-button]');
    var message = one('[data-player-message]');

    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function startPlayback() {
      var source = video.getAttribute('data-src');
      button.classList.add('is-hidden');
      setMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setMessage('');
          }).catch(function () {
            setMessage('浏览器阻止了自动播放，请点击播放器上的播放按钮。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setMessage('播放源加载异常，请刷新页面或稍后重试。');
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().then(function () {
            setMessage('');
          }).catch(function () {
            setMessage('浏览器阻止了自动播放，请点击播放器上的播放按钮。');
          });
        }, { once: true });
        return;
      }

      video.src = source;
      video.play().then(function () {
        setMessage('');
      }).catch(function () {
        setMessage('当前浏览器可能不支持此 HLS 播放源，请更换浏览器或稍后重试。');
      });
    }

    button.addEventListener('click', startPlayback);
  }

  function initBackTop() {
    var button = one('[data-back-top]');
    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 600);
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initSearchAndSort();
    initPlayer();
    initBackTop();
  });
})();

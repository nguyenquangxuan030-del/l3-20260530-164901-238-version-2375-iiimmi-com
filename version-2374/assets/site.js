function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
    return;
  }
  document.addEventListener('DOMContentLoaded', callback);
}

function initMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function initHero() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
      restart();
    });
  });
  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  show(0);
  restart();
}

function initListSearch() {
  var searchBox = document.querySelector('[data-list-search]');
  var sortBox = document.querySelector('[data-sort]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty]');
  if (!cards.length) {
    return;
  }
  function apply() {
    var q = searchBox ? searchBox.value.trim().toLowerCase() : '';
    var visible = 0;
    cards.forEach(function (card) {
      var hay = (card.getAttribute('data-search') || '').toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }
  function sortCards() {
    if (!sortBox) {
      return;
    }
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var mode = sortBox.value;
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === 'title') {
        return (a.getAttribute('data-search') || '').localeCompare(b.getAttribute('data-search') || '', 'zh-Hans-CN');
      }
      return 0;
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }
  if (searchBox) {
    searchBox.addEventListener('input', apply);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchBox.value = query;
    }
  }
  if (sortBox) {
    sortBox.addEventListener('change', function () {
      sortCards();
      apply();
    });
  }
  apply();
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-src');
    var hlsReady = false;
    function bindSource() {
      if (hlsReady || !src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        hlsReady = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsReady = true;
        return;
      }
      video.src = src;
      hlsReady = true;
    }
    function play() {
      bindSource();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });
    bindSource();
  });
}

ready(function () {
  initMenu();
  initHero();
  initListSearch();
  initPlayers();
});

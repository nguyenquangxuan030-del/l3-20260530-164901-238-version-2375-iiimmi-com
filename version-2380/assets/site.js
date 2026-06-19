(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterReset = document.querySelector('[data-filter-reset]');
  var filterList = document.querySelector('[data-filter-list]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(filterYear && filterYear.value);
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || normalize(card.getAttribute('data-year')) === year;
      card.style.display = matchedKeyword && matchedYear ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }
  if (filterReset) {
    filterReset.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      if (filterYear) {
        filterYear.value = '';
      }
      applyFilter();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  function initVideo(video) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = src;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');

    function startPlayback() {
      initVideo(video);
      player.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('click', function () {
        initVideo(video);
      });
    }
  });

  var searchResults = document.getElementById('search-results');
  if (searchResults && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var keyword = normalize(params.get('q'));
    var source = window.MOVIE_INDEX;
    var results = keyword ? source.filter(function (movie) {
      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.genre,
        movie.tags,
        movie.category
      ].join(' ')).indexOf(keyword) !== -1;
    }) : source.slice(0, 80);

    searchResults.innerHTML = results.slice(0, 240).map(function (movie) {
      return '<a class="movie-card" href="' + movie.url + '">' +
        '<span class="poster-wrap">' +
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
        '<span class="poster-gradient"></span>' +
        '<span class="pill top-left">' + movie.category + '</span>' +
        '<span class="pill top-right">' + movie.duration + '</span>' +
        '</span>' +
        '<span class="card-body">' +
        '<strong>' + movie.title + '</strong>' +
        '<span class="card-desc">' + movie.desc + '</span>' +
        '<span class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>★ ' + movie.rating + '</span></span>' +
        '</span>' +
        '</a>';
    }).join('');

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
    }
  }
})();

(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      mobilePanel.setAttribute('aria-hidden', mobilePanel.classList.contains('open') ? 'false' : 'true');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5500);
  }

  Array.prototype.slice.call(document.querySelectorAll('.inline-filter')).forEach(function (input) {
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      Array.prototype.slice.call(list.children).forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.indexOf(query) === -1 ? 'none' : '';
      });
    });
  });

  function startPlayer(video) {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-stream') || (video.querySelector('source') && video.querySelector('source').src);
    var shell = video.closest('.video-shell');
    var Engine = window.StreamEngine;

    if (source && Engine && Engine.isSupported && Engine.isSupported()) {
      if (!video.mediaEngine) {
        video.mediaEngine = new Engine({
          enableWorker: true,
          lowLatencyMode: true
        });
        video.mediaEngine.loadSource(source);
        video.mediaEngine.attachMedia(video);
      }
    } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
    } else if (source && !video.getAttribute('src')) {
      video.setAttribute('src', source);
    }

    video.play().then(function () {
      if (shell) {
        shell.classList.add('playing');
      }
    }).catch(function () {
      if (shell) {
        shell.classList.remove('playing');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-play-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var shell = button.closest('.video-shell');
      startPlayer(shell ? shell.querySelector('video') : null);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.movie-video')).forEach(function (video) {
    video.addEventListener('play', function () {
      var shell = video.closest('.video-shell');
      if (shell) {
        shell.classList.add('playing');
      }
    });

    video.addEventListener('pause', function () {
      var shell = video.closest('.video-shell');
      if (shell) {
        shell.classList.remove('playing');
      }
    });
  });

  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');

  if (searchResults && window.catalogItems) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var formInput = document.querySelector('.search-page-form input[name="q"]');

    if (formInput) {
      formInput.value = q;
    }

    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.catalogItems.filter(function (item) {
      if (!terms.length) {
        return true;
      }

      var haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = q ? '搜索 “' + q + '” 的结果' : '输入关键词后可按影片、年份、地区和题材检索';
    }

    searchResults.innerHTML = results.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '">',
        '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="card-pill">' + escapeHtml(item.category) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }
})();

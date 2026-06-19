(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initLocalFilter() {
    var forms = selectAll('[data-local-filter]');
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-keyword]');
      var year = form.querySelector('[data-filter-year]');
      var list = document.querySelector('[data-filter-list]');

      if (!list) {
        return;
      }

      var cards = selectAll('.movie-card', list);

      function apply() {
        var keyword = (input && input.value || '').trim().toLowerCase();
        var selectedYear = year && year.value || '';

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var yearMatched = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden-card', !(yearMatched && keywordMatched));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      if (year) {
        year.addEventListener('change', apply);
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function resultCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-chip">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var hint = document.querySelector('[data-search-hint]');

    if (!form || !input || !results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var matched = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return item.featured;
        }

        return [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.desc,
          item.category
        ].join(' ').toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 80);

      results.innerHTML = matched.map(resultCard).join('');
      hint.textContent = keyword ? '已显示相关影片' : '推荐片单';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();

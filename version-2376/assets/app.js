(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-menu]");
    var search = document.querySelector(".header-search");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function reset() {
      window.clearInterval(timer);
      start();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        reset();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var empty = section.querySelector("[data-filter-empty]");
      fillSelect(regionSelect, unique(cards.map(function (card) { return card.dataset.region; })));
      fillSelect(typeSelect, unique(cards.map(function (card) { return card.dataset.type; })));
      function apply() {
        var q = (input && input.value || "").trim().toLowerCase();
        var region = regionSelect && regionSelect.value;
        var type = typeSelect && typeSelect.value;
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.dataset.tags || "").toLowerCase();
          var ok = (!q || haystack.indexOf(q) !== -1) && (!region || card.dataset.region === region) && (!type || card.dataset.type === type);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [input, regionSelect, typeSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initSearch() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.MOVIES_INDEX) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var count = document.querySelector("[data-search-count]");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }
    render(q);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    function render(query) {
      var keyword = (query || "").trim().toLowerCase();
      var list = window.MOVIES_INDEX.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 240);
      results.innerHTML = list.map(renderCard).join("");
      if (title) {
        title.textContent = keyword ? "“" + query.trim() + "” 的搜索结果" : "全部影片检索";
      }
      if (count) {
        count.textContent = "共显示 " + list.length + " 部影片";
      }
      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char];
    });
  }

  function renderCard(movie) {
    return "<article class=\"movie-card\" data-movie-card>" +
      "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-chip\">播放</span></a>" +
      "<div class=\"card-body\"><div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" +
      movie.tags.slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") +
      "</div></div></article>";
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var trigger = document.querySelector("[data-play-trigger]");
      var src = box.dataset.src;
      var hlsInstance = null;
      var loaded = false;
      function loadAndPlay() {
        if (!video || !src) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
          } else {
            video.src = src;
          }
          loaded = true;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
      if (trigger) {
        trigger.addEventListener("click", loadAndPlay);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();

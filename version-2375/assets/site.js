(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  const menuButton = qs(".mobile-menu-button");
  const mobilePanel = qs(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  const slides = qsa(".hero-slide");
  const dots = qsa(".hero-dot");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function scheduleSlides() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  qsa(".hero-next").forEach(function (button) {
    button.addEventListener("click", function () {
      showSlide(current + 1);
      scheduleSlides();
    });
  });

  qsa(".hero-prev").forEach(function (button) {
    button.addEventListener("click", function () {
      showSlide(current - 1);
      scheduleSlides();
    });
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide") || 0));
      scheduleSlides();
    });
  });

  scheduleSlides();

  function applyFilter(value, scope) {
    const query = String(value || "").trim().toLowerCase();
    const cards = qsa("[data-search]", scope || document);
    let visible = 0;
    cards.forEach(function (card) {
      const text = card.getAttribute("data-search") || "";
      const matched = !query || text.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    const empty = qs(".empty-state", scope || document);
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  qsa(".movie-filter-input").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input.value, document);
    });
  });

  if (document.body.getAttribute("data-page") === "search") {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const searchInput = qs("#searchPageInput");
    if (searchInput) {
      searchInput.value = query;
    }
    applyFilter(query, document);
  }
}());

(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const next = document.querySelector('[data-hero-next]');
  const prev = document.querySelector('[data-hero-prev]');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  const input = document.querySelector('[data-filter-input]');
  const year = document.querySelector('[data-year-filter]');
  const cards = Array.from(document.querySelectorAll('.filter-card'));
  const empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    const keyword = normalize(input ? input.value : '');
    const yearValue = year ? year.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      const cardYear = card.getAttribute('data-year') || '';
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1 || cardYear.indexOf(keyword) !== -1;
      const matchYear = !yearValue || cardYear === yearValue;
      const visible = matchKeyword && matchYear;

      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visibleCount === 0);
    }
  }

  if (input || year) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    filterCards();

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (year) {
      year.addEventListener('change', filterCards);
    }
  }
})();

(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function textOf(node) {
        return (node || "").toString().toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
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
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                var value = textOf(input.value);
                var scope = input.closest("[data-search-scope]") || document.querySelector("[data-search-scope]") || document;
                var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .category-card"));
                var empty = scope.querySelector("[data-empty-state]");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textOf([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" "));
                    var matched = !value || haystack.indexOf(value) !== -1;
                    card.classList.toggle("is-search-hidden", !matched);
                    if (matched && !card.classList.contains("is-filtered-out")) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            });
        });
    }

    function initFilters() {
        var rows = Array.prototype.slice.call(document.querySelectorAll(".filter-row"));
        rows.forEach(function (row) {
            var chips = Array.prototype.slice.call(row.querySelectorAll("[data-filter]"));
            var scope = row.closest("[data-search-scope]") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    var value = textOf(chip.getAttribute("data-filter"));
                    var visible = 0;
                    cards.forEach(function (card) {
                        var haystack = textOf([
                            card.getAttribute("data-title"),
                            card.getAttribute("data-region"),
                            card.getAttribute("data-genre"),
                            card.getAttribute("data-year"),
                            card.getAttribute("data-category"),
                            card.textContent
                        ].join(" "));
                        var matched = value === "全部" || !value || haystack.indexOf(value) !== -1;
                        card.classList.toggle("is-filtered-out", !matched);
                        if (matched && !card.classList.contains("is-search-hidden")) {
                            visible += 1;
                        }
                    });
                    if (empty) {
                        empty.classList.toggle("is-visible", visible === 0);
                    }
                });
            });
            if (chips[0]) {
                chips[0].classList.add("is-active");
            }
        });
    }

    window.initStaticPlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(buttonId);
        var pendingPlay = false;
        if (!video || !streamUrl) {
            return;
        }

        function startVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            video.setAttribute("data-ready", "1");
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 28,
                    backBufferLength: 20
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        startVideo();
                    }
                });
                video.hlsInstance = hls;
            } else {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", function () {
                    if (pendingPlay) {
                        startVideo();
                    }
                }, { once: true });
            }
        }

        function play() {
            pendingPlay = true;
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            startVideo();
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initFilters();
    });
})();

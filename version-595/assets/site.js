(function () {
    function $(selector, context) {
        return (context || document).querySelector(selector);
    }

    function $all(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileMenu() {
        var button = $(".mobile-menu-button");
        var panel = $(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function initSearchForms() {
        $all(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initHeroCarousel() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        var timer;

        function setActive(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === activeIndex);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                setActive(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                setActive(i);
                start();
            });
        });

        start();
    }

    function initGridFilters() {
        var filter = $("[data-grid-filter]");
        var grid = $("[data-filter-grid]");
        if (!filter || !grid) {
            return;
        }
        var textInput = $("[data-filter-text]", filter);
        var regionSelect = $("[data-filter-region]", filter);
        var typeSelect = $("[data-filter-type]", filter);
        var yearSelect = $("[data-filter-year]", filter);
        var cards = $all("[data-movie-card]", grid);
        var empty = $("[data-empty-state]");

        function apply() {
            var text = normalize(textInput && textInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute("data-search"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var ok = true;

                if (text && search.indexOf(text) === -1) {
                    ok = false;
                }
                if (region && cardRegion !== region) {
                    ok = false;
                }
                if (type && cardType !== type) {
                    ok = false;
                }
                if (year && cardYear !== year) {
                    ok = false;
                }

                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<div class=\"movie-poster\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"badge\">" + escapeHtml(movie.region) + "</span>" +
            "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>" +
            "</div>" +
            "<div class=\"movie-card-body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.views) + "观看</span></div>" +
            "</div>" +
            "</a>";
    }

    function initSearchPage() {
        var root = $("[data-search-results]");
        if (!root || !window.SEARCH_MOVIES) {
            return;
        }
        var input = $("[data-search-page-input]");
        var empty = $("[data-search-empty]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function run(value) {
            var words = normalize(value).split(/\s+/).filter(Boolean);
            if (words.length === 0) {
                root.innerHTML = "";
                if (empty) {
                    empty.textContent = "输入关键词开始搜索";
                    empty.classList.add("is-visible");
                }
                return;
            }
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" "));
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            root.innerHTML = results.map(renderSearchCard).join("");
            if (empty) {
                empty.textContent = results.length ? "" : "没有找到匹配影片";
                empty.classList.toggle("is-visible", results.length === 0);
            }
        }

        run(query);
    }

    window.initPlayer = function (config) {
        var video = $(config.videoSelector);
        var cover = $(config.coverSelector);
        var button = $(config.buttonSelector);
        var message = $(config.messageSelector);
        var source = config.source;
        var hlsReady = false;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (hlsReady) {
                return;
            }
            hlsReady = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (message) {
                        message.textContent = "点击画面继续播放";
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("error", function () {
            if (message) {
                message.textContent = "暂时无法播放，请稍后重试";
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initSearchForms();
        initHeroCarousel();
        initGridFilters();
        initSearchPage();
    });
})();

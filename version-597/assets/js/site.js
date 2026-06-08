(function () {
    var heroIndex = 0;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initializeMobileMenu() {
        var toggle = qs('[data-mobile-menu-toggle]');
        var menu = qs('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.hidden = !menu.hidden;
        });
    }

    function setHeroSlide(index) {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('active', current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('active', current === heroIndex);
        });
    }

    function initializeHero() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var prev = qs('[data-hero-prev]', carousel);
        var next = qs('[data-hero-next]', carousel);
        qsa('[data-hero-dot]', carousel).forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHeroSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                setHeroSlide(heroIndex - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setHeroSlide(heroIndex + 1);
            });
        }
        window.setInterval(function () {
            setHeroSlide(heroIndex + 1);
        }, 5200);
    }

    function renderGlobalResults(panel, results) {
        if (!results.length) {
            panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
            panel.hidden = false;
            return;
        }
        panel.innerHTML = results.slice(0, 12).map(function (movie) {
            return [
                '<a class="search-result" href="./' + movie.href + '">',
                '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
                '    <span>',
                '        <strong>' + movie.title + '</strong>',
                '        <span>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span>',
                '    </span>',
                '</a>'
            ].join('');
        }).join('');
        panel.hidden = false;
    }

    function initializeGlobalSearch() {
        var form = qs('[data-global-search-form]');
        var input = qs('[data-global-search-input]');
        var panel = qs('[data-global-search-panel]');
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!form || !input || !panel || !index.length) {
            return;
        }
        function search() {
            var term = normalize(input.value);
            if (!term) {
                panel.hidden = true;
                panel.innerHTML = '';
                return [];
            }
            var results = index.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(term) !== -1;
            });
            renderGlobalResults(panel, results);
            return results;
        }
        input.addEventListener('input', search);
        input.addEventListener('focus', function () {
            if (input.value.trim()) {
                search();
            }
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var results = search();
            if (results.length) {
                window.location.href = './' + results[0].href;
            }
        });
        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                panel.hidden = true;
            }
        });
    }

    function initializeLocalFilters() {
        qsa('[data-local-filter]').forEach(function (panel) {
            var searchInput = qs('[data-local-search]', panel);
            var regionSelect = qs('[data-local-region]', panel);
            var typeSelect = qs('[data-local-type]', panel);
            var reset = qs('[data-filter-reset]', panel);
            var count = qs('[data-filter-count]', panel);
            var cards = qsa('[data-movie-card]');
            function apply() {
                var term = normalize(searchInput && searchInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var matchedTerm = !term || text.indexOf(term) !== -1;
                    var matchedRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                    var matchedType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                    var show = matchedTerm && matchedRegion && matchedType;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部';
                }
            }
            if (searchInput) {
                searchInput.addEventListener('input', apply);
            }
            if (regionSelect) {
                regionSelect.addEventListener('change', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
            if (reset) {
                reset.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function playVideo(video, overlay) {
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        if (overlay) {
            overlay.classList.add('hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== source) {
                video.src = source;
            }
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._hlsInstance = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
            }
            video.play().catch(function () {});
            return;
        }
        if (video.src !== source) {
            video.src = source;
        }
        video.play().catch(function () {});
    }

    function initializePlayers() {
        qsa('[data-player-box]').forEach(function (box) {
            var video = qs('video[data-src]', box);
            var overlay = qs('[data-play-button]', box);
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.addEventListener('click', function () {
                    playVideo(video, overlay);
                });
            }
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initializeMobileMenu();
        initializeHero();
        initializeGlobalSearch();
        initializeLocalFilters();
        initializePlayers();
    });
})();

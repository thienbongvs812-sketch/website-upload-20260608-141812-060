(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-hero-target')) || 0;
                show(index);
            });
        });
        window.setInterval(function() {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function initPageFilters() {
        var input = document.querySelector('.page-filter');
        var year = document.querySelector('.year-filter');
        var type = document.querySelector('.type-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-card'));
        if (!cards.length || (!input && !year && !type)) {
            return;
        }
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var matchText = !q || haystack.indexOf(q) !== -1;
                var matchYear = !y || card.getAttribute('data-year') === y;
                var matchType = !t || (card.getAttribute('data-type') || '').indexOf(t) !== -1;
                card.classList.toggle('is-hidden-card', !(matchText && matchYear && matchType));
            });
        }
        [input, year, type].forEach(function(el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    function cardTemplate(movie) {
        var tags = movie.tags.slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
                '<a class="card-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<div class="poster-wrap">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="poster-time">' + escapeHtml(movie.duration) + '</span>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<h3>' + escapeHtml(movie.title) + '</h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="card-tags">' + tags + '</div>' +
                        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var input = document.getElementById('searchInput');
        var results = document.getElementById('searchResults');
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render() {
            var query = input.value.trim().toLowerCase();
            var source = window.SEARCH_MOVIES;
            var matched = source.filter(function(movie) {
                if (!query) {
                    return true;
                }
                return movie.searchText.indexOf(query) !== -1;
            }).slice(0, 96);
            if (!matched.length) {
                results.innerHTML = '<div class="search-empty">没有找到匹配内容，可更换关键词继续搜索。</div>';
                return;
            }
            results.innerHTML = matched.map(cardTemplate).join('');
        }
        input.addEventListener('input', render);
        render();
    }

    window.setupHlsPlayer = function(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var source = options.source;
        if (!video || !overlay || !source) {
            return;
        }
        var initialized = false;
        var hlsInstance = null;
        function attach() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = source;
        }
        function start() {
            attach();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {});
            }
        }
        overlay.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function() {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function() {
        initMenu();
        initHero();
        initPageFilters();
        initSearchPage();
    });
})();

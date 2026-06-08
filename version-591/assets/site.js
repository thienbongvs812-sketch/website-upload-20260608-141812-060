(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupPageFilters() {
        document.querySelectorAll('[data-list-root]').forEach(function (root) {
            var input = root.querySelector('[data-page-filter]');
            var sort = root.querySelector('[data-page-sort]');
            var list = root.querySelector('[data-card-list]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);

            function normalize(value) {
                return String(value || '').toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year'));
                    card.classList.toggle('is-hidden-card', keyword && content.indexOf(keyword) === -1);
                });
                if (sort) {
                    var value = sort.value;
                    var sorted = cards.slice().sort(function (a, b) {
                        if (value === 'views') {
                            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                        }
                        if (value === 'likes') {
                            return Number(b.getAttribute('data-likes')) - Number(a.getAttribute('data-likes'));
                        }
                        if (value === 'year') {
                            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                        }
                        return cards.indexOf(a) - cards.indexOf(b);
                    });
                    sorted.forEach(function (card) {
                        list.appendChild(card);
                    });
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (sort) {
                sort.addEventListener('change', apply);
            }
        });
    }

    function setupSearchPage() {
        var results = document.getElementById('globalResults');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        });
        document.querySelector('.search-page').classList.add('has-results');
        results.innerHTML = matched.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a href="' + movie.url + '" class="poster-link">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="card-badge">' + escapeHtml(movie.channel) + '</span>',
                '    </a>',
                '    <div class="card-body">',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
        if (!matched.length) {
            results.innerHTML = '<div class="detail-card"><h2>未找到匹配结果</h2><p>可以更换关键词再次搜索。</p></div>';
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('.player-video');
            var overlay = player.querySelector('.player-overlay');
            if (!video || !overlay) {
                return;
            }
            var source = video.getAttribute('data-video-url');
            var attached = false;
            var hls = null;

            function requestPlay() {
                overlay.classList.add('is-hidden');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            function attachAndPlay() {
                if (!source) {
                    return;
                }
                if (attached) {
                    requestPlay();
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', requestPlay, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
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
                        }
                    });
                    return;
                }
                video.src = source;
                video.addEventListener('loadedmetadata', requestPlay, { once: true });
                video.load();
            }

            overlay.addEventListener('click', attachAndPlay);
            video.addEventListener('click', function () {
                if (video.paused) {
                    attachAndPlay();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    overlay.classList.remove('is-hidden');
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupPageFilters();
        setupSearchPage();
        setupPlayers();
    });
})();

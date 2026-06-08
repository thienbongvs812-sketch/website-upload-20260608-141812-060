(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var toggle = qs('.mobile-toggle');
        var nav = qs('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupBackToTop() {
        var button = qs('.back-to-top');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-slide-dot]', hero);
        var next = qs('[data-slide-next]', hero);
        var prev = qs('[data-slide-prev]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = qs('[data-filter-panel]');
        var grid = qs('[data-card-grid]');
        if (!panel || !grid) {
            return;
        }
        var search = qs('[data-filter-search]', panel);
        var type = qs('[data-filter-type]', panel);
        var year = qs('[data-filter-year]', panel);
        var sort = qs('[data-filter-sort]', panel);
        var empty = qs('[data-empty-state]');
        var cards = qsa('[data-card]', grid);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || params.get('search') || '';
        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applySort(visibleCards) {
            var mode = sort ? sort.value : 'default';
            var ordered = cards.slice();
            if (mode === 'year') {
                ordered.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            } else if (mode === 'views') {
                ordered.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            } else if (mode === 'rating') {
                ordered.sort(function (a, b) {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                });
            }
            ordered.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function filter() {
            var query = normalize(search && search.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.dataset.title);
                var okQuery = !query || text.indexOf(query) !== -1;
                var okType = !typeValue || normalize(card.dataset.type) === typeValue;
                var okYear = !yearValue || normalize(card.dataset.year) === yearValue;
                var show = okQuery && okType && okYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            applySort();
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [search, type, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
        filter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupBackToTop();
        setupHero();
        setupFilters();
    });
}());

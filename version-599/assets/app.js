(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        start();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = "./movies.html";
                }
            });
        });
    }

    function setupFiltering() {
        var searchInput = document.querySelector("[data-live-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector("[data-empty-state]");
        var clearButton = document.querySelector("[data-clear-search]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        if (!searchInput || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var activeFilter = "";
        searchInput.value = initialQuery;

        function textFor(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = searchInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = textFor(card);
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                var show = matchedQuery && matchedFilter;
                card.classList.toggle("is-filtered-out", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        searchInput.addEventListener("input", apply);
        if (clearButton) {
            clearButton.addEventListener("click", function () {
                searchInput.value = "";
                activeFilter = "";
                filterButtons.forEach(function (button) {
                    button.classList.remove("is-active");
                });
                apply();
            });
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter-value") || "";
                if (activeFilter === value) {
                    activeFilter = "";
                    button.classList.remove("is-active");
                } else {
                    activeFilter = value;
                    filterButtons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                }
                apply();
            });
        });
        apply();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearchForms();
        setupFiltering();
    });
}());

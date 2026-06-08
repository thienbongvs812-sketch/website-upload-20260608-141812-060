(function () {
    var body = document.body;
    var base = body ? body.getAttribute("data-base") || "" : "";
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            var isOpen = navLinks.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var drawer = document.querySelector("[data-search-drawer]");
    var openButtons = document.querySelectorAll("[data-search-open]");
    var closeButtons = document.querySelectorAll("[data-search-close]");
    var globalInput = document.querySelector("[data-global-search]");
    var globalResults = document.querySelector("[data-global-results]");

    function openSearch() {
        if (!drawer) {
            return;
        }
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        setTimeout(function () {
            if (globalInput) {
                globalInput.focus();
            }
        }, 30);
    }

    function closeSearch() {
        if (!drawer) {
            return;
        }
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
    }

    openButtons.forEach(function (button) {
        button.addEventListener("click", openSearch);
    });

    closeButtons.forEach(function (button) {
        button.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSearch();
        }
    });

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function renderGlobalResults(keyword) {
        if (!globalResults) {
            return;
        }
        var query = normalize(keyword);
        globalResults.innerHTML = "";
        if (!query) {
            return;
        }
        var index = window.MOVIE_SEARCH_INDEX || [];
        var results = index.filter(function (item) {
            return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.category + " " + item.genre).indexOf(query) !== -1;
        }).slice(0, 12);

        results.forEach(function (item) {
            var link = document.createElement("a");
            link.className = "search-result-item";
            link.href = base + item.url;

            var img = document.createElement("img");
            img.src = base + item.cover;
            img.alt = item.title;
            img.loading = "lazy";

            var copy = document.createElement("span");
            var title = document.createElement("strong");
            title.textContent = item.title;
            var meta = document.createElement("span");
            meta.textContent = item.region + " · " + item.year + " · " + item.type + " · " + item.category;
            copy.appendChild(title);
            copy.appendChild(meta);

            link.appendChild(img);
            link.appendChild(copy);
            globalResults.appendChild(link);
        });
    }

    if (globalInput) {
        globalInput.addEventListener("input", function () {
            renderGlobalResults(globalInput.value);
        });
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-card-search]");
        var typeFilter = scope.querySelector("[data-type-filter]");
        var yearFilter = scope.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var typeMatch = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
                var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !(typeMatch && yearMatch && keywordMatch));
            });
        }

        [input, typeFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });
    });
})();

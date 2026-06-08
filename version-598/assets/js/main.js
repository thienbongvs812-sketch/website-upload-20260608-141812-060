(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function startHero() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });

      showSlide(0);
      startHero();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
      var searchInput = root.querySelector("[data-filter-search]");
      var yearSelect = root.querySelector("[data-filter-year]");
      var typeSelect = root.querySelector("[data-filter-type]");
      var regionSelect = root.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var empty = root.querySelector("[data-filter-empty]");

      function normal(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var query = normal(searchInput && searchInput.value);
        var year = normal(yearSelect && yearSelect.value);
        var type = normal(typeSelect && typeSelect.value);
        var region = normal(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normal(card.getAttribute("data-search"));
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (year && normal(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (type && normal(card.getAttribute("data-type")) !== type) {
            ok = false;
          }
          if (region && normal(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();

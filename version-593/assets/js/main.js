
(function () {
  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-no-results]');
    if (!list || (!input && !yearSelect)) {
      return;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  function setupPlayers() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var shell = trigger.closest('.video-shell');
        var video = shell ? shell.querySelector('video') : null;
        if (!video) {
          return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }

        trigger.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupLocalFilter();
    setupPlayers();
  });
})();

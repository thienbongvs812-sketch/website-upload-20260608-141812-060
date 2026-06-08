
(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');

  if (!input || !results || !summary) {
    return;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="play-chip">立即观看</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '    <div class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>',
      '    <p>' + escapeHtml(item.oneLine || '') + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function search(data, query) {
    if (!query) {
      summary.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }

    var lower = query.toLowerCase();
    var matched = data.filter(function (item) {
      var haystack = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(lower) !== -1;
    }).slice(0, 200);

    summary.textContent = '关键词“' + query + '”找到 ' + matched.length + ' 条结果，最多展示 200 条。';
    results.innerHTML = matched.map(renderCard).join('\n');
  }

  fetch('data/search-index.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var initialQuery = getQuery();
      input.value = initialQuery;
      search(data, initialQuery);
      input.addEventListener('input', function () {
        search(data, input.value.trim());
      });
    })
    .catch(function () {
      summary.textContent = '搜索数据读取失败，请通过分类页继续浏览。';
    });
})();

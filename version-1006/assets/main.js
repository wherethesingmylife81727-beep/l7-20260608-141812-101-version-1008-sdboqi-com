(function () {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var opened = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var resultBox = document.getElementById('search-results');
    if (!resultBox || !window.SEARCH_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('search-input');
    var count = document.getElementById('result-count');
    var empty = document.getElementById('search-empty');
    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<a class="movie-card" href="' + escapeHtml(item.href) + '">' +
                '<div class="card-cover">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="year-pill">' + escapeHtml(item.year) + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<span class="category-pill">' + escapeHtml(item.category) + '</span>' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<div class="card-tags">' + tags + '</div>' +
                '</div>' +
            '</a>';
    }

    if (!query) {
        if (empty) {
            empty.style.display = 'block';
        }
        if (count) {
            count.textContent = '';
        }
        return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SEARCH_INDEX.filter(function (item) {
        var hay = item.search;
        return words.every(function (word) {
            return hay.indexOf(word) !== -1;
        });
    }).slice(0, 120);

    if (empty) {
        empty.style.display = results.length ? 'none' : 'block';
        if (!results.length) {
            empty.innerHTML = '<h2>未找到相关影视作品</h2><p>可以尝试更短的片名、地区、类型或标签关键词。</p>';
        }
    }
    if (count) {
        count.textContent = results.length ? '找到 ' + results.length + ' 条相关结果' : '';
    }
    resultBox.innerHTML = results.map(card).join('');
})();

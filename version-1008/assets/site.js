(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function initFilters() {
        var search = document.querySelector('[data-filter-search]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length || (!search && !selects.length)) {
            return;
        }
        function valueFor(name) {
            var field = document.querySelector('[data-filter-select="' + name + '"]');
            return field ? field.value.trim() : '';
        }
        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var type = valueFor('type');
            var region = valueFor('region');
            var year = valueFor('year');
            var category = valueFor('category');
            var shown = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-category') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && (card.getAttribute('data-type') || '') !== type) {
                    matched = false;
                }
                if (region && (card.getAttribute('data-region') || '').indexOf(region) === -1) {
                    matched = false;
                }
                if (year && (card.getAttribute('data-year') || '') !== year) {
                    matched = false;
                }
                if (category && (card.getAttribute('data-category') || '') !== category) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }
        if (search) {
            search.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    }

    function initBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initPlayer() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        boxes.forEach(function (box) {
            var video = box.querySelector('video');
            var overlay = box.querySelector('[data-play-button]');
            var stream = box.getAttribute('data-stream');
            var loaded = false;
            var hls = null;
            if (!video || !overlay || !stream) {
                return;
            }
            function begin() {
                overlay.classList.add('is-hidden');
                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                        video.addEventListener('loadedmetadata', function () {
                            video.play().catch(function () {});
                        }, { once: true });
                    } else {
                        video.src = stream;
                        video.play().catch(function () {});
                    }
                    loaded = true;
                    return;
                }
                video.play().catch(function () {});
            }
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                begin();
            });
            video.addEventListener('click', function () {
                if (!loaded) {
                    begin();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initBackTop();
        initPlayer();
    });
}());

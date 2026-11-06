/* HanShu 汉书 · Product Page — 交互与动效
   纯原生 JS，无依赖。所有功能都有无 JS 回退（内容默认可见，中英切换默认中文）。 */
(function () {
  'use strict';

  /* ---------- 1. 中英切换 ---------- */
  var root = document.documentElement;
  var langButtons = document.querySelectorAll('[data-set-lang]');
  var STORAGE_KEY = 'hanshu-lang';

  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') lang = 'zh';
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    langButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang));
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* 隐私模式下忽略 */ }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  if (!saved) {
    // 首次访问按浏览器语言判断：中文环境默认中文，其余默认英文
    var nav = (navigator.language || 'zh').toLowerCase();
    saved = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }
  setLang(saved);

  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });

  /* ---------- 2. 移动端菜单 ---------- */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 3. 顶栏滚动状态 ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 4. 滚动渐入 ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. 示例面板 Tab ---------- */
  document.querySelectorAll('.tabs').forEach(function (tablist) {
    var tabs = tablist.querySelectorAll('[role="tab"]');
    var group = tabs.length ? tabs[0].getAttribute('data-tabgroup') : null;
    if (!group) return;
    var panels = document.querySelectorAll('[data-panel][data-tabgroup="' + group + '"]');

    function activate(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== tab.getAttribute('data-tab');
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab); });
      tab.addEventListener('keydown', function (ev) {
        var next = null;
        if (ev.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (ev.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (ev.key === 'Home') next = tabs[0];
        if (ev.key === 'End') next = tabs[tabs.length - 1];
        if (next) { ev.preventDefault(); next.focus(); activate(next); }
      });
    });
    activate(tabs[0]);
  });

  /* ---------- 6. 终端重放 ---------- */
  var consoleEl = document.getElementById('console');
  var replayBtn = document.getElementById('replay');
  if (consoleEl && replayBtn) {
    replayBtn.addEventListener('click', function () {
      var lines = consoleEl.querySelectorAll('.l');
      lines.forEach(function (l) {
        l.style.animation = 'none';
        // 强制回流，重启动画
        void l.offsetWidth;
        l.style.animation = '';
      });
    });
  }

  /* ---------- 7. 年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 8. 当前区块高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          a.style.color = on ? 'var(--fg)' : '';
          a.style.background = on ? 'var(--bg-3)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- 9. 截图大图 ---------- */
  var lightbox = document.getElementById('lightbox');
  var zoomTargets = document.querySelectorAll('[data-lightbox]');
  if (lightbox && zoomTargets.length) {
    var lbImg = lightbox.querySelector('img');
    var lastFocus = null;

    var openLightbox = function (src, label) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      if (label) lbImg.alt = label;
      lightbox.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
      lightbox.focus();
    };

    var closeLightbox = function () {
      lightbox.removeAttribute('open');
      lbImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    Array.prototype.forEach.call(zoomTargets, function (el) {
      var src = el.getAttribute('data-lightbox');
      var img = el.querySelector('img');
      var label = img ? img.alt : '';
      el.addEventListener('click', function () { openLightbox(src, label); });
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openLightbox(src, label); }
      });
    });

    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && lightbox.hasAttribute('open')) closeLightbox();
    });
  }

  /* ---------- 10. 优先使用 WebP 版本（file:// 下 <picture><source> 不生效，故用 JS 替换） ---------- */
  if (/^https?:$/.test(location.protocol)) {
    Array.prototype.forEach.call(document.querySelectorAll(".shot-img"), function (img) {
      var webp = img.getAttribute("src").replace(/\.png$/, ".webp");
      var probe = new Image();
      probe.onload = function () { img.src = webp; };
      probe.src = webp;
    });
  }
})( );

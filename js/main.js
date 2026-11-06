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

  /* ---------- 11. 分享面板 ---------- */
  var shareBtn = document.getElementById("shareBtn");
  var sharePanel = document.getElementById("sharePanel");
  var shareUrlField = document.getElementById("shareUrlField");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function isEn() {
    return document.documentElement.getAttribute("data-lang") === "en";
  }

  function copyText(text) {
    return new Promise(function (resolve, reject) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(resolve, function () { legacyCopy(text) ? resolve() : reject(new Error("copy failed")); });
        return;
      }
      legacyCopy(text) ? resolve() : reject(new Error("copy failed"));
    });
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function pageUrl() {
    return location.href.split("#")[0];
  }

  var SHARE = {
    qq: function (u, t) {
      return "https://connect.qq.com/widget/shareqq/index.html?url=" +
        encodeURIComponent(u) + "&title=" + encodeURIComponent(t) + "&source=HanShu";
    },
    weibo: function (u, t) {
      return "https://service.weibo.com/share/share.php?url=" +
        encodeURIComponent(u) + "&title=" + encodeURIComponent(t);
    },
    bili: function () {
      return "https://www.bilibili.com/video/BV14maK67EZQ/";
    }
  };

  function openSharePanel() {
    if (!sharePanel) return;
    if (shareUrlField) shareUrlField.value = pageUrl();
    sharePanel.hidden = false;
    shareBtn.setAttribute("aria-expanded", "true");
  }

  function closeSharePanel() {
    if (!sharePanel || sharePanel.hidden) return;
    sharePanel.hidden = true;
    shareBtn.setAttribute("aria-expanded", "false");
  }

  if (shareBtn && sharePanel) {
    shareBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      sharePanel.hidden ? openSharePanel() : closeSharePanel();
    });

    sharePanel.addEventListener("click", function (ev) { ev.stopPropagation(); });

    document.addEventListener("click", closeSharePanel);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeSharePanel();
    });

    Array.prototype.forEach.call(sharePanel.querySelectorAll("[data-share]"), function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-share");
        var url = pageUrl();
        var title = isEn() ? "HanShu — RPG Creation IDE & Mod Engine" : "HanShu 汉书 · RPG 创作 IDE 与 Mod 运行引擎";

        if (kind === "copy") {
          copyText(url).then(function () { toast(isEn() ? "Link copied" : "链接已复制"); })
                          .catch(function () { toast(isEn() ? "Copy failed — select the link above" : "复制失败，请手动选中上方链接"); });
          return;
        }

        if (kind === "system") {
          if (navigator.share) {
            navigator.share({ title: title, url: url }).catch(function () { /* 取消即忽略 */ });
            closeSharePanel();
          } else {
            copyText(url).then(function () { toast(isEn() ? "Link copied" : "链接已复制（此浏览器无系统分享）"); })
                            .catch(function () { toast(isEn() ? "Copy failed — select the link above" : "复制失败，请手动选中上方链接"); });
          }
          return;
        }

        var target = SHARE[kind] && SHARE[kind](url, title);
        if (target) {
          window.open(target, "_blank", "noopener,noreferrer");
          closeSharePanel();
        }
      });
    });
  }
})();

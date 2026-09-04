/* ---------- Scroll progress bar ---------- */
(function () {
  var bar = document.getElementById('scroll-progress');
  function update() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Scroll reveal ---------- */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ---------- Active nav link on scroll ---------- */
(function () {
  var links = document.querySelectorAll('.nav-links a');
  var sections = Array.prototype.map.call(links, function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (section) { observer.observe(section); });
})();

/* ---------- Force resume download (Blob-based, works even in Safari) ---------- */
(function () {
  var link = document.getElementById('resume-download-link');
  if (!link) return;

  link.addEventListener('click', function (e) {
    e.preventDefault();
    var url = link.getAttribute('href');
    var filename = link.getAttribute('download') || 'resume.pdf';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then(function (blob) {
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1000);
      })
      .catch(function () {
        // Fallback: if fetch fails (e.g. opened via file:// without a server), just navigate to the file.
        window.location.href = url;
      });
  });
})();

/* ---------- Theme toggle (light / dark) ---------- */
(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
    toggle.setAttribute('aria-pressed', 'true');
  }

  toggle.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggle.setAttribute('aria-pressed', 'false');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.setAttribute('aria-pressed', 'true');
    }
  });
})();

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

/* ---------- Certifications carousel ---------- */
(function () {
  var track = document.getElementById('cert-track');
  var prev = document.getElementById('cert-prev');
  var next = document.getElementById('cert-next');
  var count = document.getElementById('cert-count');
  var carousel = document.getElementById('cert-carousel');
  if (!track || !prev || !next) return;

  var slides = Array.prototype.slice.call(track.children);
  var total = slides.length;
  var bar = document.getElementById('cert-progress');
  var offscreen = true, tabHidden = false;
  var descs = Array.prototype.slice.call(document.querySelectorAll('#cert-info .cert-desc'));
  var index = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Autoplay: the progress bar's 5s animation is the timer; when it ends, go to the next slide.
  function restartTimer() {
    if (!bar || reduce) return;
    bar.classList.remove('run');
    void bar.offsetWidth;
    bar.classList.add('run');
  }
  function syncPause() {
    carousel.classList.toggle('is-paused', offscreen || tabHidden);
  }
  if (bar && !reduce) {
    bar.addEventListener('animationend', function () { show(index + 1, 1); });
    document.addEventListener('visibilitychange', function () {
      tabHidden = document.hidden; syncPause();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        offscreen = !entries[0].isIntersecting; syncPause();
      }, { threshold: 0.3 }).observe(carousel);
    } else {
      offscreen = false;
    }
    syncPause();
  }

  function show(i, dir) {
    var nextIndex = (i + total) % total;
    var incoming = slides[nextIndex];
    var outgoing = slides[index];
    dir = dir || 1;

    if (nextIndex !== index && !reduce) {
      // place the incoming slide just off to the side (no transition), then let it glide in
      incoming.style.transition = 'none';
      incoming.style.transform = 'translateX(' + (dir * 7) + '%) scale(.97)';
      void incoming.offsetWidth;
      incoming.style.transition = '';
      incoming.style.transform = '';
      // outgoing drifts the opposite way while it fades
      outgoing.style.transform = 'translateX(' + (-dir * 7) + '%) scale(.97)';
      setTimeout(function () { outgoing.style.transform = ''; }, 600);
    }

    slides.forEach(function (sl, n) { sl.classList.toggle('is-active', n === nextIndex); });
    descs.forEach(function (d, n) { d.classList.toggle('is-active', n === nextIndex); });
    index = nextIndex;
    count.textContent = (index + 1) + ' / ' + total;
    restartTimer();
  }

  prev.addEventListener('click', function () { show(index - 1, -1); });
  next.addEventListener('click', function () { show(index + 1, 1); });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(index - 1, -1);
    if (e.key === 'ArrowRight') show(index + 1, 1);
  });

  var startX = null;
  carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX = null;
  });

  show(0);
})();

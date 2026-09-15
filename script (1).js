document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Hero oscilloscope trace — animated waveform
     --------------------------------------------------------- */
  const trace = document.getElementById('scopeTrace');
  if (trace) {
    const width = 560, height = 200, mid = 100;
    let t = 0;

    function buildPath(offset) {
      let d = `M 0 ${mid}`;
      const points = 70;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const y = mid
          + Math.sin((i * 0.35) + offset) * 26
          + Math.sin((i * 0.9) + offset * 1.7) * 10
          + Math.sin((i * 0.05) + offset * 0.4) * 14;
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return d;
    }

    if (reduceMotion) {
      trace.setAttribute('d', buildPath(0));
    } else {
      function animate() {
        t += 0.035;
        trace.setAttribute('d', buildPath(t));
        requestAnimationFrame(animate);
      }
      animate();
    }
  }

  /* ---------------------------------------------------------
     2. RM EYE diagnostics — accessible tab panel
     --------------------------------------------------------- */
  const tabs = document.querySelectorAll('.diag-tab');
  const panels = document.querySelectorAll('.diag-panel');

  function activateTab(tab) {
    tabs.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => {
      p.classList.remove('is-active');
      p.hidden = true;
    });

    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const target = document.getElementById('panel-' + tab.dataset.target);
    if (target) {
      target.hidden = false;
      target.classList.add('is-active');
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      const list = Array.from(tabs);
      const i = list.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    });
  });

  /* ---------------------------------------------------------
     3. Asset horizontal scroll — progress indicator
     --------------------------------------------------------- */
  const track = document.getElementById('assetsTrack');
  const progress = document.getElementById('assetsProgress');

  if (track && progress) {
    function updateProgress() {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      const barWidth = Math.max(15, (track.clientWidth / track.scrollWidth) * 100);
      progress.style.width = barWidth + '%';
      progress.style.transform = `translateX(${ratio * (100 / barWidth - 1) * 100}%)`;
    }
    track.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------------------------------------------------------
     4. Mobile nav toggle
     --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.querySelector('.main-nav');
  const navCta = document.querySelector('.nav-cta');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
      if (navCta) navCta.style.display = expanded ? 'none' : 'flex';
      if (!expanded) {
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = '100%';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.background = '#131519';
        mainNav.style.padding = '1.5rem 24px';
        mainNav.style.borderBottom = '1px solid #2B2D33';
        mainNav.querySelector('ul').style.flexDirection = 'column';
        mainNav.querySelector('ul').style.gap = '1rem';
      }
    });
  }

  /* ---------------------------------------------------------
     5. Header shrink-on-scroll shadow
     --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 8px 30px -20px rgba(0,0,0,.8)' : 'none';
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     6. Section reveal on scroll (single orchestrated pattern)
     --------------------------------------------------------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.pillar-card, .industry-card, .resource-card, .asset-card');
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => io.observe(el));
  }
});

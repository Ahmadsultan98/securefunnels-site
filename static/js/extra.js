/* Secure Funnels — shared site helpers: tracking events, lightbox, sticky mobile CTA */
(function () {
  'use strict';

  function fb() { try { if (window.fbq) window.fbq.apply(null, arguments); } catch (e) {} }
  function ga() { try { if (window.gtag) window.gtag.apply(null, arguments); } catch (e) {} }

  // ── Tracking: button clicks that matter for ads
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('/contact') === 0) {
      fb('trackCustom', 'AuditClick', { page: location.pathname, label: (a.textContent || '').trim().slice(0, 60) });
      ga('event', 'audit_click', { page_path: location.pathname });
    } else if (href.indexOf('mailto:') === 0 || /linkedin\.com|instagram\.com|wa\.me/.test(href)) {
      fb('track', 'Contact');
      ga('event', 'contact_click', { link_url: href });
    }
  });

  // ── Lightbox for screenshots
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button class="lb-close" aria-label="Close">×</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  function closeLb() { lb.classList.remove('open'); }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  document.querySelectorAll('img[data-zoom], .proof-card-img').forEach(function (img) {
    img.addEventListener('click', function () {
      lbImg.src = img.getAttribute('data-zoom') || img.src;
      lbImg.alt = img.alt || '';
      lb.classList.add('open');
    });
  });

  // ── Sticky "Get Free Audit" bar on phones (not on the contact page)
  if (location.pathname.indexOf('/contact') !== 0 && location.pathname.indexOf('/thank-you') !== 0) {
    var bar = document.createElement('div');
    bar.className = 'm-sticky';
    bar.innerHTML = '<a href="/contact/">Get Your Free Piracy Audit</a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-sticky');
    window.addEventListener('scroll', function () {
      bar.classList.toggle('show', window.scrollY > 520);
    }, { passive: true });
  }
})();

/* Safety net: never leave a section hidden if an animation is missed */
setTimeout(function () {
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(function (el) { el.classList.add('visible'); });
}, 1500);

/* Scroll-in animation for cards (content stays visible if JS or observer is missing) */
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = '.rv, .rv-shot, .proof-card, .price-card, .svc-card, .svc-item, .sdiv-item, .info-card, .value-item, .wid-card, .faq-item, .step, .bio-stat, .proof-stat';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) {
    return el.getBoundingClientRect().top > window.innerHeight * 0.9; // leave anything already on screen alone
  });
  if (!els.length) return;
  document.documentElement.classList.add('fx-ready');
  els.forEach(function (el) { el.classList.add('fx'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var sibs = [].slice.call(e.target.parentNode.children).filter(function (c) { return c.classList.contains('fx'); });
      e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 70 + 'ms';
      var t = e.target; t.classList.add('fx-in'); io.unobserve(t);
      setTimeout(function () { t.classList.remove('fx', 'fx-in'); t.style.transitionDelay = ''; }, 1100); // hand hover effects back
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
  setTimeout(function () { els.forEach(function (el) { el.classList.remove('fx', 'fx-in'); }); }, 8000);
})();

/* Reel player: plays muted when visible, tap for sound */
(function () {
  var v = document.getElementById('reel1'), b = document.getElementById('reelSound');
  if (!v) return;
  var fb = function () { try { if (window.fbq) window.fbq.apply(null, arguments); } catch (e) {} };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); } });
    }, { threshold: 0.4 }).observe(v);
  }
  function sound() {
    v.muted = false; v.currentTime = 0; v.controls = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    b.classList.add('hide');
    fb('trackCustom', 'ReelPlay', { reel: 'reel1' });
  }
  b.addEventListener('click', sound);
})();

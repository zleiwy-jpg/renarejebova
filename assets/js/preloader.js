(function () {
  "use strict";
  if (document.getElementById("pageLoader")) return;

  var mathExprs = [
    "\u222B f(x) dx","\u03C0r\u00B2","a\u00B2 + b\u00B2 = c\u00B2","E = mc\u00B2","\u03A3x","\u221Ax","lim x\u2192\u221E",
    "sin\u00B2\u03B8 + cos\u00B2\u03B8 = 1","\u0394 = b\u00B2 \u2212 4ac","f\u2032(x)","log x","\u2202/\u2202x","\u221E","\u03C6",
    "A = \u03C0r\u00B2","V = 4/3\u03C0r\u00B3","\u2211 n","x = (\u2212b \u00B1 \u221A\u0394)/2a","tan \u03B8","e^(i\u03C0)+1=0"
  ];

  function buildMathBg() {
    var bg = document.createElement("div");
    bg.className = "page-loader-bg";
    for (var i = 0; i < mathExprs.length; i++) {
      var span = document.createElement("span");
      span.className = "page-loader-math";
      span.textContent = mathExprs[i];
      span.style.left = (5 + (i * 37) % 90) + "%";
      span.style.top = (5 + (i * 53) % 90) + "%";
      span.style.animationDuration = (12 + (i % 7) * 3) + "s";
      span.style.animationDelay = -(i * 1.7) + "s";
      span.style.setProperty("--dx", ((i % 2 === 0 ? 1 : -1) * (30 + (i % 5) * 18)) + "px");
      span.style.setProperty("--dy", ((i % 3 === 0 ? -1 : 1) * (25 + (i % 4) * 20)) + "px");
      span.style.setProperty("--rot", ((i % 2 === 0 ? -1 : 1) * (i % 12)) + "deg");
      bg.appendChild(span);
    }
    return bg;
  }

  var loader = document.createElement("div");
  loader.className = "page-loader";
  loader.id = "pageLoader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");
  loader.setAttribute("aria-label", "S\u0259hif\u0259 y\u00FCkl\u0259nir");
  loader.appendChild(buildMathBg());

  var center = document.createElement("div");
  center.className = "page-loader-center";
  var script = document.currentScript || document.querySelector('script[src*="preloader.js"]');
  var scriptSrc = script && script.src;
  var logoUrl = scriptSrc ? new URL("../img/nav_logo.png", scriptSrc).href : "assets/img/nav_logo.png";
  center.innerHTML =
    '<div class="page-loader-logo-wrap">' +
      '<div class="page-loader-spinner" aria-hidden="true"></div>' +
      '<img class="page-loader-logo" src="' + logoUrl + '" alt="R\u0259na R\u0259c\u0259bova">' +
    '</div>' +
    '<p class="page-loader-status">Y\u00FCkl\u0259nir...</p>';
  loader.appendChild(center);

  function start() {
    document.body.insertBefore(loader, document.body.firstChild);
    document.documentElement.classList.add("loader-locked");

    var status = loader.querySelector(".page-loader-status");
    var pageLoaded = document.readyState === "complete";
    var finished = false;
    var startTime = performance.now();
    var minimumDuration = 1400;
    var maximumWait = 3500;

    window.addEventListener("load", function () { pageLoaded = true; }, { once: true });

    function finish() {
      if (finished) return;
      finished = true;
      if (status) status.textContent = "Haz\u0131rd\u0131r";
      window.setTimeout(function () {
        loader.classList.add("is-leaving");
        loader.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("loader-locked");
        window.setTimeout(function () { loader.remove(); }, 520);
      }, 220);
    }

    function tick(now) {
      var elapsed = now - startTime;
      if ((pageLoaded && elapsed >= minimumDuration) || elapsed >= maximumWait) { finish(); return; }
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if (document.body) { start(); } else { document.addEventListener("DOMContentLoaded", start); }
})();

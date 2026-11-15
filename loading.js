"use strict";

(() => {
  let loader = document.querySelector(".page-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "page-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-label", "Riyaziyyat səhifəsi yüklənir");
    loader.innerHTML = `
      <div class="loader-content">
        <img class="loader-logo" src="nav_logo.png" alt="Rəna Rəcəbova">
        <p class="loader-kicker">DÜŞÜN <span>·</span> HESABLA <span>·</span> ANLA</p>
        <div class="loader-math" aria-hidden="true">
          <svg class="loader-circle" viewBox="0 0 240 240">
            <circle class="loader-circle-track" cx="120" cy="120" r="82"></circle>
            <circle class="loader-circle-progress" cx="120" cy="120" r="82" pathLength="100"></circle>
          </svg>
          <div class="loader-pencil-orbit">
            <div class="pencil">
              <div class="pencil__ball-point"></div>
              <div class="pencil__cap"></div>
              <div class="pencil__cap-base"></div>
              <div class="pencil__middle"></div>
              <div class="pencil__eraser"></div>
            </div>
          </div>
        </div>
        <h2 class="loader-status">Səhifə yüklənir, zəhmət olmasa gözlə...</h2>
      </div>`;
    document.body.prepend(loader);
  }

  const minimumDisplayTime = 2000;
  const startedAt = performance.now();
  const finishLoading = () => {
    const remaining = Math.max(0, minimumDisplayTime - (performance.now() - startedAt));
    window.setTimeout(() => {
      loader.classList.add("is-leaving");
      loader.addEventListener("transitionend", event => {
        if (event.target === loader && event.propertyName === "opacity") loader.remove();
      }, { once: true });
      window.setTimeout(() => loader.remove(), 500);
    }, remaining);
  };

  if (document.readyState === "complete") {
    finishLoading();
  } else {
    window.addEventListener("load", finishLoading, { once: true });
  }
})();

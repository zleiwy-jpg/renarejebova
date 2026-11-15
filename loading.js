"use strict";

(() => {
  let loader = document.querySelector(".page-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "page-loader";
    loader.innerHTML = `
      <div class="loader-background" aria-hidden="true">
        <span class="loader-float loader-float-one">π ≈ 3.14</span>
        <span class="loader-float loader-float-two">√144 = 12</span>
        <span class="loader-float loader-float-three">a² + b² = c²</span>
        <span class="loader-float loader-float-four">S = a × b</span>
        <span class="loader-float loader-float-five">∫ x dx</span>
        <span class="loader-float loader-float-six">x² + y²</span>
      </div>
      <div class="loader-content">
        <img class="loader-logo" src="nav_logo.png" alt="Rəna Rəcəbova">
        <h1 class="loader-title">Riyaziyyatın aydın həlli</h1>
        <p class="loader-subtitle">Məsələləri addım-addım öyrən.</p>
        <div class="loader-formula">2x + 5 = 13</div>
        <div class="loader-progress-info">
          <span class="loader-status" role="status" aria-live="polite">Səhifə hazırlanır...</span>
          <span class="loader-percent">0%</span>
        </div>
        <div class="loader-progress" role="progressbar" aria-label="Səhifənin yüklənmə faizi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="loader-progress-fill"></span>
        </div>
        <p class="loader-footer">DÜŞÜN · HƏLL ET · ANLA</p>
      </div>`;
    document.body.prepend(loader);
  }

  const progressBar = loader.querySelector(".loader-progress");
  const progressFill = loader.querySelector(".loader-progress-fill");
  const percentLabel = loader.querySelector(".loader-percent");
  const statusLabel = loader.querySelector(".loader-status");
  const formulaLabel = loader.querySelector(".loader-formula");
  const formulas = [
    "2x + 5 = 13",
    "a² + b² = c²",
    "√144 = 12",
    "S = a × b",
    "π ≈ 3.14159",
    "∫ x dx = x²/2 + C"
  ];
  const minimumDisplayTime = 2000;
  const startedAt = performance.now();
  let progress = 0;
  let formulaIndex = 0;
  let finished = false;
  let formulaTimeout;
  const updateProgress = value => {
    progress = value;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (percentLabel) percentLabel.textContent = `${progress}%`;
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(progress));
  };
  const progressTimer = window.setInterval(() => {
    if (progress < 90) updateProgress(Math.min(90, progress + 2));
  }, 45);
  const formulaTimer = window.setInterval(() => {
    if (!formulaLabel) return;
    formulaLabel.style.opacity = "0";
    formulaTimeout = window.setTimeout(() => {
      formulaIndex = (formulaIndex + 1) % formulas.length;
      formulaLabel.textContent = formulas[formulaIndex];
      formulaLabel.style.opacity = "1";
    }, 220);
  }, 1700);
  const finishLoading = () => {
    if (finished) return;
    finished = true;
    window.clearInterval(progressTimer);
    window.clearInterval(formulaTimer);
    window.clearTimeout(formulaTimeout);
    updateProgress(100);
    if (statusLabel) statusLabel.textContent = "Hazırdır!";
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

(() => {
  "use strict";

  if (document.querySelector(".rank-panel")) return;

  const fallbackStudents = [
    { name: "Aysel Məmmədova", grade: "11-A", answers: 1284, rating: 98 },
    { name: "Murad Əliyev", grade: "11-B", answers: 1197, rating: 95 },
    { name: "Nərmin Həsənova", grade: "10-A", answers: 1103, rating: 92 },
    { name: "Tural Quliyev", grade: "11-C", answers: 986, rating: 89 },
    { name: "Leyla İsmayılova", grade: "10-B", answers: 924, rating: 86 },
    { name: "Rəvan Babayev", grade: "9-A", answers: 861, rating: 82 },
    { name: "Zəhra Abdullayeva", grade: "10-C", answers: 790, rating: 78 },
    { name: "Elvin Rzayev", grade: "11-A", answers: 742, rating: 74 },
    { name: "Aytac Cəfərova", grade: "9-B", answers: 688, rating: 70 },
    { name: "Kamran Nəsibov", grade: "12-A", answers: 615, rating: 66 },
    { name: "Səbinə Xəlilova", grade: "10-A", answers: 552, rating: 62 },
    { name: "Fərid Musayev", grade: "9-C", answers: 498, rating: 58 }
  ];

  const store = window.RenaData || null;
  const settings = store ? store.getSettings() : {};

  if (store && settings.rankingVisible === false) return;

  function currentStudents() {
    if (store) {
      const ranking = store.getRanking();
      if (ranking.length) return ranking;
    }
    return fallbackStudents;
  }

  const root = document.documentElement;
  const wideQuery = window.matchMedia("(min-width: 1500px)");
  let stored = null;

  try {
    stored = window.localStorage.getItem("rena-rank-open");
  } catch (error) {
    stored = null;
  }

  let isOpen = stored === null ? wideQuery.matches : stored === "1";

  const backdrop = document.createElement("div");
  backdrop.className = "rank-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const panel = document.createElement("aside");
  panel.className = "rank-panel";
  panel.id = "rankPanel";
  panel.setAttribute("aria-label", "Şagird reytinqi");
  panel.innerHTML = `
    <div class="rank-panel-top">
      <span class="rank-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>
      </span>
      <div>
        <span class="rank-eyebrow">Reytinq</span>
        <h2 class="rank-title"></h2>
      </div>
      <button class="rank-panel-close" type="button" aria-label="Reytinq panelini bağla">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <p class="rank-note"></p>
    <div class="rank-columns" aria-hidden="true"><span>#</span><span>Şagird</span><span>Cavab · Faiz</span></div>
    <ol class="rank-list"></ol>
    <div class="rank-foot"><span class="rank-live">Həftəlik sıralama</span><span class="rank-total"></span></div>
  `;

  panel.querySelector(".rank-title").textContent = settings.rankingTitle || "Həftənin liderləri";
  panel.querySelector(".rank-note").textContent = settings.rankingNote || "Ən çox suala cavab verən şagirdlər";

  const list = panel.querySelector(".rank-list");
  const total = panel.querySelector(".rank-total");
  let students = currentStudents();

  function renderList() {
    list.replaceChildren();
    students.forEach((student, index) => {
      const item = document.createElement("li");
      item.className = "rank-row";
      if (index === 0) item.classList.add("is-leader");
      if (index < 3) item.classList.add("is-podium");

      const position = document.createElement("span");
      position.className = "rank-pos";
      position.textContent = String(index + 1).padStart(2, "0");

      const person = document.createElement("span");
      person.className = "rank-person";

      const avatar = document.createElement("span");
      avatar.className = "rank-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = student.name
        .split(/\s+/)
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join("");

      const identity = document.createElement("span");
      identity.className = "rank-id";

      const name = document.createElement("span");
      name.className = "rank-name";
      name.textContent = student.name;

      const grade = document.createElement("span");
      grade.className = "rank-class";
      grade.textContent = student.grade ? `${student.grade} sinif` : "Şagird";

      identity.append(name, grade);
      person.append(avatar, identity);

      const score = document.createElement("span");
      score.className = "rank-score";

      const answerCount = document.createElement("span");
      answerCount.className = "rank-answers";
      answerCount.textContent = String(student.answers).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

      const percent = document.createElement("span");
      percent.className = "rank-percent";
      percent.textContent = `${student.rating || 0}%`;

      score.append(answerCount, percent);

      item.append(position, person, score);
      list.append(item);
    });
    total.textContent = `${students.length} şagird`;
  }

  renderList();

  const tab = document.createElement("button");
  tab.className = "rank-tab";
  tab.type = "button";
  tab.setAttribute("aria-controls", "rankPanel");
  tab.setAttribute("aria-label", "Şagird reytinqini aç");
  tab.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>
    <span>Reytinq</span>
  `;

  const closeButton = panel.querySelector(".rank-panel-close");

  document.body.append(backdrop, panel, tab);

  function apply(open, moveFocus, persist) {
    isOpen = open;
    panel.setAttribute("aria-hidden", String(!open));
    tab.setAttribute("aria-expanded", String(open));
    panel.inert = !open;

    if (wideQuery.matches) {
      root.classList.toggle("rank-closed", !open);
      root.classList.remove("rank-open");
    } else {
      root.classList.toggle("rank-open", open);
      root.classList.remove("rank-closed");
    }

    if (persist) {
      try {
        window.localStorage.setItem("rena-rank-open", open ? "1" : "0");
      } catch (error) {}
    }

    if (moveFocus) {
      window.requestAnimationFrame(() => {
        const target = open ? closeButton : tab;
        target.focus({ preventScroll: true });
      });
    }
  }

  function syncMode() {
    if (wideQuery.matches) {
      root.classList.remove("rank-open");
      root.classList.toggle("rank-closed", !isOpen);
    } else {
      root.classList.remove("rank-closed");
      root.classList.toggle("rank-open", isOpen);
    }
  }

  tab.addEventListener("click", () => apply(true, true, true));
  closeButton.addEventListener("click", () => apply(false, true, true));
  backdrop.addEventListener("click", () => apply(false, true, true));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.getAttribute("aria-hidden") === "false") {
      apply(false, true, true);
    }
  });

  if (wideQuery.addEventListener) {
    wideQuery.addEventListener("change", syncMode);
  } else {
    wideQuery.addListener(syncMode);
  }

  if (store && typeof store.subscribe === "function") {
    store.subscribe(() => {
      students = currentStudents();
      renderList();
    });
  }

  apply(isOpen, false, false);
})();

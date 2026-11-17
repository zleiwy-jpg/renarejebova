(function () {
  "use strict";

  const store = window.RenaData;

  if (!store) {
    document.body.textContent = "Məlumat modulu yüklənmədi.";
    return;
  }

  const $ = id => document.getElementById(id);

  const state = {
    view: "dashboard",
    studentSearch: "",
    studentStatus: "all",
    rankingSearch: "",
    examSearch: "",
    examLevel: "all",
    entrySearch: "",
    entryMode: "all",
    editingStudentId: null,
    convertEntryId: null,
    currentExamId: null,
    confirmHandler: null
  };

  const icons = {
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.9c2 .5 3.5 2.3 3.5 5.1"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h4.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M5 20V11M12 20V4M19 20v-6"/><path d="M3 20h18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 5.5l3 3"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    login: '<svg viewBox="0 0 24 24"><path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 8l4 4-4 4M14 12H3"/></svg>',
    userPlus: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.2 2.5-5.4 5.5-5.4 1.2 0 2.3.3 3.2.9"/><path d="M18 14v6M15 17h6"/></svg>',
    dot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>'
  };

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value === null || value === undefined || value === false) continue;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "html") node.innerHTML = value;
        else if (key === "dataset") Object.assign(node.dataset, value);
        else if (key === "style") node.style.cssText = value;
        else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value === true) {
          node.setAttribute(key, "");
        } else {
          node.setAttribute(key, String(value));
        }
      }
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(node, children) {
    for (const child of children) {
      if (child === null || child === undefined || child === false) continue;
      if (Array.isArray(child)) appendChildren(node, child);
      else node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("az-AZ").format(Number(value) || 0);
  }

  function formatDate(iso, withTime = true) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const day = date.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!withTime) return day;
    return `${day} ${date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}`;
  }

  function formatRelative(iso) {
    const time = new Date(iso).getTime();
    if (Number.isNaN(time)) return "—";
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return "indi";
    if (minutes < 60) return `${minutes} dəq əvvəl`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} saat əvvəl`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} gün əvvəl`;
    return formatDate(iso, false);
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    return `${Math.floor(total / 60)} dəq ${String(total % 60).padStart(2, "0")} san`;
  }

  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  }

  function toneFor(name) {
    const code = String(name || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return `tone-${code % 4}`;
  }

  function avatar(name, extraClass = "") {
    return el("span", { class: `avatar ${toneFor(name)} ${extraClass}`.trim(), text: initials(name) });
  }

  function personCell(name, sub) {
    return el(
      "div",
      { class: "cell-person" },
      avatar(name),
      el("span", {}, el("strong", { text: name }), sub ? el("small", { text: sub }) : null)
    );
  }

  function levelLabel(level) {
    return level === "abituriyent" ? "Abituriyent" : "Orta məktəb";
  }

  function statusPill(active) {
    return el("span", { class: `pill ${active ? "pill-success" : "pill-muted"}`, text: active ? "Aktiv" : "Passiv" });
  }

  function passPill(score, passScore) {
    const passed = score >= passScore;
    return el("span", { class: `pill ${passed ? "pill-success" : "pill-danger"}`, text: passed ? "Keçdi" : "Keçmədi" });
  }

  function progressBar(value) {
    const width = Math.max(0, Math.min(100, Number(value) || 0));
    return el(
      "div",
      { class: "progress" },
      el("div", { class: "progress-track" }, el("span", { class: "progress-fill", style: `width:${width}%` })),
      el("span", { text: `${width}%` })
    );
  }

  function iconButton(html, title, handler, danger = false) {
    return el("button", {
      class: `icon-btn${danger ? " is-danger" : ""}`,
      type: "button",
      title,
      "aria-label": title,
      html,
      onclick: handler
    });
  }

  function toast(title, message, type) {
    const node = el(
      "div",
      { class: `toast${type ? ` is-${type}` : ""}` },
      el("div", {}, el("strong", { text: title }), message ? el("p", { text: message }) : null)
    );
    $("toastStack").append(node);
    window.setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(6px)";
      window.setTimeout(() => node.remove(), 200);
    }, 3600);
  }

  function openModal(id) {
    $(id).hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (!document.querySelector(".modal:not([hidden])")) document.body.style.overflow = "";
  }

  function askConfirm(title, text, handler) {
    $("confirmTitle").textContent = title;
    $("confirmText").textContent = text;
    state.confirmHandler = handler;
    openModal("confirmModal");
  }

  const loginScreen = $("loginScreen");
  const app = $("app");
  const loginForm = $("loginForm");
  const loginError = $("loginError");

  function showApp() {
    loginScreen.hidden = true;
    app.hidden = false;
    setView(state.view);
    renderAll();
  }

  function showLogin() {
    loginScreen.hidden = false;
    app.hidden = true;
  }

  function login(event) {
    event.preventDefault();
    const database = store.getDb();
    const username = $("loginUsername").value.trim();
    const password = $("loginPassword").value;
    if (username !== database.auth.username || !store.verifyPassword(password)) {
      loginError.textContent = "İstifadəçi adı və ya şifrə yanlışdır.";
      loginError.hidden = false;
      $("loginPassword").focus();
      $("loginPassword").select();
      return;
    }
    loginError.hidden = true;
    try {
      sessionStorage.setItem(store.SESSION_KEY, "1");
    } catch (error) {}
    loginForm.reset();
    showApp();
  }

  function logout() {
    try {
      sessionStorage.removeItem(store.SESSION_KEY);
    } catch (error) {}
    showLogin();
    $("loginUsername").focus();
  }

  const viewMeta = {
    dashboard: { title: "İcmal", subtitle: "Saytın ümumi göstəriciləri və son fəaliyyət" },
    students: { title: "Şagirdlər", subtitle: "Şagird bazasını idarə edin və reytinq göstəricilərini yeniləyin" },
    rankings: { title: "Reytinq", subtitle: "Saytda görünən reytinq panelini nizamlayın" },
    exams: { title: "Sınaq nəticələri", subtitle: "Online sınaqda iştirak edənlərin nəticələri" },
    entries: { title: "Girişlər", subtitle: "Saytdan gələn giriş və qeydiyyat müraciətləri" },
    settings: { title: "Parametrlər", subtitle: "Admin hesabı, sayt ayarları və məlumatların idarəsi" }
  };

  function setView(view) {
    state.view = view in viewMeta ? view : "dashboard";
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("is-active", item.dataset.view === state.view);
    });
    document.querySelectorAll("[data-view-panel]").forEach(panel => {
      panel.hidden = panel.dataset.viewPanel !== state.view;
    });
    $("pageTitle").textContent = viewMeta[state.view].title;
    $("pageSubtitle").textContent = viewMeta[state.view].subtitle;
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function toggleSidebar(open) {
    $("sidebar").classList.toggle("is-open", open);
    $("sidebarOverlay").hidden = !open;
  }

  function closeSidebar() {
    toggleSidebar(false);
  }

  function sameDay(first, second) {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  function renderKpis() {
    const database = store.getDb();
    const students = database.students;
    const exams = database.exams;
    const entries = database.entries;
    const passScore = database.settings.passScore;
    const activeStudents = students.filter(student => student.status === "active").length;
    const newEntries = entries.filter(entry => entry.status === "yeni").length;
    const average = exams.length ? Math.round(exams.reduce((sum, exam) => sum + exam.score, 0) / exams.length) : 0;
    const passed = exams.filter(exam => exam.score >= passScore).length;
    const passRate = exams.length ? Math.round((passed / exams.length) * 100) : 0;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekExams = exams.filter(exam => new Date(exam.date) >= weekStart).length;

    const cards = [
      {
        icon: icons.users,
        tone: "",
        trend: newEntries ? `${newEntries} yeni müraciət` : "Yeni müraciət yoxdur",
        trendDown: false,
        value: formatNumber(activeStudents),
        label: "Aktiv şagird"
      },
      {
        icon: icons.clipboard,
        tone: "info",
        trend: `Son 7 gün: ${weekExams}`,
        trendDown: false,
        value: formatNumber(exams.length),
        label: "Sınaq nəticəsi"
      },
      {
        icon: icons.chart,
        tone: "success",
        trend: `${formatNumber(students.length)} şagird bazada`,
        trendDown: false,
        value: `${average}%`,
        label: "Orta nəticə"
      },
      {
        icon: icons.check,
        tone: "warning",
        trend: `${passed} nəticə keçib`,
        trendDown: false,
        value: `${passRate}%`,
        label: `Keçid faizi (${passScore}%)`
      }
    ];

    $("kpiGrid").replaceChildren(...cards.map(card => el(
      "article",
      { class: `kpi-card ${card.tone ? `tone-${card.tone}` : ""}`.trim() },
      el(
        "div",
        { class: "kpi-top" },
        el("span", { class: "kpi-icon", html: card.icon }),
        el("span", { class: `kpi-trend${card.trendDown ? " is-down" : ""}`, text: card.trend })
      ),
      el("div", { class: "kpi-value", text: card.value }),
      el("div", { class: "kpi-label", text: card.label })
    )));
  }

  function renderWeekChart() {
    const exams = store.getDb().exams;
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      days.push(day);
    }
    const counts = days.map(day => exams.filter(exam => sameDay(new Date(exam.date), day)).length);
    const maximum = Math.max(1, ...counts);
    const total = counts.reduce((sum, count) => sum + count, 0);
    $("weekTotal").textContent = `${total} sınaq`;

    $("weekChart").replaceChildren(...days.map((day, index) => {
      const count = counts[index];
      const percent = count === 0 ? 0 : Math.max(6, Math.round((count / maximum) * 100));
      const label = day.toLocaleDateString("az-AZ", { day: "2-digit", month: "short" });
      return el(
        "div",
        { class: `bar-col${index === days.length - 1 ? " is-today" : ""}`, title: `${label}: ${count} sınaq` },
        el("span", { class: "bar-value", text: String(count) }),
        el("div", { class: "bar-track" }, el("span", { class: "bar-fill", style: `height:${percent}%` })),
        el("span", { class: "bar-label", text: label })
      );
    }));
  }

  function renderDonut() {
    const exams = store.getDb().exams;
    const middle = exams.filter(exam => exam.level !== "abituriyent").length;
    const abituriyent = exams.length - middle;
    const total = exams.length;
    const middleShare = total ? Math.round((middle / total) * 100) : 0;

    const donut = $("levelDonut");
    donut.style.background = total
      ? `conic-gradient(#6d4c7d 0 ${middleShare}%, #3d6fa8 ${middleShare}% 100%)`
      : "var(--surface-3)";
    $("donutCenter").replaceChildren(
      el("strong", { text: String(total) }),
      el("small", { text: "iştirakçı" })
    );

    const items = [
      { label: "Orta məktəb", value: middle, color: "#6d4c7d" },
      { label: "Abituriyent", value: abituriyent, color: "#3d6fa8" }
    ];
    $("levelLegend").replaceChildren(...items.map(item => el(
      "li",
      {},
      el("span", { class: "legend-dot", style: `background:${item.color}` }),
      el("span", { class: "legend-label", text: item.label }),
      el("span", { class: "legend-value", text: String(item.value) }),
      el("span", { class: "legend-share", text: total ? `${Math.round((item.value / total) * 100)}%` : "0%" })
    )));
  }

  function renderRecentExams() {
    const database = store.getDb();
    const exams = store.getExams().slice(0, 5);
    if (!exams.length) {
      $("recentExamsBody").replaceChildren(el("tr", {}, el("td", { colspan: 4, class: "cell-muted", text: "Hələ sınaq nəticəsi yoxdur." })));
      return;
    }
    $("recentExamsBody").replaceChildren(...exams.map(exam => el(
      "tr",
      {},
      el("td", {}, personCell(exam.name, exam.phone || "—")),
      el("td", {}, el("span", { class: "cell-muted", text: levelLabel(exam.level) })),
      el("td", {}, el("span", { class: `pill ${exam.score >= database.settings.passScore ? "pill-success" : "pill-danger"}`, text: `${exam.score}%` })),
      el("td", { class: "cell-muted", text: formatDate(exam.date, false) })
    )));
  }

  function renderLeaders() {
    const ranking = store.getRanking().slice(0, 5);
    if (!ranking.length) {
      $("leaderList").replaceChildren(el("li", { class: "cell-muted", text: "Reytinq üçün şagird yoxdur." }));
      return;
    }
    $("leaderList").replaceChildren(...ranking.map((student, index) => el(
      "li",
      {},
      el("span", { class: "leader-rank", text: String(index + 1) }),
      avatar(student.name),
      el("span", { class: "leader-info" }, el("strong", { text: student.name }), el("small", { text: student.grade ? `${student.grade} sinif · Reytinq ${student.rating}%` : `Reytinq ${student.rating}%` })),
      el("span", { class: "leader-score", text: formatNumber(student.answers), html: undefined }, el("small", { text: "cavab" }))
    )));
  }

  function renderRecentEntries() {
    const entries = store.getEntries().slice(0, 4);
    if (!entries.length) {
      $("recentEntriesList").replaceChildren(el("li", { class: "cell-muted", text: "Giriş müraciəti yoxdur." }));
      return;
    }
    $("recentEntriesList").replaceChildren(...entries.map(entry => el(
      "li",
      {},
      el("span", { class: `activity-icon${entry.mode === "register" ? " is-register" : ""}`, html: icons.login }),
      el("span", { class: "activity-info" }, el("strong", { text: entry.name }), el("small", { text: entry.mode === "register" ? "Qeydiyyat müraciəti" : "Giriş müraciəti" })),
      el("span", { class: "activity-time", text: formatRelative(entry.date) })
    )));
  }

  function renderRecentStudents() {
    const students = [...store.getStudents()]
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 4);
    if (!students.length) {
      $("recentStudentsList").replaceChildren(el("li", { class: "cell-muted", text: "Şagird əlavə olunmayıb." }));
      return;
    }
    $("recentStudentsList").replaceChildren(...students.map(student => el(
      "li",
      {},
      el("span", { class: "activity-icon is-student", html: icons.userPlus }),
      el("span", { class: "activity-info" }, el("strong", { text: student.name }), el("small", { text: `${student.grade ? `${student.grade} sinif · ` : ""}Reytinq ${student.rating}%` })),
      el("span", { class: "activity-time", text: formatRelative(student.createdAt) })
    )));
  }

  function renderStudents() {
    const database = store.getDb();
    const query = state.studentSearch.trim().toLowerCase();
    const students = database.students
      .filter(student => state.studentStatus === "all" || student.status === state.studentStatus)
      .filter(student => {
        if (!query) return true;
        return `${student.name} ${student.grade} ${student.phone}`.toLowerCase().includes(query);
      })
      .sort((first, second) => second.answers - first.answers);

    $("studentCountLabel").textContent = `${students.length} şagird`;
    $("studentsEmpty").hidden = students.length > 0;

    $("studentsBody").replaceChildren(...students.map(student => el(
      "tr",
      {},
      el("td", {}, personCell(student.name, `Qeydiyyat: ${formatDate(student.createdAt, false)}`)),
      el("td", { class: "cell-muted", text: student.grade || "—" }),
      el("td", { class: "cell-muted", text: student.phone || "—" }),
      el("td", { class: "num cell-strong", text: formatNumber(student.answers) }),
      el("td", {}, progressBar(student.rating)),
      el("td", {}, statusPill(student.status === "active")),
      el("td", { class: "actions-col" }, el(
        "span",
        { class: "row-actions" },
        iconButton(icons.edit, "Redaktə et", () => openStudentModal(student)),
        iconButton(icons.trash, "Sil", () => {
          askConfirm("Şagirdi sil", `"${student.name}" adlı şagird silinsin? Bu əməliyyat geri qaytarılmır.`, () => {
            store.deleteStudent(student.id);
            toast("Şagird silindi", student.name, "success");
            renderAll();
          });
        }, true)
      ))
    )));
  }

  function renderRankings() {
    const database = store.getDb();
    const ranking = store.getRanking();
    const query = state.rankingSearch.trim().toLowerCase();
    const filtered = ranking.filter(student => !query || `${student.name} ${student.grade}`.toLowerCase().includes(query));

    $("rankingCount").textContent = `${filtered.length} şagird`;
    $("rankingEmpty").hidden = filtered.length > 0;

    $("rankingBody").replaceChildren(...filtered.map(student => {
      const position = ranking.findIndex(item => item.id === student.id) + 1;
      const fullStudent = database.students.find(item => item.id === student.id) || student;
      return el(
        "tr",
        {},
        el("td", { class: "cell-muted", text: String(position).padStart(2, "0") }),
        el("td", {}, personCell(student.name, student.grade ? `${student.grade} sinif` : "Şagird")),
        el("td", { class: "cell-muted", text: student.grade || "—" }),
        el("td", { class: "num cell-strong", text: formatNumber(student.answers) }),
        el("td", {}, progressBar(student.rating)),
        el("td", { class: "actions-col" }, iconButton(icons.edit, "Reytinqi dəyiş", () => openStudentModal(fullStudent)))
      );
    }));

    const preview = $("rankPreview");
    const head = el(
      "div",
      { class: "rank-preview-head" },
      el("span", { text: "Reytinq" }),
      el("strong", { text: database.settings.rankingTitle }),
      el("p", { text: database.settings.rankingNote })
    );
    const list = el("ol", { class: "rank-preview-list" });
    const top = ranking.slice(0, 6);
    if (top.length) {
      top.forEach((student, index) => {
        list.append(el(
          "li",
          { class: `rank-preview-row${index < 3 ? " is-top" : ""}` },
          el("span", { class: "pos", text: String(index + 1).padStart(2, "0") }),
          avatar(student.name),
          el("span", { class: "who" }, el("strong", { text: student.name }), el("small", { text: student.grade ? `${student.grade} sinif` : "Şagird" })),
          el("span", { class: "score", text: formatNumber(student.answers) })
        ));
      });
      preview.replaceChildren(head, list);
    } else {
      preview.replaceChildren(head, el("div", { class: "empty-state" }, el("strong", { text: "Reytinq boşdur" }), el("p", { text: "Aktiv şagird əlavə edin." })));
    }

    if (document.activeElement !== $("rankingTitleInput")) $("rankingTitleInput").value = database.settings.rankingTitle;
    if (document.activeElement !== $("rankingNoteInput")) $("rankingNoteInput").value = database.settings.rankingNote;
    if (document.activeElement !== $("rankingVisible")) $("rankingVisible").checked = database.settings.rankingVisible !== false;
  }

  function renderExams() {
    const database = store.getDb();
    const query = state.examSearch.trim().toLowerCase();
    const exams = store.getExams()
      .filter(exam => state.examLevel === "all" || exam.level === state.examLevel)
      .filter(exam => !query || `${exam.name} ${exam.phone}`.toLowerCase().includes(query));

    const passed = exams.filter(exam => exam.score >= database.settings.passScore).length;
    $("examCountLabel").textContent = `${exams.length} nəticə`;
    $("examPassRate").textContent = exams.length ? `Keçid: ${Math.round((passed / exams.length) * 100)}%` : "Keçid: 0%";
    $("examsEmpty").hidden = exams.length > 0;

    $("examsBody").replaceChildren(...exams.map(exam => el(
      "tr",
      {},
      el("td", {}, personCell(exam.name, exam.phone || "—")),
      el("td", { class: "cell-muted", text: levelLabel(exam.level) }),
      el("td", {}, el("span", { class: `pill ${exam.score >= database.settings.passScore ? "pill-success" : "pill-danger"}`, text: `${exam.score}%` })),
      el("td", { class: "num cell-strong", text: String(exam.correct) }),
      el("td", { class: "num cell-muted", text: String(exam.wrong) }),
      el("td", { class: "num cell-muted", text: String(exam.blank) }),
      el("td", {}, passPill(exam.score, database.settings.passScore)),
      el("td", { class: "cell-muted", text: formatDate(exam.date) }),
      el("td", { class: "actions-col" }, el(
        "span",
        { class: "row-actions" },
        iconButton(icons.eye, "Nəticəyə bax", () => openExamModal(exam)),
        iconButton(icons.trash, "Sil", () => {
          askConfirm("Nəticəni sil", `"${exam.name}" adlı iştirakçının nəticəsi silinsin?`, () => {
            store.deleteExam(exam.id);
            toast("Nəticə silindi", exam.name, "success");
            renderAll();
          });
        }, true)
      ))
    )));
  }

  function renderEntries() {
    const query = state.entrySearch.trim().toLowerCase();
    const entries = store.getEntries()
      .filter(entry => state.entryMode === "all" || entry.mode === state.entryMode)
      .filter(entry => !query || `${entry.name} ${entry.username}`.toLowerCase().includes(query));
    const newCount = store.getEntries().filter(entry => entry.status === "yeni").length;

    $("entryCountLabel").textContent = `${entries.length} müraciət`;
    $("entryNewCount").textContent = `${newCount} yeni`;
    $("entryNewCount").hidden = newCount === 0;
    $("entriesEmpty").hidden = entries.length > 0;

    $("entriesBody").replaceChildren(...entries.map(entry => {
      const actions = el("span", { class: "row-actions" });
      if (entry.status === "yeni") {
        actions.append(iconButton(icons.check, "Baxıldı kimi işarələ", () => {
          store.updateEntry(entry.id, { status: "baxıldı" });
          toast("Müraciət yeniləndi", "Baxıldı kimi işarələndi.", "success");
          renderAll();
        }));
      }
      if (entry.mode === "register") {
        actions.append(iconButton(icons.userPlus, "Şagirdə çevir", () => {
          openStudentModal({ name: entry.name, grade: "", phone: "", answers: 0, rating: 0, status: "active" }, entry.id);
        }));
      }
      actions.append(iconButton(icons.trash, "Sil", () => {
        askConfirm("Müraciəti sil", `"${entry.name}" adlı müraciət silinsin?`, () => {
          store.deleteEntry(entry.id);
          toast("Müraciət silindi", entry.name, "success");
          renderAll();
        });
      }, true));

      return el(
        "tr",
        {},
        el("td", {}, personCell(entry.name, entry.mode === "register" ? "Qeydiyyat" : "Giriş")),
        el("td", { class: "cell-muted", text: entry.username || "—" }),
        el("td", {}, el("span", { class: `pill ${entry.mode === "register" ? "pill-info" : "pill-muted"}`, text: entry.mode === "register" ? "Qeydiyyat" : "Giriş" })),
        el("td", { class: "cell-muted", text: formatDate(entry.date) }),
        el("td", {}, el("span", { class: `pill ${entry.status === "yeni" ? "pill-warning" : "pill-muted"}`, text: entry.status === "yeni" ? "Yeni" : "Baxıldı" })),
        el("td", { class: "actions-col" }, actions)
      );
    }));
  }

  function renderSettings() {
    const database = store.getDb();
    if (document.activeElement !== $("siteNameInput")) $("siteNameInput").value = database.settings.siteName;
    if (document.activeElement !== $("passScoreInput")) $("passScoreInput").value = database.settings.passScore;

    const size = new Blob([JSON.stringify(database)]).size;
    $("storageNote").textContent = `Baza: ${database.students.length} şagird · ${database.exams.length} nəticə · ${database.entries.length} müraciət · ${(size / 1024).toFixed(1)} KB`;
  }

  function renderBadges() {
    const database = store.getDb();
    const entries = database.entries.filter(entry => entry.status === "yeni").length;
    document.querySelectorAll("[data-badge]").forEach(badge => {
      const key = badge.dataset.badge;
      if (key === "students") badge.textContent = String(database.students.length);
      else if (key === "exams") badge.textContent = String(database.exams.length);
      else if (key === "entries") {
        badge.textContent = entries ? String(entries) : "";
        badge.classList.toggle("is-alert", entries > 0);
      }
    });
  }

  function renderAll() {
    renderKpis();
    renderWeekChart();
    renderDonut();
    renderRecentExams();
    renderLeaders();
    renderRecentEntries();
    renderRecentStudents();
    renderStudents();
    renderRankings();
    renderExams();
    renderEntries();
    renderSettings();
    renderBadges();
  }

  function openStudentModal(student, convertEntryId) {
    state.editingStudentId = student && student.id ? student.id : null;
    state.convertEntryId = convertEntryId || null;
    $("studentModalTitle").textContent = state.editingStudentId ? "Şagirdi redaktə et" : "Yeni şagird";
    $("studentModalSub").textContent = state.editingStudentId ? "Məlumatları yeniləyin" : "Şagird məlumatlarını doldurun";
    $("studentId").value = student && student.id ? student.id : "";
    $("studentName").value = student && student.name ? student.name : "";
    $("studentGrade").value = student && student.grade ? student.grade : "";
    $("studentPhone").value = student && student.phone ? student.phone : "";
    $("studentAnswers").value = student && student.answers ? student.answers : 0;
    $("studentRating").value = student && student.rating ? student.rating : 0;
    $("studentStatus").value = student && student.status === "inactive" ? "inactive" : "active";
    $("studentError").hidden = true;
    openModal("studentModal");
    window.setTimeout(() => $("studentName").focus(), 30);
  }

  function submitStudent(event) {
    event.preventDefault();
    const name = $("studentName").value.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      $("studentError").textContent = "Şagirdin adını daxil edin.";
      $("studentError").hidden = false;
      $("studentName").focus();
      return;
    }
    const existing = state.editingStudentId
      ? store.getStudents().find(student => student.id === state.editingStudentId)
      : null;
    store.saveStudent({
      id: state.editingStudentId || undefined,
      name,
      grade: $("studentGrade").value.trim(),
      phone: $("studentPhone").value.trim(),
      answers: Number($("studentAnswers").value) || 0,
      rating: Number($("studentRating").value) || 0,
      status: $("studentStatus").value,
      createdAt: existing ? existing.createdAt : undefined
    });
    if (state.convertEntryId) {
      store.updateEntry(state.convertEntryId, { status: "baxıldı" });
    }
    closeModal($("studentModal"));
    toast(state.editingStudentId ? "Şagird yeniləndi" : "Şagird əlavə edildi", name, "success");
    state.editingStudentId = null;
    state.convertEntryId = null;
    renderAll();
  }

  function openExamModal(exam) {
    state.currentExamId = exam.id;
    const database = store.getDb();
    $("examModalSub").textContent = `${levelLabel(exam.level)} · ${formatDate(exam.date)}`;

    const body = el(
      "div",
      {},
      el(
        "div",
        { class: "exam-summary" },
        el("div", { class: "score-ring", style: `--score:${Math.max(0, Math.min(100, exam.score))}` }, el("strong", { text: `${exam.score}%` })),
        el(
          "div",
          { class: "exam-summary-copy" },
          el("strong", { text: exam.name }),
          el("small", { text: exam.phone || "Telefon qeyd olunmayıb" }),
          passPill(exam.score, database.settings.passScore)
        )
      ),
      el(
        "div",
        { class: "detail-grid" },
        el("div", { class: "detail-item" }, el("span", { text: "Düzgün cavab" }), el("strong", { text: String(exam.correct) })),
        el("div", { class: "detail-item" }, el("span", { text: "Səhv cavab" }), el("strong", { text: String(exam.wrong) })),
        el("div", { class: "detail-item" }, el("span", { text: "Boş sual" }), el("strong", { text: String(exam.blank) }))
      ),
      el(
        "div",
        { class: "detail-list" },
        el("div", {}, el("span", { text: "Səviyyə" }), el("strong", { text: levelLabel(exam.level) })),
        el("div", {}, el("span", { text: "Ümumi sual" }), el("strong", { text: String(exam.total) })),
        el("div", {}, el("span", { text: "Sərf olunan vaxt" }), el("strong", { text: formatDuration(exam.durationSeconds) })),
        el("div", {}, el("span", { text: "Bitmə səbəbi" }), el("strong", { text: exam.expired ? "Vaxt bitdi" : "İstifadəçi bitirdi" }))
      )
    );

    $("examModalBody").replaceChildren(body);
    openModal("examModal");
  }

  function submitPassword(event) {
    event.preventDefault();
    const current = $("currentPassword").value;
    const next = $("newPassword").value;
    const confirm = $("confirmPassword").value;
    if (!store.verifyPassword(current)) {
      toast("Şifrə dəyişmədi", "Cari şifrə yanlışdır.", "error");
      $("currentPassword").focus();
      return;
    }
    if (next.length < 6) {
      toast("Şifrə dəyişmədi", "Yeni şifrə ən azı 6 simvol olmalıdır.", "error");
      return;
    }
    if (next !== confirm) {
      toast("Şifrə dəyişmədi", "Yeni şifrələr uyğun gəlmir.", "error");
      return;
    }
    store.setPassword(next);
    event.target.reset();
    toast("Şifrə yeniləndi", "Növbəti girişdə yeni şifrədən istifadə edin.", "success");
  }

  function submitSite(event) {
    event.preventDefault();
    store.saveSettings({
      siteName: $("siteNameInput").value.trim() || "Rəna Rəcəbova.az",
      passScore: Number($("passScoreInput").value) || 0
    });
    toast("Ayarlar yadda saxlanıldı", "Sayt parametrləri yeniləndi.", "success");
    renderAll();
  }

  function submitRanking(event) {
    event.preventDefault();
    store.saveSettings({
      rankingTitle: $("rankingTitleInput").value.trim() || "Həftənin liderləri",
      rankingNote: $("rankingNoteInput").value.trim() || "Ən çox suala cavab verən şagirdlər"
    });
    toast("Reytinq paneli yeniləndi", "Dəyişikliklər saytda görünəcək.", "success");
    renderAll();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = el("a", { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function csvValue(value) {
    return `"${String(value === null || value === undefined ? "" : value).replace(/"/g, '""')}"`;
  }

  function downloadCsv(filename, headers, rows) {
    const content = [headers, ...rows].map(row => row.map(csvValue).join(";")).join("\r\n");
    downloadBlob(new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" }), filename);
  }

  function exportStudents() {
    const rows = store.getStudents().map(student => [
      student.name,
      student.grade,
      student.phone,
      student.answers,
      student.rating,
      student.status === "active" ? "Aktiv" : "Passiv",
      formatDate(student.createdAt)
    ]);
    downloadCsv("sagirdler.csv", ["Ad", "Sinif", "Telefon", "Cavab sayı", "Reytinq", "Status", "Qeydiyyat tarixi"], rows);
    toast("CSV hazırdır", "Şagird siyahısı yükləndi.", "success");
  }

  function exportRanking() {
    const rows = store.getRanking().map((student, index) => [
      index + 1,
      student.name,
      student.grade,
      student.answers,
      student.rating
    ]);
    downloadCsv("reyting.csv", ["Yer", "Ad", "Sinif", "Cavab sayı", "Reytinq"], rows);
    toast("CSV hazırdır", "Reytinq cədvəli yükləndi.", "success");
  }

  function exportExams() {
    const database = store.getDb();
    const rows = store.getExams().map(exam => [
      exam.name,
      exam.phone,
      levelLabel(exam.level),
      exam.score,
      exam.correct,
      exam.wrong,
      exam.blank,
      exam.score >= database.settings.passScore ? "Keçdi" : "Keçmədi",
      formatDate(exam.date)
    ]);
    downloadCsv("sinaq-neticeleri.csv", ["Ad", "Telefon", "Səviyyə", "Nəticə", "Düzgün", "Səhv", "Boş", "Status", "Tarix"], rows);
    toast("CSV hazırdır", "Sınaq nəticələri yükləndi.", "success");
  }

  function exportEntries() {
    const rows = store.getEntries().map(entry => [
      entry.name,
      entry.username,
      entry.mode === "register" ? "Qeydiyyat" : "Giriş",
      formatDate(entry.date),
      entry.status === "yeni" ? "Yeni" : "Baxıldı"
    ]);
    downloadCsv("girisler.csv", ["Ad", "İstifadəçi adı", "Növ", "Tarix", "Status"], rows);
    toast("CSV hazırdır", "Giriş müraciətləri yükləndi.", "success");
  }

  function exportBackup() {
    downloadBlob(
      new Blob([JSON.stringify(store.getDb(), null, 2)], { type: "application/json;charset=utf-8;" }),
      `rena-az-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    toast("Ehtiyat nüsxə hazırdır", "Bütün məlumatlar JSON faylına yazıldı.", "success");
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.students)) {
          throw new Error("invalid");
        }
        store.replaceDatabase(parsed);
        toast("Bərpa tamamlandı", "Məlumatlar fayldan yükləndi.", "success");
        renderAll();
      } catch (error) {
        toast("Bərpa alınmadı", "Fayl düzgün ehtiyat nüsxə deyil.", "error");
      }
    };
    reader.readAsText(file);
  }

  function bindEvents() {
    loginForm.addEventListener("submit", login);
    $("todayChip").textContent = new Date().toLocaleDateString("az-AZ", { day: "2-digit", month: "long", year: "numeric" });

    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => setView(item.dataset.view));
    });

    document.addEventListener("click", event => {
      const viewLink = event.target.closest("[data-view-link]");
      if (viewLink) {
        setView(viewLink.dataset.viewLink);
        return;
      }
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === "add-student") openStudentModal();
      else if (action === "logout") logout();
      else if (action === "clear-exams") {
        askConfirm("Nəticələri sil", "Bütün sınaq nəticələri silinsin? Bu əməliyyat geri qaytarılmır.", () => {
          store.clearExams();
          toast("Nəticələr silindi", "Bütün sınaq nəticələri təmizləndi.", "success");
          renderAll();
        });
      } else if (action === "reset-data") {
        askConfirm("Məlumatları sıfırla", "Bütün məlumatlar ilkin demo vəziyyətinə qaytarılsın?", () => {
          store.reset();
          toast("Sıfırlandı", "Demo məlumatlar bərpa olundu.", "success");
          renderAll();
        });
      }
    });

    document.addEventListener("click", event => {
      const closer = event.target.closest("[data-close-modal]");
      if (closer) closeModal(closer.closest(".modal"));
    });

    $("menuBtn").addEventListener("click", () => toggleSidebar(true));
    $("sidebarOverlay").addEventListener("click", closeSidebar);

    $("studentSearch").addEventListener("input", event => {
      state.studentSearch = event.target.value;
      renderStudents();
    });
    $("studentStatusFilter").addEventListener("change", event => {
      state.studentStatus = event.target.value;
      renderStudents();
    });
    $("rankingSearch").addEventListener("input", event => {
      state.rankingSearch = event.target.value;
      renderRankings();
    });
    $("examSearch").addEventListener("input", event => {
      state.examSearch = event.target.value;
      renderExams();
    });
    $("examLevelFilter").addEventListener("change", event => {
      state.examLevel = event.target.value;
      renderExams();
    });
    $("entrySearch").addEventListener("input", event => {
      state.entrySearch = event.target.value;
      renderEntries();
    });
    $("entryModeFilter").addEventListener("change", event => {
      state.entryMode = event.target.value;
      renderEntries();
    });

    $("studentForm").addEventListener("submit", submitStudent);
    $("passwordForm").addEventListener("submit", submitPassword);
    $("siteForm").addEventListener("submit", submitSite);
    $("rankingForm").addEventListener("submit", submitRanking);

    $("rankingVisible").addEventListener("change", event => {
      store.saveSettings({ rankingVisible: event.target.checked });
      toast(
        event.target.checked ? "Reytinq saytda görünəcək" : "Reytinq saytdan gizlədildi",
        "Dəyişiklik saytda növbəti açılışda tətbiq olunur.",
        "success"
      );
      renderRankings();
    });

    $("exportStudents").addEventListener("click", exportStudents);
    $("exportRanking").addEventListener("click", exportRanking);
    $("exportExams").addEventListener("click", exportExams);
    $("exportEntries").addEventListener("click", exportEntries);
    $("exportBackup").addEventListener("click", exportBackup);
    $("importBackup").addEventListener("change", event => {
      importBackup(event.target.files && event.target.files[0]);
      event.target.value = "";
    });

    $("confirmAccept").addEventListener("click", () => {
      const handler = state.confirmHandler;
      state.confirmHandler = null;
      closeModal($("confirmModal"));
      if (typeof handler === "function") handler();
    });

    $("deleteExamBtn").addEventListener("click", () => {
      const exam = store.getExams().find(item => item.id === state.currentExamId);
      if (!exam) return;
      askConfirm("Nəticəni sil", `"${exam.name}" adlı iştirakçının nəticəsi silinsin?`, () => {
        store.deleteExam(exam.id);
        closeModal($("examModal"));
        toast("Nəticə silindi", exam.name, "success");
        renderAll();
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        const open = document.querySelector(".modal:not([hidden])");
        if (open) closeModal(open);
        closeSidebar();
      }
    });

    window.addEventListener("storage", event => {
      if (event.key === store.DB_KEY) renderAll();
    });
  }

  function initGitHubSync() {
    const tokenKey = "rena.github.token";
    const autoKey = "rena.github.autoSync";
    const tokenInput = $("githubTokenInput");
    const repoInput = $("githubRepoInput");
    const branchInput = $("githubBranchInput");
    const pathInput = $("githubPathInput");
    const autoCheckbox = $("githubAutoSyncInput");
    const pushBtn = $("githubPushBtn");
    const statusEl = $("githubSyncStatus");

    // Prefill repo info from store.REMOTE
    if (store.REMOTE) {
      repoInput.value = `${store.REMOTE.owner}/${store.REMOTE.repo}`;
      branchInput.value = store.REMOTE.branch;
      pathInput.value = store.REMOTE.path;
    }

    // Load saved token and auto-sync
    const savedToken = localStorage.getItem(tokenKey);
    if (savedToken) tokenInput.value = savedToken;
    const autoSync = localStorage.getItem(autoKey) === "true";
    autoCheckbox.checked = autoSync;

    // Save token on input
    tokenInput.addEventListener("input", () => {
      localStorage.setItem(tokenKey, tokenInput.value);
    });

    // Save auto-sync preference
    autoCheckbox.addEventListener("change", () => {
      localStorage.setItem(autoKey, autoCheckbox.checked);
    });

    // Manual push
    pushBtn.addEventListener("click", async () => {
      if (!tokenInput.value) {
        statusEl.textContent = "Token daxil edin";
        statusEl.className = "sync-status error";
        return;
      }
      pushBtn.disabled = true;
      statusEl.textContent = "Yüklənir...";
      statusEl.className = "sync-status";
      try {
        await store.pushRemote();
        statusEl.textContent = "GitHub-a yazıldı";
        statusEl.className = "sync-status success";
      } catch (err) {
        statusEl.textContent = "Xəta: " + err.message;
        statusEl.className = "sync-status error";
      } finally {
        pushBtn.disabled = false;
      }
    });

    // Auto-sync on store changes (debounced)
    let syncTimeout = null;
    const unsubscribe = store.subscribe(() => {
      if (!autoCheckbox.checked) return;
      if (!tokenInput.value) return;
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(async () => {
        try {
          await store.pushRemote();
          statusEl.textContent = "Avtomatik yazıldı";
          statusEl.className = "sync-status success";
        } catch (err) {
          statusEl.textContent = "Avtomatik xəta: " + err.message;
          statusEl.className = "sync-status error";
        }
      }, 1500);
    });
  }
  bindEvents();
  initGitHubSync();

  let authed = false;
  try {
    authed = sessionStorage.getItem(store.SESSION_KEY) === "1";
  } catch (error) {
    authed = false;
  }

  if (authed) showApp();
  else showLogin();
})();

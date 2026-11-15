"use strict";

const revealElements = [...document.querySelectorAll("[data-reveal]")];
if (revealElements.length && "IntersectionObserver" in window) {
  const statistics = document.querySelector("[data-statistics]");
  const statValues = [...(statistics?.querySelectorAll("[data-count]") || [])];
  statValues.forEach(value => {
    value.dataset.target = value.dataset.count;
    value.textContent = "0";
  });

  function countUpStatistics() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    statValues.forEach(value => {
      const target = Number(value.dataset.target);
      if (prefersReducedMotion) {
        value.textContent = String(target);
        return;
      }

      const duration = 1300;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        value.textContent = String(Math.round(target * easedProgress));
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.matches("[data-statistics]")) {
        entry.target.classList.add("is-counting");
        countUpStatistics();
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
  document.documentElement.classList.add("reveal-enabled");
  revealElements.forEach(element => revealObserver.observe(element));
}

const input = document.querySelector("#problem-input");
const errorBox = document.querySelector(".inline-error");
const solveButton = document.querySelector(".solve-button");
const tabs = [...document.querySelectorAll(".mode-tab")];
let activeMode = "type";
let selectedImage = null;
let ocrPromise = null;
let lastGraph = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
}

function setMode(mode) {
  activeMode = mode;
  tabs.forEach(tab => {
    const selected = tab.dataset.mode === mode;
    tab.classList.toggle("selected", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  document.querySelectorAll(".mode-content").forEach(panel => panel.classList.toggle("active", panel.dataset.content === mode));
  clearError();
  if (mode === "draw") resizeDrawingCanvas();
}

tabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));

const dashboardDialog = document.querySelector(".dashboard-dialog");
const dashboardOpen = document.querySelector(".dashboard-open");
const loginDialog = document.querySelector(".login-dialog");
const loginDialogClose = document.querySelector(".login-dialog-close");
const headerLoginForm = document.querySelector(".header-login-form");
const loginDialogMessage = document.querySelector(".login-dialog-message");
const loginDialogTitle = document.querySelector("#login-title");
const loginDialogCopy = document.querySelector(".login-dialog-copy");
const loginDialogSubmitLabel = document.querySelector(".login-dialog-submit-label");
const loginUsernameLabel = document.querySelector('label[for="login-username"]');
const loginPassword = document.querySelector("#login-password");
const loginPasswordConfirm = document.querySelector("#register-password-confirm");
const loginMascot = document.querySelector(".login-mascot");
const loginMascotPupils = [...document.querySelectorAll(".login-mascot-pupil")];
const authModeButtons = [...document.querySelectorAll("[data-auth-mode]")];
const registerOnlyFields = [...document.querySelectorAll(".register-only")];
const dashboardClose = document.querySelector(".dashboard-close");
const dashboardLogout = document.querySelector(".dashboard-logout");
const loginScreen = document.querySelector(".login-screen");
const dashboardScreen = document.querySelector(".dashboard-screen");
const loginForm = document.querySelector(".login-form");
const accessCode = document.querySelector("#access-code");
const loginError = document.querySelector(".login-error");
const dashboardGrid = document.querySelector(".dashboard-grid");
const dashboardNotice = document.querySelector(".dashboard-notice");
const studentTotal = document.querySelector(".student-total");
const dashboardStorageKey = "rena-preparation-dashboard-v1";
const studentLevels = ["5–8-ci siniflər", "9-cu siniflər", "10-cu siniflər", "11-ci siniflər", "Abituriyentlər"];
const scheduleSlots = [
  { id: "days-2-4-time-14", days: "2-ci və 4-cü günlər", time: "14:00–16:00" },
  { id: "days-2-4-time-16", days: "2-ci və 4-cü günlər", time: "16:00–18:00" },
  { id: "days-1-3-time-14", days: "1-ci və 3-cü günlər", time: "14:00–16:00" },
  { id: "days-1-3-time-16", days: "1-ci və 3-cü günlər", time: "16:00–18:00" }
];
let dashboardData = null;

if (loginDialog && dashboardOpen && loginDialogClose && headerLoginForm && loginDialogMessage) {
  function setAuthMode(mode) {
    const isRegister = mode === "register";
    authModeButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.authMode === mode));
    });
    registerOnlyFields.forEach(field => {
      field.hidden = !isRegister;
      if (field instanceof HTMLInputElement) {
        field.disabled = !isRegister;
        field.required = isRegister;
      }
    });
    loginDialogTitle.textContent = isRegister ? "Yeni hesab yaradın" : "Hesaba daxil olun";
    loginDialogCopy.textContent = isRegister
      ? "Qeydiyyat üçün məlumatlarınızı doldurun."
      : "Davam etmək üçün giriş məlumatlarınızı qeyd edin.";
    loginDialogSubmitLabel.textContent = isRegister ? "Qeydiyyatdan keç" : "Daxil ol";
    loginUsernameLabel.textContent = isRegister ? "İstifadəçi adı" : "E-poçt və ya istifadəçi adı";
    loginPassword.autocomplete = isRegister ? "new-password" : "current-password";
    loginMascot.classList.remove("is-shy");
    loginMascotPupils.forEach(pupil => pupil.setAttribute("transform", "translate(0 0)"));
    loginDialogMessage.hidden = true;
    headerLoginForm.reset();
  }

  loginDialog.addEventListener("pointermove", event => {
    if (loginMascot.classList.contains("is-shy")) return;
    const bounds = loginMascot.getBoundingClientRect();
    const x = Math.max(-2.5, Math.min(2.5, ((event.clientX - bounds.left) / bounds.width - .5) * 8));
    const y = Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - .5) * 6));
    loginMascotPupils.forEach(pupil => pupil.setAttribute("transform", `translate(${x} ${y})`));
  });

  headerLoginForm.addEventListener("focusin", event => {
    loginMascot.classList.toggle("is-shy", event.target.type === "password");
  });
  headerLoginForm.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      loginMascot.classList.toggle(
        "is-shy",
        document.activeElement === loginPassword || document.activeElement === loginPasswordConfirm
      );
    });
  });

  authModeButtons.forEach(button => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  function closeLoginDialog() {
    if (!loginDialog.open || loginDialog.classList.contains("is-closing")) return;
    loginDialog.classList.add("is-closing");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    window.setTimeout(() => {
      loginDialog.classList.remove("is-closing");
      loginDialog.close();
    }, delay);
  }

  dashboardOpen.addEventListener("click", () => {
    setAuthMode("login");
    loginDialog.showModal();
    loginDialog.querySelector("#login-username").focus();
  });

  if (new URLSearchParams(window.location.search).get("login") === "1") {
    setAuthMode("login");
    loginDialog.showModal();
    loginDialog.querySelector("#login-username").focus();
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }

  loginDialogClose.addEventListener("click", closeLoginDialog);
  loginDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeLoginDialog();
  });
  loginDialog.addEventListener("click", event => {
    if (event.target === loginDialog) closeLoginDialog();
  });
  headerLoginForm.addEventListener("submit", event => {
    event.preventDefault();
    if (headerLoginForm.elements.password.value !==
        headerLoginForm.elements.passwordConfirm.value &&
        headerLoginForm.elements.passwordConfirm.value) {
      loginDialogMessage.textContent = "Şifrələr uyğun gəlmir.";
      loginDialogMessage.hidden = false;
      return;
    }
    const isRegister = !headerLoginForm.elements.passwordConfirm.disabled;
    loginDialogMessage.textContent = isRegister
      ? "Qeydiyyat xidməti hələ qoşulmayıb. Məlumatlarınız göndərilmədi."
      : "Giriş xidməti hələ qoşulmayıb. Məlumatlarınız göndərilmədi.";
    loginDialogMessage.hidden = false;
  });
}

function createEmptyDashboardData() {
  return Object.fromEntries(scheduleSlots.map(slot => [slot.id, []]));
}

function readDashboardData() {
  const saved = localStorage.getItem(dashboardStorageKey);
  if (saved === null) return createEmptyDashboardData();

  const parsed = JSON.parse(saved);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Saxlanmış qrafik formatı düzgün deyil.");
  }

  const data = createEmptyDashboardData();
  scheduleSlots.forEach(slot => {
    const students = parsed[slot.id];
    if (!Array.isArray(students)) throw new Error("Saxlanmış qrafik məlumatları oxuna bilmir.");
    data[slot.id] = students.map(student => {
      if (!student || typeof student !== "object" ||
          typeof student.id !== "string" || student.id.length > 100 ||
          typeof student.name !== "string" || !student.name.trim() || student.name.length > 60 ||
          !studentLevels.includes(student.level)) {
        throw new Error("Şagird siyahısında etibarsız məlumat var.");
      }
      return { id: student.id, name: student.name, level: student.level };
    });
  });
  return data;
}

function saveDashboardData() {
  localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboardData));
}

function showDashboardNotice(message, isError = true) {
  dashboardNotice.textContent = message;
  dashboardNotice.classList.toggle("is-error", isError);
  dashboardNotice.hidden = false;
}

function renderDashboard() {
  dashboardGrid.replaceChildren();
  let total = 0;

  scheduleSlots.forEach(slot => {
    const card = document.createElement("article");
    card.className = "schedule-card";

    const heading = document.createElement("div");
    heading.className = "schedule-card-heading";
    const headingCopy = document.createElement("div");
    const dayLabel = document.createElement("p");
    dayLabel.className = "schedule-days";
    dayLabel.textContent = slot.days;
    const title = document.createElement("h4");
    title.textContent = slot.time;
    headingCopy.append(dayLabel, title);
    const groupBadge = document.createElement("span");
    groupBadge.className = "schedule-group-badge";
    groupBadge.textContent = "Qrup";
    heading.append(headingCopy, groupBadge);

    const studentList = document.createElement("div");
    studentList.className = "schedule-students";
    const slotStudents = dashboardData[slot.id];
    total += slotStudents.length;

    const groupedStudents = studentLevels
      .map(level => ({ level, students: slotStudents.filter(student => student.level === level) }))
      .filter(group => group.students.length > 0);

    if (groupedStudents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "schedule-empty";
      empty.textContent = "Bu qrupda hələ şagird yoxdur.";
      studentList.append(empty);
    } else {
      groupedStudents.forEach(group => {
        const groupSection = document.createElement("section");
        groupSection.className = "schedule-level";
        const groupHeading = document.createElement("h5");
        groupHeading.textContent = group.level;
        const groupList = document.createElement("ul");
        group.students.forEach(student => {
          const item = document.createElement("li");
          const studentName = document.createElement("span");
          studentName.className = "schedule-student-name";
          studentName.textContent = student.name;
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "student-remove";
          removeButton.dataset.slot = slot.id;
          removeButton.dataset.student = student.id;
          removeButton.setAttribute("aria-label", `${student.name} adını sil`);
          removeButton.textContent = "×";
          item.append(studentName, removeButton);
          groupList.append(item);
        });
        groupSection.append(groupHeading, groupList);
        studentList.append(groupSection);
      });
    }

    const form = document.createElement("form");
    form.className = "student-form";
    form.dataset.slot = slot.id;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "studentName";
    nameInput.placeholder = "Şagirdin adı";
    nameInput.maxLength = 60;
    nameInput.autocomplete = "off";
    nameInput.setAttribute("aria-label", `${slot.days} ${slot.time} qrupu üçün şagirdin adı`);
    nameInput.required = true;
    const levelSelect = document.createElement("select");
    levelSelect.name = "studentLevel";
    levelSelect.setAttribute("aria-label", "Sinif və ya qrup");
    levelSelect.required = true;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Sinif / qrup";
    placeholder.disabled = true;
    placeholder.selected = true;
    levelSelect.append(placeholder);
    studentLevels.forEach(level => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level;
      levelSelect.append(option);
    });
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.className = "student-add";
    addButton.setAttribute("aria-label", "Şagirdi qrupa əlavə et");
    addButton.textContent = "+";
    form.append(nameInput, levelSelect, addButton);
    card.append(heading, studentList, form);
    dashboardGrid.append(card);
  });

  studentTotal.textContent = String(total);
}

function closeDashboard() {
  if (dashboardDialog.open) dashboardDialog.close();
}

if (dashboardDialog && dashboardOpen && dashboardClose && dashboardLogout &&
    loginScreen && dashboardScreen && loginForm && accessCode && loginError &&
    dashboardGrid && dashboardNotice && studentTotal) {
dashboardOpen.addEventListener("click", () => {
  loginError.hidden = true;
  accessCode.value = "";
  loginScreen.hidden = false;
  dashboardScreen.hidden = true;
  dashboardDialog.classList.add("is-login");
  dashboardDialog.showModal();
  accessCode.focus();
});

dashboardClose.addEventListener("click", closeDashboard);
dashboardLogout.addEventListener("click", closeDashboard);
dashboardDialog.addEventListener("click", event => {
  if (event.target === dashboardDialog) closeDashboard();
});
dashboardDialog.addEventListener("close", () => {
  loginScreen.hidden = false;
  dashboardScreen.hidden = true;
  dashboardDialog.classList.add("is-login");
  loginForm.reset();
  loginError.hidden = true;
  dashboardNotice.hidden = true;
});

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  if (accessCode.value !== "123456") {
    loginError.textContent = "Giriş kodu yanlışdır. Yenidən yoxlayın.";
    loginError.hidden = false;
    accessCode.select();
    return;
  }

  try {
    dashboardData = readDashboardData();
    renderDashboard();
    dashboardNotice.hidden = true;
    loginError.hidden = true;
    loginScreen.hidden = true;
    dashboardScreen.hidden = false;
    dashboardDialog.classList.remove("is-login");
  } catch (error) {
    loginError.textContent = error instanceof Error
      ? `Dashboard məlumatları açıla bilmədi: ${error.message}`
      : "Dashboard məlumatları açıla bilmədi.";
    loginError.hidden = false;
  }
});

dashboardGrid.addEventListener("submit", event => {
  const form = event.target.closest(".student-form");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get("studentName") || "").trim();
  const level = String(formData.get("studentLevel") || "");
  const slot = form.dataset.slot;
  if (!name || name.length > 60 || !studentLevels.includes(level) ||
      !Object.prototype.hasOwnProperty.call(dashboardData, slot)) {
    showDashboardNotice("Şagirdin adını və düzgün sinif/qrupu qeyd edin.");
    return;
  }

  const student = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name,
    level
  };
  dashboardData[slot].push(student);
  try {
    saveDashboardData();
  } catch (error) {
    dashboardData[slot].pop();
    showDashboardNotice(error instanceof Error
      ? `Məlumatı saxlamaq mümkün olmadı: ${error.message}`
      : "Məlumatı saxlamaq mümkün olmadı.");
    return;
  }
  dashboardNotice.hidden = true;
  renderDashboard();
});

dashboardGrid.addEventListener("click", event => {
  const removeButton = event.target.closest(".student-remove");
  if (!removeButton) return;
  const slot = removeButton.dataset.slot;
  const studentIndex = dashboardData[slot]?.findIndex(student => student.id === removeButton.dataset.student) ?? -1;
  if (studentIndex < 0) return;

  const [student] = dashboardData[slot].splice(studentIndex, 1);
  try {
    saveDashboardData();
  } catch (error) {
    dashboardData[slot].splice(studentIndex, 0, student);
    showDashboardNotice(error instanceof Error
      ? `Şagirdi silmək mümkün olmadı: ${error.message}`
      : "Şagirdi silmək mümkün olmadı.");
    return;
  }
  dashboardNotice.hidden = true;
  renderDashboard();
});
}

function tokenize(source) {
  const normalized = source.replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/²/g, "^2").replace(/,/g, ".");
  const tokens = normalized.match(/(?:\d+(?:\.\d*)?|\.\d+)|(?:[a-zA-Z]+)|[()+\-*/^=]/g) || [];
  if (tokens.join("") !== normalized.replace(/\s/g, "")) {
    throw new Error("İfadədə tanınmayan simvol var. +, −, ×, ÷, mötərizə və x istifadə et.");
  }
  return tokens;
}

function parsePolynomial(source) {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const isPrimaryStart = token => token !== undefined && (token === "(" || /^[a-zA-Z]+$/.test(token) || /^(?:\d|\.)/.test(token));
  const clean = values => values.map(value => Math.abs(value) < 1e-11 ? 0 : value);
  const add = (a, b, sign = 1) => clean([0, 1, 2].map(index => (a[index] || 0) + sign * (b[index] || 0)));
  const multiply = (a, b) => {
    const result = [0, 0, 0, 0, 0];
    a.forEach((left, i) => b.forEach((right, j) => { result[i + j] += left * right; }));
    if (Math.abs(result[3]) > 1e-10 || Math.abs(result[4]) > 1e-10) throw new Error("Hazırda yalnız x²-yə qədər çoxhədli ifadələr dəstəklənir.");
    return clean(result.slice(0, 3));
  };
  const divide = (a, b) => {
    if (b[1] !== 0 || b[2] !== 0 || b[0] === 0) throw new Error("Bölən sıfırdan fərqli sabit olmalıdır.");
    return clean(a.map(value => value / b[0]));
  };
  function expression() {
    let value = product();
    while (peek() === "+" || peek() === "-") {
      const operator = take();
      value = add(value, product(), operator === "+" ? 1 : -1);
    }
    return value;
  }
  function product() {
    let value = signed();
    while (peek() === "*" || peek() === "/" || isPrimaryStart(peek())) {
      const operator = peek() === "*" || peek() === "/" ? take() : "*";
      const next = signed();
      value = operator === "/" ? divide(value, next) : multiply(value, next);
    }
    return value;
  }
  function signed() {
    if (peek() === "+") { take(); return signed(); }
    if (peek() === "-") { take(); return signed().map(value => -value); }
    return power();
  }
  function power() {
    const base = primary();
    if (peek() !== "^") return base;
    take();
    const exponent = signed();
    if (exponent[1] !== 0 || exponent[2] !== 0 || !Number.isInteger(exponent[0]) || exponent[0] < 0 || exponent[0] > 2) {
      throw new Error("Qüvvət 0, 1 və ya 2 ola bilər.");
    }
    let result = [1, 0, 0];
    for (let i = 0; i < exponent[0]; i++) result = multiply(result, base);
    return result;
  }
  function primary() {
    const token = take();
    if (token === "(") {
      const value = expression();
      if (take() !== ")") throw new Error("Mötərizələri yoxla.");
      return value;
    }
    if (token && /^[a-zA-Z]+$/.test(token)) {
      if (token.toLowerCase() === "x") return [0, 1, 0];
      if (token.toLowerCase() === "pi") return [Math.PI, 0, 0];
      if (token.toLowerCase() === "e") return [Math.E, 0, 0];
      throw new Error(`«${token}» dəyişəni tanınmadı. Dəyişən kimi x istifadə et.`);
    }
    if (token && /^(?:\d|\.)/.test(token)) {
      const value = Number(token);
      if (Number.isFinite(value)) return [value, 0, 0];
    }
    throw new Error("Riyazi ifadəni yoxla; məsələn: 2x + 5 = 13.");
  }
  if (!tokens.length) throw new Error("Əvvəlcə məsələni daxil et.");
  const result = expression();
  if (position !== tokens.length) throw new Error("İfadənin yazılışını və mötərizələri yoxla.");
  return result;
}

function formatNumber(number) {
  if (Math.abs(number) < 1e-10) return "0";
  return String(Math.round(number * 1e8) / 1e8);
}

function formatPolynomial(poly) {
  const pieces = [];
  for (let degree = 2; degree >= 0; degree--) {
    const coefficient = poly[degree] || 0;
    if (Math.abs(coefficient) < 1e-10) continue;
    const magnitude = Math.abs(coefficient);
    const term = degree === 0 ? formatNumber(magnitude) : `${magnitude === 1 ? "" : formatNumber(magnitude)}x${degree === 1 ? "" : "^2"}`;
    if (!pieces.length) pieces.push(coefficient < 0 ? `-${term}` : term);
    else pieces.push(`${coefficient < 0 ? "−" : "+"} ${term}`);
  }
  return pieces.join(" ") || "0";
}

function formatInput(source) {
  return source.replace(/\s+/g, " ").trim().replace(/\*/g, "×").replace(/\bpi\b/gi, "π");
}

const wordProblemObjects = [
  { pattern: /alma(?:lar(?:ın|ı|ını)?|sı|sını)?/i, singular: "alma", plural: "alma", emoji: "🍎" },
  { pattern: /armud(?:u|ları|larını)?/i, singular: "armud", plural: "armud", emoji: "🍐" },
  { pattern: /portağal(?:ı|ları|larını)?/i, singular: "portağal", plural: "portağal", emoji: "🍊" },
  { pattern: /banan(?:ı|ları|larını)?/i, singular: "banan", plural: "banan", emoji: "🍌" },
  { pattern: /kitab(?:ı|ları|larını)?/i, singular: "kitab", plural: "kitab", emoji: "📚" },
  { pattern: /qələm(?:i|ləri|lərini)?/i, singular: "qələm", plural: "qələm", emoji: "✏️" },
  { pattern: /konfet(?:i|ləri|lərini)?/i, singular: "konfet", plural: "konfet", emoji: "🍬" },
  { pattern: /top(?:u|ları|larını)?/i, singular: "top", plural: "top", emoji: "⚽" },
  { pattern: /gül(?:ü|ləri|lərini)?/i, singular: "gül", plural: "gül", emoji: "🌷" },
  { pattern: /şar(?:ı|ları|larını)?/i, singular: "şar", plural: "şar", emoji: "🎈" },
  { pattern: /peçenye(?:si|ləri|lərini)?/i, singular: "peçenye", plural: "peçenye", emoji: "🍪" },
  { pattern: /ulduz(?:u|ları|larını)?/i, singular: "ulduz", plural: "ulduz", emoji: "⭐" }
];

function parseFractionWordProblem(source) {
  const fractionPattern = /\\frac\s*\{\s*(\d+)\s*\}\s*\{\s*(\d+)\s*\}|(\d+)\s*\/\s*(\d+)|([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g;
  const fractionValues = {
    "½": [1, 2], "⅓": [1, 3], "⅔": [2, 3], "¼": [1, 4], "¾": [3, 4],
    "⅕": [1, 5], "⅖": [2, 5], "⅗": [3, 5], "⅘": [4, 5],
    "⅙": [1, 6], "⅚": [5, 6], "⅛": [1, 8], "⅜": [3, 8],
    "⅝": [5, 8], "⅞": [7, 8]
  };
  const fractions = [];
  const ranges = [];
  for (const match of source.matchAll(fractionPattern)) {
    const numerator = Number(match[1] || match[3] || fractionValues[match[5]]?.[0]);
    const denominator = Number(match[2] || match[4] || fractionValues[match[5]]?.[1]);
    if (!denominator || numerator <= 0 || numerator >= denominator) return null;
    fractions.push({ numerator, denominator });
    ranges.push([match.index, match.index + match[0].length]);
  }
  if (fractions.length < 2 || !/\bqalan\b/i.test(source) || !/(?:^|[^A-Za-z])qaldı(?:$|[^A-Za-z])/i.test(source) || !/\bsat(?:dı|ıb|ırlar|ır|mış|acaq)/i.test(source)) return null;
  const item = wordProblemObjects.find(candidate => candidate.pattern.test(source));
  if (!item) return null;

  let amountSource = source;
  ranges.slice().reverse().forEach(([start, end]) => {
    amountSource = `${amountSource.slice(0, start)}${" ".repeat(end - start)}${amountSource.slice(end)}`;
  });
  const amounts = [...amountSource.matchAll(/\d+/g)].map(match => Number(match[0]));
  if (amounts.length !== 1 || !Number.isSafeInteger(amounts[0]) || amounts[0] <= 0) return null;

  const finalAmount = amounts[0];
  const phases = fractions.map(fraction => ({
    ...fraction,
    remainingNumerator: fraction.denominator - fraction.numerator
  }));
  let amountBefore = finalAmount;
  for (let index = phases.length - 1; index >= 0; index--) {
    const phase = phases[index];
    const previousAmount = amountBefore * phase.denominator / phase.remainingNumerator;
    phase.remaining = amountBefore;
    phase.startingAmount = previousAmount;
    phase.sold = previousAmount - amountBefore;
    amountBefore = previousAmount;
  }
  if (phases.some(phase => !Number.isSafeInteger(phase.startingAmount) || !Number.isSafeInteger(phase.sold)) ||
      !Number.isSafeInteger(amountBefore) || amountBefore <= 0) {
    throw new Error("Bu kəsrlərlə tam sayda alma alınmır. Məsələnin ədədlərini yoxla.");
  }
  return {
    kind: "fraction-word",
    answer: `${amountBefore} ${item.plural}`,
    wordProblem: { item, initialAmount: amountBefore, finalAmount, phases },
    steps: [
      ["Son mərhələdən başlayaq", `Satıcı son satışdan sonra ${finalAmount} alma saxlayıb.`],
      ...phases.slice().reverse().map((phase, index) => {
        const remainingNumerator = phase.remainingNumerator;
        const reverseCalculation = `${phase.remaining} ÷ ${remainingNumerator} × ${phase.denominator} = ${phase.startingAmount}`;
        return [
          `Kəsrli satışı geriyə hesablayaq (${fractions.length - index}-ci mərhələ)`,
          `Almaların ${phase.numerator}/${phase.denominator}-i satılıb, ${remainingNumerator}/${phase.denominator}-i qalıb. ${phase.remaining} qalan alma həmin hissədir: ${reverseCalculation} alma.`
        ];
      }),
      ...phases.map((phase, index) => [
        `İrəli yoxlayaq (${index + 1}-ci satış)`,
        `${phase.startingAmount} almanın ${phase.numerator}/${phase.denominator}-i = ${phase.sold} alma satıldı, ${phase.remaining} alma qaldı.`
      ]),
      ["Cavab", `Əvvəlcə ${amountBefore} alma gətirilib.`]
    ]
  };
}

function parseWordProblem(source) {
  const amounts = [...source.matchAll(/\d+/g)].map(match => Number(match[0]));
  if (amounts.length !== 2 || amounts.some(amount => !Number.isSafeInteger(amount) || amount > 10000)) return null;
  const item = wordProblemObjects.find(candidate => candidate.pattern.test(source));
  if (!item) return null;

  const isSubtraction = /(?:yedi|yedilər|yeyib|itirdi|itirdi|xərclədi|satdı|payladı|azal(?:dı|ıb)|çıxardı|götürdü|dostuna|qardaşına|bacısına|başqasına)/i.test(source);
  const hasAction = /(?:var|verdi|gətirdi|aldı|əlavə|artdı|yedi|yedilər|yeyib|itirdi|xərclədi|satdı|payladı|azal(?:dı|ıb)|çıxardı|götürdü|qazandı|dostu)/i.test(source);
  if (!hasAction) return null;

  const [first, second] = amounts;
  if (isSubtraction && second > first) {
    throw new Error("Çıxılan miqdar başlanğıc miqdarından çox ola bilməz. Məsələnin ədədlərini yoxla.");
  }
  const resultValue = isSubtraction ? first - second : first + second;
  const action = isSubtraction ? "çıxırıq" : "toplayırıq";
  const actionDetail = isSubtraction
    ? `${second} ${item.plural} götürüldü. Ona görə çıxma əməliyyatından istifadə edirik.`
    : `${second} ${item.plural} əlavə olundu. Ona görə toplama əməliyyatından istifadə edirik.`;
  return {
    kind: "word",
    answer: `${resultValue} ${item.plural}`,
    wordProblem: { first, second, item, isSubtraction },
    steps: [
      ["Başlanğıc miqdarı", `Əvvəl ${first} ${item.plural} var.`],
      ["Miqdardakı dəyişiklik", actionDetail],
      ["Həll əməliyyatı", `${first} ${isSubtraction ? "−" : "+"} ${second} ${action}.`]
    ]
  };
}

function makeFractionWordVisual(visual, problem) {
  const heading = document.createElement("p");
  heading.className = "word-visual-title";
  heading.textContent = "MƏSƏLƏNİN ŞƏKİLLƏ VƏ QRAFİKLƏ HƏLLİ";

  const seller = document.createElement("div");
  seller.className = "fraction-seller";
  seller.innerHTML = `<span class="fraction-person" aria-hidden="true">👦</span><span>Satıcı <strong>${problem.initialAmount}</strong> ${problem.item.plural} gətirdi</span>`;

  const unit = Math.max(1, Math.ceil(problem.initialAmount / 12));
  const scaleNote = document.createElement("p");
  scaleNote.className = "fraction-scale-note";
  scaleNote.textContent = `Şəkildə miqyas: 1 alma işarəsi təxminən ${unit} almanı göstərir`;
  const makeApples = (count, label, compact = false) => {
    const group = document.createElement("div");
    group.className = `fraction-apples${compact ? " compact" : ""}`;
    group.setAttribute("role", "img");
    group.setAttribute("aria-label", label);
    const shown = Math.min(12, Math.ceil(count / unit));
    for (let index = 0; index < shown; index++) {
      const apple = document.createElement("span");
      apple.className = "fraction-apple";
      apple.style.setProperty("--item-index", String(index));
      apple.textContent = problem.item.emoji;
      apple.setAttribute("aria-hidden", "true");
      group.append(apple);
    }
    return group;
  };

  const timeline = document.createElement("div");
  timeline.className = "fraction-timeline";
  const initialStage = document.createElement("article");
  initialStage.className = "fraction-stage initial";
  const initialHeading = document.createElement("strong");
  initialHeading.textContent = `Başlanğıc · ${problem.initialAmount} ${problem.item.plural}`;
  initialStage.append(initialHeading, makeApples(problem.initialAmount, `${problem.initialAmount} alma, hər alma şəkli təxminən ${unit} almanı göstərir`));
  timeline.append(initialStage);

  problem.phases.forEach((phase, index) => {
    const stage = document.createElement("article");
    stage.className = "fraction-stage";
    stage.style.animationDelay = `${(index + 1) * 180}ms`;
    const headingText = document.createElement("strong");
    headingText.textContent = `${index + 1}-ci satış · ${phase.numerator}/${phase.denominator} satıldı`;
    const amountText = document.createElement("span");
    amountText.className = "fraction-sale";
    amountText.textContent = `${phase.startingAmount} − ${phase.sold} = ${phase.remaining} alma`;
    const groups = document.createElement("div");
    groups.className = "fraction-stage-groups";
    groups.append(
      makeApples(phase.sold, `${phase.sold} satılan alma`, true),
      makeApples(phase.remaining, `${phase.remaining} qalan alma`, true)
    );
    const legend = document.createElement("div");
    legend.className = "fraction-legend";
    legend.innerHTML = `<span><i class="sold-key"></i>satıldı: ${phase.sold}</span><span><i class="remaining-key"></i>qaldı: ${phase.remaining}</span>`;
    stage.append(headingText, amountText, groups, legend);
    timeline.append(stage);
  });

  const chart = document.createElement("div");
  chart.className = "fraction-chart";
  const chartHeading = document.createElement("p");
  chartHeading.className = "fraction-chart-title";
  chartHeading.textContent = "HƏR SATIŞDAN SONRA QALAN ALMALAR";
  const chartSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chartSvg.setAttribute("viewBox", "0 0 360 150");
  chartSvg.setAttribute("role", "img");
  chartSvg.setAttribute("aria-label", `Başlanğıcda ${problem.initialAmount} alma, satışlardan sonra ${problem.phases.map(phase => phase.remaining).join(" və ")} alma qalır`);
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.setAttribute("id", "fraction-bar-gradient");
  gradient.setAttribute("x1", "0");
  gradient.setAttribute("x2", "0");
  gradient.setAttribute("y1", "0");
  gradient.setAttribute("y2", "1");
  const gradientStart = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  gradientStart.setAttribute("offset", "0%");
  gradientStart.setAttribute("stop-color", "#FF9800");
  const gradientEnd = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  gradientEnd.setAttribute("offset", "100%");
  gradientEnd.setAttribute("stop-color", "#FFB74D");
  gradient.append(gradientStart, gradientEnd);
  defs.append(gradient);
  chartSvg.append(defs);
  const chartData = [
    { value: problem.initialAmount, label: "Başlanğıc" },
    ...problem.phases.map((phase, index) => ({ value: phase.remaining, label: `${index + 1}-ci satış` }))
  ];
  const baseY = 116;
  const maxHeight = 82;
  const maxValue = problem.initialAmount;
  const chartTop = 22;
  [0, 0.5, 1].forEach(ratio => {
    const y = baseY - maxHeight * ratio;
    const gridline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridline.setAttribute("x1", "32");
    gridline.setAttribute("x2", "346");
    gridline.setAttribute("y1", String(y));
    gridline.setAttribute("y2", String(y));
    gridline.setAttribute("class", "fraction-gridline");
    chartSvg.append(gridline);
  });
  chartData.forEach((point, index) => {
    const x = 56 + index * (284 / Math.max(1, chartData.length - 1));
    const height = Math.max(4, point.value / maxValue * maxHeight);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x - 15));
    rect.setAttribute("y", String(baseY));
    rect.setAttribute("width", "30");
    rect.setAttribute("height", "0");
    rect.setAttribute("rx", "5");
    rect.setAttribute("class", "fraction-bar");
    rect.style.animationDelay = `${index * 180}ms`;
    chartSvg.append(rect);
    rect.setAttribute("y", String(baseY - height));
    rect.setAttribute("height", String(height));

    const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
    value.setAttribute("x", String(x));
    value.setAttribute("y", String(Math.max(chartTop, baseY - height - 7)));
    value.setAttribute("class", "fraction-chart-value");
    value.textContent = String(point.value);
    chartSvg.append(value);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(x));
    label.setAttribute("y", "137");
    label.setAttribute("class", "fraction-chart-label");
    label.textContent = point.label;
    chartSvg.append(label);
  });
  chart.append(chartHeading, chartSvg);
  visual.append(heading, seller, scaleNote, timeline, chart);
}

function solveMath(source) {
  const isFunction = /^\s*y\s*=/i.test(source);
  const cleaned = source.trim().replace(/^\s*y\s*=\s*/i, "");
  const equalParts = cleaned.split("=");
  if (equalParts.length > 2) throw new Error("Məsələdə yalnız bir bərabərlik işarəsi ola bilər.");
  if (equalParts.length === 1) {
    const value = parsePolynomial(cleaned);
    if (isFunction || value[1] !== 0 || value[2] !== 0) {
      return {
        kind: "function",
        graph: value,
        answer: `y = ${formatPolynomial(value)}`,
        steps: [
          ["İfadəni oxuyaq", `${formatInput(cleaned)} funksiyasını standart çoxhədli şəklində yazırıq.`],
          ["Qrafik üçün hazırdır", `y = ${formatPolynomial(value)}. Qrafik seçilmiş x qiymətləri üçün hesablanır.`]
        ]
      };
    }
    return {
      kind: "arithmetic",
      answer: formatNumber(value[0]),
      steps: [
        ["Əməliyyat ardıcıllığı", "Əvvəl mötərizələri, sonra vurma və bölməni, sonda toplama və çıxmanı hesablayırıq."],
        ["Hesablayırıq", `${formatInput(cleaned)} = ${formatNumber(value[0])}.`]
      ]
    };
  }

  const left = parsePolynomial(equalParts[0]);
  const right = parsePolynomial(equalParts[1]);
  const polynomial = left.map((value, index) => value - right[index]);
  const [constant, linear, quadratic] = polynomial;
  const steps = [
    ["Hədləri müqayisə edək", `${formatPolynomial(left)} = ${formatPolynomial(right)}.`],
    ["Oxşar hədləri birləşdirək", `${formatPolynomial(polynomial)} = 0.`]
  ];
  if (Math.abs(quadratic) > 1e-10) {
    const discriminant = linear * linear - 4 * quadratic * constant;
    steps.push(["Diskriminantı tapaq", `D = b² − 4ac = ${formatNumber(discriminant)}.`]);
    if (discriminant < -1e-10) return { kind: "equation", graph: polynomial, steps, answer: "Həqiqi kök yoxdur" };
    if (Math.abs(discriminant) <= 1e-10) {
      const root = -linear / (2 * quadratic);
      steps.push(["İkiqat kökü hesablayaq", `x = −b / 2a = ${formatNumber(root)}.`]);
      return { kind: "equation", graph: polynomial, roots: [root], steps, answer: `x = ${formatNumber(root)}` };
    }
    const roots = [(-linear - Math.sqrt(discriminant)) / (2 * quadratic), (-linear + Math.sqrt(discriminant)) / (2 * quadratic)].sort((a, b) => a - b);
    steps.push(["Kökləri tapaq", `x = (−b ± √D) / 2a = ${formatNumber(roots[0])} və ${formatNumber(roots[1])}.`]);
    return { kind: "equation", graph: polynomial, roots, steps, answer: `x₁ = ${formatNumber(roots[0])},  x₂ = ${formatNumber(roots[1])}` };
  }
  if (Math.abs(linear) > 1e-10) {
    const root = -constant / linear;
    steps.push(["x-i sərbəst buraxaq", `${formatNumber(linear)}x = ${formatNumber(-constant)}.`]);
    steps.push(["Hər iki tərəfi əmsala bölək", `x = ${formatNumber(-constant)} / ${formatNumber(linear)} = ${formatNumber(root)}.`]);
    return { kind: "equation", graph: polynomial, roots: [root], steps, answer: `x = ${formatNumber(root)}` };
  }
  const hasSolution = Math.abs(constant) <= 1e-10;
  steps.push(["Nəticəni yoxlayaq", hasSolution ? "Bərabərlik hər bir x üçün doğrudur." : "Sabit bərabərlik alınır və bu, yanlışdır."]);
  return { kind: "equation", graph: polynomial, roots: [], steps, answer: hasSolution ? "İstənilən x" : "Həll yoxdur" };
}

function drawGraph(polynomial, roots) {
  const canvas = document.querySelector(".solution-graph");
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const width = bounds.width;
  const height = bounds.height;
  const xs = roots.length ? [Math.min(...roots) - 3, Math.max(...roots) + 3] : [-5, 5];
  if (xs[1] - xs[0] < 5) { xs[0] -= 2; xs[1] += 2; }
  const evaluate = x => polynomial[0] + polynomial[1] * x + polynomial[2] * x * x;
  const samples = Array.from({ length: 101 }, (_, index) => evaluate(xs[0] + index * (xs[1] - xs[0]) / 100));
  const maxY = Math.max(4, ...samples.map(Math.abs));
  const ys = [-maxY * 1.15, maxY * 1.15];
  const px = x => 29 + (x - xs[0]) / (xs[1] - xs[0]) * (width - 42);
  const py = y => 8 + (ys[1] - y) / (ys[1] - ys[0]) * (height - 24);
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,183,77,.14)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 8; index++) {
    const x = 29 + index * (width - 42) / 8;
    const y = 8 + index * (height - 24) / 5;
    ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, height - 16); ctx.stroke();
    if (index <= 5) { ctx.beginPath(); ctx.moveTo(29, y); ctx.lineTo(width - 13, y); ctx.stroke(); }
  }
  ctx.strokeStyle = "rgba(255,152,0,.48)";
  ctx.beginPath(); ctx.moveTo(29, py(0)); ctx.lineTo(width - 13, py(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px(0), 8); ctx.lineTo(px(0), height - 16); ctx.stroke();
  ctx.beginPath();
  const progress = { value: 0 };
  const start = performance.now();
  const animate = now => {
    progress.value = Math.min(1, (now - start) / 850);
    const last = Math.max(1, Math.floor(progress.value * (samples.length - 1)));
    ctx.clearRect(29, 8, width - 42, height - 24);
    ctx.strokeStyle = "rgba(255,183,77,.14)";
    for (let index = 0; index <= 8; index++) {
      const x = 29 + index * (width - 42) / 8;
      const y = 8 + index * (height - 24) / 5;
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, height - 16); ctx.stroke();
      if (index <= 5) { ctx.beginPath(); ctx.moveTo(29, y); ctx.lineTo(width - 13, y); ctx.stroke(); }
    }
    ctx.strokeStyle = "rgba(255,152,0,.48)";
    ctx.beginPath(); ctx.moveTo(29, py(0)); ctx.lineTo(width - 13, py(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px(0), 8); ctx.lineTo(px(0), height - 16); ctx.stroke();
    ctx.beginPath();
    for (let index = 0; index <= last; index++) {
      const x = xs[0] + index * (xs[1] - xs[0]) / (samples.length - 1);
      const y = Math.max(-maxY * 1.1, Math.min(maxY * 1.1, samples[index]));
      if (!index) ctx.moveTo(px(x), py(y)); else ctx.lineTo(px(x), py(y));
    }
    ctx.strokeStyle = "#FF9800"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    roots.forEach(root => {
      if (root >= xs[0] && root <= xs[1]) {
        ctx.beginPath(); ctx.arc(px(root), py(0), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD54F"; ctx.fill();
      }
    });
    if (progress.value < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function revealAnswer() {
  document.querySelector(".answer-box").classList.add("revealed");
  document.querySelector(".answer-value").style.filter = "none";
  document.querySelector(".answer-scratch").classList.add("cleared");
}

function paintAnswerScratch() {
  const canvas = document.querySelector(".answer-scratch");
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, bounds.width, bounds.height);
}

function updateScratchProgress() {
  const canvas = document.querySelector(".answer-scratch");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let visiblePixels = 0;
  let totalPixels = 0;
  const stride = 4 * 12;
  for (let index = 3; index < pixels.length; index += stride) {
    totalPixels++;
    if (pixels[index] > 16) visiblePixels++;
  }
  if (totalPixels && visiblePixels / totalPixels < 0.45) revealAnswer();
}

const answerScratch = document.querySelector(".answer-scratch");
let scratchingAnswer = false;
function startAnswerScratch(event) {
  scratchingAnswer = true;
  if (event.pointerId !== undefined) answerScratch.setPointerCapture(event.pointerId);
  const bounds = answerScratch.getBoundingClientRect();
  const context = answerScratch.getContext("2d");
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(event.clientX - bounds.left, event.clientY - bounds.top, 17, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(event.clientX - bounds.left, event.clientY - bounds.top);
}
function moveAnswerScratch(event) {
  if (!scratchingAnswer) return;
  const bounds = answerScratch.getBoundingClientRect();
  const context = answerScratch.getContext("2d");
  context.globalCompositeOperation = "destination-out";
  context.lineWidth = 34;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineTo(event.clientX - bounds.left, event.clientY - bounds.top);
  context.stroke();
}
function finishAnswerScratch() {
  if (!scratchingAnswer) return;
  scratchingAnswer = false;
  updateScratchProgress();
}
answerScratch.addEventListener("pointerdown", startAnswerScratch);
answerScratch.addEventListener("pointermove", moveAnswerScratch);
answerScratch.addEventListener("pointerup", finishAnswerScratch);
["pointercancel", "lostpointercapture"].forEach(name => answerScratch.addEventListener(name, finishAnswerScratch));
answerScratch.addEventListener("mousedown", startAnswerScratch);
answerScratch.addEventListener("mousemove", moveAnswerScratch);
["mouseup", "mouseleave"].forEach(name => answerScratch.addEventListener(name, finishAnswerScratch));
function renderSolution(problem, result) {
  document.querySelector(".empty-state").hidden = true;
  document.querySelector(".solution-state").hidden = false;
  document.querySelector(".solution-problem strong").textContent = formatInput(problem);
  document.querySelector(".answer-value").textContent = result.answer;
  document.querySelector(".answer-value").style.removeProperty("filter");
  const isWordProblem = ["word", "fraction-word", "word-ai"].includes(result.kind);
  document.querySelector(".graph-caption").textContent = result.kind === "word-ai" ? "Məsələyə uyğun şəkilli izah" : result.kind === "arithmetic" ? "Qrafik tələb olunmur" : "x oxu üzrə qiymətlər";
  document.querySelector(".graph-wrap").hidden = result.kind === "arithmetic" || isWordProblem;
  document.querySelector(".answer-box").classList.remove("revealed");
  answerScratch.classList.remove("cleared");
  const stepsList = document.querySelector(".steps-list");
  stepsList.replaceChildren();
  result.steps.forEach(([title, detail], index) => {
    const step = document.createElement("div");
    step.className = "solution-step";
    step.style.animationDelay = `${index * 220}ms`;
    const number = document.createElement("b");
    number.textContent = String(index + 1);
    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = title;
    copy.append(heading, document.createTextNode(detail));
    step.append(number, copy);
    stepsList.append(step);
  });
  lastGraph = result.kind === "equation" || result.kind === "function"
    ? { polynomial: result.graph, roots: result.roots || [] }
    : null;
  if (lastGraph) drawGraph(lastGraph.polynomial, lastGraph.roots);
  paintAnswerScratch();
}

function isMathExpression(problem) {
  return /^[\d\s.,+\-−–×*/÷^()=xXπpieE]*$/.test(problem);
}

let serverBusyDialog = null;

function showServerBusyModal() {
  if (!serverBusyDialog) {
    serverBusyDialog = document.createElement("dialog");
    serverBusyDialog.className = "busy-dialog";
    serverBusyDialog.setAttribute("aria-labelledby", "busy-dialog-title");
    serverBusyDialog.innerHTML = `
      <button class="busy-dialog-close" type="button" aria-label="Bağla">×</button>
      <div class="busy-anim" aria-hidden="true">
        <span class="busy-ring"></span>
        <span class="busy-core">🛠️</span>
        <span class="busy-orbit busy-orbit-1">＋</span>
        <span class="busy-orbit busy-orbit-2">−</span>
        <span class="busy-orbit busy-orbit-3">×</span>
        <span class="busy-orbit busy-orbit-4">÷</span>
      </div>
      <p class="busy-kicker">BİR AZ SƏBİR</p>
      <h3 class="busy-title" id="busy-dialog-title">VALEH ÜZƏRİNDƏ İŞLƏYİR</h3>
      <p class="busy-copy">Səbirli olun :)</p>
      <div class="busy-dots" aria-hidden="true"><i></i><i></i><i></i></div>
    `;
    serverBusyDialog.querySelector(".busy-dialog-close").addEventListener("click", () => serverBusyDialog.close());
    serverBusyDialog.addEventListener("click", event => {
      if (event.target === serverBusyDialog) serverBusyDialog.close();
    });
    document.body.append(serverBusyDialog);
  }
  if (!serverBusyDialog.open) serverBusyDialog.showModal();
}

function serverBusyError() {
  const error = new Error("Server hazır deyil.");
  error.serverBusy = true;
  return error;
}

async function analyzeWordProblem(problem) {
  let response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem })
    });
  } catch {
    throw serverBusyError();
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404 || response.status === 503 || response.status >= 500 || !payload.error) {
      throw serverBusyError();
    }
    throw new Error(payload.error);
  }
  if (!payload.understood || !payload.wordProblem || !Array.isArray(payload.wordProblem.actions) || !Array.isArray(payload.steps)) {
    throw new Error("Məsələnin məzmunu dəqiq anlaşılmadı. Mətni bir az aydınlaşdırıb yenidən yoxla.");
  }
  return {
    kind: "word-ai",
    answer: payload.answer,
    wordProblem: payload.wordProblem,
    steps: payload.steps.map(step => [step.title, step.detail])
  };
}

// Həll serveri yalnız lokal inkişafda işləyir. Sayt statik hostinqdə
// (GitHub Pages) yerləşəndə backend olmadığı üçün dərhal mehriban modal göstərilir.
const localSolverHosts = ["localhost", "127.0.0.1", "::1"];
const isLocalDev = localSolverHosts.includes(location.hostname);

solveButton.addEventListener("click", async () => {
  clearError();
  const problem = input.value.trim();
  if (!problem) {
    showError("Həll etmək üçün məsələni yaz və ya aşağıdakı nümunələrdən birini seç.");
    input.focus();
    return;
  }
  if (problem.length > 2000) {
    showError("Məsələ çox uzundur. Zəhmət olmasa 2 000 simvoldan qısa yaz.");
    return;
  }
  if (!isLocalDev) {
    showServerBusyModal();
    return;
  }
  const originalButtonText = solveButton.innerHTML;
  solveButton.disabled = true;
  solveButton.innerHTML = isMathExpression(problem) ? "Həll edilir…" : "Məsələ təhlil olunur…";
  try {
    const result = isMathExpression(problem)
      ? solveMath(problem)
      : await analyzeWordProblem(problem);
    renderSolution(problem, result);
  } catch (error) {
    if (error && error.serverBusy) {
      showServerBusyModal();
    } else {
      showError(error instanceof Error ? error.message : "Məsələni həll edərkən xəta baş verdi.");
    }
  } finally {
    solveButton.disabled = false;
    solveButton.innerHTML = originalButtonText;
  }
});

document.querySelectorAll(".example-chip").forEach(chip => chip.addEventListener("click", () => {
  setMode("type");
  input.value = chip.dataset.example;
  solveButton.click();
}));
function resizeDrawingCanvas() {
  const canvas = document.querySelector(".drawing-canvas");
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  const previous = document.createElement("canvas");
  previous.width = canvas.width;
  previous.height = canvas.height;
  if (previous.width && previous.height) previous.getContext("2d").drawImage(canvas, 0, 0);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.lineWidth = 2.4;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#FFB74D";
  if (previous.width && previous.height) context.drawImage(previous, 0, 0, rect.width, rect.height);
}

const drawingCanvas = document.querySelector(".drawing-canvas");
let drawing = false;
drawingCanvas.addEventListener("pointerdown", event => {
  drawing = true;
  drawingCanvas.setPointerCapture(event.pointerId);
  const bounds = drawingCanvas.getBoundingClientRect();
  drawingCanvas.getContext("2d").beginPath();
  drawingCanvas.getContext("2d").moveTo(event.clientX - bounds.left, event.clientY - bounds.top);
});
drawingCanvas.addEventListener("pointermove", event => {
  if (!drawing) return;
  const bounds = drawingCanvas.getBoundingClientRect();
  const context = drawingCanvas.getContext("2d");
  context.lineTo(event.clientX - bounds.left, event.clientY - bounds.top);
  context.stroke();
});
["pointerup", "pointercancel", "lostpointercapture"].forEach(name => drawingCanvas.addEventListener(name, () => { drawing = false; }));
document.querySelector(".clear-canvas").addEventListener("click", () => drawingCanvas.getContext("2d").clearRect(0, 0, drawingCanvas.width, drawingCanvas.height));
window.addEventListener("resize", () => {
  resizeDrawingCanvas();
  if (lastGraph) drawGraph(lastGraph.polynomial, lastGraph.roots);
  if (!document.querySelector(".solution-state").hidden && !document.querySelector(".answer-box").classList.contains("revealed")) {
    paintAnswerScratch();
  }
});

function displayImage(file) {
  clearError();
  if (!file || !file.type.startsWith("image/")) { showError("Zəhmət olmasa JPG, PNG və ya WEBP formatında şəkil seç."); return; }
  if (file.size > 10 * 1024 * 1024) { showError("Şəklin ölçüsü 10 MB-dan çox olmamalıdır."); return; }
  selectedImage = file;
  const preview = document.querySelector(".image-preview");
  preview.querySelector("img").src = URL.createObjectURL(file);
  preview.hidden = false;
  document.querySelector(".upload-zone").hidden = true;
  document.querySelector(".image-recognize").hidden = false;
}

document.querySelector("#image-input").addEventListener("change", event => displayImage(event.target.files[0]));
document.querySelector(".remove-image").addEventListener("click", () => {
  const image = document.querySelector(".image-preview img");
  if (image.src.startsWith("blob:")) URL.revokeObjectURL(image.src);
  image.removeAttribute("src");
  document.querySelector(".image-preview").hidden = true;
  document.querySelector(".upload-zone").hidden = false;
  document.querySelector(".image-recognize").hidden = true;
  document.querySelector("#image-input").value = "";
  selectedImage = null;
});
const uploadZone = document.querySelector(".upload-zone");
uploadZone.addEventListener("dragover", event => { event.preventDefault(); uploadZone.classList.add("dragover"); });
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));
uploadZone.addEventListener("drop", event => { event.preventDefault(); uploadZone.classList.remove("dragover"); displayImage(event.dataTransfer.files[0]); });

async function loadOcr() {
  if (!ocrPromise) {
    ocrPromise = new Promise((resolve, reject) => {
      if (window.Tesseract) { resolve(window.Tesseract); return; }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error("Mətn tanıma kitabxanası yüklənmədi."));
      script.onerror = () => reject(new Error("Mətn tanıma üçün internet bağlantısı lazımdır. Məsələni mətn sahəsinə də yaza bilərsən."));
      document.head.append(script);
    });
  }
  return ocrPromise;
}

async function recognizeText(source, button) {
  clearError();
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = "Mətn tanınır…";
  try {
    const tesseract = await loadOcr();
    const result = await tesseract.recognize(source, "eng");
    const text = result.data.text.trim();
    if (!text) throw new Error("Şəkildə oxuna bilən mətn tapılmadı. Daha aydın şəkil çək və ya məsələni yaz.");
    setMode("type");
    input.value = text;
    input.focus();
    showError("Tanınan mətni yoxla və lazım olsa düzəlt, sonra «Həll yolunu göstər» düyməsinə bas.");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Mətn tanınarkən xəta baş verdi.");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

document.querySelector(".image-recognize").addEventListener("click", event => {
  if (selectedImage) recognizeText(selectedImage, event.currentTarget);
});
document.querySelector(".draw-recognize").addEventListener("click", event => {
  const canvas = document.createElement("canvas");
  canvas.width = drawingCanvas.width;
  canvas.height = drawingCanvas.height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(drawingCanvas, 0, 0);
  recognizeText(canvas, event.currentTarget);
});
input.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") solveButton.click();
});

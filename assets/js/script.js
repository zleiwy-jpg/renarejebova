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
      ? "Qeydiyyat üçün ad, e-poçt və şifrəni yazın."
      : "Davam etmək üçün e-poçt və şifrənizi yazın.";
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
    const username = headerLoginForm.elements.username.value.trim();
    const fullName = isRegister ? headerLoginForm.elements.fullName.value.trim() : username;

    if (window.RenaData && typeof window.RenaData.addEntry === "function") {
      window.RenaData.addEntry({
        name: fullName || username,
        username,
        mode: isRegister ? "register" : "login"
      });
    }

    loginDialogMessage.textContent = isRegister
      ? "Qeydiyyat müraciətiniz qeydə alındı. Təsdiq üçün sizinlə əlaqə saxlanılacaq."
      : "Giriş müraciətiniz qeydə alındı.";
    loginDialogMessage.hidden = false;
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

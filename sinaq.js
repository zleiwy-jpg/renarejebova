"use strict";

const questionCount = 20;
const examDurationSeconds = 15 * 60;
const answerLetters = ["A", "B", "C", "D"];
const startForm = document.querySelector(".exam-start");
const quizSection = document.querySelector(".exam-quiz");
const resultSection = document.querySelector(".exam-result");
const questionArea = document.querySelector(".quiz-question-area");
const errorMessage = document.querySelector(".exam-error");
const nameInput = document.querySelector("#student-name");
const phoneInput = document.querySelector("#student-phone");
const levelInput = document.querySelector("#student-level");
const progressBar = document.querySelector(".quiz-progress");
const finishButton = document.querySelector(".finish-exam");
const previousButton = document.querySelector(".previous-question");
const nextButton = document.querySelector(".next-question");
const timerElement = document.querySelector(".quiz-timer");
const timerValue = document.querySelector(".timer-value");
const timerRing = document.querySelector(".timer-ring-progress");
let attempt = null;
let finishArmed = false;
let examDeadline = 0;
let timerIntervalId = null;
let lastDisplayedTime = "";

function randomInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createQuestion(topic, prompt, answer, distractors) {
  const correctAnswer = String(answer);
  const options = [...new Set([correctAnswer, ...distractors.map(String)])];
  let nextDistractor = 1;
  while (options.length < 4) {
    const numericAnswer = Number(correctAnswer);
    const candidate = Number.isFinite(numericAnswer)
      ? String(numericAnswer + nextDistractor)
      : `Variant ${nextDistractor}`;
    if (!options.includes(candidate)) options.push(candidate);
    nextDistractor += 1;
  }
  return { topic, prompt, answer: correctAnswer, options: shuffle(options.slice(0, 4)) };
}

function numericQuestion(topic, prompt, answer, step = 1) {
  return createQuestion(topic, prompt, answer, [
    answer + step,
    answer - step,
    answer + (step * 2)
  ]);
}

function createMiddleSchoolBank() {
  const factories = [
    () => {
      const first = randomInteger(24, 178);
      const second = randomInteger(14, 96);
      return numericQuestion("Ədədlər", `${first} + ${second} ifadəsinin qiymətini tapın.`, first + second, 10);
    },
    () => {
      const first = randomInteger(90, 260);
      const second = randomInteger(18, first - 1);
      return numericQuestion("Ədədlər", `${first} − ${second} fərqini hesablayın.`, first - second, 10);
    },
    () => {
      const first = randomInteger(3, 12);
      const second = randomInteger(3, 12);
      return numericQuestion("Vurma", `${first} · ${second} hasilini tapın.`, first * second, 2);
    },
    () => {
      const divisor = randomInteger(2, 12);
      const quotient = randomInteger(2, 12);
      return numericQuestion("Bölmə", `${divisor * quotient} : ${divisor} ifadəsini hesablayın.`, quotient, 2);
    },
    () => {
      const percent = [10, 20, 25, 50][randomInteger(0, 3)];
      const base = randomInteger(2, 20) * 20;
      return numericQuestion("Faiz", `${base} ədədinin ${percent}%-ni tapın.`, (base * percent) / 100, 5);
    },
    () => {
      const value = randomInteger(3, 24);
      const offset = randomInteger(4, 18);
      return numericQuestion("Tənlik", `x + ${offset} = ${value + offset} tənliyində x-i tapın.`, value, 2);
    },
    () => {
      const coefficient = randomInteger(2, 8);
      const value = randomInteger(2, 12);
      const offset = randomInteger(1, 15);
      return numericQuestion("Tənlik", `${coefficient}x + ${offset} = ${coefficient * value + offset} tənliyini həll edin.`, value, 2);
    },
    () => {
      const denominator = [2, 3, 4, 5, 10][randomInteger(0, 4)];
      const numerator = randomInteger(1, denominator - 1);
      const base = randomInteger(2, 16) * denominator;
      return numericQuestion("Kəsrlər", `${base} ədədinin ${numerator}/${denominator} hissəsini tapın.`, (base * numerator) / denominator, 3);
    },
    () => {
      const length = randomInteger(4, 19);
      const width = randomInteger(3, 14);
      return numericQuestion("Perimetr", `Uzunluğu ${length} sm, eni ${width} sm olan düzbucaqlının perimetrini tapın.`, 2 * (length + width), 4);
    },
    () => {
      const length = randomInteger(4, 18);
      const width = randomInteger(3, 14);
      return numericQuestion("Sahə", `Tərəfləri ${length} sm və ${width} sm olan düzbucaqlının sahəsi neçə sm²-dir?`, length * width, 5);
    },
    () => {
      const base = randomInteger(3, 16) * 2;
      const height = randomInteger(3, 15);
      return numericQuestion("Sahə", `Oturacağı ${base} sm, hündürlüyü ${height} sm olan üçbucağın sahəsini tapın.`, (base * height) / 2, 4);
    },
    () => {
      const first = randomInteger(4, 25);
      const second = randomInteger(4, 25);
      const third = randomInteger(4, 25);
      const sum = first + second + third;
      const values = sum % 3 === 0 ? [first, second, third] : [first + (3 - (sum % 3)), second, third];
      const average = values.reduce((total, item) => total + item, 0) / 3;
      return numericQuestion("Ədədi orta", `${values.join(", ")} ədədlərinin ədədi ortasını tapın.`, average, 2);
    },
    () => {
      const first = randomInteger(2, 8);
      const second = randomInteger(2, 7);
      const multiplier = randomInteger(2, 9);
      return numericQuestion("Nisbət", `Qutudakı qırmızı və mavi qələmlərin nisbəti ${first}:${second}-dir. Qırmızı qələmlər ${first * multiplier} ədəddirsə, mavi qələmlər neçə ədəddir?`, second * multiplier, 3);
    },
    () => {
      const hours = randomInteger(1, 5);
      const minutes = randomInteger(1, 50);
      return numericQuestion("Ölçü vahidləri", `${hours} saat ${minutes} dəqiqə neçə dəqiqədir?`, (hours * 60) + minutes, 5);
    },
    () => {
      const side = randomInteger(4, 24);
      return numericQuestion("Kvadrat", `Tərəfi ${side} sm olan kvadratın perimetrini tapın.`, side * 4, 4);
    },
    () => {
      const base = randomInteger(2, 12);
      return numericQuestion("Qüvvət", `${base}² ifadəsinin qiymətini tapın.`, base ** 2, 5);
    },
    () => {
      const divisor = randomInteger(2, 9);
      const quotient = randomInteger(3, 15);
      const remainder = randomInteger(0, divisor - 1);
      return numericQuestion("Bölünmə", `${divisor * quotient + remainder} ədədini ${divisor}-ə böldükdə qalıq neçə olar?`, remainder, 1);
    },
    () => {
      const difference = randomInteger(2, 9);
      const first = randomInteger(1, 25);
      return numericQuestion("Ardıcıllıq", `${first}, ${first + difference}, ${first + 2 * difference}, ... ardıcıllığının növbəti həddini tapın.`, first + 3 * difference, difference);
    },
    () => {
      const speed = randomInteger(3, 15) * 5;
      const time = randomInteger(2, 6);
      return numericQuestion("Məsafə", `Saatda ${speed} km sürətlə ${time} saat gedən avtomobil neçə kilometr yol qət edər?`, speed * time, 10);
    },
    () => {
      const price = randomInteger(5, 40) * 10;
      const quantity = randomInteger(2, 8);
      return numericQuestion("Mətn məsələsi", `Bir dəftər ${price} qəpikdirsə, ${quantity} dəftər neçə qəpik edər?`, price * quantity, 20);
    }
  ];

  return shuffle([...factories, ...factories].map(factory => factory()));
}

function createAbituriyentBank() {
  const factories = [
    () => {
      const coefficient = randomInteger(2, 9);
      const value = randomInteger(2, 14);
      const offset = randomInteger(3, 20);
      return numericQuestion("Xətti tənlik", `${coefficient}x − ${offset} = ${coefficient * value - offset} tənliyində x-i tapın.`, value, 2);
    },
    () => {
      const firstRoot = randomInteger(1, 12);
      const secondRoot = randomInteger(1, 12);
      const sum = firstRoot + secondRoot;
      const product = firstRoot * secondRoot;
      return numericQuestion("Kvadrat tənlik", `x² − ${sum}x + ${product} = 0 tənliyinin kökləri cəmini tapın.`, sum, 2);
    },
    () => {
      const coefficient = randomInteger(2, 8);
      const offset = randomInteger(1, 12);
      const x = randomInteger(2, 10);
      return numericQuestion("Funksiya", `f(x) = ${coefficient}x + ${offset} olduqda, f(${x})-i tapın.`, coefficient * x + offset, 3);
    },
    () => {
      const firstTerm = randomInteger(1, 20);
      const difference = randomInteger(2, 9);
      const index = randomInteger(5, 15);
      return numericQuestion("Ədədi silsilə", `İlk həddi ${firstTerm}, fərqi ${difference} olan ədədi silsilənin ${index}-ci həddini tapın.`, firstTerm + ((index - 1) * difference), difference);
    },
    () => {
      const base = randomInteger(2, 8);
      const exponent = randomInteger(2, 4);
      return numericQuestion("Qüvvətlər", `${base}^${exponent} ifadəsinin qiymətini tapın.`, base ** exponent, 5);
    },
    () => {
      const coefficient = randomInteger(2, 6);
      const x = randomInteger(2, 8);
      const constant = randomInteger(1, 12);
      return numericQuestion("Törəmə", `f(x) = ${coefficient}x² + ${constant} olduqda, f′(${x})-i hesablayın.`, 2 * coefficient * x, 4);
    },
    () => {
      const percent = [10, 20, 25, 40][randomInteger(0, 3)];
      const base = randomInteger(2, 20) * 20;
      return numericQuestion("Faiz", `${base} ədədinin ${percent}%-ni tapın.`, (base * percent) / 100, 5);
    },
    () => {
      const exponent = randomInteger(2, 5);
      return createQuestion("Loqarifm", `log₂(${2 ** exponent}) ifadəsinin qiymətini tapın.`, exponent, [exponent + 1, exponent - 1, exponent + 2]);
    },
    () => {
      const red = randomInteger(2, 8);
      const blue = randomInteger(2, 8);
      const total = red + blue;
      return createQuestion("Ehtimal", `Qutuda ${red} qırmızı və ${blue} mavi kürə var. Təsadüfi seçilən bir kürənin qırmızı olması ehtimalı neçədir?`, `${red}/${total}`, [`1/${total}`, `${total - 1}/${total}`, "0"]);
    },
    () => {
      const xValue = randomInteger(1, 8);
      const yValue = randomInteger(1, 8);
      const firstX = randomInteger(1, 5);
      const firstY = randomInteger(1, 5);
      let secondX = randomInteger(1, 5);
      let secondY = randomInteger(1, 5);
      while ((firstX * secondY) === (secondX * firstY)) {
        secondX = randomInteger(1, 5);
        secondY = randomInteger(1, 5);
      }
      const firstResult = firstX * xValue + firstY * yValue;
      const secondResult = secondX * xValue + secondY * yValue;
      return numericQuestion("Tənliklər sistemi", `${firstX}x + ${firstY}y = ${firstResult}; ${secondX}x + ${secondY}y = ${secondResult}. Sistemi ödəyən x-i tapın.`, xValue, 2);
    },
    () => {
      const first = randomInteger(2, 10);
      const difference = randomInteger(2, 7);
      const termIndex = randomInteger(5, 12);
      return numericQuestion("Ədədi silsilə", `İlk həddi ${first}, fərqi ${difference} olan ədədi silsilənin ilk ${termIndex} həddinin cəmini tapın.`, (termIndex * (2 * first + ((termIndex - 1) * difference))) / 2, 5);
    },
    () => {
      const radius = randomInteger(2, 10);
      return createQuestion("Həndəsə", `Radiusu ${radius} sm olan çevrənin uzunluğunu tapın. (π ilə ifadə edin.)`, `${radius * 2}π`, [`${radius}π`, `${radius ** 2}π`, `${radius * 4}π`]);
    },
    () => {
      const first = randomInteger(2, 10);
      const second = randomInteger(2, 10);
      return numericQuestion("Kombinatorika", `${first} fərqli köynək və ${second} fərqli şalvardan neçə geyim kombinasiyası yaratmaq olar?`, first * second, 3);
    },
    () => {
      const angle = [30, 45, 60][randomInteger(0, 2)];
      const answers = { 30: ["1/2", "√3/2", "√2/2"], 45: ["√2/2", "1/2", "√3/2"], 60: ["√3/2", "1/2", "√2/2"] };
      return createQuestion("Triqonometriya", `sin ${angle}° ifadəsinin qiymətini seçin.`, answers[angle][0], answers[angle].slice(1).concat(["1"]));
    },
    () => {
      const coefficient = randomInteger(2, 8);
      const value = randomInteger(2, 12);
      const offset = randomInteger(1, 10);
      const bound = coefficient * value + offset;
      return numericQuestion("Bərabərsizlik", `${coefficient}x + ${offset} < ${bound} bərabərsizliyini ödəyən ən böyük tam x-i tapın.`, value - 1, 2);
    },
    () => {
      const first = randomInteger(3, 12);
      const second = randomInteger(3, 12);
      return numericQuestion("Orta qiymət", `${first}, ${second} və x ədədlərinin ədədi ortası ${first + second} olarsa, x-i tapın.`, 2 * (first + second) - first - second, 3);
    },
    () => {
      const denominator = randomInteger(2, 9);
      const numerator = randomInteger(2, 9);
      const value = denominator * randomInteger(2, 8);
      return numericQuestion("Nisbət", `x/${value} = ${numerator}/${denominator} olarsa, x-i tapın.`, (value * numerator) / denominator, 2);
    },
    () => {
      const first = randomInteger(2, 8);
      const second = randomInteger(2, 8);
      const x = randomInteger(2, 8);
      return numericQuestion("Funksiya", `f(x) = x² − ${first}x + ${second} olduqda, f(${x})-i tapın.`, (x ** 2) - (first * x) + second, 3);
    },
    () => {
      const first = randomInteger(2, 12);
      const second = randomInteger(2, 12);
      return numericQuestion("Həndəsə", `Katetləri ${first} sm və ${second} sm olan düzbucaqlı üçbucağın sahəsini tapın.`, (first * second) / 2, 3);
    },
    () => {
      const firstRoot = randomInteger(1, 12);
      const secondRoot = randomInteger(1, 12);
      const sum = firstRoot + secondRoot;
      const product = firstRoot * secondRoot;
      return numericQuestion("Kvadrat tənlik", `x² − ${sum}x + ${product} = 0 tənliyinin kökləri hasilini tapın.`, product, 3);
    }
  ];

  return shuffle([...factories, ...factories].map(factory => factory()));
}

function setError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function updateAnsweredCount() {
  const answered = attempt.answers.filter(answer => answer !== null).length;
  document.querySelector(".answered-count").textContent = `${answered} / ${questionCount} cavablandırılıb`;
  return answered;
}

function renderQuestion() {
  const question = attempt.questions[attempt.current];
  const questionNumber = attempt.current + 1;
  document.querySelector(".current-question").textContent = String(questionNumber);
  progressBar.setAttribute("aria-valuenow", String(questionNumber));
  progressBar.querySelector("span").style.width = `${(questionNumber / questionCount) * 100}%`;
  previousButton.disabled = attempt.current === 0;
  nextButton.hidden = attempt.current === questionCount - 1;
  finishButton.hidden = attempt.current !== questionCount - 1;

  const meta = document.createElement("div");
  meta.className = "question-meta";
  const topic = document.createElement("span");
  topic.className = "question-topic";
  topic.textContent = question.topic;
  const status = document.createElement("span");
  status.className = "question-state";
  status.textContent = attempt.answers[attempt.current] === null ? "Cavab seçilməyib" : "Cavab seçilib";
  meta.append(topic, status);

  const title = document.createElement("h2");
  title.className = "question-title";
  title.id = "question-title";
  title.textContent = question.prompt;

  const options = document.createElement("div");
  options.className = "question-options";
  options.setAttribute("role", "radiogroup");
  options.setAttribute("aria-labelledby", "question-title");
  question.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = "question-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${questionNumber}`;
    input.value = option;
    input.checked = attempt.answers[attempt.current] === option;
    input.addEventListener("change", () => {
      attempt.answers[attempt.current] = option;
      status.textContent = "Cavab seçilib";
      finishArmed = false;
      finishButton.classList.remove("is-confirming");
      finishButton.innerHTML = 'Sınağı bitir <span aria-hidden="true">✓</span>';
      document.querySelector(".quiz-finish-warning")?.remove();
      updateAnsweredCount();
    });

    const key = document.createElement("span");
    key.className = "option-key";
    key.textContent = answerLetters[optionIndex];
    const value = document.createElement("span");
    value.className = "option-text";
    value.textContent = option;
    const check = document.createElement("span");
    check.className = "option-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    label.append(input, key, value, check);
    options.append(label);
  });

  questionArea.replaceChildren(meta, title, options);
  updateAnsweredCount();
}

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  const localDigits = digits.startsWith("994") ? `0${digits.slice(3)}` : digits;
  return `${localDigits.slice(0, 3)} ••• •• ${localDigits.slice(-2)}`;
}

function buildReviewItem(question, answer, number) {
  const item = document.createElement("article");
  item.className = "review-item";
  const heading = document.createElement("div");
  heading.className = "review-item-heading";
  const numberLabel = document.createElement("strong");
  numberLabel.textContent = `${number}. sual · ${question.topic}`;
  const resultLabel = document.createElement("span");
  resultLabel.className = "review-result";
  const prompt = document.createElement("p");
  prompt.className = "review-prompt";
  prompt.textContent = question.prompt;
  const response = document.createElement("p");
  response.className = "review-answer";

  if (answer === question.answer) {
    resultLabel.classList.add("is-correct");
    resultLabel.textContent = "Düzgün";
    response.textContent = `Sənin cavabın: ${answer}`;
  } else if (answer === null) {
    resultLabel.classList.add("is-blank");
    resultLabel.textContent = "Boş";
    response.textContent = `Cavab vermədin. Düzgün cavab: ${question.answer}`;
  } else {
    resultLabel.classList.add("is-wrong");
    resultLabel.textContent = "Səhv";
    response.textContent = `Sənin cavabın: ${answer} · Düzgün cavab: ${question.answer}`;
  }

  heading.append(numberLabel, resultLabel);
  item.append(heading, prompt, response);
  return item;
}

function updateTimer() {
  if (!attempt || attempt.finished) return;
  const remainingMilliseconds = examDeadline - Date.now();
  if (remainingMilliseconds <= 0) {
    finishExam(true);
    return;
  }

  const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const displayedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (displayedTime !== lastDisplayedTime) {
    timerValue.textContent = displayedTime;
    timerElement.setAttribute("aria-label", `Qalan vaxt ${minutes} dəqiqə ${seconds} saniyə`);
    timerRing.style.strokeDashoffset = String(100.53 * (1 - remainingSeconds / examDurationSeconds));
    lastDisplayedTime = displayedTime;
  }
  timerElement.classList.toggle("is-urgent", remainingSeconds <= 60);
}

function startTimer() {
  window.clearInterval(timerIntervalId);
  examDeadline = Date.now() + (examDurationSeconds * 1000);
  lastDisplayedTime = "";
  timerElement.classList.remove("is-urgent");
  updateTimer();
  timerIntervalId = window.setInterval(updateTimer, 250);
}

function finishExam(expired = false) {
  if (!attempt || attempt.finished) return;
  attempt.finished = true;
  window.clearInterval(timerIntervalId);
  timerIntervalId = null;
  const correct = attempt.questions.reduce((total, question, index) => (
    total + (attempt.answers[index] === question.answer ? 1 : 0)
  ), 0);
  const unanswered = attempt.answers.filter(answer => answer === null).length;
  const incorrect = questionCount - correct - unanswered;
  const score = correct * 5;

  const symbol = document.createElement("div");
  symbol.className = "result-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = score >= 80 ? "✦" : score >= 50 ? "✓" : "↗";
  const title = document.createElement("h2");
  title.id = "result-title";
  title.textContent = score >= 80 ? "Möhtəşəm nəticə!" : score >= 50 ? "Yaxşı irəliləyiş!" : "Öyrənməyə davam et!";
  const greeting = document.createElement("p");
  greeting.className = "result-greeting";
  greeting.textContent = expired
    ? `${attempt.name}, vaxt bitdiyi üçün sınaq avtomatik tamamlandı. Nəticən:`
    : `${attempt.name}, sınağı tamamladın. Nəticən:`;

  const ring = document.createElement("div");
  ring.className = "result-score-ring";
  ring.style.setProperty("--score-offset", `${276.46 * (1 - (score / 100))}px`);
  ring.setAttribute("role", "img");
  ring.setAttribute("aria-label", `Nəticə: ${score} faiz`);
  ring.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="result-score-track" cx="50" cy="50" r="44"></circle><circle class="result-score-progress" cx="50" cy="50" r="44"></circle></svg><div class="result-score-value"><strong>0%</strong><span>20 sualdan</span></div>';

  const breakdown = document.createElement("div");
  breakdown.className = "result-breakdown";
  [
    { value: correct, label: "Düzgün cavab", tone: "is-correct" },
    { value: incorrect, label: "Səhv cavab", tone: "is-wrong" },
    { value: unanswered, label: "Boş sual", tone: "is-blank" }
  ].forEach(item => {
    const card = document.createElement("div");
    const value = document.createElement("strong");
    value.textContent = String(item.value);
    const label = document.createElement("span");
    label.className = item.tone;
    label.textContent = item.label;
    card.append(value, label);
    breakdown.append(card);
  });

  const phone = document.createElement("p");
  phone.className = "result-phone";
  phone.textContent = `Əlaqə nömrəsi: ${maskPhone(attempt.phone)}`;

  const review = document.createElement("details");
  review.className = "result-review";
  const summary = document.createElement("summary");
  summary.textContent = "Cavablara bax";
  const reviewList = document.createElement("div");
  reviewList.className = "review-list";
  attempt.questions.forEach((question, index) => {
    reviewList.append(buildReviewItem(question, attempt.answers[index], index + 1));
  });
  review.append(summary, reviewList);

  const restart = document.createElement("button");
  restart.className = "exam-primary result-new-test";
  restart.type = "button";
  restart.textContent = "Yeni sınaq";
  restart.addEventListener("click", startNewAttempt);

  resultSection.replaceChildren(symbol, title, greeting, ring, breakdown, phone, review, restart);
  quizSection.hidden = true;
  resultSection.hidden = false;
  const scoreValue = ring.querySelector(".result-score-value strong");
  const duration = 950;
  const start = performance.now();
  if (document.visibilityState === "hidden" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ring.classList.add("is-counting");
    scoreValue.textContent = `${score}%`;
  } else {
    requestAnimationFrame(() => ring.classList.add("is-counting"));
  }

  function countScore(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    scoreValue.textContent = `${Math.round(score * eased)}%`;
    if (progress < 1) requestAnimationFrame(countScore);
  }
  if (document.visibilityState !== "hidden" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(countScore);
  }
  resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startNewAttempt() {
  window.clearInterval(timerIntervalId);
  const bank = attempt.level === "middle-school" ? createMiddleSchoolBank() : createAbituriyentBank();
  attempt.questions = shuffle(bank).slice(0, questionCount);
  attempt.answers = Array(questionCount).fill(null);
  attempt.current = 0;
  attempt.finished = false;
  finishArmed = false;
  resultSection.hidden = true;
  quizSection.hidden = false;
  renderQuestion();
  startTimer();
  quizSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

startForm.addEventListener("submit", event => {
  event.preventDefault();
  clearError();
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const phone = phoneInput.value.trim();
  const digits = phone.replace(/\D/g, "");
  const normalizedPhone = digits.startsWith("994") ? `0${digits.slice(3)}` : digits;

  if (name.length < 2) {
    setError("Davam etmək üçün ad və soyadını daxil et.");
    nameInput.focus();
    return;
  }
  if (!/^0\d{9}$/.test(normalizedPhone)) {
    setError("Mobil nömrəni 050 123 45 67 və ya +994 50 123 45 67 formatında daxil et.");
    phoneInput.focus();
    return;
  }

  const level = levelInput.value;
  attempt = {
    name,
    phone,
    level,
    questions: [],
    answers: Array(questionCount).fill(null),
    current: 0,
    finished: false
  };
  document.querySelector(".student-name-display").textContent = name;
  document.querySelector(".student-level-display").textContent = level === "middle-school"
    ? "Orta məktəb · 5–9-cu siniflər"
    : "Abituriyent";
  startForm.hidden = true;
  quizSection.hidden = false;
  startNewAttempt();
});

previousButton.addEventListener("click", () => {
  if (attempt.current === 0) return;
  attempt.current -= 1;
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  if (attempt.current >= questionCount - 1) return;
  attempt.current += 1;
  renderQuestion();
});

finishButton.addEventListener("click", () => {
  if (!attempt || attempt.finished) return;
  const unanswered = attempt.answers.filter(answer => answer === null).length;
  if (unanswered > 0 && !finishArmed) {
    finishArmed = true;
    finishButton.classList.add("is-confirming");
    finishButton.textContent = "Yenə basaraq təsdiqlə";
    const warning = document.createElement("p");
    warning.className = "exam-error quiz-finish-warning";
    warning.setAttribute("role", "status");
    warning.textContent = `${unanswered} sual boşdur. Bitirmək üçün düyməni bir daha bas.`;
    document.querySelector(".quiz-footer").after(warning);
    return;
  }
  finishExam();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") updateTimer();
});


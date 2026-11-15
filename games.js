(() => {
  "use strict";

  const gamesSection = document.querySelector(".games-section");
  if (!gamesSection) return;

  const gameCards = gamesSection.querySelector(".games-grid");
  const gameArena = gamesSection.querySelector(".game-arena");
  const gameTitle = gamesSection.querySelector("#game-title");
  const gameTimer = gamesSection.querySelector(".game-time");
  const gameScore = gamesSection.querySelector(".game-score");
  const gameProgress = gamesSection.querySelector(".game-progress");
  const gameProgressFill = gameProgress.querySelector("span");
  const gamePlay = gamesSection.querySelector(".game-play");
  const gameInstruction = gamesSection.querySelector(".game-instruction");
  const gameQuestion = gamesSection.querySelector(".game-question");
  const gameOptions = gamesSection.querySelector(".game-options");
  const answerForm = gamesSection.querySelector(".game-answer-form");
  const answerInput = gamesSection.querySelector("#game-answer");
  const answerSubmit = answerForm.querySelector('button[type="submit"]');
  const gameFeedback = gamesSection.querySelector(".game-feedback");
  const gameNext = gamesSection.querySelector(".game-next");
  const gameOver = gamesSection.querySelector(".game-over");
  const gameOverCopy = gamesSection.querySelector(".game-over-copy");
  const gameExit = gamesSection.querySelector(".game-exit");
  const gameReplay = gamesSection.querySelector(".game-replay");
  const gameReturn = gamesSection.querySelector(".game-return");
  const roundDuration = 45;
  const gameTitles = {
    sprint: "Hesab sprinti",
    equation: "Tənlik ustası",
    fractions: "Kəsr dueli"
  };
  const gameInstructions = {
    sprint: "Düzgün cavab hər dəfə 10 xal gətirir.",
    equation: "Tənlikdə x-in tam qiymətini daxil et.",
    fractions: "Böyük olan kəsri seç."
  };

  let activeGame = null;
  let currentQuestion = null;
  let score = 0;
  let secondsLeft = roundDuration;
  let answered = false;
  let timerId = 0;

  function randomInteger(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }

  function makeSprintQuestion() {
    const operation = randomInteger(0, 2);
    let first = randomInteger(2, 20);
    let second = randomInteger(2, 20);
    let symbol;
    let answer;

    if (operation === 0) {
      symbol = "+";
      answer = first + second;
    } else if (operation === 1) {
      if (second > first) [first, second] = [second, first];
      symbol = "−";
      answer = first - second;
    } else {
      first = randomInteger(2, 12);
      second = randomInteger(2, 12);
      symbol = "×";
      answer = first * second;
    }

    return { prompt: `${first} ${symbol} ${second} = ?`, answer };
  }

  function makeEquationQuestion() {
    const multiplier = randomInteger(2, 8);
    const answer = randomInteger(1, 12);
    const constant = randomInteger(2, 15);
    const addConstant = Math.random() >= .5;
    const result = addConstant
      ? multiplier * answer + constant
      : multiplier * answer - constant;
    const sign = addConstant ? "+" : "−";
    return {
      prompt: `${multiplier}x ${sign} ${constant} = ${result}`,
      answer
    };
  }

  function makeFractionQuestion() {
    let firstNumerator;
    let firstDenominator;
    let secondNumerator;
    let secondDenominator;
    do {
      firstDenominator = randomInteger(2, 12);
      firstNumerator = randomInteger(1, firstDenominator - 1);
      secondDenominator = randomInteger(2, 12);
      secondNumerator = randomInteger(1, secondDenominator - 1);
    } while (firstNumerator * secondDenominator === secondNumerator * firstDenominator);

    const firstIsGreater = firstNumerator * secondDenominator > secondNumerator * firstDenominator;
    return {
      prompt: "Hansı kəsr daha böyükdür?",
      answer: firstIsGreater ? "A" : "B",
      choices: [
        { key: "A", value: `${firstNumerator}/${firstDenominator}` },
        { key: "B", value: `${secondNumerator}/${secondDenominator}` }
      ]
    };
  }

  function makeQuestion() {
    if (activeGame === "sprint") return makeSprintQuestion();
    if (activeGame === "equation") return makeEquationQuestion();
    if (activeGame === "fractions") return makeFractionQuestion();
    throw new Error(`Unknown game: ${activeGame}`);
  }

  function formatTime(seconds) {
    return `00:${String(seconds).padStart(2, "0")}`;
  }

  function updateTimer() {
    gameTimer.textContent = formatTime(secondsLeft);
    gameProgress.setAttribute("aria-valuenow", String(secondsLeft));
    gameProgressFill.style.transform = `scaleX(${secondsLeft / roundDuration})`;
    gameTimer.classList.toggle("is-low", secondsLeft <= 10);
  }

  function renderChoices(choices) {
    gameOptions.replaceChildren();
    choices.forEach(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "game-option";
      button.dataset.answer = choice.key;

      const key = document.createElement("span");
      key.className = "game-option-key";
      key.textContent = choice.key;
      const value = document.createElement("strong");
      value.textContent = choice.value;

      button.append(key, value);
      gameOptions.append(button);
    });
    gameOptions.hidden = false;
    answerForm.hidden = true;
  }

  function renderQuestion() {
    currentQuestion = makeQuestion();
    answered = false;
    gameQuestion.textContent = currentQuestion.prompt;
    gameFeedback.textContent = "";
    gameFeedback.classList.remove("is-correct");
    gameNext.hidden = true;
    answerInput.value = "";
    answerInput.disabled = false;
    answerSubmit.disabled = false;
    answerForm.hidden = Boolean(currentQuestion.choices);
    gameOptions.hidden = !currentQuestion.choices;

    if (currentQuestion.choices) {
      renderChoices(currentQuestion.choices);
      gameOptions.querySelector("button").focus();
    } else {
      answerInput.focus();
    }
  }

  function finishGame() {
    window.clearInterval(timerId);
    timerId = 0;
    secondsLeft = Math.max(0, secondsLeft);
    updateTimer();
    gamePlay.hidden = true;
    gameOver.hidden = false;
    gameOverCopy.textContent = `45 saniyədə ${score} xal topladın. İstəsən, bir raund da oyna.`;
    gameReplay.focus();
  }

  function submitAnswer(value) {
    if (answered) return;
    answered = true;
    const isCorrect = String(value).trim().toLowerCase() === String(currentQuestion.answer).toLowerCase();

    if (isCorrect) {
      score += 10;
      gameScore.textContent = String(score);
      gameFeedback.textContent = "Düzdür! +10 xal";
      gameFeedback.classList.add("is-correct");
    } else {
      const correctAnswer = currentQuestion.choices
        ? `${currentQuestion.answer} — ${currentQuestion.choices.find(choice => choice.key === currentQuestion.answer).value}`
        : currentQuestion.answer;
      gameFeedback.textContent = `Bu dəfə olmadı. Düzgün cavab: ${correctAnswer}`;
      gameFeedback.classList.remove("is-correct");
    }

    answerInput.disabled = true;
    answerSubmit.disabled = true;
    gameOptions.querySelectorAll("button").forEach(button => {
      button.disabled = true;
      button.classList.toggle("is-answer", button.dataset.answer === currentQuestion.answer);
    });
    gameNext.hidden = false;
    gameNext.focus();
  }

  function startGame(gameId) {
    if (!Object.prototype.hasOwnProperty.call(gameTitles, gameId)) {
      throw new Error(`Unknown game: ${gameId}`);
    }

    window.clearInterval(timerId);
    activeGame = gameId;
    score = 0;
    secondsLeft = roundDuration;
    gameScore.textContent = "0";
    gameTitle.textContent = gameTitles[gameId];
    gameInstruction.textContent = gameInstructions[gameId];
    gameCards.hidden = true;
    gameArena.hidden = false;
    gamePlay.hidden = false;
    gameOver.hidden = true;
    gameTimer.classList.remove("is-low");
    updateTimer();
    renderQuestion();
    gameArena.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center"
    });

    timerId = window.setInterval(() => {
      secondsLeft -= 1;
      updateTimer();
      if (secondsLeft <= 0) finishGame();
    }, 1000);
  }

  function returnToGames() {
    window.clearInterval(timerId);
    timerId = 0;
    activeGame = null;
    gameArena.hidden = true;
    gameCards.hidden = false;
    gameCards.querySelector("button").focus();
  }

  gameCards.addEventListener("click", event => {
    const button = event.target.closest("[data-game-start]");
    if (button) startGame(button.dataset.gameStart);
  });

  answerForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!answerForm.reportValidity()) return;
    const value = Number(answerInput.value.trim());
    if (!Number.isFinite(value)) {
      gameFeedback.textContent = "Zəhmət olmasa, rəqəm daxil et.";
      gameFeedback.classList.remove("is-correct");
      return;
    }
    submitAnswer(value);
  });

  gameOptions.addEventListener("click", event => {
    const button = event.target.closest("[data-answer]");
    if (button) submitAnswer(button.dataset.answer);
  });

  gameNext.addEventListener("click", renderQuestion);
  gameExit.addEventListener("click", returnToGames);
  gameReturn.addEventListener("click", returnToGames);
  gameReplay.addEventListener("click", () => startGame(activeGame));
})();

const colors = [
  "#d94141",
  "#f28c28",
  "#f2d43d",
  "#58b96f",
  "#23a0a3",
  "#2f73d9",
  "#7151c8",
  "#cc5ca8",
  "#7a5234",
];

const memoryGrid = document.querySelector("#memoryGrid");
const gameStage = document.querySelector(".game-stage");
const answerGrid = document.querySelector("#answerGrid");
const answerWrap = document.querySelector("#answerWrap");
const mainBoardLabel = document.querySelector("#mainBoardLabel");
const palette = document.querySelector("#palette");
const timer = document.querySelector("#timer");
const phaseLabel = document.querySelector("#phaseLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const statusText = document.querySelector("#statusText");
const submitButton = document.querySelector("#submitButton");
const newGameButton = document.querySelector("#newGameButton");

let answer = [];
let guesses = Array(9).fill(null);
let selectedColor = null;
let acceptingGuesses = false;
let countdownId = null;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeButton(className, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  return button;
}

function paintGrid(showAnswer = false) {
  memoryGrid.innerHTML = "";

  answer.forEach((color, index) => {
    const cell = makeButton("cell", `Grid square ${index + 1}`);
    const fill = showAnswer ? color : guesses[index];
    cell.style.background = fill || "";
    cell.disabled = !acceptingGuesses;

    cell.addEventListener("click", () => {
      if (!acceptingGuesses || !selectedColor) return;
      guesses[index] = selectedColor;
      cell.style.background = selectedColor;
      submitButton.disabled = guesses.some((guess) => !guess);
      statusText.textContent = "Keep placing colors until all nine squares are filled.";
    });

    memoryGrid.append(cell);
  });
}

function paintPalette() {
  palette.innerHTML = "";

  colors.forEach((color) => {
    const swatch = makeButton("swatch", `Choose ${color}`);
    swatch.style.background = color;
    swatch.addEventListener("click", () => {
      selectedColor = color;
      document
        .querySelectorAll(".swatch")
        .forEach((button) => button.classList.toggle("selected", button === swatch));
    });
    palette.append(swatch);
  });
}

function paintAnswerGrid() {
  answerGrid.innerHTML = "";

  answer.forEach((color, index) => {
    const cell = makeButton("cell", `Original square ${index + 1}`);
    cell.style.background = color;
    cell.disabled = true;
    answerGrid.append(cell);
  });
}

function startMemorizing() {
  answer = shuffle(colors);
  guesses = Array(9).fill(null);
  selectedColor = null;
  acceptingGuesses = false;
  answerWrap.hidden = true;
  gameStage.classList.remove("show-answer");
  mainBoardLabel.textContent = "Original grid";
  submitButton.disabled = true;
  scoreLabel.textContent = "0%";
  phaseLabel.textContent = "Memorize";
  statusText.textContent = "Memorize the nine colors before they disappear.";

  paintPalette();
  paintGrid(true);

  let secondsLeft = 5;
  timer.textContent = secondsLeft;
  clearInterval(countdownId);

  countdownId = setInterval(() => {
    secondsLeft -= 1;
    timer.textContent = secondsLeft;

    if (secondsLeft === 0) {
      clearInterval(countdownId);
      beginGuessing();
    }
  }, 1000);
}

function beginGuessing() {
  acceptingGuesses = true;
  mainBoardLabel.textContent = "Your grid";
  phaseLabel.textContent = "Place colors";
  timer.textContent = "Go";
  statusText.textContent = "Pick a color from the side, then tap its square.";
  paintGrid(false);
}

function showScore() {
  acceptingGuesses = false;
  const matches = guesses.filter((guess, index) => guess === answer[index]).length;
  const percentage = Math.round((matches / answer.length) * 100);

  scoreLabel.textContent = `${percentage}%`;
  phaseLabel.textContent = "Score";
  timer.textContent = `${matches}/9`;
  statusText.textContent = `You matched ${matches} out of 9 squares.`;
  submitButton.disabled = true;
  answerWrap.hidden = false;
  paintAnswerGrid();

  memoryGrid.innerHTML = "";
  answer.forEach((color, index) => {
    const cell = makeButton("cell", `Square ${index + 1}`);
    const isCorrect = guesses[index] === color;
    const mark = document.createElement("span");

    cell.style.background = guesses[index] || "";
    cell.disabled = true;
    cell.classList.add(isCorrect ? "correct" : "wrong");
    mark.className = "result-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = isCorrect ? "✓" : "X";
    cell.append(mark);
    memoryGrid.append(cell);
  });

  gameStage.classList.add("show-answer");
}

submitButton.addEventListener("click", showScore);
newGameButton.addEventListener("click", startMemorizing);

startMemorizing();

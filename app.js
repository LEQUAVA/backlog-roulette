const STORAGE_KEY = "lequava-backlog-roulette";

const form = document.getElementById("game-form");
const input = document.getElementById("game-input");
const list = document.getElementById("game-list");
const counter = document.getElementById("counter");
const result = document.getElementById("result");
const spinButton = document.getElementById("spin");
const againButton = document.getElementById("again");
const clearButton = document.getElementById("clear");

let games = loadGames();
let lastPick = null;

function loadGames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter((game) => typeof game === "string") : [];
  } catch {
    return [];
  }
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function normaliseTitle(value) {
  return value.trim().replace(/\s+/g, " ");
}

function render() {
  list.replaceChildren();

  games.forEach((game, index) => {
    const row = document.createElement("li");
    const title = document.createElement("span");
    const remove = document.createElement("button");

    title.textContent = game;
    remove.type = "button";
    remove.textContent = "remove";
    remove.setAttribute("aria-label", `Remove ${game}`);
    remove.addEventListener("click", () => removeGame(index));

    row.append(title, remove);
    list.append(row);
  });

  counter.textContent = `${games.length} ${games.length === 1 ? "game" : "games"}`;
  spinButton.disabled = games.length === 0;
  clearButton.disabled = games.length === 0;

  if (games.length === 0) {
    result.textContent = "Add a few games first.";
    againButton.hidden = true;
    lastPick = null;
  }
}

function addGame(title) {
  const cleanTitle = normaliseTitle(title);
  if (!cleanTitle) return;

  const alreadyExists = games.some(
    (game) => game.toLocaleLowerCase() === cleanTitle.toLocaleLowerCase()
  );

  if (alreadyExists) {
    result.textContent = `You already added ${cleanTitle}.`;
    return;
  }

  games.push(cleanTitle);
  saveGames();
  render();
  input.value = "";
  input.focus();
}

function removeGame(index) {
  const [removed] = games.splice(index, 1);
  if (removed === lastPick) lastPick = null;
  saveGames();
  render();
}

function pickGame() {
  if (games.length === 0) return;

  let pool = games;
  if (games.length > 1 && lastPick) {
    pool = games.filter((game) => game !== lastPick);
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  lastPick = picked;
  result.textContent = picked;
  againButton.hidden = games.length < 2;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addGame(input.value);
});

spinButton.addEventListener("click", pickGame);
againButton.addEventListener("click", pickGame);

clearButton.addEventListener("click", () => {
  if (games.length === 0) return;
  if (!window.confirm("Clear the whole backlog?")) return;

  games = [];
  saveGames();
  render();
});

render();

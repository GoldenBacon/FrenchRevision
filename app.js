// ============================================
// FRENCH REVISION APP
// Supabase + Quiz System
// ============================================

// ---------- SUPABASE ----------

const SUPABASE_URL = "https://aoabqbdazcabwyiyfpbs.supabase.co";
const SUPABASE_KEY = "sb_publishable_mpTrg2TsXLKKtEnNas6H-g_pSTDJX7C";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ---------- APP STATE ----------

let currentTest = null;
let currentMode = null;
let quiz = null;
let currentUser = null;
let currentProfile = null;

const session = {
  answered: 0,
  correct: 0,
  points: 0,
  started: Date.now()
};

const MODES = {
  multiple: [
    "🔘",
    "Multiple Choice",
    "Pick the English meaning."
  ],
  typing: [
    "⌨️",
    "Enter English",
    "Type the English meaning."
  ]
};


// ---------- HELPERS ----------

const $ = id => document.getElementById(id);

const get = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const norm = value =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");

const esc = value =>
  String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

const shuffle = array => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const time = seconds => {
  if (seconds >= 3600) {
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
};

function view(id) {
  document
    .querySelectorAll(".view")
    .forEach(element => element.classList.remove("active"));

  const target = $(id);

  if (target) {
    target.classList.add("active");
    scrollTo(0, 0);
  }
}


// ---------- AUTH UI ----------

function showLogin() {
  view("loginView");
}

function showSignup() {
  view("signupView");
}


// ---------- AUTH ----------

async function checkAuth() {
  const {
    data: { session: authSession }
  } = await supabase.auth.getSession();

  if (authSession?.user) {
    currentUser = authSession.user;
    await loadProfile();
    showLoggedIn();
  } else {
    currentUser = null;
    currentProfile = null;
    showLogin();
  }
}


async function loadProfile() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    console.error("Could not load profile:", error);
    return;
  }

  currentProfile = data;

  if ($("currentUsername")) {
    $("currentUsername").textContent = data.username;
  }

  if ($("settingsUsername")) {
    $("settingsUsername").value = data.username;
  }

  if ($("settingsEmail")) {
    $("settingsEmail").value = currentUser.email || "";
  }
}


function showLoggedIn() {
  if ($("currentUsername") && currentProfile) {
    $("currentUsername").textContent = currentProfile.username;
  }

  view("homeView");
}


async function login() {
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  $("loginMsg").textContent = "";

  if (!email || !password) {
    $("loginMsg").textContent = "Please enter your email and password.";
    return;
  }

  $("login").disabled = true;
  $("login").textContent = "Logging in...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  $("login").disabled = false;
  $("login").textContent = "Log In";

  if (error) {
    $("loginMsg").textContent = error.message;
    return;
  }

  currentUser = data.user;

  await loadProfile();
  showLoggedIn();
}


async function signup() {
  const username = $("signupUsername").value.trim();
  const email = $("signupEmail").value.trim();
  const password = $("signupPassword").value;
  const password2 = $("signupPassword2").value;

  $("signupMsg").textContent = "";

  // Username validation
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    $("signupMsg").textContent =
      "Username must be 3–20 characters and use only letters, numbers or _.";
    return;
  }

  if (!email) {
    $("signupMsg").textContent = "Please enter your email.";
    return;
  }

  if (password.length < 6) {
    $("signupMsg").textContent =
      "Password must be at least 6 characters.";
    return;
  }

  if (password !== password2) {
    $("signupMsg").textContent =
      "The passwords do not match.";
    return;
  }

  $("signup").disabled = true;
  $("signup").textContent = "Creating account...";

  // ============================================
  // THIS IS THE IMPORTANT SUPABASE CHANGE
  // ============================================

  const { data, error } = await supabase.auth.signUp({
    email,
    password,

    options: {
      data: {
        username
      }
    }
  });

  $("signup").disabled = false;
  $("signup").textContent = "Create Account";

  if (error) {
    if (
      error.message.toLowerCase().includes("duplicate") ||
      error.message.toLowerCase().includes("unique") ||
      error.message.toLowerCase().includes("username")
    ) {
      $("signupMsg").textContent =
        "That username is already taken. Please choose another.";
    } else {
      $("signupMsg").textContent = error.message;
    }

    return;
  }

  /*
    The Supabase database trigger now automatically creates
    the profile using the username above.

    We therefore DO NOT insert into profiles here.
  */

  if (data.session) {
    currentUser = data.user;
    await loadProfile();
    showLoggedIn();
  } else {
    $("signupMsg").textContent =
      "Account created! Check your email to confirm your account, then log in.";

    $("signupPassword").value = "";
    $("signupPassword2").value = "";
  }
}


async function logout() {
  await supabase.auth.signOut();

  currentUser = null;
  currentProfile = null;

  showLogin();
}


// ---------- SESSION STATS ----------

function updateSession() {
  if (!$("session")) return;

  const accuracy = session.answered
    ? Math.round((session.correct / session.answered) * 100)
    : 0;

  $("session").textContent =
    `${session.answered} answered · ${accuracy}% accuracy`;
}


function statsWord(fr, correct) {
  const stats = get("wordStats", {});

  stats[fr] ??= {
    attempts: 0,
    correct: 0
  };

  stats[fr].attempts++;

  if (correct) {
    stats[fr].correct++;
  }

  set("wordStats", stats);
}


// ---------- TESTS ----------

function renderTests() {
  $("tests").innerHTML = TESTS.map(test => `
    <button class="card test" data-test="${esc(test.id)}">
      <h2>${esc(test.title)}</h2>
      <span>${esc(test.description)}</span>
      <small>${Object.keys(test.words).length} words</small>
    </button>
  `).join("");

  document.querySelectorAll("[data-test]").forEach(button => {
    button.onclick = () => {
      currentTest = TESTS.find(
        test => test.id === button.dataset.test
      );

      $("testName").textContent = currentTest.title;

      renderModes();

      view("modeView");
    };
  });
}


// ---------- MODES ----------

function renderModes() {
  $("modes").innerHTML = Object.entries(MODES).map(
    ([id, info]) => `
      <button class="card mode" data-mode="${id}">
        <span>${info[0]}</span>
        <b>${info[1]}</b>
        <small>${info[2]}</small>
      </button>
    `
  ).join("");

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.onclick = () => {
      const countSelect = $("questionCount");

      let count = countSelect
        ? countSelect.value
        : "all";

      start(button.dataset.mode, count);
    };
  });
}


// ---------- QUIZ START ----------

function start(mode, count = "all") {
  currentMode = mode;

  let items = Object.entries(currentTest.words);

  items = shuffle(items);

  if (count !== "all") {
    items = items.slice(0, Number(count));
  }

  quiz = {
    items,
    i: 0,
    points: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: [],
    started: Date.now()
  };

  view("quizView");

  renderQ();
}


// ---------- PRACTICE MISTAKES ----------

function startMistakes() {
  const stats = get("wordStats", {});

  let mistakes = [];

  for (const test of TESTS) {
    for (const [fr, en] of Object.entries(test.words)) {
      const stat = stats[fr];

      if (stat && stat.attempts > stat.correct) {
        mistakes.push({
          fr,
          en,
          test: test.title
        });
      }
    }
  }

  if (!mistakes.length) {
    alert("You don't have any recorded mistakes yet!");
    return;
  }

  currentTest = {
    id: "mistakes",
    title: "Practice Mistakes",
    description: "Words you've previously got wrong.",
    words: Object.fromEntries(
      mistakes.map(word => [word.fr, word.en])
    )
  };

  $("testName").textContent = "Practice Mistakes";

  renderModes();

  view("modeView");
}


// ---------- ANSWER OPTIONS ----------

function acceptedAnswers(expected) {
  return expected
    .split("/")
    .map(answer => norm(answer))
    .filter(Boolean);
}


function isCorrect(given, expected) {
  return acceptedAnswers(expected).includes(norm(given));
}


function choices(correct) {
  const otherAnswers = Object.values(currentTest.words)
    .filter(answer => answer !== correct);

  return shuffle([
    correct,
    ...shuffle(otherAnswers).slice(0, 3)
  ]);
}


// ---------- QUESTION ----------

function renderQ() {
  const [fr, en] = quiz.items[quiz.i];

  $("progress").textContent =
    `${quiz.i + 1}/${quiz.items.length}`;

  $("points").textContent =
    `${quiz.points} pts`;

  $("modeLabel").textContent =
    MODES[currentMode][1];

  $("question").textContent = fr;

  $("feedback").textContent = "";

  $("next").classList.add("hidden");
  $("next").classList.remove("answered");

  if (currentMode === "multiple") {

    $("answers").innerHTML = choices(en)
      .map(answer => `
        <button class="answer" data-a="${esc(answer)}">
          ${esc(answer)}
        </button>
      `)
      .join("");

    document.querySelectorAll(".answer").forEach(button => {
      button.onclick = () =>
        answer(
          button.dataset.a,
          en,
          fr,
          button
        );
    });

  } else {

    $("answers").innerHTML = `
      <div class="row">
        <input
          id="typing"
          placeholder="English meaning"
          autocomplete="off"
        >

        <button id="check" class="primary">
          Check
        </button>
      </div>
    `;

    $("typing").focus();

    $("check").onclick = () =>
      answer(
        $("typing").value,
        en,
        fr
      );

    $("typing").onkeydown = event => {
      if (event.key === "Enter") {
        $("check").click();
      }
    };
  }
}


// ---------- ANSWERING ----------

function answer(given, en, fr, clicked) {
  if ($("next").classList.contains("answered")) {
    return;
  }

  const correct = isCorrect(given, en);

  session.answered++;

  if (correct) {
    session.correct++;
  }

  statsWord(fr, correct);

  // ---------- STREAK ----------

  if (correct) {
    quiz.streak++;

    quiz.bestStreak =
      Math.max(
        quiz.bestStreak,
        quiz.streak
      );
  } else {
    quiz.streak = 0;
    quiz.mistakes.push({
      fr,
      en
    });
  }

  // ---------- POINTS ----------

  let earned = 0;

  if (correct) {
    earned =
      10 +
      Math.min(quiz.streak, 5) * 2;

    quiz.points += earned;
    session.points += earned;
  }

  updateSession();

  $("points").textContent =
    `${quiz.points} pts`;

  // ---------- MULTIPLE CHOICE ----------

  if (clicked) {

    document
      .querySelectorAll(".answer")
      .forEach(button => {

        button.disabled = true;

        if (
          isCorrect(
            button.dataset.a,
            en
          )
        ) {
          button.classList.add("correct");
        }
      });

    if (!correct) {
      clicked.classList.add("wrong");
    }
  }

  // ---------- FEEDBACK ----------

  if (correct) {
    $("feedback").textContent =
      `+${earned} points — Correct! 🔥`;

    $("feedback").style.color =
      "var(--good)";
  } else {
    $("feedback").textContent =
      `Answer: ${en}`;

    $("feedback").style.color =
      "var(--bad)";
  }

  $("next").classList.remove("hidden");
  $("next").classList.add("answered");

  $("next").onclick = next;
}


// ---------- NEXT QUESTION ----------

function next() {
  quiz.i++;

  if (quiz.i >= quiz.items.length) {
    finish();
  } else {
    renderQ();
  }
}


// ---------- FINISH ----------

async function finish() {
  const seconds = Math.round(
    (Date.now() - quiz.started) / 1000
  );

  const accuracy = quiz.items.length
    ? Math.round(
        (session.correct / session.answered) * 100
      )
    : 0;

  const result = {
    test: currentTest.title,
    mode: MODES[currentMode][1],
    points: quiz.points,
    seconds,
    questions: quiz.items.length,
    correct: quiz.items.length - quiz.mistakes.length,
    wrong: quiz.mistakes.length,
    accuracy,
    bestStreak: quiz.bestStreak,
    mistakes: quiz.mistakes,
    date: new Date().toISOString()
  };

  // Save local result history
  const results = get("results", []);

  results.unshift(result);

  set(
    "results",
    results.slice(0, 100)
  );

  // Upload score to Supabase
  await submitScore(result);

  renderResults();

  view("resultsView");
}


// ---------- SUBMIT ONLINE SCORE ----------

async function submitScore(result) {
  if (!currentUser) {
    return;
  }

  const { error } = await supabase
    .from("quiz_scores")
    .insert({
      user_id: currentUser.id,
      points: result.points,
      seconds: result.seconds,
      questions: result.questions,
      correct: result.correct,
      test: result.test,
      mode: result.mode
    });

  if (error) {
    console.error(
      "Could not submit score:",
      error
    );
  }
}


// ---------- RESULTS ----------

function renderResults() {
  const results = get("results", []);
  const wordStats = get("wordStats", {});

  const attempts = Object.values(wordStats)
    .reduce(
      (total, stat) => total + stat.attempts,
      0
    );

  const correct = Object.values(wordStats)
    .reduce(
      (total, stat) => total + stat.correct,
      0
    );

  const lifetimePoints = results
    .reduce(
      (total, result) => total + result.points,
      0
    );

  const lifetimeSeconds = results
    .reduce(
      (total, result) => total + result.seconds,
      0
    );

  const accuracy = attempts
    ? Math.round((correct / attempts) * 100)
    : 0;

  $("summary").innerHTML = [
    [
      lifetimePoints,
      "Lifetime points"
    ],
    [
      time(lifetimeSeconds),
      "Playtime"
    ],
    [
      `${accuracy}%`,
      "Word accuracy"
    ],
    [
      attempts,
      "Word attempts"
    ]
  ]
    .map(stat => `
      <div class="stat">
        <b>${stat[0]}</b>
        <small>${stat[1]}</small>
      </div>
    `)
    .join("");

  $("words").innerHTML =
    Object.entries(wordStats)
      .sort(
        (a, b) =>
          b[1].attempts - a[1].attempts
      )
      .map(([word, stat]) => `
        <div class="word">
          <span>
            ${esc(word)}
            <small>
              <br>
              ${stat.correct}/${stat.attempts} correct
            </small>
          </span>

          <b>
            ${Math.round(
              stat.correct / stat.attempts * 100
            )}%
          </b>
        </div>
      `)
      .join("")
    ||
    "<p class='muted'>No attempts yet.</p>";
}


// ---------- GLOBAL LEADERBOARD ----------

async function renderBoard(type) {
  $("board").innerHTML =
    "<p class='muted'>Loading leaderboard...</p>";

  const { data, error } = await supabase
    .from("leaderboard_totals")
    .select("username, points, seconds");

  if (error) {
    console.error(
      "Leaderboard error:",
      error
    );

    $("board").innerHTML =
      "<p class='muted'>Could not load the leaderboard.</p>";

    return;
  }

  const board = [...data]
    .sort((a, b) => {

      if (type === "points") {
        return Number(b.points) -
          Number(a.points);
      }

      return Number(b.seconds) -
        Number(a.seconds);
    })
    .slice(0, 20);

  if (!board.length) {
    $("board").innerHTML =
      "<p class='muted'>No scores yet. Be the first!</p>";

    return;
  }

  $("board").innerHTML =
    board
      .map((user, index) => `
        <div class="rank">
          <b>#${index + 1}</b>
          <b>${esc(user.username)}</b>
          <b>
            ${
              type === "points"
                ? `${Number(user.points)} pts`
                : time(Number(user.seconds))
            }
          </b>
        </div>
      `)
      .join("");
}


// ---------- DARK MODE ----------

function setupDarkMode() {
  $("dark").onclick = () => {

    document.documentElement.classList.toggle(
      "dark"
    );

    localStorage.setItem(
      "dark",
      document.documentElement.classList.contains("dark")
        ? "1"
        : "0"
    );
  };

  if (
    localStorage.getItem("dark") === "1"
  ) {
    document.documentElement.classList.add(
      "dark"
    );
  }
}


// ---------- NAVIGATION ----------

function setupNavigation() {
  document
    .querySelectorAll("[data-go]")
    .forEach(button => {

      button.onclick = () =>
        view(button.dataset.go);
    });

  if ($("home")) {
    $("home").onclick = () =>
      view("homeView");
  }
}


// ---------- EVENT LISTENERS ----------

function setupEvents() {

  // Login
  if ($("login")) {
    $("login").onclick = login;
  }

  // Signup
  if ($("signup")) {
    $("signup").onclick = signup;
  }

  // Logout
  if ($("logout")) {
    $("logout").onclick = logout;
  }

  // Signup page
  if ($("showSignup")) {
    $("showSignup").onclick = showSignup;
  }

  // Login page
  if ($("showLogin")) {
    $("showLogin").onclick = showLogin;
  }

  // Practice mistakes
  if ($("mistakes")) {
    $("mistakes").onclick =
      startMistakes;
  }

  // Leaderboard tabs
  document
    .querySelectorAll(".tab")
    .forEach(button => {

      button.onclick = () => {

        document
          .querySelectorAll(".tab")
          .forEach(tab =>
            tab.classList.remove("active")
          );

        button.classList.add("active");

        renderBoard(
          button.dataset.board
        );
      };
    });

  // Clear local statistics
  if ($("clear")) {
    $("clear").onclick = () => {

      if (
        confirm(
          "Clear local results and word statistics?"
        )
      ) {
        localStorage.removeItem(
          "results"
        );

        localStorage.removeItem(
          "wordStats"
        );

        renderResults();
      }
    };
  }
}


// ---------- STARTUP ----------

async function init() {
  renderTests();

  renderResults();

  updateSession();

  setupDarkMode();

  setupNavigation();

  setupEvents();

  // Check whether user is already logged in
  await checkAuth();

  // Listen for login/logout changes
  supabase.auth.onAuthStateChange(
    async (event, session) => {

      if (session?.user) {
        currentUser = session.user;

        await loadProfile();

        if (
          event === "SIGNED_IN"
        ) {
          showLoggedIn();
        }

      } else if (
        event === "SIGNED_OUT"
      ) {
        currentUser = null;
        currentProfile = null;

        showLogin();
      }
    }
  );

  // Initial leaderboard
  if ($("board")) {
    renderBoard("points");
  }
}

init();

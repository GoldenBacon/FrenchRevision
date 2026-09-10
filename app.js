const SUPABASE_URL = "https://aoabqbdazcabwyiyfpbs.supabase.co";
const SUPABASE_KEY = "sb_publishable_mpTrg2TsXLKKtEnNas6H-g_pSTDJX7C";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentTest;
let currentMode;
let quiz;
let currentUser = null;
let currentProfile = null;

const session = {
  answered: 0,
  correct: 0,
  points: 0,
  started: Date.now(),
  wordStats: {}
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

const $ = id => document.getElementById(id);

const get = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const norm = value =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");

const acceptedAnswers = value =>
  String(value ?? "")
    .split("/")
    .map(norm)
    .filter(Boolean);

const isCorrect = (given, expected) =>
  acceptedAnswers(expected).includes(norm(given));

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

function view(id) {
  document
    .querySelectorAll(".view")
    .forEach(x => x.classList.remove("active"));

  $(id)?.classList.add("active");

  scrollTo(0, 0);
}

function updateSession() {
  $("session").textContent =
    `${session.answered} answered · ${
      session.answered
        ? Math.round(
            session.correct / session.answered * 100
          )
        : 0
    }% accuracy`;
}


/* =========================
   AUTHENTICATION
========================= */

async function checkAuth() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  currentUser = user;

  if (!user) {
    showLogin();
    return;
  }

  await loadProfile();
}

async function loadProfile() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  currentProfile = data;

  if ($("currentUsername")) {
    $("currentUsername").textContent = data.username;
  }

  if ($("settingsUsername")) {
    $("settingsUsername").textContent = data.username;
  }

  if ($("settingsEmail")) {
    $("settingsEmail").textContent =
      currentUser.email || "—";
  }

  view("homeView");
}

function showLogin() {
  view("loginView");
}

function showSignup() {
  view("signupView");
}

async function login() {
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  $("loginMsg").textContent = "";

  if (!email || !password) {
    $("loginMsg").textContent =
      "Please enter your email and password.";
    return;
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    $("loginMsg").textContent = error.message;
    return;
  }

  $("loginMsg").textContent = "Logged in!";

  await checkAuth();
}

async function signup() {
  const username =
    $("signupUsername").value.trim();

  const email =
    $("signupEmail").value.trim();

  const password =
    $("signupPassword").value;

  const password2 =
    $("signupPassword2").value;

  $("signupMsg").textContent = "";

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    $("signupMsg").textContent =
      "Username must be 3–20 characters using letters, numbers or underscores.";
    return;
  }

  if (!email) {
    $("signupMsg").textContent =
      "Please enter an email address.";
    return;
  }

  if (password.length < 6) {
    $("signupMsg").textContent =
      "Password must be at least 6 characters.";
    return;
  }

  if (password !== password2) {
    $("signupMsg").textContent =
      "Passwords do not match.";
    return;
  }

  /*
    Check username first.
    The database also has a UNIQUE constraint,
    so two people cannot claim the same username.
  */

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .limit(1);

  if (existing?.length) {
    $("signupMsg").textContent =
      "That username is already taken.";
    return;
  }

  const {
    data,
    error
  } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    $("signupMsg").textContent =
      error.message;
    return;
  }

  if (!data.user) {
    $("signupMsg").textContent =
      "Account created. Check your email to continue.";
    return;
  }

  /*
    Create the permanent profile.
  */

  const {
    error: profileError
  } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      username
    });

  if (profileError) {
    $("signupMsg").textContent =
      profileError.code === "23505"
        ? "That username is already taken."
        : profileError.message;

    return;
  }

  if (!data.session) {
    $("signupMsg").textContent =
      "Account created! Check your email to confirm your account, then log in.";

    return;
  }

  currentUser = data.user;

  await loadProfile();
}

async function logout() {
  await supabase.auth.signOut();

  currentUser = null;
  currentProfile = null;

  showLogin();
}


/* =========================
   VOCABULARY STATS
========================= */

function statsWord(fr, ok) {
  session.wordStats[fr] ??= {
    attempts: 0,
    correct: 0
  };

  session.wordStats[fr].attempts++;

  if (ok) {
    session.wordStats[fr].correct++;
  }

  const stats = get("wordStats", {});

  stats[fr] ??= {
    attempts: 0,
    correct: 0
  };

  stats[fr].attempts++;

  if (ok) {
    stats[fr].correct++;
  }

  set("wordStats", stats);
}


/* =========================
   TEST SELECTION
========================= */

function renderTests() {
  $("tests").innerHTML = TESTS.map(test => `
    <button
      class="card test"
      data-test="${esc(test.id)}">

      <h2>${esc(test.title)}</h2>

      <span>
        ${esc(test.description)}
      </span>

      <small>
        ${Object.keys(test.words).length} words
      </small>

    </button>
  `).join("");

  document
    .querySelectorAll("[data-test]")
    .forEach(button => {
      button.onclick = () => {

        currentTest =
          TESTS.find(
            test =>
              test.id === button.dataset.test
          );

        $("testName").textContent =
          currentTest.title;

        renderModes();

        view("modeView");
      };
    });
}


/* =========================
   GAME MODES
========================= */

function renderModes() {
  const wordCount =
    Object.keys(currentTest.words).length;

  const counts = [
    10,
    20,
    30,
    "all"
  ].filter(
    count =>
      count === "all" ||
      count <= wordCount
  );

  $("modes").innerHTML = `

    <div class="choice-panel">

      <b>Number of questions</b>

      <div class="count-buttons">

        ${counts.map(count => `
          <button
            class="count ${
              count === "all"
                ? "selected"
                : ""
            }"
            data-count="${count}">

            ${count === "all"
              ? "All"
              : count}

          </button>
        `).join("")}

      </div>

    </div>

    ${Object.entries(MODES).map(
      ([id, mode]) => `
        <button
          class="card mode"
          data-mode="${id}">

          <span>${mode[0]}</span>

          <b>${mode[1]}</b>

          <small>${mode[2]}</small>

        </button>
      `
    ).join("")}

    <button
      class="secondary mistakes"
      id="mistakes">

      🎯 Practice Mistakes

    </button>
  `;

  document
    .querySelectorAll(".count")
    .forEach(button => {
      button.onclick = () => {

        document
          .querySelectorAll(".count")
          .forEach(x =>
            x.classList.remove("selected")
          );

        button.classList.add("selected");
      };
    });

  document
    .querySelectorAll("[data-mode]")
    .forEach(button => {
      button.onclick = () =>
        start(
          button.dataset.mode,
          selectedCount()
        );
    });

  $("mistakes").onclick =
    startMistakes;
}

function selectedCount() {
  const button =
    document.querySelector(".count.selected");

  return button
    ? button.dataset.count
    : "all";
}

function shuffled(array) {
  return [...array].sort(
    () => Math.random() - 0.5
  );
}


/* =========================
   START QUIZ
========================= */

function start(mode, count = "all") {
  currentMode = mode;

  let items =
    shuffled(
      Object.entries(currentTest.words)
    );

  if (count !== "all") {
    items =
      items.slice(0, Number(count));
  }

  quiz = {
    items,
    i: 0,
    points: 0,
    streak: 0,
    bestStreak: 0,
    started: Date.now(),
    mistakes: []
  };

  view("quizView");
  renderQ();
}

function startMistakes() {
  const stats =
    get("wordStats", {});

  const items =
    Object.entries(currentTest.words)
      .filter(([fr]) =>
        stats[fr] &&
        stats[fr].attempts > 0 &&
        stats[fr].correct <
          stats[fr].attempts
      );

  if (!items.length) {
    alert(
      "No mistakes yet for this test!"
    );
    return;
  }

  currentMode = "typing";

  quiz = {
    items: shuffled(items),
    i: 0,
    points: 0,
    streak: 0,
    bestStreak: 0,
    started: Date.now(),
    mistakes: []
  };

  view("quizView");
  renderQ();
}


/* =========================
   QUESTIONS
========================= */

function choices(correct) {
  return [
    correct,

    ...Object.values(currentTest.words)
      .filter(x => x !== correct)
      .sort(
        () => Math.random() - 0.5
      )
      .slice(0, 3)

  ].sort(
    () => Math.random() - 0.5
  );
}

function renderQ() {
  const [fr, en] =
    quiz.items[quiz.i];

  $("progress").textContent =
    `${quiz.i + 1}/${quiz.items.length}`;

  $("points").textContent =
    `${quiz.points} pts`;

  $("modeLabel").textContent =
    MODES[currentMode][1];

  $("question").textContent =
    fr;

  $("feedback").textContent = "";

  $("next").classList.add("hidden");
  $("next").classList.remove("answered");

  $("streak").textContent =
    `🔥 ${quiz.streak}`;

  if (currentMode === "multiple") {

    $("answers").innerHTML =
      choices(en)
        .map(answer => `
          <button
            class="answer"
            data-a="${esc(answer)}">

            ${esc(answer)}

          </button>
        `)
        .join("");

    document
      .querySelectorAll(".answer")
      .forEach(button => {

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
          autocomplete="off">

        <button
          id="check"
          class="primary">

          Check

        </button>

      </div>
    `;

    $("typing").focus();

    $("check").onclick =
      () =>
        answer(
          $("typing").value,
          en,
          fr
        );

    $("typing").onkeydown =
      event => {
        if (event.key === "Enter") {
          $("check").click();
        }
      };
  }
}


/* =========================
   ANSWER
========================= */

function answer(
  given,
  en,
  fr,
  clicked
) {
  if (
    $("next").classList.contains(
      "answered"
    )
  ) {
    return;
  }

  const ok =
    isCorrect(given, en);

  session.answered++;

  let earned = 0;

  if (ok) {

    session.correct++;

    earned =
      10 +
      Math.min(
        quiz.streak,
        5
      ) * 2;

    session.points += earned;
    quiz.points += earned;

    quiz.streak++;

    quiz.bestStreak =
      Math.max(
        quiz.bestStreak,
        quiz.streak
      );

  } else {

    quiz.streak = 0;

    quiz.mistakes.push(fr);
  }

  statsWord(fr, ok);

  updateSession();

  if (clicked) {

    document
      .querySelectorAll(".answer")
      .forEach(button => {

        button.disabled = true;

        if (
          acceptedAnswers(en)
            .includes(
              norm(
                button.dataset.a
              )
            )
        ) {
          button.classList.add(
            "correct"
          );
        }

      });

    if (!ok) {
      clicked.classList.add(
        "wrong"
      );
    }
  }

  $("feedback").textContent =
    ok
      ? `+${earned} points — Correct!`
      : `Answer: ${en}`;

  $("feedback").style.color =
    ok
      ? "var(--good)"
      : "var(--bad)";

  $("next").classList.remove(
    "hidden"
  );

  $("next").classList.add(
    "answered"
  );

  $("next").onclick = next;
}

function next() {
  quiz.i++;

  if (
    quiz.i >= quiz.items.length
  ) {
    finish();
  } else {
    renderQ();
  }
}


/* =========================
   FINISH QUIZ
========================= */

async function finish() {
  const seconds =
    Math.max(
      1,
      Math.round(
        (Date.now() -
          quiz.started) /
          1000
      )
    );

  const correct =
    quiz.items.length -
    quiz.mistakes.length;

  const result = {
    test: currentTest.title,
    mode: MODES[currentMode][1],
    questions: quiz.items.length,
    correct,
    points: quiz.points,
    seconds,
    bestStreak: quiz.bestStreak,
    mistakes: quiz.mistakes,
    date: new Date().toISOString()
  };

  const results =
    get("results", []);

  results.unshift(result);

  set(
    "results",
    results.slice(0, 100)
  );

  /*
    Submit the result to Supabase.
    The database will associate it with
    the authenticated user.
  */

  await submitScore(result);

  renderResults(result);

  view("resultsView");
}


/* =========================
   ONLINE SCORE
========================= */

async function submitScore(result) {
  if (!currentUser) {
    return;
  }

  const {
    error
  } = await supabase
    .from("quiz_scores")
    .insert({
      user_id: currentUser.id,
      username: currentProfile?.username,
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


/* =========================
   RESULTS
========================= */

function time(seconds) {
  return seconds >= 3600
    ? `${Math.floor(seconds / 3600)}h ${
        Math.floor(
          seconds % 3600 / 60
        )
      }m`

    : seconds >= 60
      ? `${Math.floor(seconds / 60)}m ${
          seconds % 60
        }s`

      : `${seconds}s`;
}

function renderResults(last) {
  const results =
    get("results", []);

  const words =
    get("wordStats", {});

  const attempts =
    Object.values(words)
      .reduce(
        (n, x) =>
          n + x.attempts,
        0
      );

  const correct =
    Object.values(words)
      .reduce(
        (n, x) =>
          n + x.correct,
        0
      );

  $("summary").innerHTML = [

    [
      last
        ? last.points
        : 0,
      "Last score"
    ],

    [
      last
        ? `${last.correct}/${last.questions}`
        : "—",
      "Last result"
    ],

    [
      last
        ? time(last.seconds)
        : "—",
      "Last playtime"
    ],

    [
      last
        ? `${last.bestStreak} 🔥`
        : "—",
      "Best streak"
    ],

    [
      attempts
        ? Math.round(
            correct /
            attempts *
            100
          ) + "%"
        : "0%",
      "Word accuracy"
    ],

    [
      attempts,
      "Word attempts"
    ]

  ]
    .map(
      item => `
        <div class="stat">
          <b>${item[0]}</b>
          <small>${item[1]}</small>
        </div>
      `
    )
    .join("");

  $("words").innerHTML =
    Object.entries(words)
      .sort(
        (a, b) =>
          b[1].attempts -
          a[1].attempts
      )
      .map(
        ([word, stats]) => `
          <div class="word">

            <span>
              ${esc(word)}

              <small>
                <br>
                ${stats.correct}/${stats.attempts}
                correct
              </small>
            </span>

            <b>
              ${Math.round(
                stats.correct /
                stats.attempts *
                100
              )}%
            </b>

          </div>
        `
      )
      .join("")
      ||
      "<p class='muted'>No attempts yet.</p>";

  if ($("mistakesList")) {

    $("mistakesList").innerHTML =
      last &&
      last.mistakes.length

        ? `
          <h3>Words to practise</h3>

          ${
            [
              ...new Set(
                last.mistakes
              )
            ]
              .map(
                word => `
                  <div class="word">
                    <span>
                      ${esc(word)}
                    </span>
                  </div>
                `
              )
              .join("")
          }
        `

        : "";
  }
}


/* =========================
   GLOBAL LEADERBOARD
========================= */

async function renderBoard(type) {

  $("board").innerHTML =
    "<p class='muted'>Loading leaderboard...</p>";

  const column =
    type === "points"
      ? "points"
      : "seconds";

  const {
    data,
    error
  } = await supabase
    .from("quiz_scores")
    .select(
      "username, points, seconds"
    )
    .order(
      column,
      { ascending: false }
    )
    .limit(20);

  if (error) {

    console.error(error);

    $("board").innerHTML =
      `
        <p class="muted">
          Could not load leaderboard.
        </p>
      `;

    return;
  }

  if (!data.length) {

    $("board").innerHTML =
      `
        <p class="muted">
          No scores yet. Be the first!
        </p>
      `;

    return;
  }

  /*
    For points, a player can have multiple
    scores, so combine their scores first.
  */

  let leaderboard = data;

  if (type === "points") {

    const totals = {};

    data.forEach(row => {

      totals[row.username] ??= 0;

      totals[row.username] +=
        row.points;

    });

    leaderboard =
      Object.entries(totals)
        .map(
          ([username, points]) => ({
            username,
            points
          })
        )
        .sort(
          (a, b) =>
            b.points -
            a.points
        )
        .slice(0, 20);

  } else {

    const totals = {};

    data.forEach(row => {

      totals[row.username] ??= 0;

      totals[row.username] +=
        row.seconds;

    });

    leaderboard =
      Object.entries(totals)
        .map(
          ([username, seconds]) => ({
            username,
            seconds
          })
        )
        .sort(
          (a, b) =>
            b.seconds -
            a.seconds
        )
        .slice(0, 20);
  }

  $("board").innerHTML =
    leaderboard
      .map(
        (user, index) => `
          <div class="rank">

            <b>
              #${index + 1}
            </b>

            <b>
              ${esc(user.username)}
            </b>

            <b>
              ${
                type === "points"
                  ? `${user.points} pts`
                  : time(user.seconds)
              }
            </b>

          </div>
        `
      )
      .join("");
}


/* =========================
   DARK MODE
========================= */

$("dark").onclick = () => {

  document.documentElement
    .classList.toggle("dark");

  localStorage.setItem(
    "dark",
    document.documentElement
      .classList.contains("dark")
      ? "1"
      : "0"
  );
};

if (
  localStorage.getItem("dark") === "1"
) {
  document.documentElement
    .classList.add("dark");
}


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll("[data-go]")
  .forEach(button => {

    button.onclick = () =>
      view(button.dataset.go);

  });

$("home").onclick = async () => {

  if (currentUser) {
    view("homeView");
  } else {
    showLogin();
  }

};


/* =========================
   AUTH BUTTONS
========================= */

$("login").onclick = login;
$("signup").onclick = signup;

$("showSignup").onclick =
  showSignup;

$("showLogin").onclick =
  showLogin;

$("logout").onclick =
  logout;

$("settingsLogout").onclick =
  logout;


/* =========================
   CLEAR LOCAL DATA
========================= */

$("clear").onclick = () => {

  if (
    confirm(
      "Clear local quiz results?"
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


/* =========================
   LEADERBOARD TABS
========================= */

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".tab")
        .forEach(x =>
          x.classList.remove(
            "active"
          )
        );

      button.classList.add(
        "active"
      );

      renderBoard(
        button.dataset.board
      );
    };
  });


/* =========================
   ENTER KEY FOR AUTH
========================= */

$("loginPassword")
  .addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        login();
      }

    }
  );

$("signupPassword2")
  .addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        signup();
      }

    }
  );


/* =========================
   INITIALISE
========================= */

renderTests();
renderResults();
updateSession();

supabase.auth.onAuthStateChange(
  async (event, session) => {

    currentUser =
      session?.user || null;

    if (currentUser) {
      await loadProfile();
    } else {
      showLogin();
    }

  }
);

checkAuth();

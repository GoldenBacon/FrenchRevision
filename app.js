// =====================================================
// FRENCH REVISION APP
// Local-only version.
// No accounts. No Supabase.
// =====================================================


let currentCategory = null;
let currentTest = null;
let currentMode = null;
let quiz = null;


// =====================================================
// SESSION
// =====================================================

const session = {
  answered: 0,
  correct: 0,
  points: 0
};


// =====================================================
// HELPERS
// =====================================================

const $ = id => document.getElementById(id);


function get(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key)
    );

    return value ?? fallback;

  } catch {
    return fallback;
  }
}


function set(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


function shuffle(array) {

  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] =
      [copy[j], copy[i]];
  }

  return copy;
}


function norm(value) {

  return String(value)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.!?;:]/g, "")
    .replace(/\s+/g, " ");
}


function esc(value) {

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}


function isRapidMode() {

  return (
    currentMode === "rapid-multiple" ||
    currentMode === "rapid-typing"
  );
}


// =====================================================
// VIEW NAVIGATION
// =====================================================

function view(id) {

  document
    .querySelectorAll(".view")
    .forEach(element => {
      element.classList.remove("active");
    });


  const target = $(id);

  if (target) {

    target.classList.add("active");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}


// =====================================================
// SESSION DISPLAY
// =====================================================

function updateSession() {

  $("sessionAnswered").textContent =
    session.answered;


  $("sessionAccuracy").textContent =
    session.answered
      ? `${Math.round(
          session.correct /
          session.answered *
          100
        )}%`
      : "0%";


  $("sessionPoints").textContent =
    session.points;


  const stats =
    get("wordStats", {});


  const mistakes =
    Object.values(stats)
      .filter(stat =>
        stat.attempts > stat.correct
      )
      .length;


  $("mistakesInfo").textContent =
    mistakes
      ? `${mistakes} word${
          mistakes === 1 ? "" : "s"
        } currently have mistakes.`
      : "No recorded mistakes yet.";
}


// =====================================================
// DARK MODE
// =====================================================

function setupDarkMode() {

  if (
    localStorage.getItem("darkMode") === "1"
  ) {

    document.documentElement
      .classList.add("dark");

    $("darkToggle").textContent = "☀️";

  } else {

    $("darkToggle").textContent = "🌙";
  }


  $("darkToggle").onclick = () => {

    const dark =
      document.documentElement
        .classList.toggle("dark");


    localStorage.setItem(
      "darkMode",
      dark ? "1" : "0"
    );


    $("darkToggle").textContent =
      dark ? "☀️" : "🌙";
  };
}


// =====================================================
// WORD ACCURACY
// =====================================================

function recordWord(fr, correct) {

  const stats =
    get("wordStats", {});


  if (!stats[fr]) {

    stats[fr] = {
      attempts: 0,
      correct: 0
    };
  }


  stats[fr].attempts++;


  if (correct) {
    stats[fr].correct++;
  }


  set("wordStats", stats);
}


function getAllWords() {

  const words = [];


  for (const test of TESTS) {

    for (
      const [fr, en]
      of Object.entries(test.words)
    ) {

      if (
        !words.some(word =>
          word.fr === fr
        )
      ) {

        words.push({
          fr,
          en
        });
      }
    }
  }


  return words;
}


function renderWordStats() {

  const stats =
    get("wordStats", {});


  const query =
    norm($("wordSearch").value);


  const words =
    getAllWords();


  const filtered =
    words.filter(word => {

      return (
        !query ||
        norm(word.fr).includes(query) ||
        norm(word.en).includes(query)
      );
    });


  if (!filtered.length) {

    $("wordStats").innerHTML =
      `<p class="muted">No words found.</p>`;

    return;
  }


  $("wordStats").innerHTML =
    filtered.map(word => {

      const stat =
        stats[word.fr] || {
          attempts: 0,
          correct: 0
        };


      const accuracy =
        stat.attempts
          ? Math.round(
              stat.correct /
              stat.attempts *
              100
            )
          : 0;


      let cls = "";


      if (stat.attempts) {

        if (accuracy >= 80) {
          cls = "accuracy-good";
        }

        if (accuracy < 50) {
          cls = "accuracy-bad";
        }
      }


      return `
        <div class="word-row">

          <div>

            <strong>
              ${esc(word.fr)}
            </strong>

            <small>
              ${esc(word.en)}
            </small>

          </div>

          <div>

            <strong class="${cls}">
              ${
                stat.attempts
                  ? accuracy + "%"
                  : "—"
              }
            </strong>

            <small>
              ${stat.attempts}
              attempt${
                stat.attempts === 1
                  ? ""
                  : "s"
              }
            </small>

          </div>

        </div>
      `;

    }).join("");
}


// =====================================================
// CATEGORIES
// =====================================================

function getCategories() {

  return [
    ...new Set(
      TESTS.map(test =>
        test.category
      )
    )
  ].sort();
}


function renderCategories() {

  const query =
    norm($("categorySearch").value);


  const categories =
    getCategories()
      .filter(category =>
        !query ||
        norm(category).includes(query)
      );


  if (!categories.length) {

    $("categories").innerHTML =
      `<p class="muted">
        No categories found.
      </p>`;

    return;
  }


  $("categories").innerHTML =
    categories.map(category => {

      const tests =
        TESTS.filter(
          test =>
            test.category === category
        );


      const wordCount =
        tests.reduce(
          (total, test) =>
            total +
            Object.keys(test.words).length,
          0
        );


      return `
        <button
          class="category-card"
          data-category="${esc(category)}"
        >

          <b>
            📁 ${esc(category)}
          </b>

          <small>
            ${tests.length}
            test${tests.length === 1 ? "" : "s"}
            ·
            ${wordCount}
            word${wordCount === 1 ? "" : "s"}
          </small>

        </button>
      `;

    }).join("");


  document
    .querySelectorAll("[data-category]")
    .forEach(button => {

      button.onclick = () => {

        currentCategory =
          button.dataset.category;


        renderTests();

        view("testsView");
      };
    });
}


// =====================================================
// TEST LIST
// =====================================================

function categoryTests() {

  return TESTS.filter(
    test =>
      test.category === currentCategory
  );
}


function mergeTests(tests) {

  const words = {};


  for (const test of tests) {

    for (
      const [fr, en]
      of Object.entries(test.words)
    ) {

      if (!words[fr]) {
        words[fr] = en;
      }
    }
  }


  return {

    id:
      `all-${currentCategory}`,

    category:
      currentCategory,

    title:
      `All ${currentCategory}`,

    description:
      `Every word from every test in ${currentCategory}.`,

    words

  };
}


function renderTests() {

  const tests =
    categoryTests();


  $("categoryTitle").textContent =
    currentCategory;


  const totalWords =
    tests.reduce(
      (total, test) =>
        total +
        Object.keys(test.words).length,
      0
    );


  $("allTestContainer").innerHTML = `

    <button
      id="allCategoryButton"
      class="all-card"
    >

      <b>
        ⭐ All tests in
        ${esc(currentCategory)}
      </b>

      <small>
        Test all
        ${totalWords}
        words from this category.
      </small>

    </button>

  `;


  $("allCategoryButton").onclick =
    () => {

      currentTest =
        mergeTests(tests);

      openMode();
    };


  $("tests").innerHTML =
    tests.map(test => `

      <button
        class="test-card"
        data-test-id="${esc(test.id)}"
      >

        <b>
          📝 ${esc(test.title)}
        </b>

        <small>
          ${esc(test.description)}
        </small>

        <small>
          ${
            Object.keys(test.words).length
          }
          words
        </small>

      </button>

    `).join("");


  document
    .querySelectorAll("[data-test-id]")
    .forEach(button => {

      button.onclick = () => {

        currentTest =
          TESTS.find(
            test =>
              test.id ===
              button.dataset.testId
          );


        openMode();
      };
    });
}


// =====================================================
// MODE SELECTION
// =====================================================

function openMode() {

  $("testTitle").textContent =
    currentTest.title;


  $("testDescription").textContent =
    `${currentTest.description} Choose a mode.`;


  view("modeView");
}


// =====================================================
// ANSWER CHECKING
// =====================================================

function expectedMeanings(expected) {

  return String(expected)
    .split("/")
    .map(norm)
    .filter(Boolean);
}


function typedMeanings(input) {

  return String(input)
    .split(/[,/;]+/)
    .map(norm)
    .filter(Boolean);
}


function isCorrect(input, expected) {

  const accepted =
    expectedMeanings(expected);


  const typed =
    typedMeanings(input);


  if (!typed.length) {
    return false;
  }


  return typed.every(
    answer =>
      accepted.includes(answer)
  );
}


// =====================================================
// MULTIPLE CHOICE
// =====================================================

function answerChoices(correct) {

  const others = [];


  for (const test of TESTS) {

    for (
      const value
      of Object.values(test.words)
    ) {

      if (
        value !== correct &&
        !others.includes(value)
      ) {

        others.push(value);
      }
    }
  }


  return shuffle([
    correct,
    ...shuffle(others).slice(0, 3)
  ]);
}


// =====================================================
// START QUIZ
// =====================================================

function startQuiz(mode) {

  currentMode = mode;


  const items =
    shuffle(
      Object.entries(
        currentTest.words
      )
    );


  quiz = {

    items,

    index: 0,

    points: 0,

    correct: 0,

    wrong: 0,

    streak: 0,

    bestStreak: 0,

    missed: [],

    answered: false,

    started: Date.now()

  };


  if (mode === "multiple") {

    $("quizMode").textContent =
      "Multiple Choice";

  } else if (mode === "typing") {

    $("quizMode").textContent =
      "Enter English";

  } else if (mode === "rapid-multiple") {

    $("quizMode").textContent =
      "⚡ Rapid Fire — Multiple Choice";

  } else {

    $("quizMode").textContent =
      "⚡ Rapid Fire — Enter English";
  }


  view("quizView");

  renderQuestion();
}


// =====================================================
// RENDER QUESTION
// =====================================================

function renderQuestion() {

  const [
    fr,
    en
  ] = quiz.items[quiz.index];


  quiz.answered = false;


  $("quizProgress").textContent =
    `${quiz.index + 1}/${quiz.items.length}`;


  $("progressFill").style.width =
    `${
      (
        (quiz.index + 1) /
        quiz.items.length
      ) * 100
    }%`;


  $("quizPoints").textContent =
    `${quiz.points} pts`;


  $("question").textContent =
    fr;


  $("feedback").textContent = "";

  $("feedback").style.color =
    "var(--text)";


  $("nextButton")
    .classList.add("hidden");


  $("nextButton").onclick =
    nextQuestion;


  // ===================================================
  // MULTIPLE CHOICE
  // ===================================================

  if (
    currentMode === "multiple" ||
    currentMode === "rapid-multiple"
  ) {

    $("answers").innerHTML =
      answerChoices(en)
        .map(answer => `

          <button
            class="answer"
            data-answer="${esc(answer)}"
          >
            ${esc(answer)}
          </button>

        `)
        .join("");


    document
      .querySelectorAll(".answer")
      .forEach(button => {

        button.onclick = () => {

          checkAnswer(
            button.dataset.answer,
            en,
            fr,
            button
          );

        };
      });


    return;
  }


  // ===================================================
  // TYPING
  // ===================================================

  $("answers").innerHTML = `

    <div class="typing-row">

      <input
        id="typingInput"
        type="text"
        placeholder="Enter one or more English meanings"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
      >

      <button
        id="checkTyping"
        class="primary"
      >
        Check
      </button>

    </div>

  `;


  $("typingInput").focus();


  $("checkTyping").onclick =
    () => {

      checkAnswer(
        $("typingInput").value,
        en,
        fr
      );
    };


  $("typingInput").onkeydown =
    event => {

      if (event.key !== "Enter") {
        return;
      }


      event.preventDefault();


      // In rapid-fire typing, Enter submits
      // and immediately moves on.

      if (
        currentMode ===
        "rapid-typing"
      ) {

        if (!quiz.answered) {

          $("checkTyping").click();
        }

        return;
      }


      // In normal typing mode, Enter checks
      // the answer first.

      if (!quiz.answered) {

        $("checkTyping").click();

      } else {

        nextQuestion();
      }
    };
}


// =====================================================
// CHECK ANSWER
// =====================================================

function checkAnswer(
  given,
  expected,
  fr,
  clickedButton = null
) {

  if (quiz.answered) {
    return;
  }


  quiz.answered = true;


  const correct =
    isCorrect(
      given,
      expected
    );


  // ===================================================
  // RECORD STATS
  // ===================================================

  session.answered++;


  if (correct) {
    session.correct++;
  }


  recordWord(
    fr,
    correct
  );


  updateSession();


  // ===================================================
  // CORRECT
  // ===================================================

  if (correct) {

    quiz.correct++;

    quiz.streak++;


    quiz.bestStreak =
      Math.max(
        quiz.bestStreak,
        quiz.streak
      );


    const earned =
      10 +
      Math.min(
        quiz.streak - 1,
        5
      ) * 2;


    quiz.points += earned;

    session.points += earned;

  }


  // ===================================================
  // WRONG
  // ===================================================

  else {

    quiz.wrong++;

    quiz.streak = 0;


    quiz.missed.push({
      fr,
      en: expected
    });
  }


  // ===================================================
  // RAPID FIRE
  // ===================================================
  //
  // No feedback.
  // No Next button.
  // Go straight to the next question.
  //

  if (isRapidMode()) {

    $("quizPoints").textContent =
      `${quiz.points} pts`;


    nextQuestion();

    return;
  }


  // ===================================================
  // NORMAL MODE FEEDBACK
  // ===================================================

  if (correct) {

    const earned =
      10 +
      Math.min(
        quiz.streak - 1,
        5
      ) * 2;


    $("feedback").textContent =
      `+${earned} points — Correct! 🔥`;


    $("feedback").style.color =
      "var(--good)";

  } else {

    $("feedback").textContent =
      `Not quite. Accepted answer: ${expected}`;


    $("feedback").style.color =
      "var(--bad)";
  }


  // ===================================================
  // MULTIPLE CHOICE FEEDBACK
  // ===================================================

  if (clickedButton) {

    const buttons =
      document.querySelectorAll(
        ".answer"
      );


    buttons.forEach(button => {

      button.disabled = true;


      if (
        isCorrect(
          button.dataset.answer,
          expected
        )
      ) {

        button.classList.add(
          "correct"
        );
      }

    });


    if (!correct) {

      clickedButton.classList.add(
        "wrong"
      );
    }
  }


  $("quizPoints").textContent =
    `${quiz.points} pts`;


  $("nextButton")
    .classList.remove("hidden");
}


// =====================================================
// NEXT QUESTION
// =====================================================

function nextQuestion() {

  if (!quiz) {
    return;
  }


  quiz.index++;


  if (
    quiz.index >=
    quiz.items.length
  ) {

    finishQuiz();

  } else {

    renderQuestion();
  }
}


// =====================================================
// RESULTS
// =====================================================

function finishQuiz() {

  const seconds =
    Math.max(
      0,
      Math.round(
        (Date.now() - quiz.started) /
        1000
      )
    );


  const accuracy =
    quiz.items.length
      ? Math.round(
          quiz.correct /
          quiz.items.length *
          100
        )
      : 0;


  const result = {

    test:
      currentTest.title,

    mode:
      currentMode,

    points:
      quiz.points,

    seconds,

    questions:
      quiz.items.length,

    correct:
      quiz.correct,

    wrong:
      quiz.wrong,

    accuracy,

    bestStreak:
      quiz.bestStreak,

    missed:
      quiz.missed
  };


  const history =
    get("results", []);


  history.unshift(result);


  set(
    "results",
    history.slice(0, 100)
  );


  let modeName;


  switch (currentMode) {

    case "multiple":
      modeName = "Multiple Choice";
      break;

    case "typing":
      modeName = "Enter English";
      break;

    case "rapid-multiple":
      modeName =
        "⚡ Rapid Fire — Multiple Choice";
      break;

    case "rapid-typing":
      modeName =
        "⚡ Rapid Fire — Enter English";
      break;
  }


  $("resultSubtitle").textContent =
    `${currentTest.title} · ${modeName}`;


  $("resultStats").innerHTML = `

    <div class="result-stat">
      <strong>${result.points}</strong>
      <span>Points</span>
    </div>

    <div class="result-stat">
      <strong>${result.accuracy}%</strong>
      <span>Accuracy</span>
    </div>

    <div class="result-stat">
      <strong>
        ${result.correct}/${result.questions}
      </strong>
      <span>Correct</span>
    </div>

    <div class="result-stat">
      <strong>${result.wrong}</strong>
      <span>Wrong</span>
    </div>

    <div class="result-stat">
      <strong>
        ${formatTime(result.seconds)}
      </strong>
      <span>Time</span>
    </div>

    <div class="result-stat">
      <strong>${result.bestStreak}</strong>
      <span>Best streak</span>
    </div>

  `;


  if (result.missed.length) {

    $("missedWords").innerHTML =
      result.missed
        .map(word => `

          <div class="missed">

            <strong>
              ${esc(word.fr)}
            </strong>

            <div class="muted">
              ${esc(word.en)}
            </div>

          </div>

        `)
        .join("");

  } else {

    $("missedWords").innerHTML =
      `<p class="muted">
        Perfect — no missed words! 🎉
      </p>`;
  }


  $("againButton").onclick =
    () => startQuiz(currentMode);


  updateSession();

  renderWordStats();

  view("resultsView");
}


// =====================================================
// TIME FORMAT
// =====================================================

function formatTime(seconds) {

  if (seconds < 60) {
    return `${seconds}s`;
  }


  const minutes =
    Math.floor(seconds / 60);


  const remaining =
    seconds % 60;


  return `${minutes}m ${remaining}s`;
}


// =====================================================
// PRACTICE MISTAKES
// =====================================================

function startMistakes() {

  const stats =
    get("wordStats", {});


  const words = {};


  for (const test of TESTS) {

    for (
      const [fr, en]
      of Object.entries(test.words)
    ) {

      const stat =
        stats[fr];


      if (
        stat &&
        stat.attempts >
        stat.correct
      ) {

        words[fr] = en;
      }
    }
  }


  if (
    !Object.keys(words).length
  ) {

    alert(
      "You don't have any recorded mistakes yet."
    );

    return;
  }


  currentTest = {

    id:
      "mistakes",

    category:
      "Practice",

    title:
      "Practice Mistakes",

    description:
      "Words you have previously got wrong.",

    words

  };


  openMode();
}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

  $("testsButton").onclick =
    () => {

      renderCategories();

      view("categoriesView");
    };


  $("statsButton").onclick =
    () => {

      renderWordStats();

      view("statsView");
    };


  document
    .querySelectorAll("[data-back]")
    .forEach(button => {

      button.onclick = () => {

        const target =
          button.dataset.back;


        if (
          target ===
          "categoriesView"
        ) {

          renderCategories();
        }


        if (
          target ===
          "testsView" &&
          currentCategory
        ) {

          renderTests();
        }


        view(target);
      };
    });


  $("exitQuiz").onclick =
    () => {

      quiz = null;

      view("homeView");
    };
}


// =====================================================
// EVENTS
// =====================================================

function setupEvents() {

  $("categorySearch").oninput =
    renderCategories;


  $("wordSearch").oninput =
    renderWordStats;


  document
    .querySelectorAll(".mode-card")
    .forEach(button => {

      button.onclick = () => {

        startQuiz(
          button.dataset.mode
        );
      };
    });


  $("mistakesButton").onclick =
    startMistakes;


  // ===================================================
  // PC ENTER KEY
  // ===================================================
  //
  // If a normal question has already been answered,
  // pressing Enter does the same thing as clicking Next.
  //
  // For typing questions, Enter is handled by the
  // typing input itself.
  //

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter" ||
        !quiz ||
        isRapidMode()
      ) {

        return;
      }


      if (
        $("nextButton")
          .classList
          .contains("hidden")
      ) {

        return;
      }


      // Avoid triggering twice from the
      // typing input handler.

      if (
        document.activeElement &&
        document.activeElement.id ===
        "typingInput"
      ) {

        return;
      }


      event.preventDefault();

      nextQuestion();
    }
  );
}


// =====================================================
// START APP
// =====================================================

function init() {

  setupDarkMode();

  setupNavigation();

  setupEvents();

  renderCategories();

  renderWordStats();

  updateSession();
}


init();


// =====================================================
// OFFLINE / PWA
// =====================================================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {

          console.log(
            "French Revision is ready for offline use."
          );

        })
        .catch(error => {

          console.error(
            "Service worker registration failed:",
            error
          );

        });

    }
  );
}

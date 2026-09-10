let currentTest,currentMode,quiz;

const session={
  answered:0,
  correct:0,
  points:0,
  started:Date.now(),
  wordStats:{}
};

const MODES={
  multiple:["🔘","Multiple Choice","Pick the English meaning."],
  typing:["⌨️","Enter English","Type the English meaning."]
};

const $=x=>document.getElementById(x);

const get=(k,d)=>{
  try{return JSON.parse(localStorage.getItem(k))??d}
  catch{return d}
};

const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

const norm=s=>String(s??"")
  .toLowerCase()
  .trim()
  .replace(/[.,!?;:]/g,"")
  .replace(/\s+/g," ");

const acceptedAnswers=s=>
  String(s??"")
    .split("/")
    .map(norm)
    .filter(Boolean);

const isCorrect=(given,expected)=>
  acceptedAnswers(expected).includes(norm(given));

function view(id){
  document.querySelectorAll(".view")
    .forEach(x=>x.classList.remove("active"));

  $(id).classList.add("active");
  scrollTo(0,0);
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

function updateSession(){
  $("session").textContent=
    `${session.answered} answered · ${
      session.answered
        ? Math.round(session.correct/session.answered*100)
        : 0
    }% accuracy`;
}

function statsWord(fr,ok){

  session.wordStats[fr]??={
    attempts:0,
    correct:0
  };

  session.wordStats[fr].attempts++;

  if(ok)
    session.wordStats[fr].correct++;

  const s=get("wordStats",{});

  s[fr]??={
    attempts:0,
    correct:0
  };

  s[fr].attempts++;

  if(ok)
    s[fr].correct++;

  set("wordStats",s);
}

function renderTests(){

  $("tests").innerHTML=TESTS.map(t=>`
    <button class="card test" data-test="${t.id}">
      <h2>${esc(t.title)}</h2>
      <span>${esc(t.description)}</span>
      <small>${Object.keys(t.words).length} words</small>
    </button>
  `).join("");

  document.querySelectorAll("[data-test]").forEach(b=>{

    b.onclick=()=>{
      currentTest=TESTS.find(t=>t.id===b.dataset.test);

      $("testName").textContent=currentTest.title;

      renderModes();

      view("modeView");
    };

  });
}

function renderModes(){

  const n=Object.keys(currentTest.words).length;

  const counts=[10,20,30,"all"]
    .filter(x=>x==="all"||x<=n);

  $("modes").innerHTML=`

    <div class="choice-panel">

      <b>Number of questions</b>

      <div class="count-buttons">

        ${counts.map(x=>`
          <button
            class="count ${x==="all"?"selected":""}"
            data-count="${x}">
            ${x==="all"?"All":x}
          </button>
        `).join("")}

      </div>

    </div>

    ${Object.entries(MODES).map(([id,x])=>`

      <button class="card mode" data-mode="${id}">
        <span>${x[0]}</span>
        <b>${x[1]}</b>
        <small>${x[2]}</small>
      </button>

    `).join("")}

    <button class="secondary mistakes" id="mistakes">
      🎯 Practice Mistakes
    </button>
  `;

  document.querySelectorAll(".count").forEach(b=>{

    b.onclick=()=>{

      document.querySelectorAll(".count")
        .forEach(x=>x.classList.remove("selected"));

      b.classList.add("selected");
    };

  });

  document.querySelectorAll("[data-mode]").forEach(b=>{
    b.onclick=()=>start(
      b.dataset.mode,
      selectedCount()
    );
  });

  $("mistakes").onclick=startMistakes;
}

function selectedCount(){

  const b=document.querySelector(".count.selected");

  return b ? b.dataset.count : "all";
}

function shuffled(a){
  return [...a].sort(()=>Math.random()-.5);
}

function start(mode,count="all"){

  currentMode=mode;

  let items=shuffled(
    Object.entries(currentTest.words)
  );

  if(count!=="all")
    items=items.slice(0,Number(count));

  quiz={
    items,
    i:0,
    points:0,
    streak:0,
    bestStreak:0,
    started:Date.now(),
    mistakes:[]
  };

  view("quizView");

  renderQ();
}

function startMistakes(){

  const stats=get("wordStats",{});

  const items=Object.entries(currentTest.words)
    .filter(([fr])=>
      stats[fr] &&
      stats[fr].attempts>0 &&
      stats[fr].correct<stats[fr].attempts
    );

  if(!items.length){
    alert("No mistakes yet for this test!");
    return;
  }

  currentMode="typing";

  quiz={
    items:shuffled(items),
    i:0,
    points:0,
    streak:0,
    bestStreak:0,
    started:Date.now(),
    mistakes:[]
  };

  view("quizView");

  renderQ();
}

function choices(correct){

  return [
    correct,
    ...Object.values(currentTest.words)
      .filter(x=>x!==correct)
      .sort(()=>Math.random()-.5)
      .slice(0,3)
  ].sort(()=>Math.random()-.5);
}

function renderQ(){

  const [fr,en]=quiz.items[quiz.i];

  $("progress").textContent=
    `${quiz.i+1}/${quiz.items.length}`;

  $("points").textContent=
    `${quiz.points} pts`;

  $("modeLabel").textContent=
    MODES[currentMode][1];

  $("question").textContent=fr;

  $("feedback").textContent="";

  $("next").classList.add("hidden");

  $("next").classList.remove("answered");

  if($("streak"))
    $("streak").textContent=`🔥 ${quiz.streak}`;

  if(currentMode==="multiple"){

    $("answers").innerHTML=
      choices(en).map(a=>`

        <button
          class="answer"
          data-a="${esc(a)}">
          ${esc(a)}
        </button>

      `).join("");

    document.querySelectorAll(".answer").forEach(b=>{

      b.onclick=()=>
        answer(
          b.dataset.a,
          en,
          fr,
          b
        );

    });

  }else{

    $("answers").innerHTML=`

      <div class="row">

        <input
          id="typing"
          placeholder="English meaning"
          autocomplete="off">

        <button id="check" class="primary">
          Check
        </button>

      </div>
    `;

    $("typing").focus();

    $("check").onclick=()=>
      answer(
        $("typing").value,
        en,
        fr
      );

    $("typing").onkeydown=e=>{
      if(e.key==="Enter")
        $("check").click();
    };
  }
}

function answer(given,en,fr,clicked){

  if($("next").classList.contains("answered"))
    return;

  const ok=isCorrect(given,en);

  session.answered++;

  let earned=0;

  if(ok){

    session.correct++;

    earned=
      10+
      Math.min(quiz.streak,5)*2;

    session.points+=earned;

    quiz.points+=earned;

    quiz.streak++;

    quiz.bestStreak=
      Math.max(
        quiz.bestStreak,
        quiz.streak
      );

  }else{

    quiz.streak=0;

    quiz.mistakes.push(fr);
  }

  statsWord(fr,ok);

  updateSession();

  if(clicked){

    document.querySelectorAll(".answer")
      .forEach(b=>{

        b.disabled=true;

        if(
          acceptedAnswers(en)
            .includes(norm(b.dataset.a))
        ){
          b.classList.add("correct");
        }

      });

    if(!ok)
      clicked.classList.add("wrong");
  }

  $("feedback").textContent=
    ok
      ? `+${earned} points — Correct!`
      : `Answer: ${en}`;

  $("feedback").style.color=
    ok
      ? "var(--good)"
      : "var(--bad)";

  $("next").classList.remove("hidden");

  $("next").classList.add("answered");

  $("next").onclick=next;
}

function next(){

  quiz.i++;

  if(quiz.i>=quiz.items.length)
    finish();
  else
    renderQ();
}

function finish(){

  const seconds=Math.max(
    1,
    Math.round(
      (Date.now()-quiz.started)/1000
    )
  );

  const correct=
    quiz.items.length-
    quiz.mistakes.length;

  const result={
    test:currentTest.title,
    mode:MODES[currentMode][1],
    questions:quiz.items.length,
    correct,
    points:quiz.points,
    seconds,
    bestStreak:quiz.bestStreak,
    mistakes:quiz.mistakes,
    date:new Date().toISOString()
  };

  const r=get("results",[]);

  r.unshift(result);

  set(
    "results",
    r.slice(0,100)
  );

  renderResults(result);

  view("resultsView");
}

function time(s){

  return s>=3600
    ? `${Math.floor(s/3600)}h ${Math.floor(s%3600/60)}m`
    : s>=60
      ? `${Math.floor(s/60)}m ${s%60}s`
      : `${s}s`;
}

function renderResults(last){

  const r=get("results",[]);

  const w=get("wordStats",{});

  const a=Object.values(w)
    .reduce(
      (n,x)=>n+x.attempts,
      0
    );

  const c=Object.values(w)
    .reduce(
      (n,x)=>n+x.correct,
      0
    );

  $("summary").innerHTML=[

    [
      last ? last.points : 0,
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
      a
        ? Math.round(c/a*100)+"%"
        : "0%",
      "Lifetime word accuracy"
    ],

    [
      a,
      "Word attempts"
    ]

  ].map(x=>`

    <div class="stat">
      <b>${x[0]}</b>
      <small>${x[1]}</small>
    </div>

  `).join("");

  $("words").innerHTML=
    Object.entries(w)
      .sort(
        (a,b)=>
          b[1].attempts-
          a[1].attempts
      )
      .map(([x,s])=>`

        <div class="word">

          <span>
            ${esc(x)}

            <small>
              <br>
              ${s.correct}/${s.attempts}
              correct
            </small>
          </span>

          <b>
            ${Math.round(
              s.correct/s.attempts*100
            )}%
          </b>

        </div>

      `)
      .join("")
      ||
      "<p class='muted'>No attempts yet.</p>";

  if($("mistakesList")){

    $("mistakesList").innerHTML=
      last &&
      last.mistakes.length

        ? `

          <h3>Words to practice</h3>

          ${
            [...new Set(last.mistakes)]
              .map(x=>`

                <div class="word">
                  <span>${esc(x)}</span>
                </div>

              `)
              .join("")
          }

        `

        : "";
  }
}

function renderBoard(type){

  const x=get("demoBoard",[])
    .sort((a,b)=>
      type==="points"
        ? b.points-a.points
        : b.seconds-a.seconds
    );

  $("board").innerHTML=
    x.length

      ? x.slice(0,20)
        .map((u,i)=>`

          <div class="rank">

            <b>#${i+1}</b>

            <b>${esc(u.username)}</b>

            <b>
              ${
                type==="points"
                  ? u.points+" pts"
                  : time(u.seconds)
              }
            </b>

          </div>

        `)
        .join("")

      : "<p class='muted'>Connect a backend for a global leaderboard.</p>";
}

renderTests();

renderResults();

updateSession();

$("dark").onclick=()=>{

  document.documentElement
    .classList.toggle("dark");

  localStorage.setItem(
    "dark",
    document.documentElement.classList.contains("dark")
      ? "1"
      : "0"
  );
};

if(localStorage.getItem("dark")==="1")
  document.documentElement.classList.add("dark");

document.querySelectorAll("[data-go]")
  .forEach(b=>
    b.onclick=()=>view(b.dataset.go)
  );

$("home").onclick=()=>
  view("homeView");

$("username").value=
  localStorage.getItem("username")||"";

$("save").onclick=()=>{

  const n=$("username").value.trim();

  if(!/^[A-Za-z0-9_]{3,20}$/.test(n)){

    $("nameMsg").textContent=
      "Invalid username.";

    return;
  }

  localStorage.setItem(
    "username",
    n
  );

  $("nameMsg").textContent=
    `Saved as ${n}.`;
};

$("clear").onclick=()=>{

  if(confirm("Clear local results?")){

    localStorage.removeItem("results");

    localStorage.removeItem("wordStats");

    renderResults();
  }
};

document.querySelectorAll(".tab")
  .forEach(b=>{

    b.onclick=()=>{

      document.querySelectorAll(".tab")
        .forEach(x=>
          x.classList.remove("active")
        );

      b.classList.add("active");

      renderBoard(
        b.dataset.board
      );
    };

  });

renderBoard("points");

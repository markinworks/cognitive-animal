/* ════════════════════════════════════════════════════════
   COGNITIVE ANIMAL — quiz logic
   QUESTIONS（questions.js）を出題し、回答からVAK×EAWPの
   タイプを判定して該当アニマルページへ遷移する。
════════════════════════════════════════════════════════ */

const ANIMAL_CODE_TO_SLUG = {
  VE: "tako",
  VA: "karasu",
  VW: "taka",
  VP: "beaver",
  AE: "kujira",
  AA: "koumori",
  AW: "ookami",
  AP: "inko",
  KE: "umigame",
  KA: "mogura",
  KW: "zou",
  KP: "yagi"
};

let currentIndex = 0;
const answers = new Array(QUESTIONS.length).fill(null);

function trackEvent(name, params) {
  if (typeof gtag === "function") {
    gtag("event", name, params || {});
  }
}

function render() {
  const q = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;

  document.getElementById("progress-fill").style.width =
    (((currentIndex + 1) / total) * 100) + "%";
  document.getElementById("progress-count").textContent =
    String(currentIndex + 1).padStart(2, "0") + " / " + total;

  document.getElementById("question-eyebrow").textContent = "Q" + (currentIndex + 1);
  document.getElementById("question-text").textContent = q.text;

  const list = document.getElementById("options-list");
  list.innerHTML = "";
  q.options.forEach(function (opt) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.dataset.optionId = opt.id;

    const radio = document.createElement("span");
    radio.className = "quiz-option-radio";

    const text = document.createElement("span");
    text.className = "quiz-option-text";
    text.textContent = opt.text;

    btn.appendChild(radio);
    btn.appendChild(text);

    const currentAnswer = answers[currentIndex];
    if (currentAnswer && currentAnswer.optionId === opt.id) {
      btn.classList.add("is-selected");
    }

    btn.addEventListener("click", function () {
      selectOption(opt);
    });

    li.appendChild(btn);
    list.appendChild(li);
  });

  const backBtn = document.getElementById("back-btn");
  backBtn.classList.toggle("is-disabled", currentIndex === 0);
  backBtn.disabled = currentIndex === 0;

  const nextBtn = document.getElementById("next-btn");
  const answered = !!answers[currentIndex];
  nextBtn.classList.toggle("is-active", answered);
  nextBtn.textContent = currentIndex === total - 1 ? "結果を見る" : "次へ";
}

function selectOption(opt) {
  answers[currentIndex] = {
    optionId: opt.id,
    axis: opt.axis,
    points: opt.points
  };
  render();
}

function goBack() {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  render();
}

function goNext() {
  const answer = answers[currentIndex];
  if (!answer) return;

  const q = QUESTIONS[currentIndex];
  trackEvent("question_answered", {
    question_number: currentIndex + 1,
    axis_group: q.axisGroup,
    selected_axis: answer.axis
  });

  if (currentIndex === QUESTIONS.length - 1) {
    finishQuiz();
    return;
  }

  currentIndex += 1;
  render();
}

function pickTop(scores, tiebreakAxis) {
  const values = Object.values(scores);
  const max = Math.max.apply(null, values);
  const top = Object.keys(scores).filter(function (key) {
    return scores[key] === max;
  });
  if (top.length === 1) return top[0];
  if (tiebreakAxis && top.indexOf(tiebreakAxis) !== -1) return tiebreakAxis;
  return top[0];
}

function finishQuiz() {
  const vakScores = { V: 0, A: 0, K: 0 };
  const eawpScores = { E: 0, A: 0, W: 0, P: 0 };

  QUESTIONS.forEach(function (q, index) {
    const answer = answers[index];
    if (!answer) return;
    if (q.axisGroup === "VAK") {
      vakScores[answer.axis] += answer.points;
    } else {
      eawpScores[answer.axis] += answer.points;
    }
  });

  // Q6（VAKの最終問・最高配点）と Q16（is_tiebreaker）を同点時の決定打にする
  const vakTiebreakIndex = QUESTIONS.findIndex(function (q) {
    return q.axisGroup === "VAK" && q.id === "Q6";
  });
  const eawpTiebreakIndex = QUESTIONS.findIndex(function (q) {
    return q.isTiebreaker;
  });

  const vakTiebreakAxis = answers[vakTiebreakIndex] ? answers[vakTiebreakIndex].axis : null;
  const eawpTiebreakAxis = answers[eawpTiebreakIndex] ? answers[eawpTiebreakIndex].axis : null;

  const topVak = pickTop(vakScores, vakTiebreakAxis);
  const topEawp = pickTop(eawpScores, eawpTiebreakAxis);

  const animalCode = topVak + topEawp;
  const slug = ANIMAL_CODE_TO_SLUG[animalCode];

  trackEvent("quiz_complete", {
    result_type: animalCode,
    vak_axis: topVak,
    eawp_axis: topEawp
  });

  if (!slug) {
    console.error("Unknown animal code:", animalCode);
    return;
  }

  window.location.href = "animals/" + slug + ".html?result=" + animalCode;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("back-btn").addEventListener("click", goBack);
  document.getElementById("next-btn").addEventListener("click", goNext);
  trackEvent("quiz_start");
  render();
});

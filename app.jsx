const { useState } = React;

const SKILLS = { vocab: "Vocabulary", grammar: "Grammar", reading: "Reading" };
const TEXT1 = "Hallo Tom,\nich bin Lena. Ich wohne in Hamburg. Am Samstag habe ich Geburtstag. Die Party ist um 18 Uhr bei mir zu Hause. Bring bitte Musik mit!\nBis bald, Lena";
const TEXT2 = "Bäckerei Kraus\nÖffnungszeiten:\nMontag bis Freitag: 7.00–18.00 Uhr\nSamstag: 7.00–13.00 Uhr\nSonntag: geschlossen";

const QUESTIONS = [
  { skill: "vocab", topic: "Everyday phrases", tip: "Learn the 20 most common A1 phrases (greetings, thanks, apologies) and say them aloud.", q: "Was bedeutet „Entschuldigung“?", o: ["Thank you", "Excuse me / sorry", "Goodbye", "Please"], a: 1 },
  { skill: "vocab", topic: "Opposites & adjectives", tip: "Practise common adjectives in pairs: groß–klein, alt–neu, schnell–langsam.", q: "Das Gegenteil von „groß“ ist …", o: ["alt", "neu", "schnell", "klein"], a: 3 },
  { skill: "vocab", topic: "Days, months & dates", tip: "Recite the weekdays and months in order, then practise saying dates and times.", q: "Welcher Monat kommt nach Mai?", o: ["Juni", "April", "Juli", "März"], a: 0 },
  { skill: "vocab", topic: "Places & shops", tip: "Match shops and professions to what you buy or do there (Bäcker, Arzt, Friseur …).", q: "Man kauft Brot beim …", o: ["Arzt", "Friseur", "Bäcker", "Busfahrer"], a: 2 },
  { skill: "grammar", topic: "Verb conjugation (ich/du/er)", tip: "Drill regular verb endings: ich -e, du -st, er/sie -t, wir/sie -en.", q: "Ich ___ Anna.", o: ["heißt", "heiße", "heißen", "heiß"], a: 1 },
  { skill: "grammar", topic: "Verb conjugation (ich/du/er)", tip: "Drill regular verb endings: ich -e, du -st, er/sie -t, wir/sie -en.", q: "Er ___ jeden Tag Fußball.", o: ["spiele", "spielst", "spielen", "spielt"], a: 3 },
  { skill: "grammar", topic: "Articles & cases", tip: "Learn ein/eine/einen: masculine nouns change to „einen“ after verbs like haben, brauchen, kaufen.", q: "Ich habe ___ Bruder.", o: ["ein", "eine", "einen", "einem"], a: 2 },
  { skill: "grammar", topic: "Word order with modal verbs", tip: "With möchten/können/müssen, the second verb goes to the END as an infinitive.", q: "Ich möchte Deutsch ___.", o: ["lerne", "lernt", "lernst", "lernen"], a: 3 },
  { skill: "reading", topic: "Reading informal messages", tip: "Read short A1 emails/messages and underline who, when, where, what to bring.", passage: TEXT1, q: "Wann ist die Party?", o: ["Am Sonntag um 18 Uhr", "Am Samstag um 18 Uhr", "Am Samstag um 8 Uhr", "Am Freitag um 18 Uhr"], a: 1 },
  { skill: "reading", topic: "Reading informal messages", tip: "Read short A1 emails/messages and underline who, when, where, what to bring.", passage: TEXT1, q: "Was soll Tom mitbringen?", o: ["Kuchen", "Blumen", "Getränke", "Musik"], a: 3 },
  { skill: "reading", topic: "Signs, times & opening hours", tip: "Practise reading signs, timetables and opening hours; focus on numbers and days.", passage: TEXT2, q: "Wie lange ist die Bäckerei am Samstag geöffnet?", o: ["Bis 13 Uhr", "Bis 18 Uhr", "Gar nicht", "Erst ab 13 Uhr"], a: 0 },
  { skill: "reading", topic: "Signs, times & opening hours", tip: "Practise reading signs, timetables and opening hours; focus on numbers and days.", passage: TEXT2, q: "Sie möchten am Sonntag Brot kaufen. Was ist richtig?", o: ["Die Bäckerei ist bis 13 Uhr offen.", "Die Bäckerei ist nur morgens offen.", "Die Bäckerei ist bis 18 Uhr offen.", "Die Bäckerei ist geschlossen."], a: 3 },
];

function label(p) {
  if (p >= 75) return { t: "Ready", c: "ok" };
  if (p >= 50) return { t: "Almost", c: "mid" };
  return { t: "Needs work", c: "bad" };
}

function analyse(answers) {
  const stats = {};
  Object.keys(SKILLS).forEach(k => (stats[k] = { right: 0, total: 0 }));
  QUESTIONS.forEach((q, i) => {
    stats[q.skill].total++;
    if (answers[i] === q.a) stats[q.skill].right++;
  });
  const pct = {};
  Object.keys(stats).forEach(k => (pct[k] = Math.round((100 * stats[k].right) / stats[k].total)));
  const right = QUESTIONS.filter((q, i) => answers[i] === q.a).length;
  const overall = Math.round((100 * right) / QUESTIONS.length);
  const min = Math.min(...Object.values(pct));
  let verdict;
  if (min >= 75) verdict = { t: "Likely ready on these skills", c: "ok", d: "You scored 75% or more in every area. Check listening, speaking and writing before you book." };
  else if (overall >= 60 && min >= 50) verdict = { t: "Almost there", c: "mid", d: "Your overall score is solid, but at least one area is still shaky. A few weeks of focused practice should help." };
  else verdict = { t: "Not ready yet", c: "bad", d: "Booking now would be risky. Work on the areas below first, then retake this check." };
  // practice list: missed topics, weakest skill first
  const seen = new Set();
  const todo = QUESTIONS.map((q, i) => ({ q, i }))
    .filter(x => answers[x.i] !== x.q.a)
    .sort((a, b) => pct[a.q.skill] - pct[b.q.skill])
    .filter(x => (seen.has(x.q.topic) ? false : seen.add(x.q.topic)))
    .slice(0, 3)
    .map(x => ({ topic: x.q.topic, skill: x.q.skill, tip: x.q.tip }));
  return { pct, overall, verdict, todo, right };
}

function Intro({ start }) {
  return (
    <div>
      <h1>Am I exam-ready?</h1>
      <p className="muted">A 12-question check for A1 German (Goethe / ÖSD). It covers vocabulary, grammar and reading, takes about 5 minutes, and tells you what to practise before you book.</p>
      <div className="card">
        <p style={{ margin: 0 }}>Answer without a dictionary. If you really don’t know, choose “I don’t know” instead of guessing, which gives you a more honest result.</p>
      </div>
      <button className="btn" onClick={start}>Start the check</button>
    </div>
  );
}

function Quiz({ answers, setAnswers, idx, setIdx, finish }) {
  const q = QUESTIONS[idx];
  const cur = answers[idx];
  const last = idx === QUESTIONS.length - 1;
  const pick = v => { const n = answers.slice(); n[idx] = v; setAnswers(n); };
  return (
    <div>
      <div className="muted" style={{ marginBottom: 6 }}>Question {idx + 1} of {QUESTIONS.length}</div>
      <div className="bar"><div style={{ width: ((idx + 1) / QUESTIONS.length) * 100 + "%" }} /></div>
      <div className="card">
        <span className="tag">{SKILLS[q.skill]}</span>
        {q.passage && <div className="passage">{q.passage}</div>}
        <h2>{q.q}</h2>
        {q.o.map((t, i) => (
          <button key={i} className={"opt" + (cur === i ? " sel" : "")} onClick={() => pick(i)}>{t}</button>
        ))}
        <button className={"opt dk" + (cur === -1 ? " sel" : "")} onClick={() => pick(-1)}>I don’t know</button>
      </div>
      <div className="row">
        <button className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Back</button>
        <button className="btn" disabled={cur === undefined} onClick={() => (last ? finish() : setIdx(idx + 1))}>{last ? "See my result" : "Next"}</button>
      </div>
    </div>
  );
}

function Result({ answers, restart }) {
  const r = analyse(answers);
  return (
    <div>
      <h1>Your result</h1>
      <div className="card">
        <div className={"bad ok mid".includes(r.verdict.c) ? r.verdict.c : ""} style={{ fontSize: 22, fontWeight: 700 }}>{r.verdict.t}</div>
        <p style={{ margin: "6px 0 0" }}>{r.verdict.d}</p>
        <p className="muted" style={{ margin: "10px 0 0" }}>Overall: {r.right} of {QUESTIONS.length} correct ({r.overall}%)</p>
      </div>
      <div className="card">
        <h2>By skill</h2>
        {Object.keys(SKILLS).map(k => {
          const l = label(r.pct[k]);
          return (
            <div className="skill" key={k}>
              <div className="top"><span>{SKILLS[k]}</span><span className={l.c}>{r.pct[k]}% · {l.t}</span></div>
              <div className="bar"><div style={{ width: r.pct[k] + "%" }} /></div>
            </div>
          );
        })}
        <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>Ready = 75% or more. Each skill has only 4 questions, so treat this as a guide, not a guarantee.</p>
      </div>
      <div className="card">
        <h2>Practise this before you book</h2>
        {r.todo.length === 0 ? (
          <p style={{ margin: 0 }}>No gaps found in these questions. Next, take a full practice exam that includes listening, speaking and writing.</p>
        ) : (
          <ol className="todo">
            {r.todo.map(t => (
              <li key={t.topic}><strong>{t.topic}</strong> <span className="muted">({SKILLS[t.skill]})</span><br />{t.tip}</li>
            ))}
          </ol>
        )}
        <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>Not covered here: listening, speaking and writing. The real exam tests all four, so practise those too.</p>
      </div>
      <details className="card">
        <summary>Review your answers</summary>
        {QUESTIONS.map((q, i) => {
          const ok = answers[i] === q.a;
          return (
            <div className="rev" key={i}>
              <div>{i + 1}. {q.q}</div>
              <div className={ok ? "ok" : "bad"}>{ok ? "✓ " : "✗ "}Your answer: {answers[i] === -1 ? "I don’t know" : q.o[answers[i]]}</div>
              {!ok && <div className="muted">Correct: {q.o[q.a]}</div>}
            </div>
          );
        })}
      </details>
      <button className="btn" onClick={restart}>Retake the check</button>
    </div>
  );
}

function App() {
  const [step, setStep] = useState("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const restart = () => { setAnswers([]); setIdx(0); setStep("intro"); window.scrollTo(0, 0); };
  return (
    <div className="wrap">
      {step === "intro" && <Intro start={() => setStep("quiz")} />}
      {step === "quiz" && <Quiz answers={answers} setAnswers={setAnswers} idx={idx} setIdx={setIdx} finish={() => { setStep("result"); window.scrollTo(0, 0); }} />}
      {step === "result" && <Result answers={answers} restart={restart} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

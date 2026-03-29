/**
 * WORKable NLP Signal Layer
 *
 * Analyses free-text answers to Q9, Q11, and Q14 and produces:
 *   - sentiment  : positive | neutral | negative | contradictory
 *   - urgency    : high | low | avoidance
 *   - signal     : alert | watch | clear
 *
 * Rule-based scoring — no external API required.
 */

// ─── Sentiment vocabulary ────────────────────────────────────────────────────

const POSITIVE_TERMS = [
  'clear', 'clearly', 'confident', 'confident', 'strong', 'proven', 'evidence',
  'specific', 'know exactly', 'solid', 'growth', 'works well', 'performing',
  'delivering', 'ahead', 'excellent', 'great results', 'we have', 'we deliver',
  'we consistently', 'we understand', 'demonstrated', 'track', 'measure',
  'monitor', 'achieved', 'hitting', 'on track', 'defined', 'structured',
  'documented', 'tested', 'validated', 'we know', 'established', 'concrete',
];

const NEGATIVE_TERMS = [
  'struggle', 'struggling', 'losing', 'problem', 'issue', 'concern', 'uncomfortable',
  "not sure", 'unclear', "don't know", 'difficult', 'hard to say', "can't", "won't",
  'pushback', 'push back', 'frustrated', 'frustration', 'disconnect', 'not working',
  'broken', 'fail', 'failing', "haven't", "can't seem", 'unable', 'no idea',
  'no one', 'nobody', 'always happens', 'keeps happening', 'behind', 'missed',
  'losing margin', 'margin compressed', 'price pressure', 'discounting', 'we discount',
  'they challenge', 'clients resist', 'pushback on price', 'don\'t understand',
  'nobody knows', 'not tracked', 'not measured', 'no visibility',
];

const DEFENSIVE_TERMS = [
  "it's complicated", 'not my', 'their fault', 'external', 'market conditions',
  'hard to measure', 'it depends', 'not really applicable', 'depends on',
  'out of our control', 'industry norm', 'everyone does this', 'typical for this sector',
];

const HEDGING_TERMS = [
  'maybe', 'perhaps', 'might', 'could be', 'sort of', 'kind of', 'i guess',
  'i think', 'possibly', 'somewhat', 'to some extent', 'not entirely',
  'generally speaking', 'broadly', 'in theory',
];

const VAGUE_OPTIMISM_TERMS = [
  "hopefully", 'should be fine', "we'll figure it out", "things will improve",
  'trust the process', 'things are moving', 'heading in the right direction',
  'getting better', 'in due course', 'eventually things',
];

// ─── Urgency vocabulary ──────────────────────────────────────────────────────

const HIGH_URGENCY_TERMS = [
  'urgent', 'urgently', 'critical', 'immediately', 'right now', 'this week',
  'losing', 'need to fix', 'must address', 'key issue', 'top priority',
  'pressing', 'crisis', 'falling behind', 'bleeding', 'this is the', 'biggest problem',
  'main challenge', "can't wait", 'growing problem', 'escalating', 'getting worse',
  'we need to', 'we must', 'cannot afford', 'at risk', 'breaking point',
];

const LOW_URGENCY_TERMS = [
  'fine for now', 'when we get to', 'eventually', 'at some point', 'not a priority',
  "it's okay", 'manageable', 'not critical', 'later', "we'll get there",
  'always been this way', 'not urgent', 'not pressing', 'been like this for years',
  'we usually', 'standard', 'always done this', 'nothing new', 'same as always',
  'status quo', 'nothing urgent', 'no issues really',
];

const AVOIDANCE_PHRASES = [
  'n/a', 'nothing', 'no issues', 'all good', 'fine', 'not applicable',
  'no comment', 'nothing to add', 'no blockers', 'no problems',
];

// ─── Core helpers ────────────────────────────────────────────────────────────

/**
 * Count how many terms from a list appear in the lowercased text.
 * Returns a hit count and a ratio (hits / termList.length).
 */
function countHits(text, terms) {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (lower.includes(term)) hits++;
  }
  return { hits, ratio: hits / terms.length };
}

/**
 * Returns true if the answer is an avoidance response:
 * very short, or matches known avoidance phrases.
 */
function isAvoidance(text) {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 4) return true;
  if (AVOIDANCE_PHRASES.some(p => trimmed === p || trimmed.startsWith(p + ' ') || trimmed.endsWith(' ' + p))) return true;
  return false;
}

// ─── Sentiment classifier ────────────────────────────────────────────────────

/**
 * @returns { label: 'positive'|'neutral'|'negative'|'contradictory', score: number, detail: string }
 */
function classifySentiment(text) {
  if (!text || text.trim().length === 0) {
    return { label: 'neutral', score: 0, detail: 'No text provided' };
  }

  const pos   = countHits(text, POSITIVE_TERMS).hits;
  const neg   = countHits(text, NEGATIVE_TERMS).hits;
  const def   = countHits(text, DEFENSIVE_TERMS).hits;
  const hedge = countHits(text, HEDGING_TERMS).hits;
  const vague = countHits(text, VAGUE_OPTIMISM_TERMS).hits;

  // Weighted raw score: positive pulls up, negatives pull down at different weights
  const rawScore = pos * 1.0 - neg * 1.2 - def * 0.8 - hedge * 0.5 - vague * 0.6;

  // Normalise to a -1 … +1 range (soft cap with tanh)
  const totalSignals = pos + neg + def + hedge + vague || 1;
  const normalised = Math.tanh(rawScore / Math.max(totalSignals, 1));

  let label;
  const bothSides = pos >= 1 && (neg + def) >= 1;

  if (bothSides && Math.abs(normalised) < 0.4) {
    label = 'contradictory';
  } else if (normalised >= 0.2) {
    label = 'positive';
  } else if (normalised <= -0.15) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  const detail = [
    pos  ? `${pos} positive signal(s)` : null,
    neg  ? `${neg} negative signal(s)` : null,
    def  ? `${def} defensive phrase(s)` : null,
    hedge? `${hedge} hedge(s)` : null,
    vague? `${vague} vague-optimism phrase(s)` : null,
  ].filter(Boolean).join(', ') || 'no strong signals detected';

  return { label, score: Math.round(normalised * 100) / 100, detail };
}

// ─── Urgency classifier ──────────────────────────────────────────────────────

/**
 * @returns { label: 'high'|'low'|'avoidance', score: number, detail: string }
 */
function classifyUrgency(text) {
  if (!text || text.trim().length === 0) {
    return { label: 'avoidance', score: -1, detail: 'Empty response' };
  }

  if (isAvoidance(text)) {
    return { label: 'avoidance', score: -1, detail: 'Technically answered but emotionally avoided' };
  }

  const high = countHits(text, HIGH_URGENCY_TERMS).hits;
  const low  = countHits(text, LOW_URGENCY_TERMS).hits;

  const rawScore = high * 1.2 - low * 1.0;
  const normalised = Math.tanh(rawScore / Math.max(high + low, 1));

  let label;
  if (normalised >= 0.15 || high >= 2) {
    label = 'high';
  } else if (normalised <= -0.1 || low >= 2) {
    label = 'low';
  } else {
    // Default: if answer exists but no strong urgency signal, lean low
    label = 'low';
  }

  const detail = [
    high ? `${high} high-urgency signal(s)` : null,
    low  ? `${low} low-urgency signal(s)` : null,
  ].filter(Boolean).join(', ') || 'no urgency signals detected';

  return { label, score: Math.round(normalised * 100) / 100, detail };
}

// ─── Combined signal ─────────────────────────────────────────────────────────

/**
 * Maps (sentiment, urgency) → { emoji, tier, label, colour }
 *
 * 🔴 Alert  — negative + high urgency   OR  negative + avoidance
 * 🟡 Watch  — neutral/contradictory     OR  negative + low urgency
 * 🟢 Clear  — positive + any urgency
 */
function combinedSignal(sentimentLabel, urgencyLabel) {
  if (sentimentLabel === 'positive') {
    return { emoji: '🟢', tier: 'clear',  label: 'Clear',  colour: '#34d399' };
  }

  if (sentimentLabel === 'negative') {
    if (urgencyLabel === 'high' || urgencyLabel === 'avoidance') {
      return { emoji: '🔴', tier: 'alert', label: 'Alert',  colour: '#f43f5e' };
    }
    // negative + low → Watch (acknowledged but not pressing — may still surface)
    return { emoji: '🟡', tier: 'watch',  label: 'Watch',  colour: '#fb923c' };
  }

  // neutral or contradictory
  return { emoji: '🟡', tier: 'watch', label: 'Watch', colour: '#fb923c' };
}

// ─── Question-level notes ────────────────────────────────────────────────────

const QUESTION_META = {
  q9: {
    label: 'Q9 — Margin & Value Creation Awareness',
    interpretation: {
      alert: 'Hidden pain point: management may not know where margin actually sits vs. where they believe value is created.',
      watch: 'Confidence gap detected: answer may be assertion rather than evidence.',
      clear: 'Management has clear, evidenced view of margin and value creation.',
    }
  },
  q11: {
    label: 'Q11 — Pricing & Innovation Confidence',
    interpretation: {
      alert: 'Pricing is politically charged here — likely internal disagreement or client-side frustration.',
      watch: 'Pricing confidence gap: hedging or deflection suggests unresolved tension.',
      clear: 'Strong pricing conviction with specific value rationale.',
    }
  },
  q14: {
    label: 'Q14 — Strategic Aspiration & Conviction',
    interpretation: {
      alert: 'Vague optimism masking real uncertainty — not a compounding asset signal.',
      watch: 'Mixed conviction: answer has some substance but lacks specificity or evidence.',
      clear: 'Genuine conviction with concrete evidence — compounding asset signal.',
    }
  },
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Analyse a single text answer for a given question key (q9 | q11 | q14).
 *
 * @param {string} questionKey — 'q9', 'q11', or 'q14'
 * @param {string} text        — free-text answer
 * @returns {object}           — full NLP result record
 */
function analyseQuestion(questionKey, text) {
  const sentiment = classifySentiment(text);
  const urgency   = classifyUrgency(text);
  const signal    = combinedSignal(sentiment.label, urgency.label);
  const meta      = QUESTION_META[questionKey] || { label: questionKey, interpretation: {} };

  return {
    question:        questionKey,
    question_label:  meta.label,
    raw_text:        text || '',
    sentiment:       sentiment.label,
    sentiment_score: sentiment.score,
    sentiment_detail: sentiment.detail,
    urgency:         urgency.label,
    urgency_score:   urgency.score,
    urgency_detail:  urgency.detail,
    signal:          signal.tier,
    signal_emoji:    signal.emoji,
    signal_label:    signal.label,
    signal_colour:   signal.colour,
    interpretation:  meta.interpretation[signal.tier] || '',
  };
}

/**
 * Analyse all three questions from a diagnostic payload.
 * Skips questions with no text (or numeric-only values).
 *
 * @param {object} payload — diagnostic form payload
 * @returns {Array}        — array of NLP result records
 */
function analysePayload(payload) {
  if (!payload) return [];

  const results = [];

  const q9  = typeof payload.q9_blockers    === 'string' ? payload.q9_blockers.trim()    : '';
  const q11 = typeof payload.q11_innovation === 'string' ? payload.q11_innovation.trim() : '';
  const q14 = typeof payload.q14_aspiration === 'string' ? payload.q14_aspiration.trim() : '';

  if (q9)  results.push(analyseQuestion('q9',  q9));
  if (q11) results.push(analyseQuestion('q11', q11));
  if (q14) results.push(analyseQuestion('q14', q14));

  return results;
}

module.exports = { analysePayload, analyseQuestion };

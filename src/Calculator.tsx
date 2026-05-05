import { useState } from "react";

const gold = "#C9A84C";
const darkBg = "#080614";
const cardBg = "#1C1640";

const ARCANA: Record<number, { name: string; emoji: string; keywords: string; description: string; shadow: string; advice: string; color: string }> = {
  1:  { name: "The Magician",       emoji: "🪄", keywords: "Will · Mastery · Creation",        color: "#A855F7", shadow: "You hold all the tools you need. Your power lies in focus and intentional action — stop waiting for permission.",           description: "You are a natural creator and manifestor. Your mind is sharp, your will is strong, and you have the rare gift of turning ideas into reality. You are here to build, lead, and inspire.",  advice: "Trust your abilities fully. The resources and skills are already within you — begin." },
  2:  { name: "The High Priestess", emoji: "🌙", keywords: "Intuition · Mystery · Inner Knowing", color: "#7C3AED", shadow: "You may suppress your intuition out of fear of being 'too much.' Your inner voice is your greatest asset.",              description: "You are deeply intuitive and spiritually sensitive. You understand things that others miss, and you carry a quiet wisdom that draws people to you. Trust the silence.",                        advice: "Go inward before you decide. The answer is already there — you just need to listen." },
  3:  { name: "The Empress",        emoji: "🌿", keywords: "Abundance · Nurture · Sensuality",  color: "#16A34A", shadow: "You may give endlessly to others while neglecting yourself. True abundance starts within.",                                description: "You are a source of warmth, creativity, and life. People flourish in your presence. You are deeply connected to beauty, nature, and the rhythms of the body and soul.",                   advice: "Nurture yourself as deeply as you nurture others. Your joy is not selfish — it is your gift to the world." },
  4:  { name: "The Emperor",        emoji: "🏛️", keywords: "Structure · Authority · Stability",  color: "#DC2626", shadow: "Control can become rigidity. Learn when to lead and when to release.",                                                   description: "You are a natural authority. You think in systems, build with purpose, and protect what matters. Your stability is a gift to everyone around you.",                                        advice: "Lead with both strength and compassion. True power is earned through consistency, not force." },
  5:  { name: "The Hierophant",     emoji: "🕍", keywords: "Tradition · Wisdom · Spiritual Path", color: "#B45309", shadow: "Rigid rules can cage the soul. Wisdom means knowing which traditions to keep — and which to release.",                  description: "You are a seeker and keeper of wisdom. You feel called to teach, guide, or hold space for others on their path. You bridge the sacred and the everyday.",                                  advice: "Share your knowledge generously. You are here to be a spiritual bridge — for yourself and others." },
  6:  { name: "The Lovers",         emoji: "💞", keywords: "Love · Choice · Alignment",          color: "#EC4899", shadow: "You may seek external love before cultivating love within yourself. Union begins inside.",                                description: "You are here to experience deep connection — romantic, spiritual, and with yourself. Every major decision in your life is ultimately about alignment with your truest values.",              advice: "Choose from love, not fear. The most important relationship you will ever have is with your own heart." },
  7:  { name: "The Chariot",        emoji: "⚡", keywords: "Victory · Drive · Willpower",         color: "#0EA5E9", shadow: "Pure willpower without inner peace leads to burnout. True victory requires both force and surrender.",                   description: "You are driven, focused, and capable of extraordinary achievement. You do not stop when things get hard — you push through. Your determination is your superpower.",                       advice: "Channel your drive toward what truly matters. Not every battle deserves your energy — choose wisely." },
  8:  { name: "Strength",           emoji: "🦁", keywords: "Courage · Patience · Inner Power",   color: "#F97316", shadow: "True strength is not about suppressing emotions — it's about mastering them with compassion.",                            description: "Your greatest power is your gentleness. You tame chaos not with force, but with love and patience. You have survived things that would break others — and you did it with grace.",         advice: "Trust your quiet inner strength. Compassion is never weakness — it is the most courageous force in the universe." },
  9:  { name: "The Hermit",         emoji: "🕯️", keywords: "Solitude · Wisdom · Soul Search",    color: "#6366F1", shadow: "Isolation can become avoidance. True wisdom is meant to be shared, not hoarded.",                                      description: "You are a deep thinker and a natural seeker of truth. You need solitude to recharge, and within the quiet you find answers that others never find. You are here to illuminate.",          advice: "Honor your need for reflection — but then return with your light. Your wisdom belongs to the world." },
  10: { name: "Wheel of Fortune",   emoji: "🎡", keywords: "Cycles · Destiny · Turning Points",  color: "#D97706", shadow: "Fighting the wheel exhausts you. Learn to flow with life's cycles rather than resist them.",                            description: "You are intimately connected with the cycles of fate and fortune. Your life is marked by significant turning points — and each one carries a lesson that shapes your destiny.",             advice: "Trust the timing of your life. What feels like an ending is always, always a new beginning." },
  11: { name: "Justice",            emoji: "⚖️", keywords: "Truth · Fairness · Cause & Effect",  color: "#64748B", shadow: "Perfectionism and harsh self-judgment can masquerade as justice. Be as fair to yourself as you are to others.",         description: "You have a profound sense of truth and fairness. You see through illusions and value integrity above all. Life consistently brings you situations that test and refine your sense of right.",  advice: "Stand in your truth — calmly and completely. The universe honors those who live with integrity." },
  12: { name: "The Hanged Man",     emoji: "🌀", keywords: "Surrender · New Perspective · Pause", color: "#0891B2", shadow: "Passive waiting can become avoidance. Surrender is active — it is choosing to release, not giving up.",               description: "You see the world from a different angle than most people. Your willingness to pause, surrender, and sacrifice in the short-term brings you profound long-term wisdom.",                    advice: "Release what you cannot control. The moment you stop resisting is the moment everything shifts." },
  13: { name: "Death",              emoji: "🦋", keywords: "Transformation · Endings · Rebirth", color: "#374151", shadow: "Fear of endings keeps you stuck in chapters that are already complete. Let them close.",                                description: "You are a soul of profound transformation. You have reinvented yourself more than once — and each ending has led to a more authentic, more powerful version of who you are.",               advice: "Do not fear the ending. What is dying was never truly you. What is being born is everything you were meant to become." },
  14: { name: "Temperance",         emoji: "🌊", keywords: "Balance · Flow · Alchemy",           color: "#059669", shadow: "Over-moderation can suppress joy. Balance does not mean 'not too much of anything good' — it means flow.",             description: "You are a natural alchemist. You instinctively blend opposites — logic and intuition, action and rest, the earthly and the divine — creating something more beautiful than either alone.",  advice: "Trust the process. Everything is working together for your highest good — even what feels like contradiction." },
  15: { name: "The Devil",          emoji: "🔗", keywords: "Shadow · Materialism · Liberation",  color: "#7F1D1D", shadow: "The chains you see are often self-imposed. The first step to freedom is recognizing you hold the key.",                description: "You have an extraordinary capacity to understand shadow — both in yourself and others. This is not a curse; it is a gift. You know the deepest human fears, which gives you profound empathy.", advice: "Name your chains. The moment you can see them clearly is the moment you are already free." },
  16: { name: "The Tower",          emoji: "⚡", keywords: "Sudden Change · Revelation · Reset", color: "#B91C1C", shadow: "You may brace for disaster that never comes — or resist the necessary collapse of what no longer serves you.",           description: "You are no stranger to upheaval. Your life has been shaped by sudden revelations and dramatic shifts — and each one, however painful, has cracked you open to something truer.",            advice: "Do not rebuild what was never stable. Let it fall — and build something real from the rubble." },
  17: { name: "The Star",           emoji: "⭐", keywords: "Hope · Healing · Renewal",           color: "#0284C7", shadow: "Hope without action becomes passive wishing. The stars guide those who keep walking.",                                  description: "You carry a quiet radiance that others feel without being able to explain. After every storm in your life, you find a way to hope again — and that hope is contagious and healing.",         advice: "Keep your light burning. The world needs your gentleness and your belief in something better." },
  18: { name: "The Moon",           emoji: "🌕", keywords: "Intuition · Dreams · The Subconscious", color: "#4338CA", shadow: "Anxiety and illusion thrive in the dark. Bring light to your fears, one honest look at a time.",                  description: "You are deeply connected to the unseen — emotions, dreams, subconscious patterns. You feel things before you understand them, and your intuition often knows the truth long before your mind does.", advice: "Trust your dreams and your gut feelings — but seek clarity when fear begins to distort what you see." },
  19: { name: "The Sun",            emoji: "☀️", keywords: "Joy · Vitality · Success",           color: "#CA8A04", shadow: "Relentless positivity can mask what needs to be healed. True joy includes the full spectrum.",                         description: "You radiate warmth, optimism, and life force. People are drawn to your energy because being near you makes them feel more alive. You were born to shine — and your joy is a gift to everyone.", advice: "Let yourself be happy. Not everything needs to be earned or endured — some gifts are simply yours to receive." },
  20: { name: "Judgement",          emoji: "🔔", keywords: "Awakening · Calling · Transformation", color: "#7E22CE", shadow: "The call to awaken can trigger deep guilt or fear. Forgiveness — of yourself and others — is where it all begins.",  description: "You are undergoing or have undergone a profound awakening. You feel a deep call — to a different life, a truer path, a higher purpose. You cannot un-hear it, nor should you try.",           advice: "Answer the call. Forgive the past completely, rise into who you are becoming, and do not look back." },
  21: { name: "The World",          emoji: "🌍", keywords: "Completion · Mastery · Integration",  color: "#065F46", shadow: "The fear of being 'finished' can keep you cycling. True completion is a beginning in disguise.",                      description: "You carry the energy of completion and mastery. You have come a long way — through many cycles, lessons, and reinventions — and you carry the wisdom of the entire journey within you.",      advice: "Celebrate how far you have come. You are not at the end — you are at the threshold of the next, greatest chapter." },
  22: { name: "The Fool",           emoji: "🌈", keywords: "Beginnings · Freedom · Pure Potential", color: "#8B5CF6", shadow: "Freedom without direction can become chaos. The Fool is most powerful when led by the heart, not just impulse.",     description: "You carry the energy of pure potential and endless new beginnings. You arrived in this life with an open heart and a deep trust in the universe — and that spirit never truly left you.",       advice: "Take the leap. You were never meant to have everything figured out first — that's the whole point of your journey." },
};

function calcArcana(day: number, month: number, year: number): number {
  const digits = `${day}${month}${year}`.split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 22) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum === 0 ? 22 : sum;
}

export default function Calculator() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2025) {
      setError("Please enter a valid birth date.");
      return;
    }
    setError("");
    setResult(calcArcana(d, m, y));
  }

  const arcana = result ? ARCANA[result] : null;

  return (
    <div style={{ background: darkBg, minHeight: "100vh", padding: "40px 20px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔮</div>
          <div style={{ fontSize: "12px", letterSpacing: "0.3em", color: gold, marginBottom: "12px", fontFamily: "sans-serif" }}>✦ ✦ ✦</div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#F0E6D3", marginBottom: "10px", fontFamily: "serif" }}>
            Your Personality Arcana
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.55)", fontFamily: "sans-serif", lineHeight: "1.6" }}>
            Discover the Major Arcana card that carries your soul's blueprint.<br />Enter your birth date below.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: cardBg,
          border: `1px solid rgba(201,168,76,0.4)`,
          borderRadius: "20px",
          padding: "36px",
          marginBottom: "32px",
          boxShadow: `0 0 40px rgba(201,168,76,0.15)`,
        }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: gold, marginBottom: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
            ENTER YOUR DATE OF BIRTH
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
            {[
              { label: "Day", value: day, set: setDay, placeholder: "DD", max: 2 },
              { label: "Month", value: month, set: setMonth, placeholder: "MM", max: 2 },
              { label: "Year", value: year, set: setYear, placeholder: "YYYY", max: 4 },
            ].map(f => (
              <div key={f.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "rgba(232,224,240,0.4)", letterSpacing: "0.15em", marginBottom: "8px", fontFamily: "sans-serif" }}>
                  {f.label.toUpperCase()}
                </p>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  value={f.value}
                  maxLength={f.max}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: f.max === 4 ? "90px" : "62px",
                    padding: "12px 8px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid rgba(201,168,76,0.35)`,
                    borderRadius: "10px",
                    color: "#F0E6D3",
                    fontSize: "20px",
                    fontFamily: "serif",
                    textAlign: "center",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: "#F87171", fontSize: "12px", textAlign: "center", marginBottom: "16px", fontFamily: "sans-serif" }}>
              {error}
            </p>
          )}

          <button
            onClick={calculate}
            style={{
              width: "100%",
              padding: "16px",
              background: `linear-gradient(135deg, #4C1D95, #7C3AED)`,
              border: `1px solid rgba(201,168,76,0.4)`,
              borderRadius: "12px",
              color: "#F0E6D3",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.15em",
              fontFamily: "sans-serif",
              cursor: "pointer",
            }}
          >
            ✦ REVEAL MY ARCANA ✦
          </button>
        </div>

        {/* Result */}
        {arcana && (
          <div style={{
            background: cardBg,
            border: `1px solid ${arcana.color}77`,
            borderRadius: "20px",
            padding: "40px 36px",
            boxShadow: `0 0 50px ${arcana.color}44`,
            animation: "fadeIn 0.6s ease",
          }}>
            {/* Arcana Number & Name */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "56px", marginBottom: "8px" }}>{arcana.emoji}</div>
              <p style={{ fontSize: "11px", letterSpacing: "0.25em", color: arcana.color, marginBottom: "6px", fontFamily: "sans-serif" }}>
                YOUR ARCANA IS
              </p>
              <h2 style={{ fontSize: "34px", fontWeight: "700", color: "#F0E6D3", fontFamily: "serif", marginBottom: "8px" }}>
                {arcana.name}
              </h2>
              <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {arcana.keywords.split(" · ").map(kw => (
                  <span key={kw} style={{
                    padding: "4px 12px",
                    background: `${arcana.color}22`,
                    border: `1px solid ${arcana.color}55`,
                    borderRadius: "20px",
                    fontSize: "11px",
                    color: arcana.color,
                    fontFamily: "sans-serif",
                    letterSpacing: "0.08em",
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ width: "60px", height: "1px", background: `linear-gradient(to right, transparent, ${arcana.color}, transparent)`, margin: "0 auto 28px" }} />

            {/* Description */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: gold, marginBottom: "10px", fontFamily: "sans-serif" }}>✦ YOUR SOUL'S BLUEPRINT</p>
              <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.85)", lineHeight: "1.8", fontFamily: "serif" }}>
                {arcana.description}
              </p>
            </div>

            {/* Shadow */}
            <div style={{ background: `${arcana.color}15`, border: `1px solid ${arcana.color}33`, borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: arcana.color, marginBottom: "8px", fontFamily: "sans-serif" }}>✦ YOUR SHADOW LESSON</p>
              <p style={{ fontSize: "13px", color: "rgba(232,224,240,0.7)", lineHeight: "1.7", fontFamily: "serif", fontStyle: "italic" }}>
                {arcana.shadow}
              </p>
            </div>

            {/* Advice */}
            <div style={{ background: `rgba(201,168,76,0.08)`, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: "12px", padding: "16px 20px", marginBottom: "32px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: gold, marginBottom: "8px", fontFamily: "sans-serif" }}>✦ MESSAGE FOR YOU</p>
              <p style={{ fontSize: "14px", color: "#F0E6D3", lineHeight: "1.8", fontFamily: "serif" }}>
                {arcana.advice}
              </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", borderTop: `1px solid rgba(201,168,76,0.2)`, paddingTop: "28px" }}>
              <p style={{ fontSize: "13px", color: "rgba(232,224,240,0.5)", marginBottom: "16px", fontFamily: "sans-serif" }}>
                Want to explore your Arcana in a full personal reading?
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="https://t.me/Ana_Krista" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "11px 22px", background: "linear-gradient(135deg, #2AABEE, #229ED9)",
                  borderRadius: "50px", color: "#fff", fontSize: "12px", fontWeight: "700",
                  fontFamily: "sans-serif", textDecoration: "none", letterSpacing: "0.05em",
                }}>
                  ✈ Telegram @Ana_Krista
                </a>
                <a href="https://wa.me/13177520369" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "11px 22px", background: "linear-gradient(135deg, #25D366, #1DA851)",
                  borderRadius: "50px", color: "#fff", fontSize: "12px", fontWeight: "700",
                  fontFamily: "sans-serif", textDecoration: "none", letterSpacing: "0.05em",
                }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

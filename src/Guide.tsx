export default function Guide() {
  const spreads = [
    {
      num: 4,
      emoji: "💕",
      category: "Spread 1 · Love",
      title: "The Heart Mirror",
      question: '"What does my heart truly want — and what is blocking it?"',
      color: { bg: "bg-pink-50", border: "border-pink-100", circle: "bg-pink-500", title: "text-pink-900", label: "text-pink-800", note: "bg-pink-100 text-pink-800", noteLabel: "text-pink-700", category: "text-pink-400" },
      cards: [
        { num: "1", label: "Your Heart's Truth", desc: "What you truly desire in love right now" },
        { num: "2", label: "The Hidden Block", desc: "What is unconsciously keeping love away" },
        { num: "3", label: "The Mirror", desc: "What you are projecting onto others" },
        { num: "4", label: "The Gift", desc: "What love is trying to teach you" },
        { num: "5", label: "Next Step", desc: "One action to open your heart more fully" },
      ],
      note: "Card 2 (The Hidden Block) is often the most powerful card in this spread. If a Major Arcana appears here, it signals a deep soul-level pattern that may need professional exploration to fully understand.",
    },
    {
      num: 6,
      emoji: "🌹",
      category: "Spread 2 · Love",
      title: "The Relationship Crossroads",
      question: '"Where are we — and where is this going?"',
      color: { bg: "bg-purple-50", border: "border-purple-100", circle: "bg-purple-500", title: "text-purple-900", label: "text-purple-800", note: "bg-purple-100 text-purple-800", noteLabel: "text-purple-700", category: "text-purple-400" },
      cards: [
        { num: "1", label: "You in This Relationship", desc: "Your energy, role, and feelings right now" },
        { num: "2", label: "Them in This Relationship", desc: "Their energy and true intentions" },
        { num: "3", label: "The Foundation", desc: "What this connection is built on" },
        { num: "4", label: "The Challenge", desc: "The core tension between you" },
        { num: "5", label: "Hidden Influence", desc: "An unseen factor affecting both of you" },
        { num: "6", label: "The Path Forward", desc: "Where this relationship is heading" },
      ],
      note: "If cards 1 and 2 are in opposition (e.g., Cups vs. Swords), this is a strong signal of emotional disconnect. This is where a personal reading can be life-changing.",
    },
    {
      num: 6,
      emoji: "✨",
      category: "Spread 3 · Love",
      title: "Calling In Love",
      question: '"What do I need to become to attract the love I want?"',
      color: { bg: "bg-rose-50", border: "border-rose-100", circle: "bg-rose-500", title: "text-rose-900", label: "text-rose-800", note: "bg-rose-100 text-rose-800", noteLabel: "text-rose-700", category: "text-rose-400" },
      cards: [
        { num: "1", label: "Who You Are Now", desc: "Your current energy in love" },
        { num: "2", label: "What You Attract", desc: "The type of partners you draw in" },
        { num: "3", label: "The Wound", desc: "The past pattern to heal" },
        { num: "4", label: "The Shift", desc: "What needs to change within you" },
        { num: "5", label: "Who You're Becoming", desc: "Your future self in love" },
        { num: "6", label: "The Invitation", desc: "A message from the Universe" },
      ],
      note: null,
    },
    {
      num: 5,
      emoji: "💰",
      category: "Spread 4 · Money",
      title: "The Money Flow",
      question: '"What is my relationship with money — and how do I improve it?"',
      color: { bg: "bg-emerald-50", border: "border-emerald-100", circle: "bg-emerald-500", title: "text-emerald-900", label: "text-emerald-800", note: "bg-emerald-100 text-emerald-800", noteLabel: "text-emerald-700", category: "text-emerald-400" },
      cards: [
        { num: "1", label: "Your Money Energy", desc: "How you relate to money right now" },
        { num: "2", label: "Where Money Flows From", desc: "Your primary source of abundance" },
        { num: "3", label: "Where Money Drains", desc: "What is depleting your resources" },
        { num: "4", label: "The Money Block", desc: "The belief holding you back" },
        { num: "5", label: "The Opportunity", desc: "What abundance is available to you now" },
      ],
      note: "Card 4 (The Money Block) almost always points to a childhood belief or family pattern. If The Tower, The Devil, or Five of Pentacles appears here, a deeper personal session is strongly recommended.",
    },
    {
      num: 5,
      emoji: "🌟",
      category: "Spread 5 · Finances",
      title: "The Abundance Activation",
      question: '"What is my next step toward financial freedom?"',
      color: { bg: "bg-indigo-50", border: "border-indigo-100", circle: "bg-indigo-500", title: "text-indigo-900", label: "text-indigo-800", note: "bg-indigo-100 text-indigo-800", noteLabel: "text-indigo-700", category: "text-indigo-400" },
      cards: [
        { num: "1", label: "Where You Stand", desc: "Your current financial reality" },
        { num: "2", label: "Hidden Resource", desc: "A strength or asset you're not using" },
        { num: "3", label: "What to Release", desc: "The habit or belief to let go of" },
        { num: "4", label: "The Action Card", desc: "A concrete step to take this month" },
        { num: "5", label: "The Outcome", desc: "What becomes possible when you act" },
      ],
      note: null,
    },
  ];

  return (
    <div className="guide-print bg-white text-gray-900 max-w-[750px] mx-auto p-10 font-serif">

      {/* Cover */}
      <div className="text-center mb-14 pb-10 border-b-2 border-purple-200" style={{ breakInside: "avoid" }}>
        <div className="text-5xl mb-4">🔮</div>
        <h1 className="text-4xl font-bold text-purple-900 mb-3 leading-tight">
          5 Tarot Spreads That Reveal<br />What You Really Need to Know
        </h1>
        <p className="text-lg text-purple-600 italic mb-4">Love · Relationships · Money · Abundance</p>
        <p className="text-sm text-gray-400">A Professional Guide by a Certified Tarot Reader</p>
      </div>

      {/* Intro */}
      <div className="mb-10" style={{ breakInside: "avoid" }}>
        <h2 className="text-xl font-bold text-purple-800 mb-3">Welcome</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Most people shuffle the cards and pull one — and wonder why the message feels vague.
          The secret isn't in the cards themselves. It's in <strong>how you ask the question</strong>.
        </p>
        <p className="text-gray-700 leading-relaxed">
          These 5 spreads were designed to help you see the <em>layers</em> beneath your situation —
          the blocks, the patterns, and the path forward. Each spread includes a card layout,
          position meanings, and guiding questions to deepen your reading.
        </p>
      </div>

      {/* Spreads */}
      {spreads.map((spread, i) => (
        <div
          key={i}
          className={`mb-10 p-7 ${spread.color.bg} rounded-2xl border ${spread.color.border}`}
          style={{ breakInside: "avoid" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{spread.emoji}</span>
            <div>
              <span className={`text-xs uppercase tracking-widest font-sans ${spread.color.category}`}>
                {spread.category}
              </span>
              <h2 className={`text-2xl font-bold ${spread.color.title}`}>{spread.title}</h2>
            </div>
          </div>
          <p className="text-gray-600 italic mb-5">{spread.question}</p>

          <div className="flex flex-wrap gap-3 mb-5">
            {spread.cards.map(card => (
              <div
                key={card.num}
                className={`bg-white rounded-xl p-4 text-center shadow-sm border ${spread.color.border} flex-1 min-w-[130px]`}
              >
                <div className={`w-8 h-8 rounded-full ${spread.color.circle} text-white text-sm font-bold flex items-center justify-center mx-auto mb-2`}>
                  {card.num}
                </div>
                <div className={`text-xs font-bold ${spread.color.label} mb-1`}>{card.label}</div>
                <div className="text-xs text-gray-500">{card.desc}</div>
              </div>
            ))}
          </div>

          {spread.note && (
            <div className={`${spread.color.note} rounded-xl p-4`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${spread.color.noteLabel}`}>💡 Reader's Note</p>
              <p className="text-sm">{spread.note}</p>
            </div>
          )}
        </div>
      ))}

      {/* CTA */}
      <div
        className="text-center p-10 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl text-white"
        style={{ breakInside: "avoid" }}
      >
        <div className="text-4xl mb-4">🔮</div>
        <h2 className="text-2xl font-bold mb-3">Ready to Go Deeper?</h2>
        <p className="text-purple-200 mb-6 leading-relaxed max-w-md mx-auto">
          These spreads reveal the surface. A personal 1-on-1 reading goes to the root —
          your unique story, your soul's pattern, your specific path forward.
        </p>
        <div className="inline-block bg-white text-purple-900 font-bold px-8 py-3 rounded-full text-sm">
          Book a Personal Reading →
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
        © 2026 · All rights reserved · Thank you for your purchase
      </div>
    </div>
  );
}

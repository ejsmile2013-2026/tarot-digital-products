export default function Guide() {
  return (
    <div className="guide-print bg-white text-gray-900 max-w-[800px] mx-auto p-12 font-serif">

      {/* Cover */}
      <div className="text-center mb-16 pb-12 border-b-2 border-purple-200">
        <div className="text-5xl mb-4">🔮</div>
        <h1 className="text-4xl font-bold text-purple-900 mb-3 leading-tight">
          5 Tarot Spreads That Reveal<br />What You Really Need to Know
        </h1>
        <p className="text-lg text-purple-600 italic mb-6">
          Love · Relationships · Money · Abundance
        </p>
        <p className="text-sm text-gray-500">
          A Professional Guide by a Certified Tarot Reader
        </p>
      </div>

      {/* Intro */}
      <div className="mb-12">
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

      {/* Spread 1 */}
      <div className="mb-12 p-8 bg-pink-50 rounded-2xl border border-pink-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">💕</span>
          <div>
            <span className="text-xs uppercase tracking-widest text-pink-400 font-sans">Spread 1 · Love</span>
            <h2 className="text-2xl font-bold text-pink-900">The Heart Mirror</h2>
          </div>
        </div>
        <p className="text-gray-600 italic mb-6">
          "What does my heart truly want — and what is blocking it?"
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { num: "1", label: "Your Heart's Truth", desc: "What you truly desire in love right now" },
            { num: "2", label: "The Hidden Block", desc: "What is unconsciously keeping love away" },
            { num: "3", label: "The Mirror", desc: "What you are projecting onto others" },
            { num: "4", label: "The Gift", desc: "What love is trying to teach you" },
            { num: "5", label: "Next Step", desc: "One action to open your heart more fully" },
          ].map(card => (
            <div key={card.num} className="bg-white rounded-xl p-4 text-center shadow-sm border border-pink-100">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {card.num}
              </div>
              <div className="text-xs font-bold text-pink-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-pink-100 col-span-1 col-start-2">
            {/* empty placeholder for layout */}
          </div>
        </div>

        <div className="bg-pink-100 rounded-xl p-4">
          <p className="text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">💡 Reader's Note</p>
          <p className="text-sm text-pink-800">
            Card 2 (The Hidden Block) is often the most powerful card in this spread.
            If a Major Arcana appears here, it signals a deep soul-level pattern that may need
            professional exploration to fully understand.
          </p>
        </div>
      </div>

      {/* Spread 2 */}
      <div className="mb-12 p-8 bg-purple-50 rounded-2xl border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🌹</span>
          <div>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-sans">Spread 2 · Love</span>
            <h2 className="text-2xl font-bold text-purple-900">The Relationship Crossroads</h2>
          </div>
        </div>
        <p className="text-gray-600 italic mb-6">
          "Where are we — and where is this going?"
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { num: "1", label: "You in This Relationship", desc: "Your energy, role, and feelings right now" },
            { num: "2", label: "Them in This Relationship", desc: "Their energy and true intentions" },
            { num: "3", label: "The Foundation", desc: "What this connection is built on" },
            { num: "4", label: "The Challenge", desc: "The core tension between you" },
            { num: "5", label: "Hidden Influence", desc: "An unseen factor affecting both of you" },
            { num: "6", label: "The Path Forward", desc: "Where this relationship is heading" },
          ].map(card => (
            <div key={card.num} className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {card.num}
              </div>
              <div className="text-xs font-bold text-purple-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-purple-100 rounded-xl p-4">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">💡 Reader's Note</p>
          <p className="text-sm text-purple-800">
            If cards 1 and 2 are in opposition (e.g., Cups vs. Swords), this is a strong signal
            of emotional disconnect that goes deeper than surface arguments. This is where
            a personal reading can be life-changing.
          </p>
        </div>
      </div>

      {/* Spread 3 */}
      <div className="mb-12 p-8 bg-rose-50 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">✨</span>
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-400 font-sans">Spread 3 · Love</span>
            <h2 className="text-2xl font-bold text-rose-900">Calling In Love</h2>
          </div>
        </div>
        <p className="text-gray-600 italic mb-6">
          "What do I need to become to attract the love I want?"
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { num: "1", label: "Who You Are Now", desc: "Your current energy in love" },
            { num: "2", label: "What You Attract", desc: "The type of partners you draw in" },
            { num: "3", label: "The Wound", desc: "The past pattern to heal" },
            { num: "4", label: "The Shift", desc: "What needs to change within you" },
            { num: "5", label: "Who You're Becoming", desc: "Your future self in love" },
            { num: "6", label: "The Invitation", desc: "A message from the Universe" },
          ].map(card => (
            <div key={card.num} className="bg-white rounded-xl p-4 text-center shadow-sm border border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {card.num}
              </div>
              <div className="text-xs font-bold text-rose-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spread 4 */}
      <div className="mb-12 p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">💰</span>
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-sans">Spread 4 · Money</span>
            <h2 className="text-2xl font-bold text-emerald-900">The Money Flow</h2>
          </div>
        </div>
        <p className="text-gray-600 italic mb-6">
          "What is my relationship with money — and how do I improve it?"
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { num: "1", label: "Your Money Energy", desc: "How you relate to money right now" },
            { num: "2", label: "Where Money Flows From", desc: "Your primary source of abundance" },
            { num: "3", label: "Where Money Drains", desc: "What is depleting your resources" },
            { num: "4", label: "The Money Block", desc: "The belief holding you back" },
            { num: "5", label: "The Opportunity", desc: "What abundance is available to you now" },
          ].map(card => (
            <div key={card.num} className="bg-white rounded-xl p-4 text-center shadow-sm border border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {card.num}
              </div>
              <div className="text-xs font-bold text-emerald-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 col-span-1 col-start-1" />
        </div>

        <div className="bg-emerald-100 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">💡 Reader's Note</p>
          <p className="text-sm text-emerald-800">
            Card 4 (The Money Block) almost always points to a childhood belief or family pattern.
            If The Tower, The Devil, or Five of Pentacles appears here, a deeper personal session
            is strongly recommended to unpack the root cause.
          </p>
        </div>
      </div>

      {/* Spread 5 */}
      <div className="mb-12 p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🌟</span>
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-sans">Spread 5 · Finances</span>
            <h2 className="text-2xl font-bold text-indigo-900">The Abundance Activation</h2>
          </div>
        </div>
        <p className="text-gray-600 italic mb-6">
          "What is my next step toward financial freedom?"
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { num: "1", label: "Where You Stand", desc: "Your current financial reality" },
            { num: "2", label: "Hidden Resource", desc: "A strength or asset you're not using" },
            { num: "3", label: "What to Release", desc: "The habit or belief to let go of" },
            { num: "4", label: "The Action Card", desc: "A concrete step to take this month" },
            { num: "5", label: "The Outcome", desc: "What becomes possible when you act" },
          ].map(card => (
            <div key={card.num} className="bg-white rounded-xl p-4 text-center shadow-sm border border-indigo-100">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {card.num}
              </div>
              <div className="text-xs font-bold text-indigo-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
          <div className="col-span-1" />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl text-white">
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

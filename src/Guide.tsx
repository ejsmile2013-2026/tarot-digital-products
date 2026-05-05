export default function Guide() {
  const gold = "#C9A84C";
  const darkBg = "#080614";
  const cardBg = "#2A1F52";
  const borderGold = "1px solid rgba(201,168,76,0.6)";

  const spreads = [
    {
      emoji: "💕",
      category: "Spread I · Love",
      title: "The Heart Mirror",
      question: "What does my heart truly want — and what is blocking it?",
      accentColor: "#9B6FA0",
      cards: [
        { num: "I", label: "Your Heart's Truth", desc: "What you truly desire in love right now" },
        { num: "II", label: "The Hidden Block", desc: "What is unconsciously keeping love away" },
        { num: "III", label: "The Mirror", desc: "What you are projecting onto others" },
        { num: "IV", label: "The Gift", desc: "What love is trying to teach you" },
        { num: "V", label: "Next Step", desc: "One action to open your heart more fully" },
      ],
      note: "Card II (The Hidden Block) is often the most powerful card in this spread. If a Major Arcana appears here, it signals a deep soul-level pattern — consider a personal session to explore it fully.",
    },
    {
      emoji: "🌹",
      category: "Spread II · Love",
      title: "The Relationship Crossroads",
      question: "Where are we — and where is this going?",
      accentColor: "#7B5EA7",
      cards: [
        { num: "I", label: "You in This Relationship", desc: "Your energy, role, and feelings right now" },
        { num: "II", label: "Them in This Relationship", desc: "Their energy and true intentions" },
        { num: "III", label: "The Foundation", desc: "What this connection is built on" },
        { num: "IV", label: "The Challenge", desc: "The core tension between you" },
        { num: "V", label: "Hidden Influence", desc: "An unseen factor affecting both of you" },
        { num: "VI", label: "The Path Forward", desc: "Where this relationship is heading" },
      ],
      note: "If cards I and II are in opposition — Cups vs. Swords, for example — this signals a deep emotional disconnect that goes beyond surface arguments. A personal reading can be transformative here.",
    },
    {
      emoji: "✨",
      category: "Spread III · Love",
      title: "Calling In Love",
      question: "What do I need to become to attract the love I want?",
      accentColor: "#A0567A",
      cards: [
        { num: "I", label: "Who You Are Now", desc: "Your current energy in love" },
        { num: "II", label: "What You Attract", desc: "The type of partners you draw in" },
        { num: "III", label: "The Wound", desc: "The past pattern to heal" },
        { num: "IV", label: "The Shift", desc: "What needs to change within you" },
        { num: "V", label: "Who You're Becoming", desc: "Your future self in love" },
        { num: "VI", label: "The Invitation", desc: "A message from the Universe" },
      ],
      note: null,
    },
    {
      emoji: "💰",
      category: "Spread IV · Money",
      title: "The Money Flow",
      question: "What is my relationship with money — and how do I improve it?",
      accentColor: "#4A7C6F",
      cards: [
        { num: "I", label: "Your Money Energy", desc: "How you relate to money right now" },
        { num: "II", label: "Where Money Flows From", desc: "Your primary source of abundance" },
        { num: "III", label: "Where Money Drains", desc: "What is depleting your resources" },
        { num: "IV", label: "The Money Block", desc: "The belief holding you back" },
        { num: "V", label: "The Opportunity", desc: "What abundance is available to you now" },
      ],
      note: "Card IV (The Money Block) almost always points to a childhood belief or family pattern. If The Tower, The Devil, or Five of Pentacles appears here, a deeper personal session is strongly recommended.",
    },
    {
      emoji: "🌟",
      category: "Spread V · Finances",
      title: "The Abundance Activation",
      question: "What is my next step toward financial freedom?",
      accentColor: "#4A5F8A",
      cards: [
        { num: "I", label: "Where You Stand", desc: "Your current financial reality" },
        { num: "II", label: "Hidden Resource", desc: "A strength or asset you're not using" },
        { num: "III", label: "What to Release", desc: "The habit or belief to let go of" },
        { num: "IV", label: "The Action Card", desc: "A concrete step to take this month" },
        { num: "V", label: "The Outcome", desc: "What becomes possible when you act" },
      ],
      note: null,
    },
  ];

  return (
    <div
      className="guide-print font-serif"
      style={{
        background: darkBg,
        color: "#E8E0F0",
        maxWidth: "780px",
        margin: "0 auto",
        padding: "48px 40px",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Cover */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "56px",
          paddingBottom: "48px",
          borderBottom: `1px solid rgba(201,168,76,0.3)`,
          breakInside: "avoid",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "8px", letterSpacing: "0.3em", color: gold }}>
          ✦ ✦ ✦
        </div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: "#F0E6D3",
            lineHeight: "1.25",
            marginBottom: "16px",
            letterSpacing: "0.02em",
          }}
        >
          5 Tarot Spreads That Reveal<br />What You Really Need to Know
        </h1>
        <div
          style={{
            width: "80px",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${gold}, transparent)`,
            margin: "16px auto",
          }}
        />
        <p style={{ fontSize: "15px", color: gold, fontStyle: "italic", letterSpacing: "0.15em", marginBottom: "12px" }}>
          Love · Relationships · Money · Abundance
        </p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
          A PROFESSIONAL GUIDE BY A CERTIFIED TAROT READER
        </p>
      </div>

      {/* Intro */}
      <div
        style={{
          marginBottom: "48px",
          padding: "28px 32px",
          background: cardBg,
          border: borderGold,
          borderRadius: "16px",
          breakInside: "avoid",
        }}
      >
        <h2 style={{ fontSize: "18px", color: gold, marginBottom: "12px", letterSpacing: "0.08em" }}>
          ✦ Welcome
        </h2>
        <p style={{ color: "rgba(232,224,240,0.85)", lineHeight: "1.8", marginBottom: "12px", fontSize: "14px" }}>
          Most people shuffle the cards and pull one — and wonder why the message feels vague.
          The secret isn't in the cards themselves. It's in <strong style={{ color: "#F0E6D3" }}>how you ask the question</strong>.
        </p>
        <p style={{ color: "rgba(232,224,240,0.85)", lineHeight: "1.8", fontSize: "14px" }}>
          These 5 spreads were designed to help you see the <em>layers</em> beneath your situation —
          the blocks, the patterns, and the path forward. Each spread includes a card layout,
          position meanings, and guiding questions to deepen your reading.
        </p>
      </div>

      {/* Spreads */}
      {spreads.map((spread, i) => (
        <div
          key={i}
          style={{
            marginBottom: "40px",
            padding: "32px",
            background: cardBg,
            border: `1px solid ${spread.accentColor}99`,
            borderRadius: "20px",
            breakInside: "avoid",
            boxShadow: `0 0 40px ${spread.accentColor}66, 0 4px 20px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Spread Header */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: spread.accentColor, marginBottom: "4px", fontFamily: "sans-serif" }}>
              {spread.category.toUpperCase()}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>{spread.emoji}</span>
              <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#F0E6D3", letterSpacing: "0.02em" }}>
                {spread.title}
              </h2>
            </div>
            <div style={{ width: "40px", height: "2px", background: spread.accentColor, margin: "12px 0", borderRadius: "2px" }} />
            <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.6)", fontStyle: "italic" }}>
              "{spread.question}"
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: spread.note ? "20px" : "0" }}>
            {spread.cards.map(card => (
              <div
                key={card.num}
                style={{
                  flex: "1 1 130px",
                  background: `${spread.accentColor}30`,
                  border: `1px solid ${spread.accentColor}77`,
                  borderRadius: "12px",
                  padding: "16px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: `${spread.accentColor}33`,
                    border: `1px solid ${spread.accentColor}88`,
                    color: gold,
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    fontFamily: "serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {card.num}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#F0E6D3", marginBottom: "4px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(232,224,240,0.5)", lineHeight: "1.4" }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          {spread.note && (
            <div
              style={{
                background: `${spread.accentColor}22`,
                border: `1px solid ${spread.accentColor}44`,
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", color: gold, marginBottom: "6px", fontFamily: "sans-serif" }}>
                ✦ READER'S NOTE
              </p>
              <p style={{ fontSize: "12px", color: "rgba(232,224,240,0.75)", lineHeight: "1.6" }}>
                {spread.note}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* CTA */}
      <div
        style={{
          textAlign: "center",
          padding: "44px 32px",
          background: "linear-gradient(135deg, #1A0E2E 0%, #0D1A35 100%)",
          border: borderGold,
          borderRadius: "20px",
          breakInside: "avoid",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔮</div>
        <div style={{ fontSize: "13px", letterSpacing: "0.25em", color: gold, marginBottom: "12px", fontFamily: "sans-serif" }}>
          ✦ ✦ ✦
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#F0E6D3", marginBottom: "12px" }}>
          Ready to Go Deeper?
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.65)", lineHeight: "1.8", maxWidth: "420px", margin: "0 auto 24px" }}>
          These spreads reveal the surface. A personal 1-on-1 reading goes to the root —
          your unique story, your soul's pattern, your specific path forward.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://t.me/Ana_Krista"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              background: "linear-gradient(135deg, #2AABEE, #229ED9)",
              borderRadius: "50px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              fontFamily: "sans-serif",
              textDecoration: "none",
            }}
          >
            ✈ TELEGRAM @Ana_Krista
          </a>
          <a
            href="https://wa.me/13177520369"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              background: "linear-gradient(135deg, #25D366, #1DA851)",
              borderRadius: "50px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              fontFamily: "sans-serif",
              textDecoration: "none",
            }}
          >
            💬 WHATSAPP +1 317 752 0369
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <div style={{ fontSize: "16px", letterSpacing: "0.3em", color: `${gold}66`, marginBottom: "8px" }}>✦</div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
          © 2026 · ALL RIGHTS RESERVED · THANK YOU FOR YOUR PURCHASE
        </p>
      </div>
    </div>
  );
}

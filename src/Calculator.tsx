import { useState } from "react";

const gold = "#C9A84C";
const darkBg = "#080614";
const cardBg = "#1C1640";

interface Arcana {
  name: string; roman: string; emoji: string; symbol: string;
  keywords: string; color: string; gradient: string;
  planet: string; element: string;
  description: string;
  gift: string;
  purpose: string;
  love: string;
  career: string;
  shadow: string;
  affirmation: string;
  famous: string;
}

const ARCANA: Record<number, Arcana> = {
  1:  { name:"The Magician",       roman:"I",    emoji:"🪄", symbol:"∞", color:"#A855F7", gradient:"135deg, #4C1D95, #7C3AED",
        keywords:"Will · Mastery · Creation", planet:"Mercury ☿", element:"Air 🜁",
        description:"You are a born creator and manifestor. You arrived in this life with all the tools you need — your mind is razor-sharp, your will is unbreakable, and when you focus your energy, you can turn any idea into reality. You are here to build, lead, and inspire others to believe in the impossible.",
        gift:"You can see potential where others see nothing. One conversation with you changes people's trajectories.",
        purpose:"Your soul came here to demonstrate that reality is malleable — that with focused intention and aligned action, anything can be created from scratch.",
        love:"In love, you are magnetic and captivating. You need a partner who matches your mental fire. Beware of losing yourself in the 'project' of a relationship — your magic works best when you remain fully yourself.",
        career:"You are made for entrepreneurship, leadership, or any field where you create and innovate. You work best when given full creative freedom. Routine dulls your spark.",
        shadow:"You scatter your energy across too many projects and never complete them. Or you use your gifts to manipulate rather than create. Focus is your greatest discipline.",
        affirmation:"I focus my mind, align my will, and create exactly the life I intend.",
        famous:"Nikola Tesla · Elon Musk · Madonna" },
  2:  { name:"The High Priestess", roman:"II",   emoji:"🌙", symbol:"☽", color:"#6D28D9", gradient:"135deg, #312E81, #5B21B6",
        keywords:"Intuition · Mystery · Inner Knowing", planet:"Moon 🌙", element:"Water 🜄",
        description:"You are one of the most intuitive people alive. You feel truths that others cannot see, you sense energy shifts before they happen, and your inner voice has never truly led you wrong — even when you doubted it. You carry a quiet, deep wisdom that people are drawn to without fully understanding why.",
        gift:"You read between the lines of every situation. People feel seen and understood by you in ways no one else has made them feel.",
        purpose:"Your soul came here to be a bridge between the visible and invisible worlds — to trust the unseen, to honor intuition as wisdom, and to help others reconnect with their own inner knowing.",
        love:"You love deeply but rarely show it all at once. You need emotional safety and time to open. A partner who rushes you or dismisses your intuitions will drain you completely.",
        career:"You thrive in fields that honor the intuitive and the unseen — healing, counseling, writing, research, spirituality, or any creative field that requires depth over surface.",
        shadow:"You may retreat so deeply into your inner world that you become unavailable to life. Or you suppress your intuition to fit in — at great personal cost.",
        affirmation:"I trust my inner knowing completely. My intuition is my greatest guide.",
        famous:"Carl Jung · Frida Kahlo · Nicole Kidman" },
  3:  { name:"The Empress",        roman:"III",  emoji:"🌿", symbol:"♀", color:"#16A34A", gradient:"135deg, #14532D, #15803D",
        keywords:"Abundance · Nurture · Sensuality", planet:"Venus ♀", element:"Earth 🜃",
        description:"You are a living source of warmth, beauty, and abundance. You have a rare gift for making people feel nurtured, seen, and loved. You are deeply connected to the physical world — to beauty, nature, the body, and the cycles of life. When you are in alignment, abundance flows to you naturally.",
        gift:"Your presence heals. People feel calmer, more beautiful, and more worthy after spending time with you.",
        purpose:"Your soul came here to embody love in its most generous, earthly form — to create beauty, nourish life, and remind the world that pleasure and abundance are sacred, not shameful.",
        love:"You are a deeply sensual, generous lover who gives everything. Your lesson is to receive as beautifully as you give — and to never make yourself smaller to keep someone comfortable.",
        career:"You flourish in anything that creates beauty, comfort, or care — art, design, wellness, food, fashion, hospitality, or nurturing professions. Your aesthetic sense is exquisite.",
        shadow:"You may give endlessly until you are depleted, confusing self-sacrifice with love. Or you lose yourself in comfort and avoid the necessary discomforts of growth.",
        affirmation:"I am worthy of the abundance I create. I receive love as freely as I give it.",
        famous:"Beyoncé · Princess Diana · Oprah Winfrey" },
  4:  { name:"The Emperor",        roman:"IV",   emoji:"🏛️", symbol:"♂", color:"#DC2626", gradient:"135deg, #7F1D1D, #B91C1C",
        keywords:"Structure · Authority · Legacy", planet:"Mars ♂", element:"Fire 🜂",
        description:"You are a natural authority — someone who builds structures, systems, and legacies that outlast you. You think in long arcs, protect what matters fiercely, and bring order where there was chaos. People instinctively look to you for direction, and when you lead from integrity, you create something that lasts.",
        gift:"You can hold a vision over the long term when everyone else has given up. Your discipline and follow-through are extraordinary.",
        purpose:"Your soul came here to build — not just external structures, but inner ones. To demonstrate that true power is consistency, discipline, and showing up fully, day after day.",
        love:"You are deeply loyal and protective in love. Your challenge is vulnerability — letting someone fully in, rather than leading the relationship from behind a wall of strength.",
        career:"You are built for leadership, entrepreneurship, finance, law, architecture, or any field that rewards vision and long-term thinking. You need to be building something meaningful.",
        shadow:"Control can become rigidity. The need to be right can isolate you. True authority includes the courage to admit when you are wrong and the wisdom to empower others.",
        affirmation:"I lead with integrity and build with purpose. My strength creates safety for those I love.",
        famous:"Barack Obama · Steve Jobs · Angela Merkel" },
  5:  { name:"The Hierophant",     roman:"V",    emoji:"🕍", symbol:"☩", color:"#B45309", gradient:"135deg, #78350F, #92400E",
        keywords:"Wisdom · Tradition · Spiritual Path", planet:"Venus ♀", element:"Earth 🜃",
        description:"You are a keeper and seeker of wisdom. You feel called to something greater than ordinary life — a tradition, a path, a teaching. You have a natural ability to hold space for others in their spiritual or personal journeys, and you are often the one people come to when they need perspective, guidance, or ritual.",
        gift:"You can translate complex spiritual truths into words people actually understand. Your presence carries a calming authority.",
        purpose:"Your soul came here to be a bridge between the sacred and the everyday — to preserve what is worth keeping, to question what has outlived its truth, and to guide others to their own authentic spiritual path.",
        love:"You seek depth and meaning in your relationships, not just chemistry. A partner must share your values and respect your inner world. Shallow connections drain you.",
        career:"You are drawn to teaching, counseling, spiritual leadership, philosophy, law, medicine, or any role where you transmit knowledge or hold space for others' growth.",
        shadow:"Rigid adherence to rules and tradition can cage the soul. Wisdom means knowing which structures liberate and which imprison — including your own beliefs.",
        affirmation:"I honor the wisdom of the past and trust the truth unfolding within me now.",
        famous:"Dalai Lama · C.S. Lewis · Mother Teresa" },
  6:  { name:"The Lovers",         roman:"VI",   emoji:"💞", symbol:"☿", color:"#EC4899", gradient:"135deg, #831843, #BE185D",
        keywords:"Love · Choice · Deep Alignment", planet:"Mercury ☿", element:"Air 🜁",
        description:"You are here to experience — and embody — love in its highest form. Every significant moment of your life has come down to a choice between what is safe and what is true. You feel most alive in deep connection, and you have a rare ability to see the divinity in another person.",
        gift:"You create genuine intimacy. People feel profoundly seen and loved by you. Your relationships, when aligned, are transformative for both people.",
        purpose:"Your soul came here to learn that love is not something that happens to you — it is something you choose, again and again, from the deepest part of your being. Starting with yourself.",
        love:"You are a deeply devoted, romantic partner who gives completely. Your lesson: choose from wholeness, not need. The partner who matches your soul will meet you as an equal, not a savior.",
        career:"You flourish in partnerships and collaborations. You work best when your work feels meaningful and aligned with your values. Anything that requires empathy, connection, or creative vision.",
        shadow:"You may sacrifice your truth to maintain harmony. Or seek external love to fill an internal void — only to find the void grows larger.",
        affirmation:"I choose love. I choose truth. I choose the path that makes me most fully alive.",
        famous:"Princess Diana · Rumi · John Lennon" },
  7:  { name:"The Chariot",        roman:"VII",  emoji:"⚡", symbol:"⊙", color:"#0EA5E9", gradient:"135deg, #0C4A6E, #0369A1",
        keywords:"Victory · Drive · Focused Will", planet:"Moon 🌙", element:"Water 🜄",
        description:"You are built for achievement. When you set your sights on something, very little stops you — you have a relentless drive, extraordinary self-discipline, and the ability to push through obstacles that would make others quit. You have already overcome more than most people will ever face.",
        gift:"Your determination is contagious. When people see you push through adversity with grace, they start to believe they can do the same.",
        purpose:"Your soul came here to demonstrate the power of directed will — that victory is not about force alone, but about mastering both the inner and outer landscape simultaneously.",
        love:"You are fiercely loyal and protective once committed. Your challenge is slowing down enough to be truly present. Love requires stillness, not just momentum.",
        career:"You excel in any field that rewards ambition, focus, and the ability to perform under pressure — athletics, business, medicine, law, military, or any competitive arena.",
        shadow:"Pure willpower without inner peace creates burnout and isolation. Winning means nothing if you arrive alone. Learn to rest as a strategy, not a weakness.",
        affirmation:"I move forward with confidence, clarity, and an open heart. Victory and peace are not opposites.",
        famous:"Napoleon Bonaparte · Serena Williams · Amelia Earhart" },
  8:  { name:"Strength",           roman:"VIII", emoji:"🦁", symbol:"∞", color:"#F97316", gradient:"135deg, #7C2D12, #C2410C",
        keywords:"Courage · Patience · Grace Under Fire", planet:"Sun ☀️", element:"Fire 🜂",
        description:"Your greatest power is your gentleness. You tame chaos not with force, but with love, patience, and extraordinary inner fortitude. You have survived experiences that would have broken others — and you did it with more grace than anyone will ever fully know. Your quiet strength is your most formidable gift.",
        gift:"You make people feel safe enough to be their most vulnerable, truest selves. You carry others through their darkest hours without losing yourself.",
        purpose:"Your soul came here to demonstrate that compassion is not weakness — it is the most powerful force in the universe. That real strength comes from love, not domination.",
        love:"You love with fierce, patient, unconditional devotion. Your challenge: do not mistake endurance for love. You deserve a partnership where strength flows in both directions.",
        career:"You are extraordinary in any role that requires resilience, compassion, or supporting others through challenge — healing, counseling, teaching, caregiving, crisis work, or spiritual guidance.",
        shadow:"You may absorb others' pain as if it were your duty, until nothing is left for yourself. Boundaries are not walls — they are the frame that makes your love sustainable.",
        affirmation:"My gentleness is my power. I face every challenge with courage, compassion, and an open heart.",
        famous:"Nelson Mandela · Malala Yousafzai · Maya Angelou" },
  9:  { name:"The Hermit",         roman:"IX",   emoji:"🕯️", symbol:"△", color:"#6366F1", gradient:"135deg, #1E1B4B, #3730A3",
        keywords:"Solitude · Inner Wisdom · The Lantern", planet:"Mercury ☿", element:"Earth 🜃",
        description:"You are a deep thinker and a genuine seeker of truth. You need solitude to recharge, and within the quiet you find answers that most people never discover — because most people are too afraid of the silence to look there. You carry a lantern of insight that belongs to the world, not just yourself.",
        gift:"You see through the surface of things to the deeper truth beneath. Your insights arrive years before the world is ready for them.",
        purpose:"Your soul came here to seek wisdom — not as an intellectual exercise, but as a living, embodied truth. And then to carry that lantern back to others who are still lost in the dark.",
        love:"You need a partner who honors your silence and your depth. Someone who does not take your need for solitude personally. When you do connect, you love with extraordinary depth and loyalty.",
        career:"You excel in research, writing, philosophy, spirituality, science, psychology, or any field that rewards deep, sustained thinking and the courage to walk your own path.",
        shadow:"Isolation can become avoidance. Wisdom that is never shared becomes stagnant. The lantern is not for you alone — it is meant to light the way for others.",
        affirmation:"I honor my need for solitude. My inner light is a gift I am ready to share with the world.",
        famous:"Albert Einstein · Nikola Tesla · Georgia O'Keeffe" },
  10: { name:"Wheel of Fortune",   roman:"X",    emoji:"🎡", symbol:"☸", color:"#D97706", gradient:"135deg, #78350F, #B45309",
        keywords:"Destiny · Cycles · Divine Timing", planet:"Jupiter ♃", element:"Fire 🜂",
        description:"You are intimately connected to the great cycles of fate and fortune. Your life has been marked by extraordinary turning points — sudden rises, dramatic reversals, unexpected gifts — and each one has shaped you in ways you are still discovering. You understand, on a soul level, that timing is everything.",
        gift:"You are extraordinarily resilient. No matter how low the wheel has turned, you know — in your bones — that it will rise again. This knowing is a rare and powerful gift.",
        purpose:"Your soul came here to master the art of flow — to move with life's cycles rather than against them, and to find the sacred lesson within every turn of fate.",
        love:"Your relationships often arrive and transform in unexpected, fated ways. Trust the timing. The love that is meant for you will not pass you by — it will circle back.",
        career:"You are drawn to fields where change, risk, and timing are central — business, investing, entrepreneurship, travel, or any path that rewards adaptability and big-picture thinking.",
        shadow:"Surrendering to fate without taking responsibility becomes passivity. The wheel responds to your energy — you are not simply a passenger, you are also the force that turns it.",
        affirmation:"I trust the divine timing of my life. Every turn of the wheel is bringing me exactly what I need.",
        famous:"Oprah Winfrey · J.K. Rowling · Winston Churchill" },
  11: { name:"Justice",            roman:"XI",   emoji:"⚖️", symbol:"♎", color:"#64748B", gradient:"135deg, #1E293B, #334155",
        keywords:"Truth · Integrity · Cause & Effect", planet:"Venus ♀", element:"Air 🜁",
        description:"You have one of the most refined senses of truth and fairness of anyone alive. You see through illusions clearly, value integrity above almost everything, and are deeply disturbed by injustice. Life consistently brings you situations that test — and ultimately strengthen — your commitment to living in alignment with your deepest values.",
        gift:"You can hold complexity without collapsing into easy answers. People trust you instinctively, because they sense you will always tell them the truth.",
        purpose:"Your soul came here to demonstrate that integrity is not a rigid rule — it is a living practice. That truth, spoken with compassion, is the most healing force in any relationship.",
        love:"You love with honesty and complete commitment. You cannot be with someone whose values conflict with yours — the dissonance becomes physical. You need a partner who matches your depth of integrity.",
        career:"You are extraordinary in law, advocacy, journalism, mediation, ethics, leadership, or any role that requires impartiality, clear thinking, and the courage to stand for what is right.",
        shadow:"Perfectionism and harsh self-judgment can masquerade as justice. The most important verdict you will ever render is the one about yourself — make it fair.",
        affirmation:"I stand in my truth with clarity and compassion. I am in alignment with what is right and real.",
        famous:"Abraham Lincoln · Malala Yousafzai · Ruth Bader Ginsburg" },
  12: { name:"The Hanged Man",     roman:"XII",  emoji:"🌀", symbol:"▽", color:"#0891B2", gradient:"135deg, #0C4A6E, #0E7490",
        keywords:"Surrender · Perspective · Sacred Pause", planet:"Neptune ♆", element:"Water 🜄",
        description:"You see the world from an angle that most people never reach. You have a gift for willingly stepping back, pausing, and releasing control in moments when others grip tighter — and in that sacred surrender, you discover truths that cannot be found any other way. Your wisdom is earned through the willingness to wait.",
        gift:"You can find meaning and peace in circumstances that would send anyone else into panic. Your capacity for surrender is not weakness — it is advanced spiritual mastery.",
        purpose:"Your soul came here to demonstrate that some doors only open from the inside — that the answer you have been seeking lies just beyond the moment you finally stop searching and simply let go.",
        love:"You are capable of extraordinary patience and depth in love. Your challenge is ensuring that patience does not become passivity — that you are waiting for the right moment, not avoiding the necessary one.",
        career:"You are drawn to fields that reward unconventional thinking, artistic vision, or the ability to hold paradox — art, spirituality, therapy, philosophy, or any role that values depth over speed.",
        shadow:"Passive surrender can become avoidance. True surrender is an active, courageous choice — not drifting, but releasing with full awareness and intention.",
        affirmation:"I release what I cannot control. In surrender, I discover exactly what I was looking for.",
        famous:"Rumi · Leonardo da Vinci · Simone Weil" },
  13: { name:"Death",              roman:"XIII", emoji:"🦋", symbol:"☽", color:"#4B5563", gradient:"135deg, #111827, #1F2937",
        keywords:"Transformation · Endings · Rebirth", planet:"Pluto ♇", element:"Water 🜄",
        description:"You are a soul of profound, ongoing transformation. More than almost anyone, you have experienced — and survived — endings that felt unsurvivable. You have reinvented yourself multiple times, often completely. And each time, you emerged more authentic, more powerful, and closer to the person you were always meant to be.",
        gift:"You understand impermanence on a cellular level — and that understanding gives you a freedom and depth of presence that most people never find.",
        purpose:"Your soul came here to master the art of transformation — to move through endings with grace, to release what is complete, and to model for others that death is never truly the end.",
        love:"You need a partner who is not afraid of depth, intensity, or the full range of human experience. Shallow love is not for you. You need someone willing to transform alongside you.",
        career:"You are extraordinary in fields that involve transformation, healing, investigation, or working with the cycles of ending and beginning — therapy, medicine, research, hospice work, or deep creative work.",
        shadow:"Fear of loss can create control, resistance, and clinging to what is already gone. What you fear losing was never truly yours to keep — only to cherish while it lasted.",
        affirmation:"I move through every ending with grace. What is dying is making room for everything I am becoming.",
        famous:"Steve Jobs · Phoenix (mythology) · Frida Kahlo" },
  14: { name:"Temperance",         roman:"XIV",  emoji:"🌊", symbol:"△", color:"#059669", gradient:"135deg, #064E3B, #065F46",
        keywords:"Balance · Alchemy · Divine Flow", planet:"Jupiter ♃", element:"Fire 🜂",
        description:"You are a natural alchemist. You have a rare gift for blending opposites into something more beautiful than either could be alone — logic and intuition, structure and flow, the earthly and the divine. At your best, your life is a living demonstration that balance is not the absence of tension, but its transformation.",
        gift:"You bring harmony into chaotic situations without force. People feel steadier, calmer, and more capable in your presence.",
        purpose:"Your soul came here to master the sacred art of alchemy — to take the raw, sometimes painful material of experience and transmute it into wisdom, beauty, and healing.",
        love:"You need a relationship that balances passion with peace, depth with lightness. You have an extraordinary capacity for long-term, evolving love — if your partner is willing to grow.",
        career:"You excel in medicine, healing, art, music, counseling, diplomacy, or any field that requires the patient, skillful combining of opposing forces into something whole.",
        shadow:"Over-moderation can suppress joy, creativity, and authentic desire. Balance does not mean 'never too much of anything good.' Sometimes the right dose is abundance.",
        affirmation:"I trust the process. Everything in my life is aligning in perfect, divine timing.",
        famous:"Florence Nightingale · Albert Camus · Tao Te Ching" },
  15: { name:"The Devil",          roman:"XV",   emoji:"🔗", symbol:"♄", color:"#991B1B", gradient:"135deg, #450A0A, #7F1D1D",
        keywords:"Shadow Work · Liberation · Raw Power", planet:"Saturn ♄", element:"Earth 🜃",
        description:"You have an extraordinary capacity to understand the shadow — both in yourself and in others. This is not a burden; it is one of the most powerful gifts a soul can carry. You see what others hide, you understand the deepest human fears, and that understanding gives you a depth of empathy and insight that is genuinely rare.",
        gift:"You can name what is actually happening beneath the surface of any situation, relationship, or pattern — and that naming is often the beginning of someone's freedom.",
        purpose:"Your soul came here to work with shadow — not to be destroyed by it, but to master it. To demonstrate that what we refuse to face will control us, and what we face with courage will set us free.",
        love:"You need a partner who is not afraid of intensity, depth, or honest reckoning with shadow. A love that requires you to be less than your full self is not love — it is a cage.",
        career:"You excel in psychology, shadow work, investigative fields, healing, addiction recovery, finance, strategy, or any role that requires unflinching honesty and the ability to see what others miss.",
        shadow:"The chains you see in others are often the chains you have not yet examined in yourself. The path to freedom always begins with an honest look inward.",
        affirmation:"I face my shadow with courage and compassion. I am not my chains — I hold the key.",
        famous:"Carl Jung · Dostoevsky · Marianne Williamson" },
  16: { name:"The Tower",          roman:"XVI",  emoji:"⚡", symbol:"☈", color:"#B91C1C", gradient:"135deg, #450A0A, #991B1B",
        keywords:"Revelation · Sudden Change · Liberation", planet:"Mars ♂", element:"Fire 🜂",
        description:"Your life has been shaped by sudden, dramatic revelations — moments when everything you thought was solid turned out to be built on a misunderstanding. These upheavals, however painful, have cracked you open to something truer, stronger, and more real. You do not just survive disruption. You are refined by it.",
        gift:"You have an extraordinary capacity to rebuild — faster, wiser, and more authentically each time. You know, in your core, that you can survive anything.",
        purpose:"Your soul came here to experience and demonstrate that the structures that limit us must fall before we can step into our fullest truth. The lightning does not destroy — it illuminates.",
        love:"You need a love built on absolute truth, not comfortable illusion. If a relationship is built on a foundation that isn't real, it will eventually come apart — and the Tower will bring it down.",
        career:"You are extraordinary in crisis management, innovation, disruptive entrepreneurship, emergency medicine, investigative journalism, or any field that requires the courage to tear down what isn't working and rebuild from truth.",
        shadow:"You may unconsciously create chaos to avoid the discomfort of stillness. Or resist the necessary collapse of what is already over, prolonging the suffering. Let it fall.",
        affirmation:"I welcome the truth, even when it disrupts. What is falling was never meant to hold me.",
        famous:"Nikola Tesla · Galileo Galilei · Harriet Tubman" },
  17: { name:"The Star",           roman:"XVII", emoji:"⭐", symbol:"✦", color:"#0284C7", gradient:"135deg, #0C4A6E, #075985",
        keywords:"Hope · Healing · Renewal", planet:"Uranus ♅", element:"Air 🜁",
        description:"You carry a quiet, radiant light that others feel without being able to explain. After every difficulty in your life, you find — sometimes slowly, sometimes surprisingly quickly — a way to hope again. That hope is not naïve; it is hard-won, tested, and luminous. And it is contagious in the most healing possible way.",
        gift:"Your presence renews people's belief in goodness. After talking to you, people feel like things might actually work out — not because you said something clever, but because you genuinely believe it.",
        purpose:"Your soul came here to be a living reminder that beauty, goodness, and healing are always still possible — no matter how dark things have become. You are a light in the collective darkness.",
        love:"You love with extraordinary gentleness and genuine care. You need a partner who cherishes your sensitivity rather than exploiting it — someone whose presence feels like coming home.",
        career:"You flourish in healing, counseling, the arts, social work, spirituality, environmental work, or any field that allows you to contribute to a more beautiful, more hopeful world.",
        shadow:"Hope without action becomes passive wishing. The stars do not navigate for you — they guide you while you are moving. Your light is most powerful when paired with your feet on the ground.",
        affirmation:"I am a light in the world. My hope is a healing force, and I share it freely.",
        famous:"Anne Frank · Audrey Hepburn · Nelson Mandela" },
  18: { name:"The Moon",           roman:"XVIII",emoji:"🌕", symbol:"☽", color:"#4338CA", gradient:"135deg, #1E1B4B, #3730A3",
        keywords:"Intuition · Dreams · The Unseen", planet:"Neptune ♆", element:"Water 🜄",
        description:"You are deeply connected to the unseen world — to dreams, to the subconscious, to the undercurrents that move beneath the surface of ordinary life. You feel things before you understand them. Your body knows truths your mind has not yet translated into words. You are not confused; you are profoundly sensitive.",
        gift:"Your dreamlife is rich with meaning. Your intuition picks up on things that instruments cannot measure. You are a natural psychic, healer, or artist of the inner world.",
        purpose:"Your soul came here to navigate the waters between the conscious and unconscious — to make peace with mystery, to trust what cannot be proven, and to help others do the same.",
        love:"You need a partner who can handle your emotional depth and your occasional disappearances into the inner world. Someone who speaks the language of feeling, not just logic.",
        career:"You excel in dream work, art, poetry, music, psychology, spiritual counseling, investigation, or any field that requires diving beneath the surface to find the truth.",
        shadow:"Anxiety and illusion thrive in the dark. When you cannot distinguish intuition from fear, seek grounding — nature, the body, trusted truth-tellers who love you.",
        affirmation:"I trust my intuition. I move through the mystery with courage, and I always find my way home.",
        famous:"Salvador Dalí · Virginia Woolf · Edgar Allan Poe" },
  19: { name:"The Sun",            roman:"XIX",  emoji:"☀️", symbol:"☉", color:"#CA8A04", gradient:"135deg, #78350F, #B45309",
        keywords:"Joy · Vitality · Radiant Success", planet:"Sun ☀️", element:"Fire 🜂",
        description:"You radiate warmth, optimism, and life force. Being near you makes people feel more alive, more possible, more capable. You have an extraordinary capacity for joy — not the shallow kind, but the deep, embodied, full-spectrum kind that has survived real darkness and shines brighter for it.",
        gift:"Your joy is medicine. Your laughter heals rooms. Your belief in people — real, specific, personal belief — is transformative.",
        purpose:"Your soul came here to embody joy as a spiritual practice — to demonstrate that radiance is not frivolous but sacred, and that your happiness is not separate from your purpose. It IS your purpose.",
        love:"You are a generous, warm, playful partner who brings genuine light into a relationship. You need someone who can meet your warmth — not someone you must drag into the sunshine.",
        career:"You flourish in any field that allows your warmth and vitality to be felt — performance, teaching, leadership, healing, entrepreneurship, or any role where your energy is the gift.",
        shadow:"Relentless positivity can mask what genuinely needs to be healed or grieved. True joy includes the full spectrum — and sometimes the most important thing you can do is let yourself feel the dark.",
        affirmation:"I am a source of light. My joy is sacred, and I share it with the world without apology.",
        famous:"Pharrell Williams · Ellen DeGeneres · Robin Williams" },
  20: { name:"Judgement",          roman:"XX",   emoji:"🔔", symbol:"☊", color:"#7E22CE", gradient:"135deg, #3B0764, #6B21A8",
        keywords:"Awakening · Higher Calling · Rebirth", planet:"Pluto ♇", element:"Fire 🜂",
        description:"You are in the midst of — or approaching — a profound spiritual awakening. You feel a deep, insistent call toward a different life, a truer purpose, a more authentic version of yourself. You have heard the trumpet. You cannot un-hear it. And no matter how long you have delayed, it is calling you still.",
        gift:"You have the capacity for complete, radical reinvention — not just surface-level change, but soul-level transformation. Each time you answer the call, you become more fully yourself.",
        purpose:"Your soul came here to answer the deepest call of all — the call to forgive everything, release everything, and rise into the fullest, most luminous version of who you truly are.",
        love:"You need a partner who supports your evolution and is committed to their own. You cannot stay in a relationship that requires you to stay small. Love, for you, must be a catalyst for becoming.",
        career:"You are called to work that feels like a vocation — healing, ministry, activism, art, teaching, or any field where your work feels like an answer to a calling rather than just a job.",
        shadow:"The call to awaken can trigger deep guilt, shame, or fear of change. Forgiveness — total, unconditional forgiveness of yourself and everyone in your story — is where the journey truly begins.",
        affirmation:"I answer my calling. I forgive the past completely and rise into who I have always been becoming.",
        famous:"Martin Luther King Jr. · Joan of Arc · Eckhart Tolle" },
  21: { name:"The World",          roman:"XXI",  emoji:"🌍", symbol:"♄", color:"#065F46", gradient:"135deg, #022C22, #064E3B",
        keywords:"Completion · Mastery · The Full Circle", planet:"Saturn ♄", element:"Earth 🜃",
        description:"You carry the energy of completion and hard-won mastery. You have been through the entire journey — through initiation, through shadow, through loss and transformation and renewal — and you carry the wisdom of the whole cycle within you. You are not at the end. You are at the threshold of the next, greatest beginning.",
        gift:"You have an integrated, embodied wisdom that cannot be faked or taught. People sense it. You have seen enough to hold complexity without judgment, and that is extraordinarily rare.",
        purpose:"Your soul came here to complete something — a cycle, a pattern, a karmic thread that has been winding through many lifetimes. And in completing it, to become a living demonstration of what wholeness actually looks like.",
        love:"You seek a relationship that is whole — not perfect, but fully alive, fully honest, fully committed to the long journey. You have outgrown anything that doesn't honor the depth of who you are.",
        career:"You are ready for your greatest work — the work that integrates everything you have learned. Leadership, mastery, legacy building, teaching from lived experience, or creating something that will outlast you.",
        shadow:"The fear of completion — of actually being finished, of not knowing what comes next — can keep you cycling through what is already complete. Trust that the next world is already waiting.",
        affirmation:"I have earned my wisdom. I step into the fullness of who I am, and I welcome what comes next.",
        famous:"Nelson Mandela · Maya Angelou · His Holiness the Dalai Lama" },
  22: { name:"The Fool",           roman:"0",    emoji:"🌈", symbol:"○", color:"#8B5CF6", gradient:"135deg, #2E1065, #4C1D95",
        keywords:"Beginnings · Pure Potential · Sacred Leap", planet:"Uranus ♅", element:"Air 🜁",
        description:"You carry the energy of pure, infinite potential — the blank page before the first word, the sky before the first star. You arrived in this life with an open heart and a deep, instinctive trust in the universe that no amount of disappointment has fully extinguished. You are always, always on the edge of something new.",
        gift:"You can begin again with a freshness and optimism that most people lose in childhood. Every closed door genuinely looks like an opening to you — and you are usually right.",
        purpose:"Your soul came here to demonstrate that the journey IS the destination — that leaping before you are ready, trusting without proof, and beginning without guarantees is not recklessness, it is the purest form of faith.",
        love:"You need a love that feels like an adventure — alive, surprising, full of possibility. A partner who inspires you and who is equally willing to leap. You cannot be caged by a love that is afraid of change.",
        career:"You are made for paths that don't exist yet — entrepreneurship, pioneering new fields, art, travel, or any work that requires you to invent the road as you walk it.",
        shadow:"Freedom without direction becomes chaos. The Fool's journey has a destination, even if the path is unscripted. Let your heart, not just your impulse, be your guide.",
        affirmation:"I leap with joy and trust. The universe has always caught me — and it always will.",
        famous:"Charlie Chaplin · Janis Joplin · Rumi" },
};

function calcArcana(day: number, month: number, year: number): number {
  const digits = `${String(day).padStart(2,'0')}${String(month).padStart(2,'0')}${year}`.split("").map(Number);
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
    <div style={{ background: darkBg, minHeight: "100vh", padding: "40px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "6px" }}>🔮</div>
          <div style={{ fontSize: "12px", letterSpacing: "0.3em", color: gold, marginBottom: "10px", fontFamily: "sans-serif" }}>✦ FREE READING ✦</div>
          <h1 style={{ fontSize: "30px", fontWeight: "700", color: "#F0E6D3", marginBottom: "10px", fontFamily: "serif" }}>
            Discover Your Personality Arcana
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.5)", fontFamily: "sans-serif", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto" }}>
            Your birth date holds a sacred code. Enter it below to reveal your Major Arcana — the card that carries your soul's blueprint, your deepest gifts, and your life's true purpose.
          </p>
        </div>

        {/* Input */}
        <div style={{ background: cardBg, border: `1px solid rgba(201,168,76,0.35)`, borderRadius: "20px", padding: "32px", marginBottom: "28px", boxShadow: `0 0 40px rgba(201,168,76,0.1)` }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: gold, marginBottom: "20px", fontFamily: "sans-serif", textAlign: "center" }}>ENTER YOUR DATE OF BIRTH</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Day", val: day, set: setDay, ph: "DD", w: "70px" },
              { label: "Month", val: month, set: setMonth, ph: "MM", w: "70px" },
              { label: "Year", val: year, set: setYear, ph: "YYYY", w: "90px" },
            ].map(f => (
              <div key={f.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "rgba(232,224,240,0.35)", letterSpacing: "0.15em", marginBottom: "6px", fontFamily: "sans-serif" }}>{f.label.toUpperCase()}</p>
                <input type="number" placeholder={f.ph} value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: f.w, padding: "12px 6px", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(201,168,76,0.3)`, borderRadius: "10px", color: "#F0E6D3", fontSize: "20px", fontFamily: "serif", textAlign: "center", outline: "none" }}
                />
              </div>
            ))}
          </div>
          {error && <p style={{ color: "#F87171", fontSize: "12px", textAlign: "center", marginBottom: "12px", fontFamily: "sans-serif" }}>{error}</p>}
          <button onClick={calculate} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, #4C1D95, #7C3AED)`, border: `1px solid rgba(201,168,76,0.35)`, borderRadius: "12px", color: "#F0E6D3", fontSize: "14px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "sans-serif", cursor: "pointer" }}>
            ✦ REVEAL MY ARCANA ✦
          </button>
        </div>

        {/* Result */}
        {arcana && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* Card Visual */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                display: "inline-block",
                width: "160px", height: "260px",
                background: `linear-gradient(${arcana.gradient})`,
                border: `2px solid rgba(201,168,76,0.6)`,
                borderRadius: "16px",
                boxShadow: `0 0 60px ${arcana.color}66, 0 0 20px ${arcana.color}33`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                padding: "20px 16px",
                position: "relative",
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>{arcana.roman}</div>
                <div>
                  <div style={{ fontSize: "56px", marginBottom: "4px" }}>{arcana.emoji}</div>
                  <div style={{ fontSize: "28px", color: "rgba(201,168,76,0.6)" }}>{arcana.symbol}</div>
                </div>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", fontFamily: "sans-serif", textAlign: "center" }}>
                  {arcana.name.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Name & Keywords */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.25em", color: arcana.color, marginBottom: "6px", fontFamily: "sans-serif" }}>YOUR PERSONALITY ARCANA</p>
              <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#F0E6D3", fontFamily: "serif", marginBottom: "12px" }}>{arcana.name}</h2>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                {arcana.keywords.split(" · ").map(kw => (
                  <span key={kw} style={{ padding: "5px 14px", background: `${arcana.color}22`, border: `1px solid ${arcana.color}55`, borderRadius: "20px", fontSize: "11px", color: arcana.color, fontFamily: "sans-serif", letterSpacing: "0.08em" }}>{kw}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "rgba(232,224,240,0.4)", fontFamily: "sans-serif" }}>{arcana.planet}</span>
                <span style={{ fontSize: "12px", color: "rgba(232,224,240,0.4)", fontFamily: "sans-serif" }}>{arcana.element}</span>
              </div>
            </div>

            <div style={{ width: "60px", height: "1px", background: `linear-gradient(to right, transparent, ${arcana.color}, transparent)`, margin: "0 auto 28px" }} />

            {/* Sections */}
            {[
              { label: "✦ YOUR SOUL'S BLUEPRINT", text: arcana.description },
              { label: "✦ YOUR EXTRAORDINARY GIFT", text: arcana.gift },
              { label: "✦ YOUR LIFE'S PURPOSE", text: arcana.purpose },
            ].map(s => (
              <div key={s.label} style={{ background: cardBg, border: `1px solid ${arcana.color}33`, borderRadius: "14px", padding: "22px 24px", marginBottom: "14px", boxShadow: `0 0 20px ${arcana.color}22` }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: gold, marginBottom: "10px", fontFamily: "sans-serif" }}>{s.label}</p>
                <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.88)", lineHeight: "1.85", fontFamily: "serif" }}>{s.text}</p>
              </div>
            ))}

            {/* Love & Career */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              {[
                { label: "💞 LOVE & RELATIONSHIPS", text: arcana.love },
                { label: "💫 CAREER & ABUNDANCE", text: arcana.career },
              ].map(s => (
                <div key={s.label} style={{ background: cardBg, border: `1px solid ${arcana.color}33`, borderRadius: "14px", padding: "20px", boxShadow: `0 0 20px ${arcana.color}22` }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: gold, marginBottom: "10px", fontFamily: "sans-serif" }}>{s.label}</p>
                  <p style={{ fontSize: "13px", color: "rgba(232,224,240,0.82)", lineHeight: "1.8", fontFamily: "serif" }}>{s.text}</p>
                </div>
              ))}
            </div>

            {/* Shadow */}
            <div style={{ background: `${arcana.color}18`, border: `1px solid ${arcana.color}44`, borderRadius: "14px", padding: "22px 24px", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: arcana.color, marginBottom: "10px", fontFamily: "sans-serif" }}>🌑 YOUR SHADOW LESSON</p>
              <p style={{ fontSize: "13px", color: "rgba(232,224,240,0.78)", lineHeight: "1.8", fontFamily: "serif", fontStyle: "italic" }}>{arcana.shadow}</p>
            </div>

            {/* Affirmation */}
            <div style={{ background: `rgba(201,168,76,0.08)`, border: `1px solid rgba(201,168,76,0.35)`, borderRadius: "14px", padding: "22px 24px", marginBottom: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: gold, marginBottom: "12px", fontFamily: "sans-serif" }}>✦ YOUR PERSONAL AFFIRMATION</p>
              <p style={{ fontSize: "16px", color: "#F0E6D3", lineHeight: "1.7", fontFamily: "serif", fontStyle: "italic" }}>"{arcana.affirmation}"</p>
            </div>

            {/* Famous */}
            <div style={{ background: cardBg, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: "14px", padding: "18px 24px", marginBottom: "28px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: gold, marginBottom: "10px", fontFamily: "sans-serif" }}>✦ FAMOUS {arcana.name.toUpperCase()} SOULS</p>
              <p style={{ fontSize: "14px", color: "rgba(232,224,240,0.6)", fontFamily: "sans-serif" }}>{arcana.famous}</p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", padding: "36px 28px", background: "linear-gradient(135deg, #1A0E2E, #0D1A35)", border: `1px solid rgba(201,168,76,0.35)`, borderRadius: "20px", boxShadow: `0 0 40px rgba(201,168,76,0.12)` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: gold, marginBottom: "12px", fontFamily: "sans-serif" }}>✦ READY TO GO DEEPER? ✦</div>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#F0E6D3", marginBottom: "12px", fontFamily: "serif" }}>Book Your Personal Tarot Reading</h3>
              <p style={{ fontSize: "13px", color: "rgba(232,224,240,0.55)", marginBottom: "20px", lineHeight: "1.7", fontFamily: "sans-serif" }}>
                This is your overview. A personal 1-on-1 session goes into your specific situation, relationships, timing, and path forward.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
                <a href="https://t.me/Ana_Krista" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "12px 24px", background: "linear-gradient(135deg, #2AABEE, #229ED9)", borderRadius: "50px", color: "#fff", fontSize: "13px", fontWeight: "700", fontFamily: "sans-serif", textDecoration: "none" }}>
                  ✈ Telegram @Ana_Krista
                </a>
                <a href="https://wa.me/13177520369" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "12px 24px", background: "linear-gradient(135deg, #25D366, #1DA851)", borderRadius: "50px", color: "#fff", fontSize: "13px", fontWeight: "700", fontFamily: "sans-serif", textDecoration: "none" }}>
                  💬 WhatsApp
                </a>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(232,224,240,0.3)", fontFamily: "sans-serif" }}>
                Telegram: t.me/Ana_Krista &nbsp;·&nbsp; WhatsApp: +1 317 752 0369
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

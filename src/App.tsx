/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Book, Moon, Zap, Journal, Image as ImageIcon, Sticker, Calculator, Home, Volume2, ArrowRight } from "lucide-react";
import Guide from "./Guide";

const PRODUCTS = [
  {
    id: 1,
    emoji: "✨",
    title: "Бот «Карта дня»",
    description: "Автоматизированный прогноз. Клиент получает совет и ссылку на запись, если нужно глубже.",
    price: "$5.00",
    color: "bg-purple-500/20",
    border: "border-purple-500/20"
  },
  {
    id: 2,
    emoji: "📖",
    title: "PDF-Гайд по Раскладам",
    description: "5 схем на любовь и финансы. Обучает клиентов видеть сложность, ведя к эксперту.",
    price: "$9.00",
    color: "bg-indigo-500/20",
    border: "border-indigo-500/20"
  },
  {
    id: 3,
    emoji: "🌙",
    title: "Лунный Ритуал",
    description: "Аудио-медитация + чек-лист под новолуние. Формирует привычку работать с энергией.",
    price: "$7.00",
    color: "bg-blue-500/20",
    border: "border-blue-500/20"
  },
  {
    id: 4,
    emoji: "🔮",
    title: "Шпаргалка Смыслов",
    description: "Карманный справочник значений Арканов. Полезно для новичков, купивших свою первую колоду.",
    price: "$3.00",
    color: "bg-pink-500/20",
    border: "border-pink-500/20"
  },
  {
    id: 5,
    emoji: "📓",
    title: "Теневой Журнал",
    description: "30 вопросов для самоанализа через Таро. Помогает проработать блоки и триггеры.",
    price: "$12.00",
    color: "bg-emerald-500/20",
    border: "border-emerald-500/20"
  },
  {
    id: 6,
    emoji: "🖼️",
    title: "Обои-Амулеты",
    description: "Стильные заставки на телефон с Арканами для привлечения удачи и защиты.",
    price: "$2.00",
    color: "bg-orange-500/20",
    border: "border-orange-500/20"
  },
  {
    id: 7,
    emoji: "📱",
    title: "Стикерпак для Сторис",
    description: "Набор магических элементов для оформления блогов подписчиков. Повышает узнаваемость.",
    price: "$4.00",
    color: "bg-rose-500/20",
    border: "border-rose-500/20"
  },
  {
    id: 8,
    emoji: "🔢",
    title: "Нумеро-Таро Расчет",
    description: "Мини-курс: как рассчитать Аркан личности. Вызывает интерес к полному разбору судьбы.",
    price: "$15.00",
    color: "bg-cyan-500/20",
    border: "border-cyan-500/20"
  },
  {
    id: 9,
    emoji: "🕯️",
    title: "Чек-лист Алтаря",
    description: "Как обустроить рабочее место для гадания дома за 15 минут из подручных средств.",
    price: "$6.00",
    color: "bg-amber-500/20",
    border: "border-amber-500/20"
  },
  {
    id: 10,
    emoji: "🎧",
    title: "Аудио-курс «Очистка»",
    description: "3 урока по экологичному завершению раскладов и сбросу чужой энергии.",
    price: "$10.00",
    color: "bg-violet-500/20",
    border: "border-violet-500/20"
  }
];

export default function App() {
  const [showGuide, setShowGuide] = useState(false);

  if (showGuide) {
    return (
      <div className="min-h-screen bg-white">
        <div className="no-print flex items-center gap-4 p-4 bg-purple-900 text-white">
          <button onClick={() => setShowGuide(false)} className="text-sm underline">← Back</button>
          <span className="text-sm font-medium">PDF Guide Preview</span>
          <button onClick={() => window.print()} className="ml-auto bg-white text-purple-900 text-sm font-bold px-4 py-2 rounded-lg">
            Save as PDF 📥
          </button>
        </div>
        <Guide />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a1f] text-white flex flex-col font-sans overflow-x-hidden p-4 md:p-8 relative selection:bg-purple-500/30">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 relative z-10">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl md:text-5xl font-serif italic tracking-wide mb-3 bg-gradient-to-r from-purple-200 to-indigo-100 bg-clip-text text-transparent">
              Экосистема Цифровых Продуктов Таро
            </h1>
            <p className="text-sm md:text-base text-indigo-200/70 font-light max-w-xl">
              10 стратегий для вовлечения подписчиков и мягких продаж ваших личных консультаций
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-left md:text-right"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-medium">Status: Production Ready</span>
            <div className="text-2xl md:text-3xl font-light text-white/90">2026 Release</div>
          </motion.div>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300 h-full cursor-default"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 ${product.color} rounded-xl flex items-center justify-center text-2xl shadow-inner`}>
                  {product.emoji}
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2 group-hover:text-purple-200 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/50 group-hover:text-white/70 transition-colors">
                    {product.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                    {product.price}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                {product.id === 2 && (
                  <button
                    onClick={() => setShowGuide(true)}
                    className="w-full text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    Preview Guide →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </main>

        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-auto flex flex-col lg:flex-row items-center justify-between p-6 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl gap-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="shrink-0">
              <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Конверсия</div>
              <div className="text-xl md:text-2xl font-medium text-purple-200">Прогрев через пользу</div>
            </div>
            
            <div className="hidden md:block w-[1px] h-12 bg-white/10"></div>
            
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Главная стратегия</div>
              <p className="text-sm text-indigo-100/80 max-w-xl leading-relaxed">
                Используйте недорогие продукты как <span className="text-indigo-300 font-medium">«трипвайер»</span>: они мгновенно решают одну малую проблему клиента 
                и доказывают вашу экспертность, делая переход к полноценной личной консультации естественным и желанным шагом.
              </p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            Записаться на разбор
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.footer>
      </div>
    </div>
  );
}

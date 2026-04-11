#!/usr/bin/env node
/**
 * Activity Bank seeder for GFA Arcade.
 *
 * Inserts 31 ready-made Year 1 British curriculum activities into the
 * `activities` table with `is_template = true, teacher_id = null`.
 * (25 original + 6 visual-rich quizzes added 2026-04-11.)
 *
 * Subjects: Maths, Phonics, Science, Geography, History, PSHE.
 * Game types: Quiz, Match Up, Flash Cards, Spin Wheel, Group Sort.
 *
 * Source: UK National Curriculum (KS1) + Letters & Sounds Phases 2-4.
 *
 * Usage:
 *   node scripts/seed-bank.mjs              # insert all 25
 *   node scripts/seed-bank.mjs --reset      # delete existing templates first
 *
 * Prerequisite: run `supabase-bank.sql` in the Supabase SQL editor first.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const TEACHER_EMAIL = "sarah.teacher@gemsfounders.ae";
const TEACHER_PASSWORD = "TestPass123!";

const args = new Set(process.argv.slice(2));
const RESET = args.has("--reset");

// ===== Helpers =====
function quiz(questions, time_limit_seconds = 25) {
  return {
    type: "quiz",
    questions: questions.map((q) => ({
      question: q.q,
      options: q.options,
      correct_index: q.options.indexOf(q.correct),
      ...(q.visual ? { visual: q.visual } : {}),
      time_limit_seconds,
    })),
  };
}

function matchUp(pairs, time_limit_seconds = 90) {
  return { type: "match-up", pairs, time_limit_seconds };
}

function flashCards(cards) {
  return { type: "flashcards", cards };
}

function spinWheel(segments, rounds = 8) {
  return { type: "spin-wheel", segments, rounds };
}

function groupSort(groups, time_limit_seconds = 90) {
  return { type: "group-sort", groups, time_limit_seconds };
}

// ===== 25 Activities =====

const ACTIVITIES = [
  // ============== MATHS (8) ==============
  {
    title: "🔢 Counting & Number Recognition",
    subject: "maths",
    topic: "Number recognition & counting to 100",
    description: "Count objects and recognise numbers up to 20.",
    difficulty: "easy",
    config: quiz([
      { q: "How many apples? 🍎🍎🍎🍎", options: ["2", "3", "4", "5"], correct: "4" },
      { q: "Which number comes after 7?", options: ["6", "8", "9", "10"], correct: "8" },
      { q: "Count the stars: ⭐⭐⭐⭐⭐⭐⭐", options: ["5", "6", "7", "8"], correct: "7" },
      { q: "What number comes before 10?", options: ["8", "9", "11", "12"], correct: "9" },
      { q: "Count on from 15: 15, 16, 17, ___", options: ["18", "19", "20", "14"], correct: "18" },
      { q: "How many tens are in 20?", options: ["1", "2", "3", "20"], correct: "2" },
      { q: "1 ten and 3 ones makes…", options: ["4", "13", "31", "103"], correct: "13" },
      { q: "Which is bigger: 12 or 21?", options: ["12", "21", "same", "neither"], correct: "21" },
      { q: "Count: 🐠🐠🐠🐠🐠🐠", options: ["4", "5", "6", "7"], correct: "6" },
      { q: "What number is between 8 and 10?", options: ["7", "9", "11", "12"], correct: "9" },
    ]),
  },
  {
    title: "➕ Addition Adventure (within 20)",
    subject: "maths",
    topic: "Addition & subtraction within 20",
    description: "Add and subtract numbers up to 20.",
    difficulty: "easy",
    config: quiz([
      { q: "5 + 3 = ? 🍪", options: ["7", "8", "9", "10"], correct: "8" },
      { q: "4 + 6 = ?", options: ["9", "10", "11", "12"], correct: "10" },
      { q: "10 − 4 = ?", options: ["4", "5", "6", "7"], correct: "6" },
      { q: "9 − 2 = ?", options: ["6", "7", "8", "11"], correct: "7" },
      { q: "7 + 7 = ?", options: ["12", "13", "14", "15"], correct: "14" },
      { q: "3 + 4 = ?", options: ["6", "7", "8", "9"], correct: "7" },
      { q: "11 − 5 = ?", options: ["5", "6", "7", "8"], correct: "6" },
      { q: "2 + 8 = ?", options: ["8", "9", "10", "11"], correct: "10" },
      { q: "6 + 3 = ?", options: ["8", "9", "10", "11"], correct: "9" },
      { q: "15 − 5 = ?", options: ["8", "9", "10", "11"], correct: "10" },
    ]),
  },
  {
    title: "🪞 Doubles & Halves",
    subject: "maths",
    topic: "Doubles & halves",
    description: "Doubles and halves up to 10.",
    difficulty: "easy",
    config: quiz([
      { q: "Double 3 is…", options: ["3", "5", "6", "9"], correct: "6" },
      { q: "Double 5 is…", options: ["5", "10", "15", "55"], correct: "10" },
      { q: "Half of 8 is…", options: ["2", "3", "4", "6"], correct: "4" },
      { q: "Half of 10 is…", options: ["2", "5", "8", "10"], correct: "5" },
      { q: "Double 4 is…", options: ["6", "7", "8", "16"], correct: "8" },
      { q: "Half of 6 is…", options: ["1", "2", "3", "4"], correct: "3" },
      { q: "Double 2 is…", options: ["2", "3", "4", "5"], correct: "4" },
      { q: "Half of 4 is…", options: ["1", "2", "3", "4"], correct: "2" },
    ]),
  },
  {
    title: "🔺 Shapes Around Us",
    subject: "maths",
    topic: "2D & 3D shapes",
    description: "Recognise everyday 2D and 3D shapes.",
    difficulty: "easy",
    config: quiz([
      { q: "How many sides does a triangle have? 🔺", options: ["2", "3", "4", "5"], correct: "3" },
      { q: "What shape is a ball? ⚽", options: ["circle", "square", "sphere", "cube"], correct: "sphere" },
      { q: "How many corners does a square have?", options: ["2", "3", "4", "5"], correct: "4" },
      { q: "Which shape has no corners?", options: ["square", "triangle", "circle", "star"], correct: "circle" },
      { q: "A dice is shaped like a…", options: ["circle", "cube", "cone", "cylinder"], correct: "cube" },
      { q: "How many sides does a rectangle have?", options: ["3", "4", "5", "6"], correct: "4" },
      { q: "Which shape is round and flat?", options: ["square", "circle", "triangle", "cube"], correct: "circle" },
      { q: "A pizza box is shaped like a…", options: ["circle", "square", "triangle", "sphere"], correct: "square" },
    ]),
  },
  {
    title: "🎡 Quick Maths Spin",
    subject: "maths",
    topic: "Mental maths warm-up",
    description: "Spin the wheel to win quick maths points!",
    difficulty: "easy",
    config: spinWheel(
      [
        { label: "+10 pts", value: 100 },
        { label: "+25 pts", value: 250 },
        { label: "+50 pts", value: 500 },
        { label: "+75 pts", value: 750 },
        { label: "+100 pts", value: 1000 },
        { label: "x2", value: 0, special: "x2" },
        { label: "+5 pts", value: 50 },
        { label: "BANKRUPT", value: 0, special: "bankrupt" },
      ],
      10
    ),
  },
  {
    title: "🔢 Numbers to Words",
    subject: "maths",
    topic: "Number words to twenty",
    description: "Match numerals to their written words.",
    difficulty: "easy",
    config: matchUp([
      { term: "1", definition: "one" },
      { term: "3", definition: "three" },
      { term: "5", definition: "five" },
      { term: "7", definition: "seven" },
      { term: "10", definition: "ten" },
      { term: "12", definition: "twelve" },
      { term: "15", definition: "fifteen" },
      { term: "20", definition: "twenty" },
    ]),
  },
  {
    title: "📐 Sort by Shape",
    subject: "maths",
    topic: "2D shape sorting",
    description: "Sort everyday objects by shape.",
    difficulty: "easy",
    config: groupSort([
      { name: "Circle", items: ["clock", "wheel", "coin", "plate"] },
      { name: "Square", items: ["window", "tile", "biscuit", "board"] },
      { name: "Triangle", items: ["pizza slice", "roof", "flag", "cone"] },
    ]),
  },
  {
    title: "🪞 Doubles Flash Cards",
    subject: "maths",
    topic: "Mental doubles",
    description: "Flip to reveal the double of each number.",
    difficulty: "easy",
    config: flashCards([
      { front: "Double 1", back: "2" },
      { front: "Double 2", back: "4" },
      { front: "Double 3", back: "6" },
      { front: "Double 4", back: "8" },
      { front: "Double 5", back: "10" },
      { front: "Double 6", back: "12" },
      { front: "Double 7", back: "14" },
      { front: "Double 8", back: "16" },
      { front: "Double 9", back: "18" },
      { front: "Double 10", back: "20" },
    ]),
  },

  // ============== PHONICS / ENGLISH (6) ==============
  {
    title: "🔤 Phase 2 First Sounds",
    subject: "phonics",
    topic: "Phase 2 graphemes & CVC blending",
    description: "Hear and blend Phase 2 sounds (s, a, t, p, i, n).",
    difficulty: "easy",
    config: quiz([
      { q: "Blend the sounds: c-a-t", options: ["cat", "cap", "cot", "cut"], correct: "cat" },
      { q: "Which word starts with the sound 's'?", options: ["dog", "sun", "pig", "hat"], correct: "sun" },
      { q: "Blend: p-i-n", options: ["pan", "pin", "pen", "pun"], correct: "pin" },
      { q: "What is the first sound in 'tap'?", options: ["a", "p", "t", "s"], correct: "t" },
      { q: "Blend: m-a-p", options: ["map", "mop", "man", "mat"], correct: "map" },
      { q: "Which word starts with the sound 'p'?", options: ["dog", "cat", "pig", "fish"], correct: "pig" },
      { q: "Blend: s-i-t", options: ["sat", "sit", "set", "sun"], correct: "sit" },
      { q: "What is the last sound in 'dog'?", options: ["d", "o", "g", "do"], correct: "g" },
      { q: "Blend: t-i-n", options: ["tan", "ten", "tin", "ton"], correct: "tin" },
      { q: "Which word starts with the sound 'n'?", options: ["nut", "cat", "dog", "pig"], correct: "nut" },
    ]),
  },
  {
    title: "🔤 Phase 3 Digraphs (sh, ch, th)",
    subject: "phonics",
    topic: "Phase 3 digraphs",
    description: "Words with two letters making one sound.",
    difficulty: "easy",
    config: quiz([
      { q: "Which word has 'sh'?", options: ["ship", "trip", "pin", "tap"], correct: "ship" },
      { q: "Blend: ch-i-p", options: ["chap", "chip", "chop", "chimp"], correct: "chip" },
      { q: "Which word has the 'ee' sound?", options: ["bed", "bee", "big", "bat"], correct: "bee" },
      { q: "Blend: b-oa-t", options: ["bit", "bat", "boat", "bout"], correct: "boat" },
      { q: "Which word ends with 'ng'?", options: ["king", "kin", "kit", "kid"], correct: "king" },
      { q: "Which word starts with 'th'?", options: ["thin", "tin", "pin", "win"], correct: "thin" },
      { q: "Which word has 'oo'?", options: ["zoo", "zap", "zip", "buzz"], correct: "zoo" },
      { q: "Blend: sh-ee-p", options: ["ship", "shop", "sheep", "shape"], correct: "sheep" },
      { q: "Which word has 'ai'?", options: ["rain", "ran", "run", "ron"], correct: "rain" },
      { q: "Blend: ch-i-n", options: ["chin", "chip", "chop", "chap"], correct: "chin" },
    ]),
  },
  {
    title: "🎵 Rhyming Pairs",
    subject: "phonics",
    topic: "Rhyming",
    description: "Match the words that rhyme.",
    difficulty: "easy",
    config: matchUp([
      { term: "cat", definition: "hat" },
      { term: "log", definition: "frog" },
      { term: "bee", definition: "tree" },
      { term: "sun", definition: "bun" },
      { term: "star", definition: "car" },
      { term: "pig", definition: "wig" },
      { term: "moon", definition: "spoon" },
      { term: "fish", definition: "dish" },
    ]),
  },
  {
    title: "🃏 Tricky Words Flash Cards",
    subject: "phonics",
    topic: "Year 1 common exception words",
    description: "Practice reading Y1 statutory tricky words.",
    difficulty: "easy",
    config: flashCards([
      { front: "the", back: "Tricky word — say it!" },
      { front: "said", back: "Tricky word — say it!" },
      { front: "was", back: "Tricky word — say it!" },
      { front: "you", back: "Tricky word — say it!" },
      { front: "they", back: "Tricky word — say it!" },
      { front: "there", back: "Tricky word — say it!" },
      { front: "where", back: "Tricky word — say it!" },
      { front: "people", back: "Tricky word — say it!" },
      { front: "your", back: "Tricky word — say it!" },
      { front: "are", back: "Tricky word — say it!" },
      { front: "have", back: "Tricky word — say it!" },
      { front: "love", back: "Tricky word — say it!" },
    ]),
  },
  {
    title: "🔤 Sort by First Sound",
    subject: "phonics",
    topic: "Initial sound sorting",
    description: "Sort words by their starting sound.",
    difficulty: "easy",
    config: groupSort([
      { name: "Starts with 's'", items: ["sun", "sock", "sand", "snake"] },
      { name: "Starts with 'b'", items: ["ball", "bee", "bat", "book"] },
      { name: "Starts with 'p'", items: ["pig", "pen", "pot", "pan"] },
    ]),
  },
  {
    title: "🔤 Blending CVC Words",
    subject: "phonics",
    topic: "CVC blending",
    description: "Blend three sounds to read a word.",
    difficulty: "easy",
    config: quiz([
      { q: "Blend: r-u-n", options: ["ran", "run", "ron", "ren"], correct: "run" },
      { q: "Blend: b-i-g", options: ["bag", "big", "bog", "bug"], correct: "big" },
      { q: "Blend: h-o-t", options: ["hat", "hit", "hot", "hut"], correct: "hot" },
      { q: "Blend: c-u-p", options: ["cap", "cop", "cup", "cut"], correct: "cup" },
      { q: "Blend: m-u-d", options: ["mad", "mid", "mud", "mod"], correct: "mud" },
      { q: "Blend: l-e-g", options: ["lag", "leg", "log", "lug"], correct: "leg" },
      { q: "Blend: f-o-x", options: ["fax", "fix", "fox", "fux"], correct: "fox" },
      { q: "Blend: w-i-n", options: ["wan", "win", "won", "wen"], correct: "win" },
      { q: "Blend: b-e-d", options: ["bad", "bed", "bid", "bud"], correct: "bed" },
      { q: "Blend: t-o-p", options: ["tap", "tip", "top", "tup"], correct: "top" },
    ]),
  },

  // ============== SCIENCE (4) ==============
  {
    title: "🐾 Animal Groups",
    subject: "science",
    topic: "Animal classification",
    description: "Mammals, birds, fish, reptiles and amphibians.",
    difficulty: "easy",
    config: quiz([
      { q: "Which animal is a mammal? 🐶", options: ["fish", "dog", "snake", "frog"], correct: "dog" },
      { q: "Which animal is a bird? 🦉", options: ["cat", "owl", "cow", "fish"], correct: "owl" },
      { q: "Which animal is a fish? 🐟", options: ["shark", "dog", "bird", "frog"], correct: "shark" },
      { q: "Which animal is a reptile? 🐍", options: ["snake", "mouse", "duck", "bee"], correct: "snake" },
      { q: "Which animal is an amphibian? 🐸", options: ["frog", "dog", "cow", "goat"], correct: "frog" },
      { q: "What do we call an animal that has fur and drinks milk as a baby?", options: ["bird", "mammal", "fish", "reptile"], correct: "mammal" },
      { q: "Which has feathers?", options: ["fish", "snake", "owl", "frog"], correct: "owl" },
      { q: "Which has scales and lives in water?", options: ["dog", "fish", "bird", "cow"], correct: "fish" },
      { q: "Which animal lays eggs and has feathers?", options: ["fish", "cow", "owl", "snake"], correct: "owl" },
      { q: "A baby cat is called a…", options: ["puppy", "kitten", "calf", "chick"], correct: "kitten" },
    ]),
  },
  {
    title: "🌱 Plants & Growing",
    subject: "science",
    topic: "Plant parts and needs",
    description: "Parts of a plant and what they need to grow.",
    difficulty: "easy",
    config: quiz([
      { q: "What part of the plant is under the ground? 🌱", options: ["leaf", "flower", "root", "stem"], correct: "root" },
      { q: "What do plants need to grow?", options: ["water and light", "sweets", "paint", "socks"], correct: "water and light" },
      { q: "Which part of a plant makes seeds? 🌻", options: ["root", "flower", "stem", "leaf"], correct: "flower" },
      { q: "What do leaves use from the sun? ☀️", options: ["light", "rain", "wind", "snow"], correct: "light" },
      { q: "What do we call a tree that loses its leaves in autumn?", options: ["evergreen", "deciduous", "baby", "plastic"], correct: "deciduous" },
      { q: "Which is part of a plant?", options: ["wing", "stem", "tail", "ear"], correct: "stem" },
      { q: "Which season do flowers usually bloom? 🌷", options: ["winter", "spring", "summer", "autumn"], correct: "spring" },
      { q: "A small plant grows from a…", options: ["rock", "seed", "spoon", "shoe"], correct: "seed" },
    ]),
  },
  {
    title: "👃 Body Parts",
    subject: "science",
    topic: "Senses & body",
    description: "Match the body part to what it does.",
    difficulty: "easy",
    config: matchUp([
      { term: "Eyes 👀", definition: "see" },
      { term: "Ears 👂", definition: "hear" },
      { term: "Nose 👃", definition: "smell" },
      { term: "Mouth 👄", definition: "taste" },
      { term: "Hands ✋", definition: "touch" },
      { term: "Feet 🦶", definition: "walk" },
      { term: "Heart ❤️", definition: "pump blood" },
      { term: "Brain 🧠", definition: "think" },
    ]),
  },
  {
    title: "🌳 Living vs Non-living",
    subject: "science",
    topic: "Living things",
    description: "Sort things into living and non-living.",
    difficulty: "easy",
    config: groupSort([
      { name: "Living", items: ["dog", "tree", "bird", "child", "flower"] },
      { name: "Non-living", items: ["rock", "chair", "car", "spoon", "ball"] },
    ]),
  },

  // ============== GEOGRAPHY (3) ==============
  {
    title: "🌍 Around the World",
    subject: "geography",
    topic: "Continents & oceans",
    description: "The 7 continents and 5 oceans.",
    difficulty: "easy",
    config: quiz([
      { q: "How many continents are there? 🌍", options: ["5", "6", "7", "8"], correct: "7" },
      { q: "Which continent do we live on if we are in the UK?", options: ["Africa", "Europe", "Asia", "Australia"], correct: "Europe" },
      { q: "Which is the biggest continent?", options: ["Africa", "Asia", "Europe", "Antarctica"], correct: "Asia" },
      { q: "Which continent is very cold and has lots of ice?", options: ["Africa", "Antarctica", "Asia", "Europe"], correct: "Antarctica" },
      { q: "Kangaroos come from which continent? 🦘", options: ["Africa", "Australia", "Asia", "Europe"], correct: "Australia" },
      { q: "How many oceans are there? 🌊", options: ["3", "4", "5", "6"], correct: "5" },
      { q: "Which is the biggest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: "Pacific" },
      { q: "What is the capital city of England?", options: ["London", "Paris", "Cardiff", "Dubai"], correct: "London" },
    ]),
  },
  {
    title: "☀️ Weather & Seasons",
    subject: "geography",
    topic: "Weather and seasons",
    description: "Weather words and the four seasons.",
    difficulty: "easy",
    config: quiz([
      { q: "What do we call water falling from clouds? 🌧️", options: ["snow", "rain", "wind", "sun"], correct: "rain" },
      { q: "Frozen rain is called… ❄️", options: ["fog", "snow", "dew", "mist"], correct: "snow" },
      { q: "Strong moving air is called… 🌬️", options: ["rain", "wind", "sun", "snow"], correct: "wind" },
      { q: "Which season has snow? ❄️", options: ["winter", "summer", "spring", "autumn"], correct: "winter" },
      { q: "In which season do leaves fall off trees? 🍂", options: ["spring", "summer", "autumn", "winter"], correct: "autumn" },
      { q: "Which season is the hottest in the UK?", options: ["winter", "spring", "summer", "autumn"], correct: "summer" },
      { q: "What do we wear when it is sunny?", options: ["scarf", "hat and sunglasses", "wellies", "gloves"], correct: "hat and sunglasses" },
      { q: "What do we use when it rains? ☂️", options: ["umbrella", "fan", "sunglasses", "blanket"], correct: "umbrella" },
    ]),
  },
  {
    title: "🇦🇪 UAE Landmarks vs World Landmarks",
    subject: "geography",
    topic: "Local & world places",
    description: "Sort famous places into UAE or rest of the world.",
    difficulty: "easy",
    config: groupSort([
      { name: "In the UAE 🇦🇪", items: ["Burj Khalifa", "Masdar City", "Sheikh Zayed Mosque", "Burj Al Arab", "Palm Jumeirah"] },
      { name: "Rest of the World 🌍", items: ["Eiffel Tower", "Big Ben", "Pyramids", "Great Wall", "Taj Mahal"] },
    ]),
  },

  // ============== HISTORY (2) ==============
  {
    title: "👑 Famous People",
    subject: "history",
    topic: "Significant individuals",
    description: "Famous people from the past who changed the world.",
    difficulty: "easy",
    config: quiz([
      { q: "Florence Nightingale was a famous…", options: ["nurse", "pilot", "queen", "chef"], correct: "nurse" },
      { q: "What did Florence Nightingale carry at night?", options: ["bag", "lamp", "sword", "phone"], correct: "lamp" },
      { q: "Neil Armstrong was the first person to walk on the… 🌕", options: ["sun", "moon", "mars", "sea"], correct: "moon" },
      { q: "Christopher Columbus travelled by…", options: ["plane", "ship", "car", "train"], correct: "ship" },
      { q: "The Wright Brothers invented the first… ✈️", options: ["car", "plane", "boat", "bike"], correct: "plane" },
      { q: "A crown is worn by a…", options: ["farmer", "king or queen", "doctor", "chef"], correct: "king or queen" },
      { q: "Florence helped sick…", options: ["astronauts", "soldiers", "teachers", "pirates"], correct: "soldiers" },
      { q: "What is the leader of the UK called?", options: ["President", "Prime Minister", "King only", "Mayor"], correct: "Prime Minister" },
    ]),
  },
  {
    title: "⏳ Then & Now",
    subject: "history",
    topic: "Past and present",
    description: "Things from long ago vs today.",
    difficulty: "easy",
    config: flashCards([
      { front: "Then: horse and cart 🐴", back: "Now: car 🚗" },
      { front: "Then: candle 🕯️", back: "Now: light bulb 💡" },
      { front: "Then: letter ✉️", back: "Now: email 📧" },
      { front: "Then: black and white photo", back: "Now: colour photo 📸" },
      { front: "Then: washboard", back: "Now: washing machine" },
      { front: "Then: town crier", back: "Now: TV news 📺" },
      { front: "Then: chalk and slate", back: "Now: tablet 📱" },
      { front: "Then: feather pen 🪶", back: "Now: ballpoint pen 🖊️" },
      { front: "Then: hand fan", back: "Now: air conditioning ❄️" },
      { front: "Then: fire to cook", back: "Now: oven" },
    ]),
  },

  // ============== PSHE (2) ==============
  {
    title: "💛 Feelings & Friendship",
    subject: "pshe",
    topic: "Emotions and being kind",
    description: "Talk about feelings and how to be a good friend.",
    difficulty: "easy",
    config: quiz([
      { q: "How might you feel on your birthday? 🎂", options: ["sad", "happy", "angry", "sleepy"], correct: "happy" },
      { q: "If you lose your toy, you might feel…", options: ["happy", "sad", "excited", "proud"], correct: "sad" },
      { q: "What should you do if you feel sad?", options: ["hide forever", "tell an adult", "shout at friends", "break toys"], correct: "tell an adult" },
      { q: "Scared means you feel…", options: ["safe", "afraid", "silly", "happy"], correct: "afraid" },
      { q: "A good friend is…", options: ["mean", "kind", "bossy", "noisy only"], correct: "kind" },
      { q: "If a friend falls over, you should…", options: ["laugh", "help them up", "run away", "shout"], correct: "help them up" },
      { q: "Sharing toys with friends is…", options: ["bad", "kind", "silly", "wrong"], correct: "kind" },
      { q: "If you hurt a friend's feelings you should…", options: ["hide", "say sorry", "laugh", "tell nobody"], correct: "say sorry" },
      { q: "A bully is someone who…", options: ["is kind", "is mean to others", "helps", "shares"], correct: "is mean to others" },
      { q: "What should you do when you feel angry?", options: ["hit someone", "take a deep breath", "throw things", "shout loud"], correct: "take a deep breath" },
    ]),
  },
  {
    title: "🥕 Healthy Choices",
    subject: "pshe",
    topic: "Healthy eating, hygiene, safety",
    description: "Healthy food, washing, brushing teeth and road safety.",
    difficulty: "easy",
    config: quiz([
      { q: "Which is a healthy snack? 🍎", options: ["apple", "chocolate bar", "crisps", "cola"], correct: "apple" },
      { q: "How many times a day should you brush your teeth? 🪥", options: ["0", "1", "2", "10"], correct: "2" },
      { q: "When should you wash your hands?", options: ["never", "before eating", "only on Sunday", "only at school"], correct: "before eating" },
      { q: "What kills germs when you wash your hands? 🧼", options: ["water only", "soap and water", "milk", "juice"], correct: "soap and water" },
      { q: "What colour means 'stop' on a traffic light? 🚦", options: ["green", "red", "blue", "yellow"], correct: "red" },
      { q: "Before crossing the road you should…", options: ["run", "stop look listen", "close eyes", "skip"], correct: "stop look listen" },
      { q: "What should you wear when riding a bike? 🚲", options: ["crown", "helmet", "hat", "nothing"], correct: "helmet" },
      { q: "Which of these is a vegetable? 🥕", options: ["carrot", "cookie", "crisps", "cola"], correct: "carrot" },
    ]),
  },

  // ============================================================
  // ========== VISUAL-RICH ACTIVITIES (2026-04-11) =============
  // ============================================================
  // These 6 activities use per-question `visual` specs that the
  // Quiz renderer dispatches to inline SVG components in
  // src/components/games/visuals/. Each visual is descriptive/
  // representative — never reveals the answer.
  //
  // Count: 6 activities × 15 questions = 90 new questions.

  // ---- Phonics: sounds oy / ir / ue / aw ------------------------
  {
    title: "🔤 Sounds: oy, ir, ue, aw",
    subject: "phonics",
    topic: "Phase 3 digraph sounds oy ir ue aw",
    description: "Listen for the special sound in each word and pick the matching digraph.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "oy", visual: { kind: "phonics-word", word: "boy", illustration: "boy" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ir", visual: { kind: "phonics-word", word: "bird", illustration: "bird" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ue", visual: { kind: "phonics-word", word: "blue", illustration: "blue" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "aw", visual: { kind: "phonics-word", word: "saw", illustration: "saw" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "oy", visual: { kind: "phonics-word", word: "toy", illustration: "toy" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ir", visual: { kind: "phonics-word", word: "girl", illustration: "girl" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ue", visual: { kind: "phonics-word", word: "glue", illustration: "glue" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "aw", visual: { kind: "phonics-word", word: "straw", illustration: "straw" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "oy", visual: { kind: "phonics-word", word: "coin", illustration: "coin" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ir", visual: { kind: "phonics-word", word: "shirt", illustration: "shirt" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ue", visual: { kind: "phonics-word", word: "rescue", illustration: "rescue" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "aw", visual: { kind: "phonics-word", word: "paw", illustration: "paw" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "oy", visual: { kind: "phonics-word", word: "oil", illustration: "oil" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ir", visual: { kind: "phonics-word", word: "skirt", illustration: "skirt" } },
        { q: "Which sound is in this word?", options: ["oy", "ir", "ue", "aw"], correct: "ue", visual: { kind: "phonics-word", word: "statue", illustration: "statue" } },
      ],
      30
    ),
  },

  // ---- Maths: Find a half of an object or shape ----------------
  {
    title: "➗ Find Half of a Shape",
    subject: "maths",
    topic: "Find a half of an object or shape",
    description: "Look at each shape and decide if it has been split into two equal halves.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "Is this circle split into two equal halves?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "circle", pattern: "half-v" } },
        { q: "Is this square split into halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "square", pattern: "uneven-2" } },
        { q: "Is this rectangle split into halves?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "half-h" } },
        { q: "Is this pizza cut into halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "pizza", pattern: "quarter" } },
        { q: "Is this circle split fairly down the middle?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "circle", pattern: "half-h" } },
        { q: "Are these chocolate pieces equal halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "chocolate", pattern: "thirds" } },
        { q: "Is this square split into two equal halves?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "square", pattern: "half-diag" } },
        { q: "Is this rectangle split into halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "thirds" } },
        { q: "Is this pizza split into halves?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "pizza", pattern: "half-v" } },
        { q: "Is this circle split into halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "circle", pattern: "thirds" } },
        { q: "Is this square split into two equal parts?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "square", pattern: "half-v" } },
        { q: "Is this chocolate bar split in half?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "chocolate", pattern: "half-v" } },
        { q: "Are these rectangle pieces equal halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "uneven-2" } },
        { q: "Is this pizza split into two equal halves?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "pizza", pattern: "half-h" } },
        { q: "Is this square split into halves?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "square", pattern: "quarter" } },
      ],
      25
    ),
  },

  // ---- Maths: Recognise a half of a quantity -------------------
  {
    title: "➗ Recognise Half of a Quantity",
    subject: "maths",
    topic: "Recognise a half of a quantity",
    description: "Look at the group of objects and decide if the given number is half of the total.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "Is 4 half of 8?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "apple", count: 8, divider: 4 } },
        { q: "Is 5 half of 10?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "star", count: 10, divider: 5 } },
        { q: "Is 2 half of 6?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "smile", count: 6, divider: 2 } },
        { q: "Is 2 half of 4?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "heart", count: 4, divider: 2 } },
        { q: "Is 6 half of 12?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "cookie", count: 12, divider: 6 } },
        { q: "Is 4 half of 6?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "balloon", count: 6, divider: 4 } },
        { q: "Is 3 half of 10?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "dot", count: 10, divider: 3 } },
        { q: "Is 1 half of 2?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "star", count: 2, divider: 1 } },
        { q: "Is 7 half of 14?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "apple", count: 14, divider: 7 } },
        { q: "Is 3 half of 8?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "cookie", count: 8, divider: 3 } },
        { q: "Is 3 half of 6?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "balloon", count: 6, divider: 3 } },
        { q: "Is 4 half of 12?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "smile", count: 12, divider: 4 } },
        { q: "Is 5 half of 10?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "heart", count: 10, divider: 5 } },
        { q: "Is 4 half of 8?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "counted-objects", object: "dot", count: 8, divider: 4 } },
        { q: "Is 2 half of 8?", options: ["Yes", "No"], correct: "No", visual: { kind: "counted-objects", object: "apple", count: 8, divider: 2 } },
      ],
      25
    ),
  },

  // ---- Maths: Find a half of a quantity -----------------------
  {
    title: "➗ Find Half of a Quantity",
    subject: "maths",
    topic: "Find a half of a quantity",
    description: "Count the objects and pick the number that is half of the total.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "What is half of 4?", options: ["1", "2", "3", "4"], correct: "2", visual: { kind: "counted-objects", object: "apple", count: 4 } },
        { q: "What is half of 6?", options: ["2", "3", "4", "5"], correct: "3", visual: { kind: "counted-objects", object: "star", count: 6 } },
        { q: "What is half of 8?", options: ["2", "3", "4", "5"], correct: "4", visual: { kind: "counted-objects", object: "smile", count: 8 } },
        { q: "What is half of 10?", options: ["3", "4", "5", "6"], correct: "5", visual: { kind: "counted-objects", object: "heart", count: 10 } },
        { q: "What is half of 12?", options: ["4", "5", "6", "7"], correct: "6", visual: { kind: "counted-objects", object: "cookie", count: 12 } },
        { q: "What is half of 2?", options: ["1", "2", "3", "4"], correct: "1", visual: { kind: "counted-objects", object: "balloon", count: 2 } },
        { q: "What is half of 14?", options: ["5", "6", "7", "8"], correct: "7", visual: { kind: "counted-objects", object: "dot", count: 14 } },
        { q: "What is half of 16?", options: ["6", "7", "8", "9"], correct: "8", visual: { kind: "counted-objects", object: "apple", count: 16 } },
        { q: "What is half of 18?", options: ["7", "8", "9", "10"], correct: "9", visual: { kind: "counted-objects", object: "star", count: 18 } },
        { q: "What is half of 20?", options: ["8", "9", "10", "11"], correct: "10", visual: { kind: "counted-objects", object: "smile", count: 20 } },
        { q: "Half of 6 is…", options: ["2", "3", "4", "5"], correct: "3", visual: { kind: "counted-objects", object: "heart", count: 6 } },
        { q: "Half of 10 is…", options: ["3", "4", "5", "6"], correct: "5", visual: { kind: "counted-objects", object: "cookie", count: 10 } },
        { q: "Half of 4 is…", options: ["1", "2", "3", "4"], correct: "2", visual: { kind: "counted-objects", object: "balloon", count: 4 } },
        { q: "Half of 12 is…", options: ["4", "5", "6", "7"], correct: "6", visual: { kind: "counted-objects", object: "dot", count: 12 } },
        { q: "Half of 8 is…", options: ["2", "3", "4", "5"], correct: "4", visual: { kind: "counted-objects", object: "apple", count: 8 } },
      ],
      30
    ),
  },

  // ---- Maths: Recognise a quarter of a shape ------------------
  {
    title: "➗ Recognise a Quarter of a Shape",
    subject: "maths",
    topic: "Recognise a quarter of an object or a shape",
    description: "Look at each shape and decide if it has been split into four equal quarters.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "Is this pizza cut into quarters?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "pizza", pattern: "quarter" } },
        { q: "Is this circle cut into quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "circle", pattern: "half-v" } },
        { q: "Is this square split into 4 equal parts?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "square", pattern: "quarter" } },
        { q: "Is this rectangle cut into quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "half-h" } },
        { q: "Is this chocolate bar split into 4 equal pieces?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "chocolate", pattern: "quarter" } },
        { q: "Is this pizza cut into quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "pizza", pattern: "thirds" } },
        { q: "Is this circle split into 4 equal pieces?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "circle", pattern: "quarter" } },
        { q: "Are these pieces a fair quarter?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "square", pattern: "uneven-2" } },
        { q: "Is the yellow part one quarter of the rectangle?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "quarter" } },
        { q: "Is this chocolate split into quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "chocolate", pattern: "half-v" } },
        { q: "Is this circle divided into 4 quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "circle", pattern: "half-h" } },
        { q: "Is this shape showing quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "square", pattern: "half-v" } },
        { q: "Does this pizza have 4 equal slices?", options: ["Yes", "No"], correct: "Yes", visual: { kind: "shape-fraction", shape: "pizza", pattern: "quarter" } },
        { q: "Is this rectangle cut into 4 quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "rectangle", pattern: "thirds" } },
        { q: "Is this chocolate split into quarters?", options: ["Yes", "No"], correct: "No", visual: { kind: "shape-fraction", shape: "chocolate", pattern: "thirds" } },
      ],
      25
    ),
  },

  // ---- Science: Magnets & Materials ---------------------------
  {
    title: "🧲 Magnets & Materials",
    subject: "science",
    topic: "Magnets — magnetic vs non-magnetic materials",
    description: "Look at each item next to the magnet and decide whether it is magnetic or not.",
    difficulty: "easy",
    config: quiz(
      [
        { q: "Will the magnet stick to this iron nail?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "nail" } },
        { q: "Is this plastic toy magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "plastic-toy" } },
        { q: "Will the magnet stick to this metal spoon?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "spoon" } },
        { q: "Is paper magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "paper" } },
        { q: "Will a magnet stick to a wooden block?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "wood-block" } },
        { q: "Will the magnet stick to this metal key?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "key" } },
        { q: "Is a rubber band magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "rubber-band" } },
        { q: "Will a magnet pick up a paperclip?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "paperclip" } },
        { q: "Will the magnet stick to these metal scissors?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "scissors" } },
        { q: "Is a sponge magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "sponge" } },
        { q: "Will a magnet stick to a glass cup?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "glass" } },
        { q: "Is an ice cube magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "fridge" } },
        { q: "Will the magnet stick to this metal fork?", options: ["Magnetic", "Not magnetic"], correct: "Magnetic", visual: { kind: "magnet-object", object: "fork" } },
        { q: "Is a rubber eraser magnetic?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "eraser" } },
        { q: "Will a magnet stick to a copper coin?", options: ["Magnetic", "Not magnetic"], correct: "Not magnetic", visual: { kind: "magnet-object", object: "coin" } },
      ],
      25
    ),
  },
];

// ===== Run =====

async function ensureSignedIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email: TEACHER_EMAIL,
    password: TEACHER_PASSWORD,
  });
  if (error) {
    console.error("❌ Failed to sign in as teacher:", error.message);
    process.exit(1);
  }
}

async function main() {
  console.log(`🌱 Activity Bank Seeder`);
  console.log(`   ${ACTIVITIES.length} activities to insert\n`);

  await ensureSignedIn();
  console.log("✓ Signed in as teacher\n");

  if (RESET) {
    console.log("🧹 Reset mode — deleting existing templates...");
    const { error } = await supabase.from("activities").delete().eq("is_template", true);
    if (error) {
      console.error("❌ Reset failed:", error.message);
      process.exit(1);
    }
    console.log("✓ Existing templates deleted\n");
  }

  let inserted = 0;
  let failed = 0;

  for (const a of ACTIVITIES) {
    const row = {
      teacher_id: null,
      title: a.title,
      game_type: a.config.type,
      config_json: a.config,
      is_template: true,
      subject: a.subject,
      topic: a.topic,
      year_level: "Year 1",
      difficulty: a.difficulty,
      description: a.description,
    };

    const { error } = await supabase.from("activities").insert(row);
    if (error) {
      console.log(`  ✗ ${a.title} — ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${a.subject.padEnd(10)} ${a.config.type.padEnd(14)} ${a.title}`);
      inserted++;
    }
  }

  console.log(`\n📊 Done: ${inserted} inserted, ${failed} failed`);

  // Verification
  const { data: counts } = await supabase
    .from("activities")
    .select("subject")
    .eq("is_template", true);

  if (counts) {
    const bySubject = {};
    for (const row of counts) {
      bySubject[row.subject] = (bySubject[row.subject] || 0) + 1;
    }
    console.log(`\n🎯 Templates by subject:`);
    for (const [subject, count] of Object.entries(bySubject).sort()) {
      console.log(`   ${subject.padEnd(12)} ${count}`);
    }
    console.log(`   ${"TOTAL".padEnd(12)} ${counts.length}`);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

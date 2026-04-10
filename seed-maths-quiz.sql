-- ==========================================================================
-- GFA ARCADE — Year 1 Maths Quiz Seed
-- ==========================================================================
-- Run this AFTER the main schema and AFTER creating a teacher account.
-- This inserts a ready-to-play maths quiz with emoji-rich questions.
-- ==========================================================================

-- Insert the activity (linked to the first teacher in the system)
INSERT INTO public.activities (id, teacher_id, title, game_type, config_json)
SELECT
  gen_random_uuid(),
  t.id,
  '🔢 Year 1 Maths Adventure',
  'quiz',
  '{
    "type": "quiz",
    "questions": [
      {
        "question": "🍎🍎🍎 What is DOUBLE of 3 apples? 🍎🍎🍎 ➡️ 🍎🍎🍎 + 🍎🍎🍎 = ?",
        "options": ["4", "6", "5", "3"],
        "correct_index": 1,
        "time_limit_seconds": 25
      },
      {
        "question": "🍪🍪 Double the cookies! What is double of 2? 🍪🍪 + 🍪🍪 = ?",
        "options": ["2", "3", "4", "5"],
        "correct_index": 2,
        "time_limit_seconds": 20
      },
      {
        "question": "🌟🌟🌟🌟🌟 What is double of 5 stars? 🌟🌟🌟🌟🌟 + 🌟🌟🌟🌟🌟 = ?",
        "options": ["8", "15", "10", "7"],
        "correct_index": 2,
        "time_limit_seconds": 25
      },
      {
        "question": "🐸 What is double of 1 frog? 🐸 + 🐸 = ?",
        "options": ["2", "1", "3", "4"],
        "correct_index": 0,
        "time_limit_seconds": 15
      },
      {
        "question": "🎈🎈🎈🎈 What is double of 4 balloons?",
        "options": ["6", "4", "8", "10"],
        "correct_index": 2,
        "time_limit_seconds": 25
      },
      {
        "question": "👥 Put 6 teddy bears into groups of 2! 🧸🧸 | 🧸🧸 | 🧸🧸  How many groups?",
        "options": ["2 groups", "3 groups", "4 groups", "6 groups"],
        "correct_index": 1,
        "time_limit_seconds": 25
      },
      {
        "question": "🐱🐱🐱🐱🐱🐱🐱🐱 Put 8 cats into groups of 4. How many groups do you get?",
        "options": ["4 groups", "3 groups", "2 groups", "1 group"],
        "correct_index": 2,
        "time_limit_seconds": 25
      },
      {
        "question": "🍓🍓🍓🍓🍓🍓🍓🍓🍓🍓🍓🍓 12 strawberries in groups of 3. How many groups?",
        "options": ["3 groups", "6 groups", "4 groups", "2 groups"],
        "correct_index": 2,
        "time_limit_seconds": 30
      },
      {
        "question": "🌺🌺🌺🌺🌺🌺 Put 6 flowers into groups of 3. 🌺🌺🌺 | 🌺🌺🌺  How many groups?",
        "options": ["3 groups", "6 groups", "2 groups", "1 group"],
        "correct_index": 2,
        "time_limit_seconds": 20
      },
      {
        "question": "🍬🍬🍬🍬🍬🍬🍬🍬🍬🍬 Share 10 sweets equally between 2 friends 👧👦. How many does each get?",
        "options": ["3 each", "4 each", "6 each", "5 each"],
        "correct_index": 3,
        "time_limit_seconds": 25
      },
      {
        "question": "🎁🎁🎁🎁🎁🎁 Share 6 gifts equally among 3 children 👧👦👧. How many each?",
        "options": ["3 each", "2 each", "1 each", "4 each"],
        "correct_index": 1,
        "time_limit_seconds": 25
      },
      {
        "question": "🍕🍕🍕🍕🍕🍕🍕🍕 Share 8 pizza slices equally between 2 friends. How many each?",
        "options": ["3 each", "5 each", "4 each", "6 each"],
        "correct_index": 2,
        "time_limit_seconds": 25
      },
      {
        "question": "🖍️🖍️🖍️🖍️🖍️🖍️🖍️🖍️🖍️ Share 9 crayons equally among 3 children. How many each?",
        "options": ["4 each", "2 each", "3 each", "5 each"],
        "correct_index": 2,
        "time_limit_seconds": 25
      },
      {
        "question": "🍕 A pizza is cut into 2 equal pieces. You eat one piece. What did you eat?",
        "options": ["A quarter", "The whole pizza", "Half the pizza 🍕½", "Two pizzas"],
        "correct_index": 2,
        "time_limit_seconds": 20
      },
      {
        "question": "🟦🟦🟦🟦 A square has 4 equal parts. 2 parts are coloured blue 🟦🟦⬜⬜. What fraction is blue?",
        "options": ["A quarter", "Half", "All of it", "None"],
        "correct_index": 1,
        "time_limit_seconds": 25
      },
      {
        "question": "🍎🍎🍎🍎🍎🍎 What is half of 6 apples?",
        "options": ["2", "4", "3", "5"],
        "correct_index": 2,
        "time_limit_seconds": 20
      },
      {
        "question": "🎂 A cake is shared equally between 2 people. Each person gets...",
        "options": ["Quarter of the cake", "Half of the cake 🎂½", "The whole cake", "Two cakes"],
        "correct_index": 1,
        "time_limit_seconds": 20
      },
      {
        "question": "🔵🔵🔵🔵🔵🔵🔵🔵 What is half of 8 circles?",
        "options": ["3", "5", "2", "4"],
        "correct_index": 3,
        "time_limit_seconds": 20
      },
      {
        "question": "🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌 What is half of 10 bananas?",
        "options": ["4", "6", "5", "3"],
        "correct_index": 2,
        "time_limit_seconds": 20
      },
      {
        "question": "⭐ BONUS! Double of 7 is...",
        "options": ["12", "13", "14", "15"],
        "correct_index": 2,
        "time_limit_seconds": 30
      }
    ]
  }'::jsonb
FROM public.teachers t
LIMIT 1;

-- Verify
SELECT title, game_type FROM public.activities WHERE title = '🔢 Year 1 Maths Adventure';

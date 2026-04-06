import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  // ─── Geography ────────────────────────────────────────────────────────────
  { question: "What is the capital of Japan?", answers: ["Beijing", "Seoul", "Tokyo", "Bangkok"], correct: 2, category: "geography", type: "trivia", difficulty: 1 },
  { question: "What is the largest ocean on Earth?", answers: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "geography", type: "trivia", difficulty: 1 },
  { question: "What is the longest river in the world?", answers: ["Amazon", "Yangtze", "Mississippi", "Nile"], correct: 3, category: "geography", type: "trivia", difficulty: 1 },
  { question: "Which country has the most natural lakes?", answers: ["Russia", "Canada", "USA", "Brazil"], correct: 1, category: "geography", type: "trivia", difficulty: 2 },
  { question: "What is the smallest country in the world?", answers: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2, category: "geography", type: "trivia", difficulty: 1 },
  { question: "Which desert is the largest in the world?", answers: ["Sahara", "Arabian", "Gobi", "Antarctic"], correct: 3, category: "geography", type: "trivia", difficulty: 2 },
  { question: "Which continent is the least populated?", answers: ["Australia", "South America", "Antarctica", "Europe"], correct: 2, category: "geography", type: "trivia", difficulty: 2 },
  { question: "What is the capital of Brazil?", answers: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 2, category: "geography", type: "trivia", difficulty: 2 },
  { question: "Which African country has the largest population?", answers: ["Ethiopia", "Egypt", "South Africa", "Nigeria"], correct: 3, category: "geography", type: "trivia", difficulty: 2 },
  { question: "What is the tallest mountain in the world?", answers: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2, category: "geography", type: "trivia", difficulty: 1 },
  { question: "Through how many countries does the Amazon River flow?", answers: ["2", "3", "4", "9"], correct: 3, category: "geography", type: "trivia", difficulty: 3 },
  { question: "Which country owns Greenland?", answers: ["Norway", "Iceland", "Denmark", "Canada"], correct: 2, category: "geography", type: "trivia", difficulty: 2 },

  // ─── Science & Nature ────────────────────────────────────────────────────
  { question: "What is the chemical symbol for gold?", answers: ["Ag", "Au", "Fe", "Pb"], correct: 1, category: "science", type: "trivia", difficulty: 1 },
  { question: "Which gas do plants absorb from the atmosphere?", answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, category: "science", type: "trivia", difficulty: 1 },
  { question: "How many bones are in the adult human body?", answers: ["206", "186", "226", "196"], correct: 0, category: "science", type: "trivia", difficulty: 2 },
  { question: "What is the boiling point of water at sea level (°C)?", answers: ["90", "95", "100", "105"], correct: 2, category: "science", type: "trivia", difficulty: 1 },
  { question: "Which planet is known as the Red Planet?", answers: ["Venus", "Jupiter", "Saturn", "Mars"], correct: 3, category: "science", type: "trivia", difficulty: 1 },
  { question: "What is the hardest natural substance on Earth?", answers: ["Quartz", "Iron", "Diamond", "Titanium"], correct: 2, category: "science", type: "trivia", difficulty: 1 },
  { question: "Which element has the atomic number 1?", answers: ["Helium", "Hydrogen", "Carbon", "Oxygen"], correct: 1, category: "science", type: "trivia", difficulty: 1 },
  { question: "Which planet has the most moons?", answers: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, category: "science", type: "trivia", difficulty: 2 },
  { question: "How long does light from the Sun take to reach Earth (approx)?", answers: ["2 minutes", "8 minutes", "20 minutes", "1 hour"], correct: 1, category: "science", type: "trivia", difficulty: 2 },
  { question: "What is the most abundant gas in Earth's atmosphere?", answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, category: "science", type: "trivia", difficulty: 2 },
  { question: "DNA stands for what?", answers: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Array", "Dense Nucleotide Agent"], correct: 0, category: "science", type: "trivia", difficulty: 1 },
  { question: "What organ produces insulin?", answers: ["Liver", "Kidney", "Pancreas", "Spleen"], correct: 2, category: "science", type: "trivia", difficulty: 2 },
  { question: "How many chromosomes do humans normally have?", answers: ["23", "44", "46", "48"], correct: 2, category: "science", type: "trivia", difficulty: 2 },

  // ─── Math ────────────────────────────────────────────────────────────────
  { question: "What is 17 × 8?", answers: ["126", "134", "136", "144"], correct: 2, category: "math", type: "math", difficulty: 1 },
  { question: "What is 15% of 200?", answers: ["20", "25", "30", "35"], correct: 2, category: "math", type: "math", difficulty: 1 },
  { question: "What is the next prime number after 13?", answers: ["14", "15", "17", "19"], correct: 2, category: "math", type: "math", difficulty: 1 },
  { question: "What is the square root of 196?", answers: ["12", "13", "14", "15"], correct: 2, category: "math", type: "math", difficulty: 1 },
  { question: "If a train travels 60 km/h, how far does it go in 2.5 hours?", answers: ["120 km", "140 km", "150 km", "160 km"], correct: 2, category: "math", type: "math", difficulty: 1 },
  { question: "What is 1/3 + 1/6?", answers: ["1/9", "1/4", "1/2", "2/3"], correct: 2, category: "math", type: "math", difficulty: 2 },
  { question: "What is 2 to the power of 10?", answers: ["512", "1000", "1024", "2048"], correct: 2, category: "math", type: "math", difficulty: 2 },
  { question: "How many sides does a hexagon have?", answers: ["5", "6", "7", "8"], correct: 1, category: "math", type: "trivia", difficulty: 1 },
  { question: "What is the sum of angles in a triangle?", answers: ["90°", "180°", "270°", "360°"], correct: 1, category: "math", type: "math", difficulty: 1 },
  { question: "What is 12 factorial (12!) divided by 11 factorial (11!)?", answers: ["10", "11", "12", "13"], correct: 2, category: "math", type: "math", difficulty: 2 },
  { question: "What is the value of π rounded to two decimal places?", answers: ["3.12", "3.14", "3.16", "3.18"], correct: 1, category: "math", type: "math", difficulty: 1 },
  { question: "A rectangle has length 9 and width 4. What is its diagonal?", answers: ["√65", "√85", "√97", "√113"], correct: 2, category: "math", type: "math", difficulty: 3 },

  // ─── History ────────────────────────────────────────────────────────────
  { question: "In what year did World War II end?", answers: ["1943", "1944", "1946", "1945"], correct: 3, category: "history", type: "trivia", difficulty: 1 },
  { question: "Who was the first person to walk on the Moon?", answers: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], correct: 2, category: "history", type: "trivia", difficulty: 1 },
  { question: "In which year did the Berlin Wall fall?", answers: ["1987", "1988", "1989", "1991"], correct: 2, category: "history", type: "trivia", difficulty: 2 },
  { question: "Which ancient wonder was located in Alexandria?", answers: ["Colossus of Rhodes", "Lighthouse of Alexandria", "Hanging Gardens", "Temple of Artemis"], correct: 1, category: "history", type: "trivia", difficulty: 2 },
  { question: "Who invented the telephone?", answers: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], correct: 2, category: "history", type: "trivia", difficulty: 1 },
  { question: "In which year did the Titanic sink?", answers: ["1910", "1911", "1912", "1914"], correct: 2, category: "history", type: "trivia", difficulty: 1 },
  { question: "Which empire was the largest in history by land area?", answers: ["Roman Empire", "British Empire", "Mongol Empire", "Ottoman Empire"], correct: 2, category: "history", type: "trivia", difficulty: 2 },
  { question: "Who painted the Mona Lisa?", answers: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], correct: 2, category: "history", type: "trivia", difficulty: 1 },
  { question: "What year did the first iPhone launch?", answers: ["2005", "2006", "2007", "2008"], correct: 2, category: "history", type: "trivia", difficulty: 1 },
  { question: "Which country was the first to give women the right to vote?", answers: ["USA", "UK", "New Zealand", "France"], correct: 2, category: "history", type: "trivia", difficulty: 2 },

  // ─── Riddles ────────────────────────────────────────────────────────────
  { question: "The more you take, the more you leave behind. What am I?", answers: ["Memories", "Footsteps", "Time", "Money"], correct: 1, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?", answers: ["A dream", "A painting", "A map", "A reflection"], correct: 2, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "What has hands but can't clap?", answers: ["A statue", "A glove", "A clock", "A robot"], correct: 2, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?", answers: ["A ghost", "A thought", "An echo", "A shadow"], correct: 2, category: "riddle", type: "riddle", difficulty: 2 },
  { question: "What can travel around the world while staying in a corner?", answers: ["The Sun", "A stamp", "Wi-Fi", "A dream"], correct: 1, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "The more you have of it, the less you see. What is it?", answers: ["Money", "Power", "Darkness", "Love"], correct: 2, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "I'm always in front of you but can't be seen. What am I?", answers: ["Your nose", "The future", "Air", "Your forehead"], correct: 1, category: "riddle", type: "riddle", difficulty: 2 },
  { question: "What has a head, a tail, but no body?", answers: ["A snake", "A comet", "A coin", "A river"], correct: 2, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "What gets wetter the more it dries?", answers: ["A sponge", "A towel", "Rain", "A cloud"], correct: 1, category: "riddle", type: "riddle", difficulty: 1 },
  { question: "I have branches but no fruit, trunk, or leaves. What am I?", answers: ["A coral reef", "A river", "A bank", "A lightning bolt"], correct: 2, category: "riddle", type: "riddle", difficulty: 2 },

  // ─── Wordplay ────────────────────────────────────────────────────────────
  { question: "Which word is an anagram of LISTEN?", answers: ["STILEN", "SILENT", "TINLES", "LENITS"], correct: 1, category: "wordplay", type: "wordplay", difficulty: 1 },
  { question: "Which word is an anagram of EARTH?", answers: ["HATER", "ARETH", "THAER", "ERHAT"], correct: 0, category: "wordplay", type: "wordplay", difficulty: 1 },
  { question: "What 5-letter word becomes shorter when you add two letters to it?", answers: ["SMALL", "BRIEF", "SHORT", "QUICK"], correct: 2, category: "wordplay", type: "wordplay", difficulty: 2 },
  { question: "I am a word of 5 letters. Take away my first letter and I sound the same. Take away my last letter and I still sound the same. What am I?", answers: ["EMPTY", "PHONE", "QUEUE", "EIGHT"], correct: 2, category: "wordplay", type: "wordplay", difficulty: 2 },
  { question: "Which word sounds like a letter of the alphabet and means to observe?", answers: ["Pee", "See", "Dee", "Kay"], correct: 1, category: "wordplay", type: "wordplay", difficulty: 1 },
  { question: "What word contains 26 letters but only has three syllables?", answers: ["Dictionary", "Encyclopedia", "Alphabet", "Language"], correct: 2, category: "wordplay", type: "wordplay", difficulty: 1 },
  { question: "Which anagram of RACE can mean something found on a face?", answers: ["CARE", "ACRE", "ARCE", "ACER"], correct: 0, category: "wordplay", type: "wordplay", difficulty: 2 },
  { question: "What do you call a fear of long words? (The word itself is long)", answers: ["Logophobia", "Verbaphobia", "Hippopotomonstrosesquippedaliophobia", "Lexiphobia"], correct: 2, category: "wordplay", type: "trivia", difficulty: 2 },

  // ─── Culture & Food ──────────────────────────────────────────────────────
  { question: "Which country is the largest producer of coffee?", answers: ["Colombia", "Vietnam", "Ethiopia", "Brazil"], correct: 3, category: "culture", type: "trivia", difficulty: 2 },
  { question: "What is the main ingredient in guacamole?", answers: ["Tomato", "Onion", "Avocado", "Lime"], correct: 2, category: "culture", type: "trivia", difficulty: 1 },
  { question: "Which country invented pizza?", answers: ["France", "Greece", "Spain", "Italy"], correct: 3, category: "culture", type: "trivia", difficulty: 1 },
  { question: "What currency is used in Japan?", answers: ["Yuan", "Won", "Baht", "Yen"], correct: 3, category: "culture", type: "trivia", difficulty: 1 },
  { question: "In which sport would you perform a slam dunk?", answers: ["Volleyball", "Basketball", "Tennis", "Baseball"], correct: 1, category: "culture", type: "trivia", difficulty: 1 },
  { question: "How many players are on a standard soccer team?", answers: ["9", "10", "11", "12"], correct: 2, category: "culture", type: "trivia", difficulty: 1 },
  { question: "Which language has the most native speakers worldwide?", answers: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correct: 2, category: "culture", type: "trivia", difficulty: 1 },
  { question: "Sushi originated in which country?", answers: ["China", "South Korea", "Japan", "Thailand"], correct: 2, category: "culture", type: "trivia", difficulty: 1 },
  { question: "What is the best-selling music album of all time?", answers: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Hotel California"], correct: 0, category: "culture", type: "trivia", difficulty: 2 },
  { question: "How many strings does a standard guitar have?", answers: ["4", "5", "6", "7"], correct: 2, category: "culture", type: "trivia", difficulty: 1 },
  { question: "Which vitamin does sunlight provide?", answers: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correct: 3, category: "culture", type: "trivia", difficulty: 1 },

  // ─── Language & Literature ───────────────────────────────────────────────
  { question: "How many letters are in the English alphabet?", answers: ["24", "25", "26", "27"], correct: 2, category: "language", type: "trivia", difficulty: 1 },
  { question: "What does 'et cetera' (etc.) mean in Latin?", answers: ["And more", "For example", "That is", "And so on"], correct: 3, category: "language", type: "trivia", difficulty: 1 },
  { question: "Who wrote Romeo and Juliet?", answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Geoffrey Chaucer"], correct: 1, category: "language", type: "trivia", difficulty: 1 },
  { question: "What is the longest word in the English language (common usage)?", answers: ["Supercalifragilistic", "Pneumonoultramicroscopicsilicovolcanoconiosis", "Antidisestablishmentarianism", "Floccinaucinihilipilification"], correct: 1, category: "language", type: "trivia", difficulty: 2 },
  { question: "What does 'per se' mean?", answers: ["By itself", "For example", "Therefore", "In contrast"], correct: 0, category: "language", type: "trivia", difficulty: 2 },
  { question: "In which novel would you find the character Sherlock Holmes?", answers: ["David Copperfield", "The Adventures of Sherlock Holmes", "Great Expectations", "Dracula"], correct: 1, category: "language", type: "trivia", difficulty: 1 },
  { question: "What literary device repeats the same consonant sound at the start of nearby words?", answers: ["Assonance", "Onomatopoeia", "Alliteration", "Metaphor"], correct: 2, category: "language", type: "trivia", difficulty: 2 },

  // ─── Logic Puzzles ───────────────────────────────────────────────────────
  { question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?", answers: ["No", "Sometimes", "Yes", "Cannot tell"], correct: 2, category: "puzzle", type: "puzzle", difficulty: 2 },
  { question: "A rooster lays an egg on top of a barn roof. Which way does it roll?", answers: ["Left", "Right", "Toward the front", "Roosters don't lay eggs"], correct: 3, category: "puzzle", type: "riddle", difficulty: 1 },
  { question: "You have a 3-litre jug and a 5-litre jug. How do you measure exactly 4 litres?", answers: ["Fill 5L, pour into 3L, empty 3L, pour remaining 2L into 3L, fill 5L, pour into 3L to top", "Fill 3L twice into 5L", "Impossible", "Fill 5L halfway"], correct: 0, category: "puzzle", type: "puzzle", difficulty: 3 },
  { question: "If you overtake the person in second place in a race, what position are you in?", answers: ["First", "Second", "Third", "It depends"], correct: 1, category: "puzzle", type: "riddle", difficulty: 1 },
  { question: "A father is 30 years older than his son. In 5 years, he'll be 3x the son's age. How old is the son now?", answers: ["5", "10", "12", "15"], correct: 0, category: "puzzle", type: "math", difficulty: 3 },
  { question: "How many months have 28 days?", answers: ["1", "4", "11", "12"], correct: 3, category: "puzzle", type: "riddle", difficulty: 2 },
  { question: "A man walks into a restaurant and orders albatross soup. He takes one sip, goes home, and kills himself. Why? (pick the closest logical answer)", answers: ["The soup was poisoned", "He realised the 'albatross' was his missing wife", "He was terminally ill", "He lost a bet"], correct: 1, category: "puzzle", type: "riddle", difficulty: 3 },
];

async function main() {
  console.log(`Seeding ${questions.length} trivia questions...`);

  let created = 0;
  let skipped = 0;

  for (const q of questions) {
    const existing = await prisma.triviaQuestion.findUnique({ where: { question: q.question } });
    if (existing) { skipped++; continue; }
    await prisma.triviaQuestion.create({ data: q });
    created++;
  }

  console.log(`Done. Created: ${created}, Skipped (already existed): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

export interface TriviaQuestion {
  question: string;
  answers: string[];
  correct: number; // index into answers
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { question: "What is the capital of Japan?", answers: ["Beijing", "Seoul", "Tokyo", "Bangkok"], correct: 2 },
  { question: "How many sides does a hexagon have?", answers: ["5", "6", "7", "8"], correct: 1 },
  { question: "Which planet is known as the Red Planet?", answers: ["Venus", "Jupiter", "Saturn", "Mars"], correct: 3 },
  { question: "What is the chemical symbol for gold?", answers: ["Ag", "Au", "Fe", "Pb"], correct: 1 },
  { question: "Who painted the Mona Lisa?", answers: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], correct: 2 },
  { question: "What is the largest ocean on Earth?", answers: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "How many bones are in the adult human body?", answers: ["206", "186", "226", "196"], correct: 0 },
  { question: "Which gas do plants absorb from the atmosphere?", answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 },
  { question: "What is the fastest land animal?", answers: ["Lion", "Cheetah", "Greyhound", "Horse"], correct: 1 },
  { question: "In what year did World War II end?", answers: ["1943", "1944", "1946", "1945"], correct: 3 },
  { question: "What is the smallest prime number?", answers: ["0", "1", "2", "3"], correct: 2 },
  { question: "Which country invented pizza?", answers: ["France", "Greece", "Spain", "Italy"], correct: 3 },
  { question: "What is H2O commonly known as?", answers: ["Salt", "Sugar", "Water", "Vinegar"], correct: 2 },
  { question: "How many continents are there on Earth?", answers: ["5", "6", "7", "8"], correct: 2 },
  { question: "What is the longest river in the world?", answers: ["Amazon", "Yangtze", "Mississippi", "Nile"], correct: 3 },
  { question: "Which element has the symbol 'O'?", answers: ["Gold", "Oxygen", "Osmium", "Oganesson"], correct: 1 },
  { question: "What language has the most native speakers worldwide?", answers: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correct: 2 },
  { question: "How many strings does a standard guitar have?", answers: ["4", "5", "6", "7"], correct: 2 },
  { question: "What is the square root of 144?", answers: ["11", "12", "13", "14"], correct: 1 },
  { question: "Which bird is the symbol of peace?", answers: ["Eagle", "Dove", "Swan", "Robin"], correct: 1 },
  { question: "What is the hardest natural substance on Earth?", answers: ["Quartz", "Iron", "Diamond", "Titanium"], correct: 2 },
  { question: "How many players are on a standard soccer team?", answers: ["9", "10", "11", "12"], correct: 2 },
  { question: "What is the currency of Japan?", answers: ["Yuan", "Won", "Baht", "Yen"], correct: 3 },
  { question: "Which organ pumps blood through the body?", answers: ["Liver", "Lungs", "Brain", "Heart"], correct: 3 },
  { question: "What is the boiling point of water at sea level (°C)?", answers: ["90", "95", "100", "105"], correct: 2 },
  { question: "How many letters are in the English alphabet?", answers: ["24", "25", "26", "27"], correct: 2 },
  { question: "What is the tallest mountain in the world?", answers: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2 },
  { question: "Which planet has the most moons?", answers: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 },
  { question: "What is the main ingredient in guacamole?", answers: ["Tomato", "Onion", "Avocado", "Lime"], correct: 2 },
  { question: "In which sport would you perform a slam dunk?", answers: ["Volleyball", "Basketball", "Tennis", "Baseball"], correct: 1 },
];

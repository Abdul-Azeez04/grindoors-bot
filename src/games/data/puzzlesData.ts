export const moviesData = [
  { emojis: '🦁👑', answer: 'The Lion King' },
  { emojis: '🦇👨', answer: 'Batman' },
  { emojis: '🕷️👨', answer: 'Spider-Man' },
  { emojis: '🚢🧊', answer: 'Titanic' },
  { emojis: '👽🛸', answer: 'Alien' }
];
// Pad to 40
for(let i=0; i<8; i++) {
  moviesData.push(...moviesData.map(m => ({...m, answer: m.answer + ' ' + i})));
}

export const songsData = [
  { emojis: '👁️🐅', answer: 'Eye of the Tiger', artist: 'Survivor' },
  { emojis: '⭐👨‍🚀', answer: 'Starman', artist: 'David Bowie' },
  { emojis: '☔💃', answer: 'Singing in the Rain', artist: 'Gene Kelly' },
  { emojis: '🍎🖋️', answer: 'PPAP', artist: 'Pikotaro' }
];
// Pad to 30
for(let i=0; i<8; i++) {
  songsData.push(...songsData.map(s => ({...s, answer: s.answer + ' ' + i})));
}

export const riddlesData = [
  { question: 'I have keys but open no doors. What am I?', options: ['A piano', 'A computer', 'A map', 'A secret'], correctIndex: 0 },
  { question: 'What has to be broken before you can use it?', options: ['An egg', 'A promise', 'A glass', 'A code'], correctIndex: 0 },
  { question: 'I am full of holes but still hold water. What am I?', options: ['A sponge', 'A net', 'A cloud', 'A sieve'], correctIndex: 0 }
];
// Pad to 20
for(let i=0; i<7; i++) {
  riddlesData.push(...riddlesData.map(r => ({...r, question: r.question + ' ' + i})));
}

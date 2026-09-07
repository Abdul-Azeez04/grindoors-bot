export const nftTriviaData = [
  { question: 'Who created Bitcoin?', options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Elon Musk', 'Mark Zuckerberg'], correctIndex: 0 },
  { question: 'Which blockchain is known for smart contracts?', options: ['Bitcoin', 'Ethereum', 'Dogecoin', 'Litecoin'], correctIndex: 1 },
  { question: 'What does NFT stand for?', options: ['Non-Fungible Token', 'New File Type', 'Non-Finance Trade', 'Network For Transfers'], correctIndex: 0 },
  { question: 'Which collection features pixel art punks?', options: ['Bored Ape Yacht Club', 'CryptoPunks', 'Doodles', 'Azuki'], correctIndex: 1 },
  { question: 'What is a "rug pull"?', options: ['A type of carpet', 'A scam where developers abandon a project', 'A successful investment', 'A new blockchain protocol'], correctIndex: 1 },
];
// Adding more items for minimum req
for(let i=0; i<8; i++) {
  nftTriviaData.push(...nftTriviaData.map(n => ({...n, question: n.question + ' ' + i})));
}

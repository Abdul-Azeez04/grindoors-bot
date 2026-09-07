export const scamScenarios = [
  { scenario: 'Someone DMs you offering 2 ETH if you send them 0.1 ETH first to "verify" your wallet.', isScam: true, explanation: 'Never send money to receive money. This is an advance-fee scam.' },
  { scenario: 'A verified project announces a free mint on their official Twitter with a link.', isScam: false, explanation: 'If it comes from official channels and aligns with announcements, it is likely legit.' },
  { scenario: 'A random account tags you in a giveaway tweet saying you won 10,000 USDT.', isScam: true, explanation: 'Random tags for large giveaways are almost always phishing attempts.' }
];
// Pad to 25
for(let i=0; i<9; i++) {
  scamScenarios.push(...scamScenarios.map(s => ({...s, scenario: s.scenario + ' ' + i})));
}

export const whaleScenarios = [
  { scenario: 'You buy an NFT and sell it 10 minutes later for a 5% loss because the floor price dipped slightly.', isWhale: false, explanation: 'Classic paperhands behavior! Panic selling at the first sign of a dip.' },
  { scenario: 'You hold your token through a 50% dump because you believe in the fundamentals.', isWhale: true, explanation: 'Diamond hands! Whales hold strong.' }
];
// Pad to 20
for(let i=0; i<10; i++) {
  whaleScenarios.push(...whaleScenarios.map(s => ({...s, scenario: s.scenario + ' ' + i})));
}

// Featured projects and their case studies (the "View details" panel).
// Facts come from each repo's README and live site; keep them in sync when a project changes.
// `slug` is the shareable link: hemeshkanyal.com/#work/<slug>
export const projects = [
  {
    slug: 'trustchain',
    title: 'TrustChain',
    shape: 'route',
    status: 'Live · team of 6',
    tagline: 'Every medicine, traceable from factory to patient.',
    description:
      'Medicines tracked through every hand-off on-chain, ESP32 cold-chain boxes that sign their own sensor reports, and recalls that reach exactly the patients who were affected.',
    stats: [
      ['6', 'roles, from admin to patient'],
      ['4', 'sensors in every smart box'],
      ['E2E', 'tested, contract to browser'],
    ],
    problem:
      '1 in 10 medical products in low- and middle-income countries is substandard or falsified (WHO, 2017). Paper custody trails are easy to fake, and a broken cold chain usually goes unnoticed until the medicine reaches a patient.',
    built: [
      'TrustChain and ColdChainMonitor contracts in Foundry for custody, strips, prescriptions and recalls, covered by unit, fuzz and invariant tests',
      'ESP32 smart-box firmware (RFID, temperature and humidity, GPS, lid switch) that signs every report on the device',
      'A Node service that verifies and relays telemetry, indexes the chain, and works out exactly who is affected by a recall',
      'One Next.js app for admins, manufacturers, distributors, pharmacies, doctors and patients, plus public verification of any medicine',
      'A device emulator, so the whole journey runs without hardware',
    ],
    flow: [
      'A manufacturer registers a batch; every hand-off after that is an on-chain transfer',
      'The smart box streams signed readings, which the backend verifies and relays to ColdChainMonitor',
      'A temperature breach quarantines the batch on-chain, automatically',
      'A recall resolves to the exact pharmacies and patients who received that batch',
      'Anyone can scan a strip and see its full journey',
    ],
    stack: ['Solidity', 'Foundry', 'ESP32', 'Node.js', 'Next.js'],
    links: [
      { label: 'Visit site', href: 'https://trustchain.hemeshkanyal.com/', primary: true },
      { label: 'Code', href: 'https://github.com/HemeshKanyal/trustchain' },
    ],
  },
  {
    slug: 'bharatrwa',
    title: 'BharatRWA',
    shape: 'fractions',
    status: 'Testnet · Ethereum & Solana',
    tagline: 'Real-world assets, tokenised with private compliance.',
    description:
      'Gold, silver and real-estate tokens that only verified investors can hold, on Ethereum and Solana, with KYC proven in zero knowledge so no identity documents go on-chain.',
    stats: [
      ['2', 'chains, one compliance model'],
      ['ERC-7943', 'the uRWA token standard'],
      ['0', 'identity documents on-chain'],
    ],
    problem:
      'Tokenised assets still have to obey securities law: only eligible investors may hold them. The usual answer is to collect everyone’s documents. BharatRWA asks for a proof instead.',
    built: [
      'A Noir circuit proving age, KYC status and sanctions screening, bound to the investor’s wallet so a proof can’t be reused',
      'On Ethereum: an ERC-20 implementing ERC-7943 (uRWA), with a compliance manager that verifies the UltraHonk proof on-chain',
      'On Solana: a Token-2022 mint whose transfer hook checks an on-chain allowlist written by an attester',
      'An asset registry, price oracle and dividends paid to holders, plus freezing and forced transfers for legal holds',
      'A Node prover service and a Next.js marketplace with trading views',
    ],
    flow: [
      'The investor generates a zero-knowledge proof from private KYC inputs',
      'Ethereum: the compliance contract verifies the proof itself and records an approval with an expiry',
      'Solana: the backend verifies the proof, and an attester writes an allowlist entry and thaws the account',
      'On both chains, every transfer checks the sender and the receiver first',
    ],
    limits: [
      'KYC inputs are self-declared; real use needs a provider’s signature checked inside the circuit',
      'Prices and order books in the exchange are simulated; settlement is checked on-chain',
      'Powerful roles sit on single keys; production would need multisigs and key rotation',
    ],
    stack: ['Solidity', 'Foundry', 'Noir', 'Anchor', 'Node.js', 'Next.js'],
    links: [
      { label: 'Live demo', href: 'https://bharatrwa.hemeshkanyal.com/', primary: true },
      { label: 'Code', href: 'https://github.com/HemeshKanyal/BharatRWA' },
    ],
  },
  {
    slug: 'risklens',
    title: 'RiskLens',
    shape: 'shield',
    status: 'Live',
    tagline: 'Portfolio risk, in plain language.',
    description:
      'Measures volatility, concentration and correlation, replays your holdings through 2008, 2020 and 2022, and explains the result in plain words, with an identity check proven inside your browser.',
    stats: [
      ['3', 'market crises replayed'],
      ['0–5', 'risk score, every part shown'],
      ['0', 'identity details leave your device'],
    ],
    problem:
      'Most investors can’t tell where their risk actually comes from. A portfolio that looks diversified can still move as one block when markets fall.',
    built: [
      'A 0–5 risk score from asset-class mix and measured volatility, with each part shown',
      'Each holding’s share of risk next to its share of value, plus correlations and a diversification ratio',
      'Stress tests that replay current holdings through 2008, 2020 and 2022',
      'Plain-language explanations from Gemini or a local Ollama model, and holdings imported from a brokerage screenshot',
      'An optional identity check: a Noir proof generated in the browser and verified by the server',
      'Saved analyses with history, trends and decision patterns',
    ],
    flow: [
      'Enter holdings, or import them from a screenshot',
      'FastAPI pulls market data and computes the metrics with pandas and numpy',
      'Stress tests replay the portfolio through past crises',
      'A language model explains the result, shown next to the numbers it came from',
    ],
    limits: [
      'Explanations come from a language model and can be wrong; the computed figures are the source of truth',
      'Market data comes from Yahoo Finance and can be delayed or missing',
      'An educational tool, not investment advice',
    ],
    stack: ['Next.js', 'FastAPI', 'pandas', 'MongoDB', 'Noir', 'Gemini'],
    links: [
      { label: 'Live demo', href: 'https://risklens.hemeshkanyal.com/', primary: true },
      { label: 'Code', href: 'https://github.com/HemeshKanyal/RiskLens' },
    ],
  },
  {
    slug: 'ascent',
    title: 'ASCENT',
    shape: 'summit',
    status: 'Site live · app in development',
    tagline: 'Never the same workout twice.',
    description:
      'A free, offline-first training app: one main lift you get stronger at, fresh exercises around it every session, anatomy down to the muscle head, and every nutrient on your plate.',
    stats: [
      ['146', 'exercises, each explained'],
      ['24', 'sports & activities'],
      ['0', 'accounts needed to train'],
    ],
    problem:
      'Training apps either repeat the same plan until it gets boring, or ignore the body using them: an injury, a pregnancy, a limit set by a doctor.',
    built: [
      'Anchor-and-rotator programming: one main lift progresses for 4–6 weeks while the exercises around it change every session',
      'A splits engine that picks your training split from your goal, experience and the days you actually have',
      'Muscle-level anatomy, step-by-step coaching, like-for-like swaps and loads suggested from your last session',
      'Nutrition from a photo, a barcode or plain text, covering vitamins, minerals and the things to keep under',
      'Health-aware plans: an injury, pregnancy, low bone density or high blood pressure changes the exercises and food targets',
      'Offline-first, with an optional private Crew for friends, clubs and leaderboards',
    ],
    flow: [
      'Workouts, food and history live on the phone; no account is needed to train',
      'A Node/Express and MongoDB backend serves exercises, split recommendations and Crew',
      'Meal photos go to an AI service to estimate the food; scanning and typing stay on the device',
      'One Expo codebase ships as an Android app and a web app',
    ],
    limits: ['No iPhone app yet; iPhone and desktop users get the web app'],
    stack: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
    links: [
      { label: 'Visit site', href: 'https://ascent.hemeshkanyal.com/', primary: true },
      { label: 'App code', href: 'https://github.com/HemeshKanyal/ASCENT-Frontend' },
      { label: 'API code', href: 'https://github.com/HemeshKanyal/ASCENT-Backend' },
    ],
  },
];

export const otherBuilds = [
  {
    title: 'Dev Growth OS',
    note: 'Streaks, tasks and a dev log for coding consistency · React, Supabase',
    href: 'https://dev-growth-os.hemeshkanyal.com/',
  },
  {
    title: 'My GitHub profile',
    note: 'My last year drawn as a blockchain, regenerated daily by a GitHub Action · Python, SVG',
    href: 'https://github.com/HemeshKanyal',
  },
  {
    title: 'Mentor Voting DApp',
    note: 'Transparent on-chain voting · Solidity',
    href: 'https://mentor-voting-dapp.vercel.app',
  },
  {
    title: 'Coin Flip DApp',
    note: 'An on-chain game · Solidity',
    href: 'https://github.com/HemeshKanyal/coinflip-dapp',
  },
];

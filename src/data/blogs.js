export const blogs = [
  {
    id: 3,
    title: "India, GIFT City and Dubai: What's Live in Tokenisation and What Still Needs Building",
    slug: "india-gift-city-dubai-tokenisation",
    date: "October 8, 2026",
    time: "10:09 PM",
    excerpt: "A map of what SEBI, RBI, IFSCA, VARA, the Dubai Land Department, DFSA and ADGM actually allow today for tokenised real-world assets, and six problems nobody has solved yet.",
    content: `In September 2026, India issued its first tokenised corporate bonds: ₹1,025 crore from REC, Larsen & Toubro and IIFL Finance, settled in wholesale digital rupees. It was a real milestone, and most coverage stopped at the headline.

I'm building infrastructure for tokenised real-world assets, starting in India and the UAE. So I spent the last few weeks reading what SEBI, RBI, IFSCA, VARA, the Dubai Land Department, DFSA and ADGM actually allow today.

This post is the map I wish I'd had at the start: what is live in each place, what is still blocked, and six problems that nobody has solved yet. It's research, not legal or tax advice, and it reflects the rules as of 8 October 2026.

## Three places, three very different stages

The short version: Dubai is furthest ahead on real estate, India has the cleanest settlement, and GIFT City is still waiting on final rules.

• **India (SEBI and RBI)** has a live pilot, but only for corporate bonds. Demat 2.0 went live in September 2026 on a ledger run by the depositories.
• **GIFT City (IFSCA)** has sandbox approvals but no final rules. A consultation came out in February 2025 and a new FinTech sandbox framework in March 2026. There is still no licence category for issuing tokens.
• **Dubai (VARA and the Dubai Land Department)** is the furthest ahead on property. Tokenised property has had controlled resale since February 2026, and VARA's April 2026 guidance says issuers of RWA-backed tokens must be licensed.

## India's Demat 2.0: how a tokenised bond moves today

Demat 2.0 is a SEBI pilot run in its regulatory sandbox, together with RBI. Here is the path a bond takes:

1. **Issue.** The bond is issued on the stock exchange's Electronic Bidding Platform, like any other corporate bond.
2. **Record.** NSDL and CDSL record it on a private, permissioned ledger they own. For now, only the depositories and exchanges run nodes.
3. **Settle.** The bond and the money move together. The cash leg uses RBI's wholesale e-rupee, so either both sides settle or neither does (atomic delivery-versus-payment).
4. **Service.** The bond's terms sit in a smart contract, and coupons and redemption are paid into investors' e-rupee wallets.

**What changed:** settlement is real-time instead of T+1, and reconciliation between two separate systems disappears. Investors don't need a crypto wallet, because the depository holds the keys.

**What didn't change:** a tokenised bond is still a bond. It keeps the same ISIN, coupon, maturity and issuer credit risk. A tokenised L&T bond is still an L&T bond. Tokenisation changes the plumbing, not the asset.

## What India still doesn't allow

Phase one of Demat 2.0 proves the settlement works. It doesn't yet create a market.

| Restriction | Why it matters |
| --- | --- |
| No exchange or RFQ trading | Holders can only trade off-market through the depository or exchange. There is no real secondary market yet. |
| Institutions only | Retail access is planned for a later stage. Individuals can't buy in. |
| No fractions | The minimum lot is still one bond. Fractional ownership hasn't been permitted or clarified. |
| No conversion | A token can't be turned back into a conventional bond, or the other way round. |
| Closed network | Only depositories and exchanges run nodes. Other regulated entities may join later. |
| One asset class | Corporate bonds only. No funds, gold, real estate or government securities. |

Outside the pilot, the picture is thinner still:

• **Fractional real estate** was pulled under SEBI's Small and Medium REIT rules in 2024, with a minimum investment of ₹10 lakh. That is a long way from "own a slice for ₹1,000".
• **Crypto-style tokens** that sit outside the demat system risk being treated as virtual digital assets. That means a flat 30% tax plus cess, 1% TDS on transfers, and no setting off losses.
• **Gold, funds and other securities** have no general tokenisation framework in the domestic market. Today, the Demat 2.0 sandbox is the only on-ramp.

## GIFT City: the door is open a crack

GIFT City is where India is most likely to allow tokenised assets at scale, but the final rules aren't out yet.

**What's possible today:**

• Register as a tokenisation technology provider under IFSCA's 2025 TechFin rules.
• Test a product in the FinTech Sandbox, whose framework was issued in March 2026, under a limited-use authorisation.
• Two real-estate token platforms already have conditional sandbox approval.

**What's still missing:**

• Final RWA tokenisation rules. The February 2025 consultation paper asked questions but proposed no specific rules.
• Any licence to issue tokens, run a platform or manage pooled assets.
• A tech registration can't solicit investors or issue products, and its clients must be non-residents.

For a startup, that means you can build the technology in GIFT City today, but you can't be the one offering the product.

## Dubai and the UAE: clear rules, but a licence comes first

The UAE has the clearest rules of the three, but almost every route starts with a licence.

**Dubai mainland (VARA and the Dubai Land Department):**

• **RWA tokens are Category 1.** VARA's issuance guidance from April 2026 says issuers of asset-referenced tokens must be licensed. They must publish a whitepaper and a separate risk statement, and meet rules on reserves, custody and redemption.
• **Property tokens can be resold.** In February 2026 the Dubai Land Department opened phase II of its tokenisation project, allowing resale of about 7.8 million property tokens. Trading happens only on approved platforms, inside a controlled pilot.
• **Big players are moving in.** In September 2026, VARA signed a partnership with Securitize to support regulated tokenisation and bring in institutions.

**The financial free zones (DIFC and ADGM):**

• **DIFC's regulator, the DFSA, runs a tokenisation sandbox.** Firms can test issuing, trading, holding and settling tokenised equities, bonds, sukuk and fund units under an Innovation Testing Licence. 96 firms expressed interest, and crypto tokens are out of scope.
• **ADGM's FSRA regulates a token that represents a share, bond or fund unit as that security.** It carries the same prospectus, licensing and custody rules, just on a different ledger.

For a builder, the free zones are the cleanest home for tokenised securities. Dubai mainland under VARA is the home for property and other asset-referenced tokens.

## India vs GIFT City vs Dubai

|  | India (SEBI + RBI) | GIFT City (IFSCA) | Dubai (VARA + DLD) |
| --- | --- | --- | --- |
| Status | Pilot live since Sep 2026 | Sandbox only, final rules pending | Property pilot with resale |
| Assets | Corporate bonds | Real estate, in the sandbox | Property and RWA-backed tokens |
| Who can invest | Institutions only | Non-residents; Indian residents via LRS | Set by licensed platforms |
| Secondary trading | Off-market only | Not defined yet | Approved platforms only |
| Route for a startup | Partner with regulated players | Tech registration or sandbox | VARA licence or a licensed partner |
| Biggest gap | Liquidity, retail access, fractions | No licence to issue | Licensing cost, closed platforms |

## Six problems nobody has solved yet

Each jurisdiction has solved part of the puzzle. These are the gaps between the pieces, and each one is an opening for builders.

• **Liquidity.** India's tokenised bonds can't trade on an exchange yet, and Dubai's property tokens resell only on approved platforms. A token you can't sell is just a slower bond.
• **Closed ledgers.** The depository network, the Dubai Land Department's platforms and GIFT City's sandboxes are separate systems that don't talk to each other.
• **The cash leg.** India settles in wholesale e-rupee. Nothing settles INR against AED or USD on-chain across the border.
• **Portable identity.** KYC done in India isn't reusable in Dubai. Every platform verifies the same investor again from scratch.
• **Small tickets.** One whole bond, institutions only, and ₹10 lakh for SM REITs. Owning a small slice of an asset isn't possible in India yet.
• **Legal and tax clarity.** GIFT City's final rules aren't out, and a token outside the demat system risks India's 30% VDA tax with no loss set-off.

The India–UAE corridor shows the gap clearly. An Indian investor wanting a Dubai property token faces unclear rules on sending money abroad, a fresh KYC, and possible VDA tax at home. A UAE investor wanting an Indian tokenised bond can't get in at all, because Demat 2.0 is open to eligible institutions only. Whoever connects these two rulebooks builds the rail.

## What this means for builders

The regulators have done the hard, boring work first: legal recognition and a real cash leg. What's missing now is the connective tissue between markets, which is exactly the kind of infrastructure startups can build.

I'm working on that layer, and I'll keep sharing what I learn as I go. If you work in capital markets, law or a bank, I'd like to hear from you. Which of these six problems would you solve first? You can reach me on X or LinkedIn.

This post is research for discussion, not legal, tax or investment advice. Rules are changing quickly, so check the primary sources before acting on anything here.

## Sources

• India set to tokenise corporate bonds, Vinod Kothari Consultants, September 2026 (summarising SEBI's Demat 2.0 FAQs of 10 September 2026)
• India starts tokenizing $620B corporate bond market with digital rupee settlement, CoinDesk, 11 September 2026
• L&T becomes India's first private-sector corporate to issue a tokenised bond, Larsen & Toubro, 9 September 2026
• India's first tokenized corporate bonds go live, The Crypto Times, 10 September 2026
• Tokenising real-world assets in GIFT IFSC: what the regulatory perimeter actually allows, PKM Advisory, August 2026
• VARA issues detailed guidance on virtual asset issuance, Hadef & Partners, 16 April 2026
• Dubai Land Department launches phase II of the real estate tokenisation project, Dubai Land Department, 9 February 2026
• Securitize signs deal with Dubai VARA to advance tokenisation, FOW, 4 September 2026
• Tokenisation Regulatory Sandbox, DFSA
• DFSA's inaugural Tokenisation Regulatory Sandbox attracts interest from 96 firms, WAM
• Crypto VDA taxation under the Income Tax Act 2025, Patron Accounting, April 2026`,
    image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1600&h=800&fit=crop&crop=bottom&q=80",
  },
  {
    id: 2,
    title: "What happens when intelligence itself becomes abundant?",
    slug: "what-happens-when-intelligence-itself-becomes-abundant",
    date: "September 27, 2026",
    time: "7:15 PM",
    excerpt: "A reflection on engineering, education, and the future of human intellectual labour — sparked by a recent classroom discussion and the rapid rise of agentic AI.",
    content: `I’ve been thinking a lot about what engineering means in the age of AI.

A recent lecture and discussion I watched (linked below) asked a very uncomfortable question:
If intelligence and thinking become cheap and commoditized, what happens to the value of human intellectual labour?

It made me revisit something I said recently about AI coding.

People often say:
“You still need engineers because AI can write code, but it can’t do engineering.”

I’m no longer sure that distinction will survive for long.

Today, if I ask an AI to build a payment system, it can already reason about architecture, trust boundaries, idempotency, failure modes, security, scalability, cost, and consistency. More importantly, it can do something humans are fundamentally bad at competing with: 

"iterate"

"Build → test → benchmark → find failure → modify → test again"

Now imagine hundreds or thousands of agents exploring different architectures in parallel, running simulations, attacking their own systems, measuring results, and continuously improving them.

At some point, “AI can’t engineer” stops being a useful argument.

The more interesting question becomes:
What happens when engineering itself becomes an optimization loop?

Human:
• define objective
• define constraints

AI:
• generates solutions
• experiments
• feedback
• optimization
• repeat

This also changes what we should learn.
Maybe the goal isn’t to become the person who can write the most code.

Maybe it is to understand:
• computer science
• systems
• mathematics
• physics
• economics
• security
• constraints
• experimentation

…and, most importantly, how to define the right problem.

Because if AI eventually becomes better than us at finding the best solution, the scarce thing may no longer be the solution.
It may be deciding what should be optimized in the first place.

This also made me think about morphogenesis. Nature often doesn’t explicitly construct every part of an organism. It creates rules, constraints, and feedback mechanisms through which complex structures emerge.

Maybe future engineering moves in a similar direction:
From building things → designing systems that build themselves.

And then the question becomes much bigger than “Will AI replace programmers?”
It becomes:
What is the role of an engineer when intelligence itself becomes abundant?

I recently watched a candid classroom discussion that went even deeper into these questions. The speaker (a professor) was visibly unsettled — talking about civilizational change, agent swarms that start cheating and copying their own weights, the collapse of the old meritocracy based on knowledge, and the very real possibility that universities and traditional education models may not survive in their current form.

He referenced Geoffrey Hinton’s point that in a capitalist society, abundance of intelligence and production does not automatically translate into shared prosperity. It becomes a distribution problem. Greed and jealousy don’t get optimized away.

He also asked the students (and himself) the hardest practical questions:
• What do we teach when knowledge is free?
• Why do students still come to a classroom when the best teacher is already on their laptop?
• What happens to intellectual labour when it is no longer scarce?
• What does an economy look like when thinking is cheap?

These are not comfortable questions. But they feel necessary.

The full discussion is here:
https://youtu.be/N2a1J0UPeL4

I’m still sitting with all of this.

I don’t have clean answers yet.

But I keep coming back to the same shift:
The scarce resource is moving from finding solutions to deciding what is worth solving and designing the systems, constraints, and values that will shape whatever emerges next.`,
    image: "https://img.youtube.com/vi/N2a1J0UPeL4/maxresdefault.jpg",
  },
  {
    id: 1,
    title: "Will Work Become Optional? A Thought on Elon, Energy, Evolution, and Human Nature",
    slug: "will-work-become-optional-elon-musk-nikhil-kamath",
    date: "December 1, 2025",
    time: "4:45 PM",
    excerpt: "Reflecting on Elon Musk's striking idea about a future where work is optional, money disappears, and energy becomes the new currency.",
    content: `A few days ago, I was watching a podcast featuring Elon Musk and Nikhil. At one point, Elon said something striking: in the future, work will be optional, traditional money may disappear, and energy might become the new currency as AI and robots take over most forms of labor.

Interestingly, a few months earlier, I was thinking along the same lines—if AI and robots handle all the work, then what will humans actually do?

To explore this, we have to understand something deeper about life. Every human being is made up of 30-40 trillion cells, and every living organism follows a simple but fundamental cycle:
- It must survive,
- It must gather energy (food),
- And ultimately, it must reproduce.

This cycle of survival and evolution has been running for millions of years. Over time, a single cell evolved into complex organisms, and eventually into humans. Along this journey, we developed emotions like anger, happiness, jealousy, disgust, ambition, and many more—emotions that have shaped human behavior and helped us dominate the planet.

Among these emotions, jealousy and ambition play a massive role. Humans constantly compare themselves with others. Everyone wants to be stronger, more successful, or more significant. This natural competition led to capitalism—a system where people seek wealth, status, and influence.

But capitalism has a strange side: people create and sell things that humans don't necessarily need, but still want.

Take ice cream, for example. It contains no protein, no real nutritional value—just sugar, water, and flavor. Humans don't need it to survive, but we crave it because it triggers dopamine. On the other side, for the capitalist who sells it, ice cream is simply a product designed to make money—not to contribute to evolution.

This brings us back to Elon's idea of a utopian future where work becomes optional. But human emotion doesn't magically disappear. As long as humans feel jealousy, ambition, and the desire to be "better than others," there will always be competition. And where there is competition, there is work, struggle, creation, and effort.

So I don't think we ever reach a perfect utopia where nobody works. Even if basic needs are fulfilled by AI, humans will still choose to work—to stand out, to create, to compete, to feel meaningful.

As for currency, I agree with Elon that fiat money may eventually be replaced. And whatever replaces it will surely be tied to something fundamental—perhaps energy, data, or something entirely new.`,
    image: "https://img.youtube.com/vi/Rni7Fz7208c/maxresdefault.jpg",
  }
];

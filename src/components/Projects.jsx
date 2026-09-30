import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projectsData = [
  {
    title: 'RiskLens',
    shape: 'shield',
    status: 'Live',
    tagline: 'Portfolio risk intelligence, provable on-chain.',
    description: 'An AI risk engine that analyses portfolios, backtests strategies and simulates scenarios — then anchors each risk snapshot on-chain with a zero-knowledge proof.',
    moreInfo: 'RiskLens pairs a Python risk engine with zero-knowledge attestations.\n\nThe FastAPI backend computes risk metrics, runs backtests and scenario simulations, tracks how a portfolio\'s risk trends over time, and turns the numbers into plain-language insights with an LLM layer. Holdings can even be imported from a screenshot.\n\nEvery risk snapshot is hashed and proven with a Noir circuit, and the attestation is recorded by Solidity contracts — so anyone can verify a risk claim without seeing the portfolio behind it. Identity checks use the same idea: ZK-KYC instead of handing over documents.',
    stack: ['Python', 'FastAPI', 'Noir', 'Solidity', 'Next.js'],
    github: 'https://github.com/HemeshKanyal/RiskLens',
    live: 'https://risklens.hemeshkanyal.com/',
  },
  {
    title: 'BharatRWA',
    shape: 'fractions',
    status: 'Live · in development',
    tagline: 'Real-world assets, tokenised with private compliance.',
    description: 'A platform that fractionalises gold, silver, real estate and commodities into ERC-20 tokens, with KYC proven in zero knowledge instead of shared.',
    moreInfo: 'BharatRWA turns physical assets into tradable, fractional tokens while keeping investors\' identities private.\n\nFoundry contracts handle the asset registry, compliance, price oracles and dividend distribution. A Noir circuit proves a user is over 18, KYC-verified and not sanctioned — without revealing who they are — and the proof is verified on-chain before any transfer.\n\nA Node.js service generates proofs and aggregates market data, and a Next.js exchange UI shows live charts and order books on the Sepolia testnet.',
    stack: ['Solidity', 'Foundry', 'Noir', 'Node.js', 'Next.js'],
    github: 'https://github.com/HemeshKanyal/BharatRWA',
    live: 'https://bharatrwa.hemeshkanyal.com/',
  },
  {
    title: 'TrustChain',
    shape: 'route',
    status: 'Live · team of 6',
    tagline: 'Every medicine, traceable from factory to patient.',
    description: 'A blockchain supply chain for medicines, with IoT sensors logging each shipment\'s location and conditions on-chain.',
    moreInfo: 'TrustChain tracks medicines across the whole supply chain — manufacturer → distributor → pharmacy → doctor → patient — so every pack can be verified, traced and trusted.\n\nEach role has its own Solidity contract. Manufacturers register medicines with unique IDs, distributors and pharmacies record every hand-off, and patients can look up a medicine\'s full journey to check it\'s genuine.\n\nIoT devices (GPS, RFID and temperature/humidity sensors) stream shipment data on-chain, and an AI module flags expiry and authenticity issues. The whole stack runs with Docker Compose.',
    stack: ['Solidity', 'React', 'Node.js', 'Python', 'IoT'],
    github: 'https://github.com/HemeshKanyal/trustchain',
    live: 'https://trustchain.hemeshkanyal.com/',
  }
];

const otherBuilds = [
  { title: 'Dev Growth OS', note: 'Productivity OS for developers · React, Supabase', href: 'https://dev-growth-os.hemeshkanyal.com/' },
  { title: 'ASCENT', note: 'Workout app with split recommendations · React Native, Express', href: 'https://github.com/HemeshKanyal/ASCENT-Frontend' },
  { title: 'Coin Flip DApp', note: 'On-chain game · Solidity', href: 'https://coinflip-dapp-kappa.vercel.app' },
  { title: 'Mentor Voting DApp', note: 'Transparent voting · Solidity', href: 'https://mentor-voting-dapp.vercel.app' },
];

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors group"
        >
          <svg className="w-6 h-6 text-foreground/50 group-hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="text-accent font-mono text-xs tracking-widest uppercase mb-4 block">
          Project Details
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          {project.title}
        </h2>
        <p className="text-xl md:text-2xl text-accent/90 font-medium mb-8">
          {project.tagline}
        </p>

        <div className="space-y-6 mb-10">
          <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {project.moreInfo}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-all flex items-center gap-2"
            >
              GitHub Repo
            </a>
          )}
          {project.live !== '#' && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 border border-foreground/20 text-foreground font-semibold rounded-full hover:bg-foreground/5 transition-all"
            >
              Live Demo
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const OtherProjects = () => (
  <motion.div
    data-shape="systems"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="py-16 border-t border-foreground/5"
  >
    <span className="text-accent font-mono text-sm tracking-wider uppercase mb-8 block">
      Other builds
    </span>
    <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
      {otherBuilds.map((b) => (
        <li key={b.title}>
          <a href={b.href} target="_blank" rel="noopener noreferrer" className="group block">
            <span className="text-xl font-display font-semibold text-foreground group-hover:text-accent transition-colors">
              {b.title} <span className="inline-block transition-transform group-hover:translate-x-1">↗</span>
            </span>
            <span className="block text-muted mt-1">{b.note}</span>
          </a>
        </li>
      ))}
    </ul>
  </motion.div>
);

const ProjectBlock = ({ project, index, onOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      data-shape={project.shape}
      className="relative min-h-[85vh] flex flex-col justify-center border-t border-foreground/10"
    >
      <span
        aria-hidden="true"
        className="absolute top-6 md:top-10 right-0 font-display font-bold leading-none text-[38vw] md:text-[20rem] text-outline-faint select-none pointer-events-none"
      >
        0{index + 1}
      </span>
      <motion.div
        className="relative max-w-4xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm tracking-wider uppercase mb-4">
          <span className="text-accent">0{index + 1} // Project</span>
          <span className="text-muted">{project.status}</span>
        </div>
        <h3 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground mb-6">
          {project.title}
        </h3>
        <p className="text-2xl md:text-4xl text-accent font-display font-medium mb-8 leading-tight max-w-3xl text-balance">
          {project.tagline}
        </p>
        <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mb-8">
          {project.description}
        </p>
        <ul className="flex flex-wrap gap-2 mb-10">
          {project.stack.map((t) => (
            <li key={t} className="px-3 py-1 rounded-full border border-foreground/10 bg-foreground/[0.03] font-mono text-xs text-foreground/80">
              {t}
            </li>
          ))}
        </ul>
        <button
          onClick={() => onOpen(project)}
          className="group inline-flex items-center text-accent hover:text-accent-hover font-medium transition-colors text-lg"
        >
          View details
          <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="w-full flex flex-col">
      {projectsData.map((project, idx) => (
        <ProjectBlock
          key={project.title}
          project={project}
          index={idx}
          onOpen={setSelectedProject}
        />
      ))}
      <OtherProjects />

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;

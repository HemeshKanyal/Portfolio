import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projectsData = [
  {
    title: 'RiskLens',
    tagline: 'Proving risk without exposing data.',
    description: 'A zero-knowledge based system designed to evaluate financial risk profiles while preserving complete user privacy through cryptographic proofs.',
    moreInfo: 'RiskLens leverages advanced ZK-SNARKs to generate proofs of solvency and risk metrics. It allows institutions to verify a user\'s financial health without ever seeing their raw balance or transaction history, effectively solving the privacy-utility trade-off in fintech.',
    github: 'https://github.com/HemeshKanyal/RiskLens',
    live: 'https://risklens.hemeshkanyal.com/',
  },
  {
    title: 'AI OS',
    tagline: 'An operating system that understands you.',
    description: 'A next-gen workspace environment where autonomous agents are integrated at the OS level to automate and fluidly assist in complex digital workflows.',
    moreInfo: 'AI OS is built on a custom microkernel architecture that prioritizes agent-to-process communication. It features a natural language shell and a context-aware file system that organizes data based on project relations rather than just directory paths.',
    github: null,
    live: '#',
  },
  {
    title: 'TrustChain',
    tagline: 'Decentralized medicine supply chain.',
    description: 'A blockchain-powered system that tracks medicines from manufacturer to patient, ensuring authenticity, transparency, and trust in the pharmaceutical supply chain.',
    moreInfo: 'TrustChain is a blockchain-based system that tracks medicines across the entire supply chain — from manufacturer → distributor → pharmacy → doctor → patient.\n\nIt ensures that every medicine can be verified, traced, and trusted at every step, eliminating fraud and increasing transparency in healthcare.\n\n How It Works:\nTrustChain creates a tamper-proof digital trail for every medicine. Manufacturers register medicines with unique IDs (like MED-001) and production data. Distributors and Pharmacies update shipment and inventory records on-chain. Finally, Patients can scan or verify the medicine ID to see the full journey: where it was made, who handled it, and whether it’s genuine.\n\n Key Features:\n End-to-End Traceability\n Tamper-Proof Records\n Medicine Authentication\n Transparency for All Stakeholders\n Trustless System',
    github: 'https://github.com/HemeshKanyal/trustchain-webpage',
    live: 'https://trustchain.hemeshkanyal.com/',
  }
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
        className="relative w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
        >
          <svg className="w-6 h-6 text-white/50 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="text-accent font-mono text-xs tracking-widest uppercase mb-4 block">
          Project Details
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
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
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all flex items-center gap-2"
            >
              GitHub Repo
            </a>
          )}
          {project.live !== '#' && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
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
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="py-16 border-t border-white/5"
  >
    <p className="text-xl text-muted leading-relaxed">
      Other builds include small-scale tools, games, and smart contracts
      exploring different systems and mechanics — including a Python Game,
      Coin Flip DApp, Mentor Voting DApp, and AutoTyper.
    </p>
  </motion.div>
);

const ProjectBlock = ({ project, index, onOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-[80vh] flex flex-col justify-center border-t border-white/10"
    >
      <motion.div
        className="max-w-4xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block">
          0{index + 1} // Project
        </span>
        <h3 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          {project.title}
        </h3>
        <p className="text-2xl md:text-4xl text-foreground font-medium mb-8 leading-tight">
          {project.tagline}
        </p>
        <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mb-12">
          {project.description}
        </p>
        <button
          onClick={() => onOpen(project)}
          className="inline-flex items-center text-accent hover:text-accent-hover font-medium transition-colors text-lg"
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

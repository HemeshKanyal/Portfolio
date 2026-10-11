import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, otherBuilds } from '../data/projects';

const HASH_PREFIX = '#work/';

const SectionLabel = ({ children }) => (
  <h4 className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-5">{children}</h4>
);

// The case study behind "View details": a sheet from the right with the problem, what was
// built, how it works, honest limits and links. Closes on Esc, the backdrop or the button.
const CaseStudy = ({ project, index, onClose }) => {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 260 }}
        className="relative h-full w-full max-w-3xl overflow-y-auto overscroll-contain border-l border-foreground/10 bg-background/90 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="sticky top-5 float-right mr-5 z-10 p-2.5 rounded-full border border-foreground/10 bg-background/70 backdrop-blur-md text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 md:px-14 pt-16 pb-20">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.25em] mb-5">
            <span className="text-accent">0{index + 1} // Case study</span>
            <span className="text-muted">{project.status}</span>
          </div>
          <h2
            id="case-study-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4 outline-none"
          >
            {project.title}
          </h2>
          <p className="text-2xl md:text-3xl text-accent font-display font-medium leading-tight mb-10">
            {project.tagline}
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group px-6 py-2.5 rounded-full font-semibold transition-all ${
                  link.primary
                    ? 'bg-accent text-background hover:bg-accent-hover shadow-[0_0_40px_-10px_rgba(242,196,109,0.6)]'
                    : 'border border-foreground/20 text-foreground hover:border-accent/50 hover:text-accent'
                }`}
              >
                {link.label} <span className="inline-block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            ))}
          </div>

          <dl className="grid grid-cols-3 gap-4 mb-16 border-y border-foreground/10 py-8">
            {project.stats.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">{value}</dd>
                <dd className="mt-2 text-sm text-muted leading-snug">{label}</dd>
              </div>
            ))}
          </dl>

          <section className="mb-14">
            <SectionLabel>The problem</SectionLabel>
            <p className="text-lg md:text-xl text-foreground/85 leading-relaxed">{project.problem}</p>
          </section>

          <section className="mb-14">
            <SectionLabel>What I built</SectionLabel>
            <ul className="space-y-4">
              {project.built.map((item) => (
                <li key={item} className="flex gap-4 text-foreground/85 leading-relaxed">
                  <span aria-hidden="true" className="text-accent mt-1 shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-14">
            <SectionLabel>How it works</SectionLabel>
            <ol className="relative border-l border-foreground/15 ml-2 space-y-6">
              {project.flow.map((step, i) => (
                <li key={step} className="relative pl-8 text-foreground/85 leading-relaxed">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border border-accent/60 bg-background flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-xs text-muted mr-3">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {project.limits && (
            <section className="mb-14">
              <SectionLabel>Honest limits</SectionLabel>
              <ul className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6">
                {project.limits.map((item) => (
                  <li key={item} className="flex gap-3 text-muted leading-relaxed">
                    <span aria-hidden="true" className="shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionLabel>Stack</SectionLabel>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <li key={t} className="px-3 py-1 rounded-full border border-foreground/10 bg-foreground/[0.03] font-mono text-xs text-foreground/80">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </motion.article>
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
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <button
            onClick={(e) => onOpen(project, e.currentTarget)}
            className="group inline-flex items-center text-accent hover:text-accent-hover font-medium transition-colors text-lg"
          >
            View case study
            <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <a
            href={project.links[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors"
          >
            {project.links[0].label} ↗
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const slugFromHash = () =>
  window.location.hash.startsWith(HASH_PREFIX) ? window.location.hash.slice(HASH_PREFIX.length) : null;

const Projects = () => {
  // A case study is addressable as #work/<slug>, so it can be shared and survives a reload
  const [openSlug, setOpenSlug] = useState(slugFromHash);
  const triggerRef = useRef(null);
  const openIndex = projects.findIndex((p) => p.slug === openSlug);
  const isOpen = openIndex >= 0;

  // Lock page scroll while a case study is open. Tied to the open state rather than the sheet's
  // lifetime, so scrolling comes back the moment it closes, not after the exit animation.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => { root.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    const onHash = () => setOpenSlug(slugFromHash());
    window.addEventListener('hashchange', onHash);
    // Arriving on a shared link: bring the project into view behind the sheet
    if (slugFromHash()) document.getElementById(`project-${slugFromHash()}`)?.scrollIntoView();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const open = useCallback((project, trigger) => {
    triggerRef.current = trigger;
    window.history.replaceState(null, '', `${HASH_PREFIX}${project.slug}`);
    setOpenSlug(project.slug);
  }, []);

  const close = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setOpenSlug(null);
    triggerRef.current?.focus();
  }, []);

  return (
    <section id="projects" className="w-full flex flex-col">
      {projects.map((project, idx) => (
        <div key={project.slug} id={`project-${project.slug}`}>
          <ProjectBlock project={project} index={idx} onOpen={open} />
        </div>
      ))}
      <OtherProjects />

      <AnimatePresence>
        {isOpen && (
          <CaseStudy project={projects[openIndex]} index={openIndex} onClose={close} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;

import React from 'react';
import { motion } from 'framer-motion';

const socials = [
  { label: 'GitHub', href: 'https://github.com/HemeshKanyal' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/hemeshkanyal22' },
  { label: 'Twitter', href: 'https://x.com/HemeshKanyal' },
  { label: 'Instagram', href: 'https://www.instagram.com/hemeshkanyal22' },
];

const Contact = () => {
  return (
    <section id="contact" data-shape="galaxy" className="min-h-[80vh] flex flex-col justify-end pb-16 border-t border-foreground/10 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="text-accent mb-8 block font-mono uppercase tracking-[0.3em] text-sm">
          Collaborate
        </span>
        <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-foreground mb-14">
          Let’s build
          <br />
          <span className="text-outline-accent">something</span>
          <br />
          meaningful.
        </h2>

        <a
          href="mailto:hemeshkanyal22@gmail.com"
          className="group inline-flex items-center gap-3 text-xl md:text-3xl font-display font-semibold text-accent hover:text-accent-hover transition-colors mb-14 break-all"
        >
          hemeshkanyal22@gmail.com
          <span className="inline-block transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
        </a>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-foreground/10">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-medium">
            {socials.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors relative group">
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            © {new Date().getFullYear()} Hemesh Kanyal
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;

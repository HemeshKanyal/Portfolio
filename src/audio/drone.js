// A synthesized deep-space drone (no audio files): detuned low oscillators plus slowly filtered
// noise. It listens to the cosmos events: a black hole pulls the pitch down and swells a rumble,
// the supernova is a burst of noise sweeping down through a filter, a click's gravitational
// wave is a LIGO-style chirp, the Big Crunch falls away to nothing and the wormhole rushes up.

const BASE = [55, 82.41, 110.3];

const noiseBuffer = (ctx, seconds = 2) => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Brown-ish noise: smoother and deeper than white
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
};

export function createDrone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 420;
  tone.connect(master);

  const oscillators = BASE.map((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 2 ? 'triangle' : 'sine';
    osc.frequency.value = f;
    osc.detune.value = (i - 1) * 6;
    const g = ctx.createGain();
    g.gain.value = [0.32, 0.18, 0.07][i];
    osc.connect(g).connect(tone);
    osc.start();
    return osc;
  });

  // Breathing gas: looped noise through a band-pass whose centre drifts with a slow LFO
  const buffer = noiseBuffer(ctx);
  const wind = ctx.createBufferSource();
  wind.buffer = buffer;
  wind.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 320;
  band.Q.value = 0.8;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.22;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 180;
  lfo.connect(lfoDepth).connect(band.frequency);
  wind.connect(band).connect(windGain).connect(master);
  wind.start();
  lfo.start();

  // Black hole rumble, silent until summoned
  const rumble = ctx.createOscillator();
  rumble.type = 'sawtooth';
  rumble.frequency.value = 31;
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 90;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0;
  rumble.connect(rumbleFilter).connect(rumbleGain).connect(master);
  rumble.start();

  const onHole = (e) => {
    const t = ctx.currentTime;
    const on = e.detail;
    oscillators.forEach((osc, i) => {
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setTargetAtTime(BASE[i] * (on ? 0.72 : 1), t, on ? 0.6 : 0.15);
    });
    rumbleGain.gain.cancelScheduledValues(t);
    rumbleGain.gain.setTargetAtTime(on ? 0.35 : 0, t, on ? 0.5 : 0.1);
    tone.frequency.setTargetAtTime(on ? 220 : 420, t, 0.4);
  };

  const onBurst = (e) => {
    const power = Math.max(0.2, e.detail);
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const sweep = ctx.createBiquadFilter();
    sweep.type = 'lowpass';
    sweep.frequency.setValueAtTime(3200, t);
    sweep.frequency.exponentialRampToValueAtTime(120, t + 2.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.9 * power, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    src.connect(sweep).connect(g).connect(master);
    src.start(t);
    src.stop(t + 2.5);
  };

  // Noise through a moving low-pass: the shared voice of the crunch and the wormhole
  const sweep = (from, to, seconds, peak) => {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + seconds);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + seconds * 0.85);
    g.gain.exponentialRampToValueAtTime(0.001, t + seconds + 0.6);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + seconds + 0.7);
  };

  // Two black holes spiralling together: rising pitch and loudness, then a sudden ringdown
  const onRipple = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.32);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.45);
  };

  const onCrunch = () => {
    const t = ctx.currentTime;
    oscillators.forEach((osc, i) => {
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setValueAtTime(osc.frequency.value, t);
      osc.frequency.exponentialRampToValueAtTime(BASE[i] * 0.3, t + 1.6);
      osc.frequency.setTargetAtTime(BASE[i], t + 1.7, 0.4);
    });
    sweep(2400, 60, 1.6, 0.8);
  };
  const onWormhole = () => sweep(120, 5000, 0.95, 0.7);

  window.addEventListener('cosmos:hole', onHole);
  window.addEventListener('cosmos:burst', onBurst);
  window.addEventListener('cosmos:ripple', onRipple);
  window.addEventListener('cosmos:crunch', onCrunch);
  window.addEventListener('cosmos:wormhole', onWormhole);

  const fade = (to, seconds) => {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(to, t + seconds);
  };

  return {
    async start() {
      await ctx.resume();
      fade(0.5, 1.5);
    },
    stop() {
      fade(0, 0.6);
      // Suspend once faded so the audio thread can sleep
      setTimeout(() => master.gain.value === 0 && ctx.suspend(), 700);
    },
    dispose() {
      window.removeEventListener('cosmos:hole', onHole);
      window.removeEventListener('cosmos:burst', onBurst);
      window.removeEventListener('cosmos:ripple', onRipple);
      window.removeEventListener('cosmos:crunch', onCrunch);
      window.removeEventListener('cosmos:wormhole', onWormhole);
      ctx.close();
    },
  };
}

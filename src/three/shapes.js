// Point-cloud generators for the cosmos background.
// Every generator fills `count` xyz points into a Float32Array, roughly within a radius of ~3 units,
// so the same particles can morph between any two shapes.

const TAU = Math.PI * 2;

const rand = (min = 0, max = 1) => min + Math.random() * (max - min);

// Box–Muller; good enough for jittering points around a centre
const gauss = (sigma = 1) =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random()) * sigma;

const put = (out, i, x, y, z) => {
  out[i * 3] = x;
  out[i * 3 + 1] = y;
  out[i * 3 + 2] = z;
};

const lerp = (a, b, t) => a + (b - a) * t;

// A random point on one of the 12 edges of an axis-aligned cube
const cubeEdgePoint = (cx, cy, cz, half, jitter = 0.012) => {
  const axis = Math.floor(Math.random() * 3);
  const s1 = Math.random() < 0.5 ? -half : half;
  const s2 = Math.random() < 0.5 ? -half : half;
  const t = rand(-half, half);
  const p = axis === 0 ? [t, s1, s2] : axis === 1 ? [s1, t, s2] : [s1, s2, t];
  return [cx + p[0] + gauss(jitter), cy + p[1] + gauss(jitter), cz + p[2] + gauss(jitter)];
};

const rotateY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
const rotateX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];

// ─── Hero: a ringed planet ───
function planet(count) {
  const out = new Float32Array(count * 3);
  const shell = Math.floor(count * 0.62);
  for (let i = 0; i < count; i++) {
    if (i < shell) {
      // Fibonacci sphere for an even shell, lightly jittered
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / shell);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = 1.45 + gauss(0.02);
      put(out, i, r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    } else {
      // Ring: denser toward the inner edge, with a visible gap like Saturn's
      let r = 2.0 + Math.pow(Math.random(), 1.4) * 1.1;
      if (r > 2.45 && r < 2.55) r += 0.12;
      const a = rand(0, TAU);
      let p = [r * Math.cos(a), gauss(0.015), r * Math.sin(a)];
      p = rotateX(p, 0.42);
      p = rotateY(p, -0.35);
      put(out, i, ...p);
    }
  }
  return out;
}

// ─── AI: layered neural network, nodes arranged on rings so it reads as 3D ───
function neural(count) {
  const out = new Float32Array(count * 3);
  const layerSizes = [5, 8, 8, 8, 4];
  const layers = layerSizes.map((n, li) => {
    const x = lerp(-2.4, 2.4, li / (layerSizes.length - 1));
    const radius = n > 5 ? 1.35 : 0.85;
    return Array.from({ length: n }, (_, k) => {
      const a = (k / n) * TAU + li * 0.4;
      return [x, Math.cos(a) * radius, Math.sin(a) * radius];
    });
  });
  const nodeShare = Math.floor(count * 0.4);
  for (let i = 0; i < count; i++) {
    if (i < nodeShare) {
      const layer = layers[Math.floor(Math.random() * layers.length)];
      const n = layer[Math.floor(Math.random() * layer.length)];
      put(out, i, n[0] + gauss(0.05), n[1] + gauss(0.05), n[2] + gauss(0.05));
    } else {
      // Synapse between two random nodes in adjacent layers
      const li = Math.floor(Math.random() * (layers.length - 1));
      const a = layers[li][Math.floor(Math.random() * layers[li].length)];
      const b = layers[li + 1][Math.floor(Math.random() * layers[li + 1].length)];
      const t = Math.random();
      put(out, i, lerp(a[0], b[0], t), lerp(a[1], b[1], t) + gauss(0.008), lerp(a[2], b[2], t) + gauss(0.008));
    }
  }
  return out;
}

// ─── Blockchain: linked blocks ───
function chain(count) {
  const out = new Float32Array(count * 3);
  const blocks = 4;
  const half = 0.42;
  const centers = Array.from({ length: blocks }, (_, b) => {
    const x = lerp(-2.4, 2.4, b / (blocks - 1));
    return [x, Math.sin(b * 1.3) * 0.35, Math.cos(b * 1.1) * 0.3];
  });
  const linkShare = Math.floor(count * 0.18);
  for (let i = 0; i < count; i++) {
    if (i < linkShare) {
      // Hash links: double strand between consecutive blocks
      const b = Math.floor(Math.random() * (blocks - 1));
      const a = centers[b], c = centers[b + 1];
      const t = rand(0.28, 0.72);
      const off = Math.random() < 0.5 ? 0.09 : -0.09;
      put(out, i, lerp(a[0], c[0], t), lerp(a[1], c[1], t) + off + gauss(0.006), lerp(a[2], c[2], t) + gauss(0.006));
    } else {
      const b = Math.floor(Math.random() * blocks);
      const c = centers[b];
      let p = cubeEdgePoint(0, 0, 0, half);
      p = rotateX(rotateY(p, 0.6 + b * 0.5), 0.35);
      put(out, i, p[0] + c[0], p[1] + c[1], p[2] + c[2]);
    }
  }
  return out;
}

// ─── Scalable systems: a lattice of containers (think pods on nodes) ───
function systems(count) {
  const out = new Float32Array(count * 3);
  const n = 3;
  const spacing = 1.15;
  const half = 0.3;
  for (let i = 0; i < count; i++) {
    const gx = Math.floor(Math.random() * n) - 1;
    const gy = Math.floor(Math.random() * n) - 1;
    const gz = Math.floor(Math.random() * n) - 1;
    let p;
    if (Math.random() < 0.82) {
      p = cubeEdgePoint(gx * spacing, gy * spacing, gz * spacing, half);
    } else {
      // Network mesh between neighbouring containers
      const axis = Math.floor(Math.random() * 3);
      const t = rand(-spacing, spacing);
      p = [gx * spacing, gy * spacing, gz * spacing];
      p[axis] = t;
      p = p.map((v) => v + gauss(0.005));
    }
    p = rotateX(rotateY(p, 0.7), 0.45);
    put(out, i, ...p);
  }
  return out;
}

// ─── RiskLens: a private core inside a lattice shield (zero-knowledge) ───
function shield(count) {
  const out = new Float32Array(count * 3);
  const core = Math.floor(count * 0.1);
  for (let i = 0; i < count; i++) {
    if (i < core) {
      const r = 0.42 * Math.cbrt(Math.random());
      const theta = rand(0, TAU);
      const phi = Math.acos(rand(-1, 1));
      put(out, i, r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    } else {
      // Points only along latitude/longitude lines → a caged sphere
      const r = 1.9 + gauss(0.012);
      let theta, phi;
      if (Math.random() < 0.5) {
        phi = (Math.floor(rand(1, 9)) / 9) * Math.PI;
        theta = rand(0, TAU);
      } else {
        theta = (Math.floor(rand(0, 14)) / 14) * TAU;
        phi = rand(0.05, Math.PI - 0.05);
      }
      put(out, i, r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    }
  }
  return out;
}

// ─── BharatRWA: a solid asset breaking into tradable fractions ───
function fractions(count) {
  const out = new Float32Array(count * 3);
  const n = 5;
  const cell = 0.5;
  for (let i = 0; i < count; i++) {
    const gx = Math.floor(Math.random() * n);
    const gy = Math.floor(Math.random() * n);
    const gz = Math.floor(Math.random() * n);
    let cx = (gx - (n - 1) / 2) * cell;
    let cy = (gy - (n - 1) / 2) * cell;
    let cz = (gz - (n - 1) / 2) * cell;
    // One corner of the block has been "tokenised" and drifts away
    const corner = gx + gy + gz - (n - 1) * 1.5;
    if (corner > 0) {
      const push = 1 + corner * 0.28;
      cx *= push; cy *= push; cz *= push;
    }
    const p = cubeEdgePoint(cx, cy, cz, cell * 0.36, 0.008);
    put(out, i, ...rotateX(rotateY(p, 0.75), 0.5));
  }
  return out;
}

// ─── TrustChain: a supply route with a verified block at every hop ───
function route(count) {
  const out = new Float32Array(count * 3);
  // manufacturer → distributor → pharmacy → doctor → patient
  const stops = [
    [-2.2, -0.9, 0.3],
    [-1.1, 0.6, -0.4],
    [0, -0.3, 0.5],
    [1.1, 0.8, -0.2],
    [2.2, -0.4, 0.2],
  ];
  const pathShare = Math.floor(count * 0.35);
  const at = (t) => {
    // Piecewise cosine-eased interpolation — smooth enough and cheap
    const f = t * (stops.length - 1);
    const k = Math.min(Math.floor(f), stops.length - 2);
    const u = (1 - Math.cos((f - k) * Math.PI)) / 2;
    const a = stops[k], b = stops[k + 1];
    return [lerp(a[0], b[0], f - k), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  };
  for (let i = 0; i < count; i++) {
    if (i < pathShare) {
      const p = at(Math.random());
      put(out, i, p[0] + gauss(0.02), p[1] + gauss(0.02), p[2] + gauss(0.02));
    } else {
      const s = stops[Math.floor(Math.random() * stops.length)];
      put(out, i, ...cubeEdgePoint(s[0], s[1], s[2], 0.26));
    }
  }
  return out;
}

// ─── Spiral galaxy for reflective / closing sections ───
function galaxy(count) {
  const out = new Float32Array(count * 3);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    const r = 0.25 + Math.pow(Math.random(), 1.2) * 3.05;
    const arm = (Math.floor(Math.random() * arms) / arms) * TAU;
    const spin = r * 1.35;
    const spread = 0.35 * (0.3 + r / 3.3);
    let p = [
      Math.cos(arm + spin) * r + gauss(spread * 0.5),
      gauss(0.06 * (1.4 - r / 3.3)),
      Math.sin(arm + spin) * r + gauss(spread * 0.5),
    ];
    p = rotateX(p, 0.55);
    put(out, i, ...p);
  }
  return out;
}

export const SHAPES = { planet, neural, chain, systems, shield, fractions, route, galaxy };

// Shapes that sit in the middle of the screen instead of beside the text
export const CENTERED_SHAPES = new Set(['galaxy']);

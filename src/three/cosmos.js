import * as THREE from 'three';
import { SHAPES, CENTERED_SHAPES, STILL_SHAPES } from './shapes';
import { createBackdrop } from './backdrop';
import { createSpacetime, FLOOR_Y } from './spacetime';

// Palette mirrors tailwind.config.js
const STARLIGHT = new THREE.Color('#ece8df');
const GOLD = new THREE.Color('#f2c46d');
const NEBULA = new THREE.Color('#7c8cff');

const MORPH_SECONDS = 1.7;

// Intro: the singularity glows for a moment, then bangs
const SINGULARITY_SECONDS = 0.8;
const BANG_SECONDS = 2.4;
// Outro: everything falls back into the singularity, then the intro plays again
const CRUNCH_SECONDS = 1.6;
// Wormhole to another page: dive in, hold while the route changes, come out the other side
const WORMHOLE_IN = 0.95;
const WORMHOLE_HOLD = 0.25;
const WORMHOLE_OUT = 1.1;

// Lens sizes in aspect space (screen height = 2)
const EINSTEIN_HOVER = 0.05;
const EINSTEIN_HOLE = 0.2;
const SHADOW = 0.1;
// A press shorter than this is just a click
const HOLD_DELAY = 0.2;

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable]';

// The hero planet is the first impression, so it gets to be the biggest thing on screen
const SHAPE_SCALE = { planet: 1.25, blackhole: 1.15 };
// Each section's sky: tint (rgb multiplier), brightness and saturation of the nebula.
// Cool and inquisitive for discovery and the work, warm for the reflective galaxy sections,
// dim and drained near the black hole.
const MOODS = {
  planet: { tint: [1, 1, 1], gain: 1, sat: 1 },
  neural: { tint: [0.82, 1.05, 1.12], gain: 1, sat: 1.05 },
  systems: { tint: [0.92, 0.98, 1.1], gain: 0.95, sat: 1 },
  chain: { tint: [0.92, 0.98, 1.1], gain: 0.95, sat: 1 },
  shield: { tint: [0.95, 1.02, 1.08], gain: 0.95, sat: 1 },
  route: { tint: [1.05, 1, 0.95], gain: 0.95, sat: 1 },
  fractions: { tint: [1.08, 1, 0.92], gain: 1, sat: 1 },
  galaxy: { tint: [1.15, 0.96, 0.9], gain: 1.08, sat: 1.1 },
  blackhole: { tint: [0.8, 0.86, 1.12], gain: 0.62, sat: 0.55 },
  dust: { tint: [1, 1, 1], gain: 0.8, sat: 0.9 },
  summit: { tint: [1.08, 1.02, 0.94], gain: 1, sat: 1 },
};

// Centred shapes normally recede behind the text; the black hole is the point of its section
const SHAPE_OPACITY = { blackhole: 1, dust: 0.3 };

const particleVertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;
  attribute float aTone;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uWell;
  uniform float uMass;
  uniform float uHole;
  uniform float uSwirl;
  uniform float uHorizon;
  uniform vec3 uBurstCenter;
  uniform float uBurst;
  uniform float uBang;
  uniform float uDiskSpin;
  uniform float uDiskPhase;
  uniform float uDiskStep;
  uniform mat4 uPrevModel;
  uniform float uDt;
  uniform vec3 uStarlight;
  uniform vec3 uGold;
  uniform vec3 uNebula;

  varying vec3 vColor;
  varying float vAlpha;

  // Accretion disk particles (flat, outside the photon ring) orbit with Kepler's ω ∝ r^-1.5
  vec3 spinDisk(vec3 p, float phase) {
    float r = length(p.xz);
    if (uDiskSpin <= 0.0 || r < 1.6 || abs(p.y) > 0.3) return p;
    float a = uDiskSpin * phase * 2.2 / pow(r, 1.5);
    float c = cos(a), s = sin(a);
    return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }

  void main() {
    // Staggered morph: each particle starts a little later than the last
    float d = clamp((uProgress - aRand * 0.35) / 0.65, 0.0, 1.0);
    float e = d * d * (3.0 - 2.0 * d);
    vec3 pos = mix(aFrom, aTo, e);

    // Big Bang: every particle starts at the singularity and is flung out to its place
    float b = clamp((uBang - aRand * 0.3) / 0.7, 0.0, 1.0);
    float bm = b - 1.0;
    vec3 kick = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3), sin(aRand * 33.1 + 1.0)) + 0.001);
    pos = pos * (1.0 + 2.2 * bm * bm * bm + 1.2 * bm * bm) + kick * sin(b * 3.14159) * (0.6 + aRand * 1.6);

    // Mid-flight the particles scatter slightly, like dust caught in a current
    float mid = sin(e * 3.14159);
    pos += vec3(
      sin(uTime * 0.9 + aRand * 21.0),
      cos(uTime * 0.7 + aRand * 13.0),
      sin(uTime * 0.8 + aRand * 7.0)
    ) * mid * 0.32;

    // Idle breathing
    pos += vec3(
      sin(uTime * 0.6 + aRand * 40.0),
      cos(uTime * 0.5 + aRand * 30.0),
      sin(uTime * 0.4 + aRand * 50.0)
    ) * 0.014;

    vec3 prevPos = spinDisk(pos, uDiskPhase - uDiskStep);
    pos = spinDisk(pos, uDiskPhase);
    vec4 world = modelMatrix * vec4(pos, 1.0);

    // Doppler shift: matter coming toward us (+z) turns blue, matter moving away turns red
    float vz = (world.z - (uPrevModel * vec4(prevPos, 1.0)).z) / max(uDt, 1e-3);
    float shift = clamp(vz * 1.1, -1.0, 1.0);

    // ─── Gravity (uWell is the cursor on the z = 0 plane) ───
    vec2 dm = world.xy - uWell.xy;
    float r = length(dm) + 1e-4;
    vec2 dir = dm / r;
    // Hovering: dust leans in toward the cursor and twists around it
    float near = smoothstep(1.7, 0.0, r);
    float r1 = r * (1.0 - 0.24 * uMass * near);
    float ang = 0.9 * uMass * near * near;
    // Holding: a black hole. Matter within reach spirals into an accretion ring at the horizon,
    // inner orbits faster, and some of it falls in for good
    float pull = uHole * pow(smoothstep(5.5, 0.0, r), 0.6);
    float r2 = mix(r1, uHorizon * (1.2 + aRand * 1.1), pull);
    ang += pull * uSwirl * (0.6 + aRand * 0.8) * uHorizon / max(r2, uHorizon);
    float ca = cos(ang), sa = sin(ang);
    world.xy = uWell.xy + vec2(dir.x * ca - dir.y * sa, dir.x * sa + dir.y * ca) * r2;
    world.z = mix(world.z, 0.0, pull * 0.8);
    float swallowed = pull * step(fract(aRand * 13.7), 0.3);

    // Letting go: a supernova blows everything outward, then the shape gathers itself again
    vec2 db = world.xy - uBurstCenter.xy;
    float rb = length(db) + 1e-4;
    world.xy += db / rb * uBurst * (0.5 + aRand * 2.2) * smoothstep(10.0, 0.0, rb);
    world.z += (aRand - 0.5) * uBurst * 2.5;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    // Capped so particles don't balloon when the camera flies through them
    gl_PointSize = min(uSize * (0.55 + aRand * 0.9) * uPixelRatio * (7.0 / -mv.z), 48.0 * uPixelRatio);

    vColor = aTone < 0.2 ? uGold : (aTone < 0.28 ? uNebula : uStarlight);
    vColor = mix(vColor, shift > 0.0 ? vec3(0.62, 0.74, 1.0) : vec3(1.0, 0.42, 0.3), abs(shift) * 0.55);
    vColor = mix(vColor, uGold * 1.5, pull * 0.8);
    vAlpha = (0.35 + 0.65 * fract(aRand * 7.31)) * (0.78 + 0.22 * sin(uTime * 1.4 + aRand * 60.0));
    vAlpha *= (1.0 - swallowed) * (1.0 + pull * 0.6);
  }
`;

const particleFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

const smooth = (t) => t * t * (3 - 2 * t);

// Is any [data-grid] section (spacetime floor) under the middle of the viewport?
function wantsGrid() {
  const mid = window.innerHeight * 0.5;
  for (const el of document.querySelectorAll('[data-grid]')) {
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) return true;
  }
  return false;
}

// Which shape the page wants right now: the innermost [data-shape] element under the middle
// of the viewport. Nested elements come later in document order, so the last match wins.
function pickShape(current) {
  const els = document.querySelectorAll('[data-shape]');
  if (els.length === 0) return 'galaxy';
  const mid = window.innerHeight * 0.5;
  let found = null;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) found = el.dataset.shape;
  }
  return found ?? current;
}

export function createCosmos(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor('#05060b', 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.z = 7.5;
  // Projections run before the first render, which is what would otherwise compute this
  camera.updateMatrixWorld();

  const isSmall = window.innerWidth < 768;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = isSmall ? 6000 : 14000;

  // ─── Morphing particles ───
  const cache = {};
  const getShape = (name) => (cache[name] ??= (SHAPES[name] ?? SHAPES.planet)(count));

  let shapeName = pickShape('planet');
  const from = new Float32Array(getShape(shapeName));
  const to = new Float32Array(getShape(shapeName));
  const randoms = new Float32Array(count);
  const tones = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    randoms[i] = Math.random();
    tones[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  // `position` is required by three.js for bounds; the shader uses aFrom/aTo
  geometry.setAttribute('position', new THREE.BufferAttribute(to, 3));
  const fromAttr = new THREE.BufferAttribute(from, 3);
  const toAttr = new THREE.BufferAttribute(to, 3);
  geometry.setAttribute('aFrom', fromAttr);
  geometry.setAttribute('aTo', toAttr);
  geometry.setAttribute('aRand', new THREE.BufferAttribute(randoms, 1));
  geometry.setAttribute('aTone', new THREE.BufferAttribute(tones, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  const uniforms = {
    uProgress: { value: 1 },
    uTime: { value: 0 },
    uSize: { value: isSmall ? 3.6 : 4.3 },
    uPixelRatio: { value: pixelRatio },
    uWell: { value: new THREE.Vector3(99, 99, 0) },
    uMass: { value: 0 },
    uHole: { value: 0 },
    uSwirl: { value: 0 },
    uHorizon: { value: 0.3 },
    uBurstCenter: { value: new THREE.Vector3(99, 99, 0) },
    uBurst: { value: 0 },
    uBang: { value: reducedMotion ? 1 : 0 },
    uDiskSpin: { value: 0 },
    uDiskPhase: { value: 0 },
    uDiskStep: { value: 0 },
    uPrevModel: { value: new THREE.Matrix4() },
    uDt: { value: 1 / 60 },
    uOpacity: { value: 0.85 },
    uStarlight: { value: STARLIGHT },
    uGold: { value: GOLD },
    uNebula: { value: NEBULA },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const group = new THREE.Group();
  group.add(new THREE.Points(geometry, material));
  scene.add(group);

  // ─── Nebula, starfield, shooting stars ───
  const backdrop = createBackdrop({ renderer, isSmall, reducedMotion, pixelRatio });
  scene.add(...backdrop.objects);
  const { fx } = backdrop;

  // ─── Spacetime grid ───
  const spacetime = createSpacetime({ isSmall });
  scene.add(spacetime.object);

  // ─── Layout ───
  let viewW = 1, viewH = 1, desktop = true;
  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    backdrop.resize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    viewW = viewH * camera.aspect;
    // Horizon in world units, matching the shadow drawn by the backdrop
    uniforms.uHorizon.value = SHADOW * viewH * 0.5;
    desktop = w >= 1024 && camera.aspect > 1.1;
  };
  resize();

  const layoutFor = (name) => {
    const centered = CENTERED_SHAPES.has(name) || !desktop;
    return {
      x: centered ? 0 : viewW * 0.25,
      // On narrow screens the text sits on top, so the shape recedes
      scale: (SHAPE_SCALE[name] ?? 1) * (desktop ? Math.min(0.85, viewH / 7.8) : Math.min(0.72, viewW / 6.2)),
      opacity: SHAPE_OPACITY[name] ?? (desktop ? (centered ? 0.45 : 1) : 0.45),
    };
  };
  let layout = layoutFor(shapeName);
  group.position.x = layout.x;
  group.scale.setScalar(layout.scale);

  const morphTo = (name) => {
    if (name === shapeName || !SHAPES[name]) return;
    // Freeze wherever each particle currently is (same easing as the shader) as the new start
    const p = uniforms.uProgress.value;
    for (let i = 0; i < count; i++) {
      const d = Math.min(Math.max((p - randoms[i] * 0.35) / 0.65, 0), 1);
      const e = smooth(d);
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k;
        from[j] = from[j] + (to[j] - from[j]) * e;
      }
    }
    to.set(getShape(name));
    fromAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    uniforms.uProgress.value = reducedMotion ? 1 : 0;
    shapeName = name;
    layout = layoutFor(name);
  };

  // ─── Input ───
  const raycaster = new THREE.Raycaster();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y);
  const floorHit = new THREE.Vector3();
  const pointerNdc = new THREE.Vector2();
  // `fine` = a mouse or pen, the only pointers that get the lens and the black hole
  const pointer = { x: 0, y: 0, active: false, fine: false };
  const setPointer = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointer.active = true;
    pointer.fine = e.pointerType !== 'touch';
  };
  const onPointerLeave = () => { pointer.active = false; };
  const onResize = () => { resize(); layout = layoutFor(shapeName); };

  // Press and hold on empty space to make a black hole; let go for a supernova
  const gravity = { armed: false, holding: false, held: 0, hole: 0, mass: 0, swirl: 0, burstAge: 1e3, burstPower: 0, shockPower: 0 };
  const setHolding = (on) => {
    gravity.holding = on;
    document.documentElement.style.userSelect = on ? 'none' : '';
    window.dispatchEvent(new CustomEvent('cosmos:hole', { detail: on }));
  };
  const onPointerDown = (e) => {
    setPointer(e);
    if (reducedMotion || e.pointerType === 'touch' || e.button !== 0 || e.target.closest?.(INTERACTIVE)) return;
    gravity.armed = true;
    gravity.held = 0;
  };
  // Gravitational wave on the spacetime floor, from wherever the pointer is
  const rippleFloor = (amplitude) => {
    raycaster.setFromCamera(pointerNdc.set(pointer.x, pointer.y), camera);
    const hit = raycaster.ray.intersectPlane(floor, floorHit);
    if (hit) spacetime.ripple.set(hit.x, hit.z, 0, amplitude);
    else spacetime.ripple.set(pointer.x * viewW * 0.5, -5, 0, amplitude);
  };

  // A quick click on empty space is a small gravitational wave: a gentle shockwave, a jolt
  // through the particles and the floor
  // Particles only get a nudge; the visible shockwave carries the effect
  const RIPPLE_JOLT = 0.05;
  const RIPPLE_SHOCK = 0.4;
  const ripple = () => {
    if (reducedMotion) return;
    // Don't cut a real supernova short
    if (gravity.burstAge < 1.5 && gravity.burstPower > RIPPLE_JOLT) return;
    gravity.burstAge = 0;
    gravity.burstPower = RIPPLE_JOLT;
    gravity.shockPower = RIPPLE_SHOCK;
    uniforms.uBurstCenter.value.set(pointer.x * viewW * 0.5, pointer.y * viewH * 0.5, 0);
    fx.uShock.value.set(pointer.x * camera.aspect, pointer.y, 0);
    rippleFloor(1);
    window.dispatchEvent(new CustomEvent('cosmos:ripple', { detail: 0.22 }));
  };

  const onPointerUp = (e) => {
    gravity.armed = false;
    if (!gravity.holding) {
      if (e.type === 'pointerup' && e.button === 0 && !e.target.closest?.(INTERACTIVE)) ripple();
      return;
    }
    setHolding(false);
    if (e.type === 'pointerup') {
      window.dispatchEvent(new CustomEvent('cosmos:burst', { detail: gravity.hole }));
      gravity.burstAge = 0;
      gravity.burstPower = gravity.hole;
      gravity.shockPower = gravity.hole;
      uniforms.uBurstCenter.value.copy(mouseWorld);
      fx.uShock.value.set(pointer.x * camera.aspect, pointer.y, 0);
      rippleFloor(2.5);
    }
  };

  window.addEventListener('pointermove', setPointer, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });
  window.addEventListener('blur', onPointerUp);
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', onResize);

  // ─── Intro ───
  // Hero copy waits for the bang; the attribute lets it skip the wait on later visits
  const intro = { t: reducedMotion ? Infinity : 0, banged: false };
  const bang = () => {
    intro.banged = true;
    document.documentElement.dataset.bang = '1';
    window.dispatchEvent(new Event('cosmos:bang'));
  };
  if (reducedMotion) bang();
  const flashPos = new THREE.Vector3();

  // Big Crunch (from the Contact section) and wormhole page transitions
  const crunch = { t: -1 };
  const onCrunch = () => {
    if (reducedMotion) {
      window.scrollTo({ top: 0 });
      window.dispatchEvent(new Event('cosmos:crunched'));
      return;
    }
    crunch.t = 0;
  };
  const tunnel = { t: -1 };
  const onWormhole = () => { if (!reducedMotion) tunnel.t = 0; };
  window.addEventListener('cosmos:crunch', onCrunch);
  window.addEventListener('cosmos:wormhole', onWormhole);

  // ─── Loop ───
  let last = performance.now();
  let frame = 0;
  let sinceCheck = 0;
  let running = true;
  const mouseWorld = new THREE.Vector3(99, 99, 0);
  const mouseTarget = new THREE.Vector3();
  const lens = new THREE.Vector2(99, 99);
  const lensTarget = new THREE.Vector2();
  const groupScreen = new THREE.Vector3();
  // The black hole section: its own lens + shadow, Kepler-spinning disk, and the grid's opacity
  const scenic = { hole: 0, disk: 0, phase: 0, grid: 0, wantGrid: false };

  const tick = () => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    sinceCheck += dt;
    if (sinceCheck > 0.15) {
      sinceCheck = 0;
      morphTo(pickShape(shapeName));
      scenic.wantGrid = wantsGrid();
    }

    // Last frame's transform, for the Doppler shift
    uniforms.uPrevModel.value.copy(group.matrixWorld);
    uniforms.uDt.value = dt;

    const still = STILL_SHAPES.has(shapeName);
    if (!reducedMotion) {
      uniforms.uTime.value += dt;
      uniforms.uProgress.value = Math.min(uniforms.uProgress.value + dt / MORPH_SECONDS, 1);
      if (still) {
        // Turn to face the camera (nearest full turn) instead of spinning
        const facing = Math.round(group.rotation.y / (Math.PI * 2)) * Math.PI * 2;
        group.rotation.y += (facing - group.rotation.y) * Math.min(1, dt * 2);
      } else {
        group.rotation.y += dt * 0.07;
      }
    }

    // Ease the sky toward this section's mood
    const mood = MOODS[shapeName] ?? MOODS.planet;
    const km = Math.min(1, dt * 1.2);
    fx.uTint.value.x += (mood.tint[0] - fx.uTint.value.x) * km;
    fx.uTint.value.y += (mood.tint[1] - fx.uTint.value.y) * km;
    fx.uTint.value.z += (mood.tint[2] - fx.uTint.value.z) * km;
    fx.uGain.value += (mood.gain - fx.uGain.value) * km;
    fx.uSat.value += (mood.sat - fx.uSat.value) * km;

    const isHole = shapeName === 'blackhole';
    scenic.hole += ((isHole ? smooth(uniforms.uProgress.value) : 0) - scenic.hole) * Math.min(1, dt * 3);
    if (scenic.hole < 0.002) scenic.hole = 0;
    scenic.disk += ((isHole && !reducedMotion ? 1 : 0) - scenic.disk) * Math.min(1, dt * 2);
    if (scenic.disk < 0.002) scenic.disk = 0;
    scenic.phase = scenic.disk > 0 ? scenic.phase + dt : 0;
    uniforms.uDiskSpin.value = scenic.disk;
    uniforms.uDiskPhase.value = scenic.phase;
    uniforms.uDiskStep.value = dt;

    // Ease toward the layout for the current shape and tilt slightly toward the pointer
    const k = 1 - Math.pow(0.02, dt);
    group.position.x += (layout.x - group.position.x) * k;
    const s = group.scale.x + (layout.scale - group.scale.x) * k;
    group.scale.setScalar(s);
    uniforms.uOpacity.value += (layout.opacity - uniforms.uOpacity.value) * k;
    group.rotation.x += (pointer.y * 0.12 + 0.08 - group.rotation.x) * k;

    if (pointer.active) mouseTarget.set(pointer.x * viewW * 0.5, pointer.y * viewH * 0.5, 0);
    else mouseTarget.set(99, 99, 0);
    mouseWorld.lerp(mouseTarget, pointer.active ? 0.2 : 1);
    uniforms.uWell.value.copy(mouseWorld);

    // ─── Gravity ───
    if (gravity.armed && !gravity.holding) {
      gravity.held += dt;
      if (gravity.held >= HOLD_DELAY) {
        setHolding(true);
        window.getSelection()?.removeAllRanges();
      }
    }
    // The hole grows slowly and collapses fast
    const holeTarget = gravity.holding ? 1 : 0;
    gravity.hole += (holeTarget - gravity.hole) * Math.min(1, dt * (gravity.holding ? 1.6 : 6));
    if (gravity.hole < 0.002) gravity.hole = 0;
    gravity.swirl = gravity.hole > 0 ? gravity.swirl + dt * (1.2 + 3 * gravity.hole) : 0;
    gravity.mass += ((pointer.active && !reducedMotion ? 1 : 0) - gravity.mass) * Math.min(1, dt * 4);

    gravity.burstAge += dt;
    const ba = gravity.burstAge;
    const burst = ba < 4 ? gravity.burstPower * (1 - Math.exp(-ba * 14)) * Math.exp(-ba * 1.8) * 2.2 : 0;

    uniforms.uMass.value = gravity.mass;
    uniforms.uHole.value = gravity.hole;
    uniforms.uSwirl.value = gravity.swirl;
    uniforms.uBurst.value = burst;

    // Lens follows the cursor a touch behind, like it has weight. In the black hole section the
    // lens sits on the hole instead, until the visitor makes their own
    const aspect = camera.aspect;
    const showLens = pointer.active && pointer.fine;
    groupScreen.copy(group.position).project(camera);
    const cursorWeight = scenic.hole > 0 ? gravity.hole : 1;
    const cursorEinstein = showLens ? EINSTEIN_HOVER + (EINSTEIN_HOLE - EINSTEIN_HOVER) * gravity.hole : 0;
    const sceneShadow = (1.0 * group.scale.x) / (viewH * 0.5);
    const einstein = cursorEinstein * cursorWeight + sceneShadow * 1.3 * scenic.hole * (1 - cursorWeight);
    if (showLens) lensTarget.set(pointer.x * aspect, pointer.y);
    else lensTarget.copy(lens);
    lensTarget.lerp(pointerNdc.set(groupScreen.x * aspect, groupScreen.y), 1 - cursorWeight);
    lens.lerp(lensTarget, lens.x > 50 ? 1 : Math.min(1, dt * 14));
    fx.uEinstein.value += (einstein - fx.uEinstein.value) * Math.min(1, dt * 6);
    fx.uLens.value.copy(lens);
    fx.uHole.value = Math.max(gravity.hole, scenic.hole);
    fx.uShadow.value = SHADOW * gravity.hole * cursorWeight + sceneShadow * scenic.hole * (1 - cursorWeight);
    fx.uSpin.value = gravity.swirl * 0.6 + scenic.phase * 0.8;
    fx.uShock.value.z = ba * 1.5;
    fx.uShockAmp.value = ba < 4 ? gravity.shockPower * Math.exp(-ba * 1.4) * Math.min(1, ba * 20) : 0;

    // ─── Intro ───
    if (intro.t < SINGULARITY_SECONDS + BANG_SECONDS + 2) {
      intro.t += dt;
      const since = intro.t - SINGULARITY_SECONDS;
      if (since >= 0 && !intro.banged) bang();
      uniforms.uBang.value = Math.min(Math.max(since / BANG_SECONDS, 0), 1);
      flashPos.copy(group.position).project(camera);
      const flash = since < 0
        ? (0.25 + 0.2 * Math.sin(intro.t * 22)) * (intro.t / SINGULARITY_SECONDS)
        : 1.8 * Math.exp(-since * 3.2);
      fx.uFlash.value.set(flashPos.x * aspect, flashPos.y, flash);
      fx.uReveal.value = since < 0 ? 0 : smooth(Math.min(since / 2, 1));
    } else {
      fx.uFlash.value.z = 0;
      fx.uReveal.value = 1;
    }

    // ─── Big Crunch ───
    if (crunch.t >= 0) {
      crunch.t += dt;
      const c = Math.min(crunch.t / CRUNCH_SECONDS, 1);
      uniforms.uBang.value = 1 - smooth(c);
      fx.uReveal.value = 1 - smooth(Math.min(crunch.t / (CRUNCH_SECONDS * 0.8), 1));
      flashPos.copy(group.position).project(camera);
      fx.uFlash.value.set(flashPos.x * aspect, flashPos.y, 0.6 * c * c);
      if (c >= 1) {
        // Back to the beginning: the next frame is the singularity again
        crunch.t = -1;
        window.scrollTo({ top: 0, behavior: 'instant' });
        intro.t = 0;
        intro.banged = false;
        window.dispatchEvent(new Event('cosmos:crunched'));
      }
    }

    // ─── Wormhole ───
    let tunnelAmt = 0;
    if (tunnel.t >= 0) {
      tunnel.t += dt;
      const t = tunnel.t;
      if (t < WORMHOLE_IN) tunnelAmt = (t / WORMHOLE_IN) ** 2;
      else if (t < WORMHOLE_IN + WORMHOLE_HOLD) tunnelAmt = 1;
      else tunnelAmt = 1 - smooth(Math.min((t - WORMHOLE_IN - WORMHOLE_HOLD) / WORMHOLE_OUT, 1));
      if (t > WORMHOLE_IN + WORMHOLE_HOLD + WORMHOLE_OUT) tunnel.t = -1;
    }
    fx.uTunnel.value = tunnelAmt;
    fx.uTravel.value += dt * tunnelAmt * 1.6;
    // Fly the camera into the particles
    camera.position.z = 7.5 - 5.5 * smooth(tunnelAmt);
    spacetime.ripple.z += dt;

    // Warp speed widens the field of view a little; the wormhole a lot
    const fov = 45 + fx.uWarp.value * 9 + tunnelAmt * 35;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // ─── Spacetime grid: a well under the shape, another under the cursor ───
    scenic.grid += ((scenic.wantGrid ? 1 : 0) - scenic.grid) * Math.min(1, dt * 2.5);
    spacetime.object.visible = scenic.grid > 0.003;
    spacetime.opacity.value = scenic.grid * fx.uReveal.value;
    if (spacetime.object.visible) {
      // Set a little behind the shape, so the funnel shows instead of falling below the screen
      spacetime.wells[0].set(group.position.x, -3, isHole ? 2.2 : 1.2, isHole ? 0.6 : 1.0);
      raycaster.setFromCamera(pointerNdc.set(pointer.x, pointer.y), camera);
      const hit = pointer.active && raycaster.ray.intersectPlane(floor, floorHit);
      const cursorMass = hit ? 0.35 * gravity.mass + 2.4 * gravity.hole : 0;
      if (hit) spacetime.wells[1].set(floorHit.x, floorHit.z, cursorMass, 0.5);
      else spacetime.wells[1].z = 0;
    }

    pointerNdc.set(pointer.x, pointer.y);
    backdrop.update(dt, pointerNdc);
    backdrop.renderNebula();
    renderer.render(scene, camera);
  };

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frame);
    } else if (!running) {
      running = true;
      last = performance.now();
      tick();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  tick();

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', setPointer);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('blur', onPointerUp);
    window.removeEventListener('cosmos:crunch', onCrunch);
    window.removeEventListener('cosmos:wormhole', onWormhole);
    document.documentElement.style.userSelect = '';
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    geometry.dispose();
    material.dispose();
    backdrop.dispose();
    spacetime.dispose();
    renderer.dispose();
  };
}

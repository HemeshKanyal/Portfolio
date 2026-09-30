import * as THREE from 'three';
import { SHAPES, CENTERED_SHAPES } from './shapes';
import { createBackdrop } from './backdrop';

// Palette mirrors tailwind.config.js
const STARLIGHT = new THREE.Color('#ece8df');
const GOLD = new THREE.Color('#f2c46d');
const NEBULA = new THREE.Color('#7c8cff');

const MORPH_SECONDS = 1.7;

// The hero planet is the first impression, so it gets to be the biggest thing on screen
const SHAPE_SCALE = { planet: 1.25 };

const particleVertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;
  attribute float aTone;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  uniform vec3 uStarlight;
  uniform vec3 uGold;
  uniform vec3 uNebula;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Staggered morph: each particle starts a little later than the last
    float d = clamp((uProgress - aRand * 0.35) / 0.65, 0.0, 1.0);
    float e = d * d * (3.0 - 2.0 * d);
    vec3 pos = mix(aFrom, aTo, e);

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

    vec4 world = modelMatrix * vec4(pos, 1.0);

    // Push particles away from the cursor (uMouse is on the z = 0 plane)
    vec2 dm = world.xy - uMouse.xy;
    float dist = length(dm);
    float force = smoothstep(1.2, 0.0, dist) * uMouseStrength;
    world.xy += normalize(dm + 0.0001) * force * 0.5;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand * 0.9) * uPixelRatio * (7.0 / -mv.z);

    vColor = aTone < 0.2 ? uGold : (aTone < 0.28 ? uNebula : uStarlight);
    vAlpha = (0.35 + 0.65 * fract(aRand * 7.31)) * (0.78 + 0.22 * sin(uTime * 1.4 + aRand * 60.0));
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
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseStrength: { value: reducedMotion ? 0 : 1 },
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
    desktop = w >= 1024 && camera.aspect > 1.1;
  };
  resize();

  const layoutFor = (name) => {
    const centered = CENTERED_SHAPES.has(name) || !desktop;
    return {
      x: centered ? 0 : viewW * 0.25,
      // On narrow screens the text sits on top, so the shape recedes
      scale: (SHAPE_SCALE[name] ?? 1) * (desktop ? Math.min(0.85, viewH / 7.8) : Math.min(0.72, viewW / 6.2)),
      opacity: desktop ? (centered ? 0.45 : 1) : 0.45,
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
  const pointer = { x: 0, y: 0, active: false };
  const onPointerMove = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointer.active = true;
  };
  const onPointerLeave = () => { pointer.active = false; };
  const onResize = () => { resize(); layout = layoutFor(shapeName); };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', onResize);

  // ─── Loop ───
  let last = performance.now();
  let frame = 0;
  let sinceCheck = 0;
  let running = true;
  const mouseWorld = new THREE.Vector3(99, 99, 0);
  const mouseTarget = new THREE.Vector3();
  const pointerNdc = new THREE.Vector2();

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
    }

    if (!reducedMotion) {
      uniforms.uTime.value += dt;
      uniforms.uProgress.value = Math.min(uniforms.uProgress.value + dt / MORPH_SECONDS, 1);
      group.rotation.y += dt * 0.07;
    }

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
    uniforms.uMouse.value.copy(mouseWorld);

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
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    geometry.dispose();
    material.dispose();
    backdrop.dispose();
    renderer.dispose();
  };
}

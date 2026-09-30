import * as THREE from 'three';

// Deep-space backdrop behind the morphing particles:
//   1. nebula clouds (domain-warped fbm) rendered at reduced resolution, then upscaled
//   2. a three-depth starfield with scroll + pointer parallax
//   3. an occasional shooting star
// Everything here is drawn in clip space, so it's independent of the 3D camera.

// Raw sRGB values (ShaderMaterial output isn't colour-managed); bg matches tailwind `background`
const BG = new THREE.Vector3(5, 6, 11).divideScalar(255);
const NEBULA_BLUE = new THREE.Vector3(124, 140, 255).divideScalar(255);
const NEBULA_VIOLET = new THREE.Vector3(120, 60, 190).divideScalar(255);
const STAR_GOLD = new THREE.Vector3(242, 196, 109).divideScalar(255);

const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const nebulaFragment = (octaves) => /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform vec3 uBlue;
  uniform vec3 uViolet;
  uniform vec3 uGold;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < ${octaves}; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    float t = uTime * 0.012;

    // Far gas: scrolls slowly, so it reads as very distant
    vec2 p = uv * 1.5 + uPointer * 0.04 + vec2(0.0, uScroll * 0.12);
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    float n = fbm(p + 1.9 * q);

    // Large-scale mask: separate clouds with dark gaps, not a uniform fog
    float mask = smoothstep(0.3, 0.78, fbm(uv * 0.55 + vec2(3.0, uScroll * 0.06) + 11.0));
    float density = smoothstep(0.28, 0.9, n) * mask;
    // Brighter filaments inside the clouds
    float glow = pow(smoothstep(0.55, 0.95, n), 2.0) * mask;

    vec3 col = mix(uViolet, uBlue, smoothstep(0.25, 0.85, q.x));
    col = mix(col, uGold, smoothstep(0.62, 0.95, q.y) * 0.35);

    // Near dust: finer grain, moves faster than the gas behind it
    vec2 p2 = uv * 3.4 + uPointer * 0.1 + vec2(0.0, uScroll * 0.32);
    float dust = smoothstep(0.58, 0.92, fbm(p2 - t * 1.8)) * mask;

    vec3 color = col * density * 0.55 + mix(uBlue, vec3(1.0), 0.3) * glow * 0.18 + uBlue * dust * 0.06;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const compositeFragment = /* glsl */ `
  uniform sampler2D uNebula;
  uniform vec3 uBg;
  varying vec2 vUv;
  void main() {
    vec3 nebula = texture2D(uNebula, vUv).rgb;
    // Soft vignette pulls the eye toward the centre
    float vig = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.6);
    gl_FragColor = vec4(uBg + nebula * vig, 1.0);
  }
`;

const starVertex = /* glsl */ `
  attribute float aDepth;
  attribute float aRand;
  attribute float aBright;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vBright;
  varying vec3 vColor;
  uniform vec3 uGold;
  uniform vec3 uBlue;

  void main() {
    // Nearer stars (aDepth → 1) move further for the same scroll / pointer movement
    float speed = mix(0.03, 0.34, aDepth);
    vec2 pos = position.xy;
    pos.y = mod(pos.y + uScroll * speed + 1.1, 2.2) - 1.1;
    pos += uPointer * speed * 0.06;
    gl_Position = vec4(pos, 0.0, 1.0);

    float size = mix(0.7, 2.4, aDepth) + aRand * 0.8;
    gl_PointSize = (aBright > 0.5 ? 22.0 + aRand * 12.0 : size) * uPixelRatio;

    float twinkle = 0.6 + 0.4 * sin(uTime * (0.5 + aRand * 1.5) + aRand * 80.0);
    vAlpha = mix(0.25, 0.85, aDepth) * twinkle;
    vBright = aBright;
    vColor = aRand < 0.12 ? uGold : (aRand > 0.85 ? uBlue : vec3(0.925, 0.91, 0.875));
  }
`;

const starFragment = /* glsl */ `
  varying float vAlpha;
  varying float vBright;
  varying vec3 vColor;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a;
    if (vBright > 0.5) {
      // Bright star: small core + diffraction spikes
      float core = pow(smoothstep(0.18, 0.0, d), 2.0);
      float spikes = max(0.0, 1.0 - abs(c.x) * 30.0) * smoothstep(0.5, 0.0, abs(c.y))
                   + max(0.0, 1.0 - abs(c.y) * 30.0) * smoothstep(0.5, 0.0, abs(c.x));
      a = core + spikes * 0.55;
    } else {
      a = smoothstep(0.5, 0.0, d);
    }
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const meteorVertex = /* glsl */ `
  uniform vec2 uHead;
  uniform vec2 uDir;
  uniform float uLength;
  uniform float uAspect;
  varying vec2 vLocal;

  void main() {
    // position.x ∈ [-0.5, 0.5] runs along the tail, position.y across it
    vLocal = position.xy + 0.5;
    vec2 perp = vec2(-uDir.y, uDir.x);
    vec2 p = uHead - uDir * vLocal.x * uLength + perp * position.y * 0.006;
    p.x /= uAspect;
    gl_Position = vec4(p, 0.0, 1.0);
  }
`;

const meteorFragment = /* glsl */ `
  uniform float uFade;
  varying vec2 vLocal;
  void main() {
    float along = pow(1.0 - vLocal.x, 2.5);
    float across = 1.0 - abs(vLocal.y - 0.5) * 2.0;
    gl_FragColor = vec4(0.97, 0.9, 0.75, along * across * uFade);
  }
`;

export function createBackdrop({ renderer, isSmall, reducedMotion, pixelRatio }) {
  // ─── Nebula, rendered off-screen at reduced resolution ───
  const nebulaScale = isSmall ? 0.3 : 0.45;
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  const quad = new THREE.PlaneGeometry(2, 2);

  const nebulaUniforms = {
    uTime: { value: Math.random() * 100 },
    uAspect: { value: 1 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uBlue: { value: NEBULA_BLUE },
    uViolet: { value: NEBULA_VIOLET },
    uGold: { value: STAR_GOLD },
  };
  const nebulaMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: nebulaFragment(isSmall ? 4 : 5),
    uniforms: nebulaUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const nebulaScene = new THREE.Scene();
  const nebulaMesh = new THREE.Mesh(quad, nebulaMaterial);
  nebulaMesh.frustumCulled = false;
  nebulaScene.add(nebulaMesh);
  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    uniforms: { uNebula: { value: target.texture }, uBg: { value: BG } },
    depthTest: false,
    depthWrite: false,
  });
  const composite = new THREE.Mesh(quad, compositeMaterial);
  composite.frustumCulled = false;
  composite.renderOrder = -2;

  // ─── Starfield ───
  const starCount = isSmall ? 700 : 1500;
  const brightCount = isSmall ? 10 : 22;
  const starPos = new Float32Array(starCount * 3);
  const depth = new Float32Array(starCount);
  const rand = new Float32Array(starCount);
  const bright = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = Math.random() * 2.2 - 1.1;
    starPos[i * 3 + 1] = Math.random() * 2.2 - 1.1;
    // Most stars far away, a few close
    depth[i] = Math.pow(Math.random(), 2.2);
    rand[i] = Math.random();
    bright[i] = i < brightCount ? 1 : 0;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
  starGeometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  starGeometry.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));

  const starUniforms = {
    uTime: nebulaUniforms.uTime,
    uScroll: { value: 0 },
    uPointer: nebulaUniforms.uPointer,
    uPixelRatio: { value: pixelRatio },
    uGold: { value: STAR_GOLD },
    uBlue: { value: NEBULA_BLUE },
  };
  const starMaterial = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: starUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  stars.renderOrder = -1;

  // ─── Shooting star ───
  const meteorUniforms = {
    uHead: { value: new THREE.Vector2() },
    uDir: { value: new THREE.Vector2(1, 0) },
    uLength: { value: 0.35 },
    uAspect: { value: 1 },
    uFade: { value: 0 },
  };
  const meteorMaterial = new THREE.ShaderMaterial({
    vertexShader: meteorVertex,
    fragmentShader: meteorFragment,
    uniforms: meteorUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const meteor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), meteorMaterial);
  meteor.frustumCulled = false;
  meteor.renderOrder = -1;
  meteor.visible = false;

  const meteorState = { wait: 4 + Math.random() * 6, age: 0, life: 0, start: new THREE.Vector2(), velocity: 0 };
  const launchMeteor = (aspect) => {
    // Start in the upper part of the sky on one side and fall diagonally toward the other
    const side = Math.random() < 0.5 ? -1 : 1;
    meteorState.start.set(-side * (0.1 + Math.random() * 0.8) * aspect, 0.5 + Math.random() * 0.5);
    const angle = (0.12 + Math.random() * 0.2) * Math.PI;
    meteorUniforms.uDir.value.set(side * Math.cos(angle), -Math.sin(angle));
    meteorState.velocity = 1.4 + Math.random() * 0.8;
    meteorState.life = 0.9 + Math.random() * 0.5;
    meteorState.age = 0;
    meteor.visible = true;
  };

  const resize = (w, h) => {
    target.setSize(Math.max(1, Math.round(w * nebulaScale)), Math.max(1, Math.round(h * nebulaScale)));
    nebulaUniforms.uAspect.value = w / h;
    meteorUniforms.uAspect.value = w / h;
  };

  let scroll = window.scrollY;

  const update = (dt, pointer) => {
    const screens = window.scrollY / window.innerHeight;
    // Ease scroll so fast flicks glide instead of jumping
    scroll += (screens - scroll) * Math.min(1, dt * 6);
    nebulaUniforms.uScroll.value = scroll;
    starUniforms.uScroll.value = scroll;
    nebulaUniforms.uPointer.value.lerp(pointer, Math.min(1, dt * 2));

    if (reducedMotion) return;
    nebulaUniforms.uTime.value += dt;

    if (meteor.visible) {
      meteorState.age += dt;
      const k = meteorState.age / meteorState.life;
      meteorUniforms.uHead.value
        .copy(meteorState.start)
        .addScaledVector(meteorUniforms.uDir.value, meteorState.velocity * meteorState.age);
      meteorUniforms.uFade.value = Math.sin(Math.min(k, 1) * Math.PI) * 0.9;
      if (k >= 1) {
        meteor.visible = false;
        meteorState.wait = 10 + Math.random() * 12;
      }
    } else {
      meteorState.wait -= dt;
      if (meteorState.wait <= 0) launchMeteor(nebulaUniforms.uAspect.value);
    }
  };

  // Called before the main scene render
  const renderNebula = () => {
    renderer.setRenderTarget(target);
    renderer.render(nebulaScene, orthoCamera);
    renderer.setRenderTarget(null);
  };

  const dispose = () => {
    target.dispose();
    quad.dispose();
    nebulaMaterial.dispose();
    compositeMaterial.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    meteor.geometry.dispose();
    meteorMaterial.dispose();
  };

  return { objects: [composite, stars, meteor], resize, update, renderNebula, dispose };
}

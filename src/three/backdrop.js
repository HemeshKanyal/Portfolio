import * as THREE from 'three';

// Deep-space backdrop behind the morphing particles:
//   1. nebula: emission gas with filaments, hot cores and dark dust lanes over a far and a near
//      layer, rendered off-screen (half-float, so no banding) and tone-mapped in the composite
//   2. a starfield with real star colours, clusters and glows, dimmed where dust lies in front
//   3. out-of-focus dust motes drifting close to the camera
//   4. an occasional shooting star
// Everything here is drawn in clip space, so it's independent of the 3D camera.
// `?bg=old` brings back the previous nebula for comparison.

// Raw sRGB values (ShaderMaterial output isn't colour-managed); bg matches tailwind `background`
const BG = new THREE.Vector3(5, 6, 11).divideScalar(255);
const NEBULA_BLUE = new THREE.Vector3(124, 140, 255).divideScalar(255);
const NEBULA_VIOLET = new THREE.Vector3(120, 60, 190).divideScalar(255);
const STAR_GOLD = new THREE.Vector3(242, 196, 109).divideScalar(255);
// Low-saturation emission accents: hydrogen-alpha rose and oxygen teal
const NEBULA_ROSE = new THREE.Vector3(170, 62, 104).divideScalar(255);
const NEBULA_TEAL = new THREE.Vector3(38, 128, 150).divideScalar(255);

// The Milky Way: a band across the sky in clip space, y = slope·x + offset, that scrolls with
// the star layer at depth BAND_DEPTH (so its stars and its glow move together) and repeats
// every 2.2 like the starfield wraps
const BAND = { slope: -0.42, offset: 0.3, width: 0.2, depth: 0.3 };
const BAND_SPEED = 0.03 + 0.31 * BAND.depth; // = the star shader's mix(0.03, 0.34, aDepth)

// Star colours by temperature (O/B → M) and how common each is in the sky we draw
const STAR_TYPES = [
  { share: 0.1, color: [0.66, 0.75, 1.0] },
  { share: 0.2, color: [0.93, 0.95, 1.0] },
  { share: 0.3, color: [1.0, 0.95, 0.86] },
  { share: 0.25, color: [1.0, 0.82, 0.6] },
  { share: 0.15, color: [1.0, 0.65, 0.5] },
];

const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const NOISE = /* glsl */ `
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
  uniform vec3 uRose;
  uniform vec3 uTeal;
  uniform float uBand;
  varying vec2 vUv;

  ${NOISE}

  const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < ${octaves}; i++) {
      v += a * noise(p);
      p = ROT * p;
      a *= 0.5;
    }
    return v;
  }

  // Ridged noise: sharp creases where plain noise crosses its midpoint, i.e. filaments
  float ridged(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < ${octaves}; i++) {
      float n = 1.0 - abs(noise(p) * 2.0 - 1.0);
      v += a * n * n;
      p = ROT * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    float t = uTime * 0.01;

    // ─── Far gas: domain-warped so it billows and folds ───
    vec2 p = uv * 1.3 + uPointer * 0.03 + vec2(t * 0.4, -uScroll * 0.08);
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 w = p + 1.7 * q;
    float n = fbm(w);

    // Separate clouds with real gaps between them, not an even fog
    float region = smoothstep(0.3, 0.7, fbm(uv * 0.45 + vec2(3.0, -uScroll * 0.05) + 11.0));
    float density = smoothstep(0.38, 0.95, n) * region;
    float filaments = smoothstep(0.3, 0.75, pow(ridged(w * 1.7 + 2.0), 2.2)) * region * smoothstep(0.28, 0.6, n);
    float core = pow(smoothstep(0.62, 1.0, n), 3.0) * region;

    // Emission colour drifts across the sky: teal oxygen, palette blue and violet, rose hydrogen.
    // fbm sits mostly in 0.35–0.65, hence the tight bands.
    float h = fbm(uv * 0.6 + q * 0.6 + vec2(7.0, -uScroll * 0.06));
    vec3 gas = mix(uTeal, uBlue, smoothstep(0.4, 0.47, h));
    gas = mix(gas, uViolet, smoothstep(0.5, 0.55, h));
    gas = mix(gas, uRose, smoothstep(0.55, 0.62, h));

    vec3 col = gas * density * 0.9
             + mix(gas, vec3(1.0), 0.2) * filaments * 0.85
             + mix(uGold, vec3(1.0), 0.35) * core * 0.8;

    // ─── Near wisps: finer, drift faster and move more with scroll, so the sky has depth ───
    vec2 p2 = uv * 2.6 + uPointer * 0.1 + vec2(-t * 1.6, -uScroll * 0.26);
    float n2 = fbm(p2 + q * 0.8);
    float wisp = pow(smoothstep(0.55, 0.92, n2), 2.0) * smoothstep(0.1, 0.7, region + 0.25);
    col += mix(gas, uBlue, 0.5) * wisp * 0.14;

    // ─── Dust lanes: dark absorption silhouetted against the glow ───
    float d = fbm(w * 2.3 + vec2(-3.0, -uScroll * 0.04));
    float lane = smoothstep(0.47, 0.6, d) * smoothstep(0.04, 0.3, density + filaments);
    col *= 1.0 - lane * 0.88;

    // ─── Milky Way: unresolved starlight with a dark rift down its middle ───
    // Same pointer parallax as the band's stars get in the star shader
    vec2 c = vUv * 2.0 - 1.0 - uPointer * ${(BAND_SPEED * 0.06).toFixed(4)};
    float along = c.x * 1.6 - uScroll * 0.1;
    // A gentle bow, so it isn't ruler-straight
    float bow = sin(along * 1.3 + 0.7) * 0.06;
    float by = mod(c.y - (${BAND.slope.toFixed(3)}) * c.x - ${BAND.offset.toFixed(3)} - uScroll * ${BAND_SPEED.toFixed(4)} - bow + 1.1, 2.2) - 1.1;
    // The band swells and pinches along its length
    float width = ${BAND.width.toFixed(3)} * (0.65 + 0.7 * fbm(vec2(along * 0.9, 9.0)));
    // Star clouds: bright clumps with darker gaps between them
    float clouds = 0.25 + 1.5 * smoothstep(0.38, 0.68, fbm(vec2(along * 1.6, by * 5.0) + 21.0));
    float band = exp(-by * by / (width * width)) * clouds;
    float bandCore = exp(-by * by / (width * width * 0.16)) * clouds;
    // Grain of countless faint stars
    float speckle = hash(floor(gl_FragCoord.xy)) * hash(floor(gl_FragCoord.xy) + 17.0);
    vec3 milky = mix(uBlue, vec3(0.8, 0.82, 0.95), 0.5) * band * 0.045
               + mix(uGold, vec3(1.0, 0.93, 0.82), 0.5) * bandCore * 0.11
               + mix(vec3(1.0, 0.92, 0.8), vec3(0.85, 0.9, 1.0), speckle) * speckle * band * 0.07;
    // The rift wanders along the band and breaks up into clumps
    float riftLine = by - (fbm(vec2(along * 2.0, 3.0)) - 0.5) * 0.16;
    float rift = exp(-riftLine * riftLine / (width * width * 0.12)) * smoothstep(0.36, 0.58, fbm(vec2(along * 3.0, by * 8.0) + 5.0));
    milky *= 1.0 - rift * 0.9;
    col = col + milky * uBand;
    lane = max(lane, rift * band * 0.9 * uBand);

    // Alpha carries how much dust lies in front of the far stars
    gl_FragColor = vec4(col, clamp(lane + density * 0.25, 0.0, 1.0));
  }
`;

// The previous nebula, kept for the ?bg=old comparison
const legacyNebulaFragment = (octaves) => /* glsl */ `
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

// Positions below are in "aspect space": y ∈ [-1, 1], x scaled by the aspect ratio, so circles stay round
const compositeFragment = /* glsl */ `
  uniform sampler2D uNebula;
  uniform vec3 uBg;
  uniform vec3 uGold;
  uniform float uAspect;
  uniform vec2 uLens;
  uniform float uEinstein;
  uniform float uHole;
  uniform float uShadow;
  uniform float uSpin;
  uniform vec3 uShock;   // xy centre, z radius
  uniform float uShockAmp;
  uniform vec3 uFlash;   // xy centre, z strength
  uniform float uReveal;
  uniform float uTunnel;
  uniform float uTime;
  uniform float uFilm;
  uniform vec3 uTint;
  uniform float uGain;
  uniform float uSat;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);
    vec2 screen = p;

    // Wormhole: the sky is pulled into a twisting throat at the centre of the screen
    if (uTunnel > 0.0) {
      float l = length(p);
      float twist = uTunnel * 2.2 / (l + 0.35);
      float c = cos(twist), s = sin(twist);
      p = mat2(c, -s, s, c) * p * (1.0 - 0.55 * uTunnel * smoothstep(1.6, 0.0, l));
    }

    // Point-mass lens: light from β reaches us at θ, where β = θ − θE²·θ/|θ|².
    // Inside the Einstein ring this mirrors the sky, which is what draws the ring.
    vec2 th = p - uLens;
    float t2 = max(dot(th, th), 1e-5);
    vec2 src = p - th * (uEinstein * uEinstein / t2);

    // The supernova shockwave refracts the gas it passes through
    vec2 ds = p - uShock.xy;
    float sd = length(ds);
    float wave = exp(-pow((sd - uShock.z) * 14.0, 2.0)) * uShockAmp;
    src += ds / max(sd, 1e-4) * wave * 0.05;

    vec3 nebula = texture2D(uNebula, src / vec2(uAspect, 1.0) * 0.5 + 0.5).rgb;
    // Soft vignette pulls the eye toward the centre
    float vig = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.6);
    nebula *= vig * uReveal;
    // Section mood: tint, brightness and saturation of the sky, eased by cosmos.js
    float luma = dot(nebula, vec3(0.299, 0.587, 0.114));
    nebula = mix(vec3(luma), nebula, uSat) * uTint * uGain;
    // Filmic shoulder: bright gas glows instead of clipping, faint gas keeps its colour
    nebula = mix(nebula, vec3(1.0) - exp(-nebula * 1.5), uFilm);
    vec3 col = uBg + nebula;
    col += mix(uGold, vec3(1.0), 0.3) * wave * 0.22;

    // Black hole: photon ring (brighter on the side spinning toward us) around a true-black shadow
    float tl = sqrt(t2);
    float ang = atan(th.y, th.x);
    float photon = exp(-pow((tl - uShadow * 1.08) / (uShadow * 0.13 + 1e-4), 2.0));
    photon *= 0.45 + 0.55 * (0.5 + 0.5 * cos(ang - uSpin));
    col += mix(uGold, vec3(1.0), 0.45) * photon * uHole;
    col *= 1.0 - uHole * smoothstep(uShadow, uShadow * 0.88, tl);

    // Big Bang: the singularity and its flash
    float fd = length(p - uFlash.xy);
    col += mix(uGold, vec3(1.0), 0.6) * uFlash.z * (exp(-fd * fd * 60.0) + 0.18 * exp(-fd * fd * 2.5));

    // Light at the end of the throat
    float tl2 = dot(screen, screen);
    col += mix(uGold, vec3(1.0), 0.5) * pow(uTunnel, 3.0) * (exp(-tl2 * 10.0) + 0.35 * exp(-tl2 * 1.5));

    // Film grain, about one 8-bit step: dithers away banding in the dark gradients
    float grain = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 91.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * (2.5 / 255.0) * uFilm;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const starVertex = /* glsl */ `
  attribute float aDepth;
  attribute float aRand;
  attribute float aBright;
  attribute float aMag;
  attribute vec3 aColor;
  uniform sampler2D uNebula;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uLens;
  uniform float uEinstein;
  uniform float uWarp;
  uniform float uReveal;
  uniform float uTunnel;
  uniform float uTravel;
  varying float vAlpha;
  varying float vBright;
  varying float vStretch;
  varying float vWarp;
  varying vec2 vDir;
  varying vec3 vColor;
  varying float vCore;
  varying float vHalo;
  uniform vec3 uGold;
  uniform vec3 uBlue;

  void main() {
    // Nearer stars (aDepth → 1) move further for the same scroll / pointer movement
    float speed = mix(0.03, 0.34, aDepth);
    vec2 pos = position.xy;
    pos.y = mod(pos.y + uScroll * speed + 1.1, 2.2) - 1.1;
    pos += uPointer * speed * 0.06;

    // Gravitational lensing: each star is seen at the outer image θ+ of a point lens,
    // so stars slide out of the way of the cursor and bunch up along the Einstein ring
    vec2 a = vec2(pos.x * uAspect, pos.y);
    vec2 beta = a - uLens;
    float b = length(beta) + 1e-5;
    a = uLens + beta / b * 0.5 * (b + sqrt(b * b + 4.0 * uEinstein * uEinstein));
    pos = vec2(a.x / uAspect, a.y);
    float u = b / max(uEinstein, 1e-4);
    float mag = uEinstein > 1e-4 ? min((u * u + 2.0) / (2.0 * u * sqrt(u * u + 4.0)) + 0.5, 4.0) : 1.0;

    // Wormhole flight: every star rushes outward from the centre and wraps back to the far end
    vDir = vec2(0.0, 1.0);
    float near = 0.0;
    if (uTunnel > 0.0) {
      float d = max(1.0 - fract(aRand * 7.13 + uTravel * (0.25 + aDepth * 0.75)), 0.04);
      a = vec2(pos.x * uAspect, pos.y);
      a = mix(a, a * 0.12 / d, uTunnel);
      pos = vec2(a.x / uAspect, a.y);
      vDir = normalize(a + 1e-4);
      near = (1.0 - d) * uTunnel;
    }
    gl_Position = vec4(pos, 0.0, 1.0);

    // Hyperspace: fast scrolling stretches stars into streaks, nearer stars more.
    // Most stars are faint pinpricks; brighter ones (aMag → 1) get a soft glow around the core.
    float size = (0.7 + aMag * 1.9 + aDepth * 0.6) * sqrt(mag);
    float glow = smoothstep(0.55, 0.95, aMag);
    float sprite = aBright > 0.5 ? 22.0 + aRand * 12.0 : size * (1.0 + glow * 5.0);
    float core = aBright > 0.5 ? 5.0 : size;
    float streak = core * (1.0 + max(uWarp * (0.25 + aDepth), near * 1.4) * 36.0);
    float px = min(max(sprite, streak), 160.0);
    gl_PointSize = px * uPixelRatio;
    vStretch = px / core;
    vCore = core / px;
    vHalo = max(glow, aBright);
    vWarp = smoothstep(0.04, 0.3, max(uWarp, uTunnel));

    // Dust lanes in the nebula hide the far stars behind them
    float dust = texture2D(uNebula, pos * 0.5 + 0.5).a;
    float shade = 1.0 - dust * 0.85 * (1.0 - aDepth);

    float twinkle = 0.65 + 0.35 * sin(uTime * (0.5 + aRand * 1.5) + aRand * 80.0);
    vAlpha = (0.2 + 0.8 * aMag) * mix(0.55, 1.0, aDepth) * twinkle * shade * min(mag, 2.5) * uReveal
           * (1.0 + uWarp * 0.6 + uTunnel * 1.5);
    vBright = aBright;
    vColor = aColor;
    // Blueshift as we race forward
    vColor = mix(vColor, mix(uBlue, vec3(1.0), 0.35), uWarp * 0.5);
  }
`;

const starFragment = /* glsl */ `
  varying float vAlpha;
  varying float vBright;
  varying float vStretch;
  varying float vWarp;
  varying vec2 vDir;
  varying vec3 vColor;
  varying float vCore;
  varying float vHalo;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // A star exactly as wide as the sprite when still; a thin streak along vDir when warping
    // (point-sprite y runs down the screen, hence the flip)
    vec2 dir = vec2(vDir.x, -vDir.y);
    float along = dot(c, dir);
    float across = dot(c, vec2(-dir.y, dir.x));
    float streak = smoothstep(0.5, 0.0, length(vec2(across * vStretch, along)));
    float a = streak;
    if (vHalo > 0.0) {
      // Glowing star: a tight core inside a soft halo; the brightest add diffraction spikes.
      // At warp it gives way to a streak.
      float d = length(c);
      float core = exp(-pow(d / (vCore * 0.5 + 1e-3), 2.0) * 2.0);
      float halo = exp(-d * d * 22.0) * 0.18 * vHalo;
      float spikes = (max(0.0, 1.0 - abs(c.x) * 30.0) * smoothstep(0.5, 0.0, abs(c.y))
                    + max(0.0, 1.0 - abs(c.y) * 30.0) * smoothstep(0.5, 0.0, abs(c.x))) * 0.55 * vBright;
      a = mix(core + halo + spikes, streak * 1.4, vWarp);
    }
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

// Out-of-focus dust right in front of the camera: big, faint discs with a brighter rim,
// moving much more than anything behind them
const moteVertex = /* glsl */ `
  attribute float aSize;
  attribute float aRand;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  uniform float uReveal;
  uniform float uTunnel;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 pos = position.xy;
    pos.x += sin(uTime * 0.05 + aRand * 20.0) * 0.08;
    pos.y = mod(pos.y + uScroll * (0.9 + aRand * 0.6) + uTime * 0.006 * (aRand - 0.3) + 1.3, 2.6) - 1.3;
    pos += uPointer * (0.1 + aRand * 0.08);
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    vAlpha = (0.02 + aRand * 0.03) * uReveal * (1.0 - uTunnel);
    vColor = aColor;
  }
`;

const moteFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float disc = smoothstep(1.0, 0.88, r);
    float rim = smoothstep(0.6, 0.93, r) * disc;
    gl_FragColor = vec4(vColor, (disc * 0.55 + rim * 0.45) * vAlpha);
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

const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

const pickStarColor = () => {
  let r = Math.random();
  for (const type of STAR_TYPES) {
    if ((r -= type.share) <= 0) return type.color;
  }
  return STAR_TYPES[STAR_TYPES.length - 1].color;
};

export function createBackdrop({ renderer, isSmall, reducedMotion, pixelRatio }) {
  const legacy = new URLSearchParams(window.location.search).get('bg') === 'old';

  // ─── Nebula, rendered off-screen at reduced resolution ───
  // The gas moves slowly, so while nothing else changes it's only redrawn every other frame
  const nebulaScale = legacy ? (isSmall ? 0.3 : 0.45) : isSmall ? 0.38 : 0.6;
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, type: THREE.HalfFloatType });
  const quad = new THREE.PlaneGeometry(2, 2);

  const nebulaUniforms = {
    uTime: { value: Math.random() * 100 },
    uAspect: { value: 1 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uBlue: { value: NEBULA_BLUE },
    uViolet: { value: NEBULA_VIOLET },
    uGold: { value: STAR_GOLD },
    uRose: { value: NEBULA_ROSE },
    uTeal: { value: NEBULA_TEAL },
    uBand: { value: 1 },
  };
  const nebulaMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: (legacy ? legacyNebulaFragment : nebulaFragment)(isSmall ? 4 : 5),
    uniforms: nebulaUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const nebulaScene = new THREE.Scene();
  const nebulaMesh = new THREE.Mesh(quad, nebulaMaterial);
  nebulaMesh.frustumCulled = false;
  nebulaScene.add(nebulaMesh);
  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Gravity + intro effects, written each frame by cosmos.js and shared by the composite and the stars
  const fx = {
    uAspect: { value: 1 },
    uLens: { value: new THREE.Vector2(99, 99) },
    uEinstein: { value: 0 },
    uHole: { value: 0 },
    uShadow: { value: 0 },
    uSpin: { value: 0 },
    uShock: { value: new THREE.Vector3(99, 99, 0) },
    uShockAmp: { value: 0 },
    uFlash: { value: new THREE.Vector3() },
    uReveal: { value: 1 },
    uWarp: { value: 0 },
    uTunnel: { value: 0 },
    uTravel: { value: 0 },
    uTint: { value: new THREE.Vector3(1, 1, 1) },
    uGain: { value: 1 },
    uSat: { value: 1 },
  };

  const compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    uniforms: {
      uNebula: { value: target.texture },
      uBg: { value: BG },
      uGold: { value: STAR_GOLD },
      uTime: nebulaUniforms.uTime,
      uFilm: { value: legacy ? 0 : 1 },
      ...fx,
    },
    depthTest: false,
    depthWrite: false,
  });
  const composite = new THREE.Mesh(quad, compositeMaterial);
  composite.frustumCulled = false;
  composite.renderOrder = -2;

  // ─── Starfield ───
  const fieldCount = isSmall ? 1100 : 2600;
  const bandCount = legacy ? 0 : isSmall ? 900 : 2200;
  const starCount = fieldCount + bandCount;
  const brightCount = isSmall ? 8 : 16;
  const starPos = new Float32Array(starCount * 3);
  const depth = new Float32Array(starCount);
  const rand = new Float32Array(starCount);
  const bright = new Float32Array(starCount);
  const magnitude = new Float32Array(starCount);
  const starColor = new Float32Array(starCount * 3);
  // A few loose clusters, so the sky isn't evenly salted
  const clusters = Array.from({ length: 5 }, () => [Math.random() * 2 - 1, Math.random() * 2.2 - 1.1, 0.04 + Math.random() * 0.08]);
  const clustered = Math.floor(starCount * 0.18);
  for (let i = 0; i < starCount; i++) {
    if (i >= fieldCount) {
      // Milky Way: piled up along the band's centre line, all at the band's depth
      const x = Math.random() * 2.2 - 1.1;
      const y = BAND.slope * x + BAND.offset + gauss() * BAND.width * 0.55;
      starPos[i * 3] = x;
      starPos[i * 3 + 1] = (((y + 1.1) % 2.2) + 2.2) % 2.2 - 1.1;
    } else if (i >= brightCount && i < brightCount + clustered) {
      const [cx, cy, spread] = clusters[i % clusters.length];
      starPos[i * 3] = cx + gauss() * spread;
      starPos[i * 3 + 1] = cy + gauss() * spread;
    } else {
      starPos[i * 3] = Math.random() * 2.2 - 1.1;
      starPos[i * 3 + 1] = Math.random() * 2.2 - 1.1;
    }
    // Most stars far away, a few close
    depth[i] = i >= fieldCount ? BAND.depth : Math.pow(Math.random(), 2.2);
    rand[i] = Math.random();
    bright[i] = i < brightCount ? 1 : 0;
    // Steep power law: lots of faint stars, very few bright ones (and the band's are fainter still)
    magnitude[i] = i < brightCount ? 1 : Math.pow(Math.random(), i >= fieldCount ? 5 : 3.5);
    starColor.set(i < brightCount && Math.random() < 0.5 ? [1.0, 0.86, 0.6] : pickStarColor(), i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
  starGeometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  starGeometry.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
  starGeometry.setAttribute('aMag', new THREE.BufferAttribute(magnitude, 1));
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColor, 3));

  const starUniforms = {
    uTime: nebulaUniforms.uTime,
    uScroll: { value: 0 },
    uPointer: nebulaUniforms.uPointer,
    uPixelRatio: { value: pixelRatio },
    uGold: { value: STAR_GOLD },
    uBlue: { value: NEBULA_BLUE },
    uNebula: { value: target.texture },
    ...fx,
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

  // ─── Dust motes near the camera ───
  const moteCount = isSmall ? 8 : 18;
  const motePos = new Float32Array(moteCount * 3);
  const moteSize = new Float32Array(moteCount);
  const moteRand = new Float32Array(moteCount);
  const moteColor = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = Math.random() * 2.4 - 1.2;
    motePos[i * 3 + 1] = Math.random() * 2.6 - 1.3;
    moteSize[i] = (isSmall ? 40 : 60) + Math.pow(Math.random(), 2) * (isSmall ? 90 : 160);
    moteRand[i] = Math.random();
    moteColor.set(Math.random() < 0.6 ? STAR_GOLD.toArray() : NEBULA_BLUE.toArray(), i * 3);
  }
  const moteGeometry = new THREE.BufferGeometry();
  moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  moteGeometry.setAttribute('aSize', new THREE.BufferAttribute(moteSize, 1));
  moteGeometry.setAttribute('aRand', new THREE.BufferAttribute(moteRand, 1));
  moteGeometry.setAttribute('aColor', new THREE.BufferAttribute(moteColor, 3));
  const moteMaterial = new THREE.ShaderMaterial({
    vertexShader: moteVertex,
    fragmentShader: moteFragment,
    uniforms: {
      uTime: nebulaUniforms.uTime,
      uScroll: starUniforms.uScroll,
      uPointer: nebulaUniforms.uPointer,
      uPixelRatio: { value: pixelRatio },
      uReveal: fx.uReveal,
      uTunnel: fx.uTunnel,
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(moteGeometry, moteMaterial);
  motes.frustumCulled = false;
  // In front of the particles: they're the closest thing to the camera
  motes.renderOrder = 5;
  motes.visible = !legacy;

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
    fx.uAspect.value = w / h;
    meteorUniforms.uAspect.value = w / h;
  };

  let scroll = window.scrollY / window.innerHeight;
  let lastScreens = scroll;
  let velocity = 0;

  const update = (dt, pointer) => {
    const screens = window.scrollY / window.innerHeight;
    // Ease scroll so fast flicks glide instead of jumping
    scroll += (screens - scroll) * Math.min(1, dt * 6);

    // Scroll speed in screens per second drives the hyperspace streaks
    if (dt > 0) velocity += ((screens - lastScreens) / dt - velocity) * Math.min(1, dt * 8);
    lastScreens = screens;
    const warp = reducedMotion ? 0 : Math.min(Math.max((Math.abs(velocity) - 0.8) / 4, 0), 1);
    fx.uWarp.value += (warp - fx.uWarp.value) * Math.min(1, dt * 5);

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
      meteorUniforms.uFade.value = Math.sin(Math.min(k, 1) * Math.PI) * 0.9 * fx.uReveal.value;
      if (k >= 1) {
        meteor.visible = false;
        meteorState.wait = 10 + Math.random() * 12;
      }
    } else {
      meteorState.wait -= dt;
      if (meteorState.wait <= 0) launchMeteor(nebulaUniforms.uAspect.value);
    }
  };

  // Called before the main scene render. Skips every other frame unless the view is moving.
  let nebulaFrame = 0;
  const lastDrawn = { scroll: NaN, x: NaN, y: NaN, aspect: NaN };
  const renderNebula = () => {
    const u = nebulaUniforms;
    const moving =
      Math.abs(u.uScroll.value - lastDrawn.scroll) > 1e-4 ||
      Math.abs(u.uPointer.value.x - lastDrawn.x) > 1e-4 ||
      Math.abs(u.uPointer.value.y - lastDrawn.y) > 1e-4 ||
      u.uAspect.value !== lastDrawn.aspect;
    if (!moving && nebulaFrame++ % 2 === 1) return;
    lastDrawn.scroll = u.uScroll.value;
    lastDrawn.x = u.uPointer.value.x;
    lastDrawn.y = u.uPointer.value.y;
    lastDrawn.aspect = u.uAspect.value;
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
    moteGeometry.dispose();
    moteMaterial.dispose();
    meteor.geometry.dispose();
    meteorMaterial.dispose();
  };

  return { objects: [composite, stars, motes, meteor], fx, resize, update, renderNebula, dispose };
}

import * as THREE from 'three';

// The rubber-sheet picture of gravity: a wireframe floor below the particles that sinks
// into a well under the current shape and another under the cursor.
// Each well dips the sheet by mass / sqrt(r² + softness²).

export const FLOOR_Y = -2.1;
const X_EXTENT = 14;
const Z_NEAR = 3;
const Z_FAR = -16;

const gridVertex = /* glsl */ `
  uniform vec4 uWells[2]; // x, z, mass, softness
  uniform vec4 uRipple;   // x, z, age, amplitude: a gravitational wave spreading from a click
  varying float vFade;
  varying float vGlow;

  void main() {
    vec3 p = position;
    float dip = 0.0;
    for (int i = 0; i < 2; i++) {
      vec2 d = p.xz - uWells[i].xy;
      dip += uWells[i].z / sqrt(dot(d, d) + uWells[i].w * uWells[i].w);
    }
    dip = min(dip, 4.0);
    p.y -= dip;

    float rr = length(p.xz - uRipple.xy) - uRipple.z * 7.0;
    float wave = uRipple.w * sin(rr * 2.2) * exp(-rr * rr * 0.12) * exp(-uRipple.z * 1.1);
    p.y += wave * 0.45;
    dip += abs(wave) * 1.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Fade toward the horizon, the sides and right under the camera
    vFade = smoothstep(${(-Z_FAR + 7).toFixed(1)}, 9.0, -mv.z) * smoothstep(${X_EXTENT.toFixed(1)}, 7.0, abs(p.x)) * smoothstep(3.0, 6.0, -mv.z);
    vGlow = clamp((dip - 0.35) * 0.55, 0.0, 1.0);
  }
`;

const gridFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uLine;
  uniform vec3 uGold;
  varying float vFade;
  varying float vGlow;

  void main() {
    vec3 col = mix(uLine, uGold, vGlow);
    gl_FragColor = vec4(col, uOpacity * vFade * (0.22 + vGlow * 0.6));
  }
`;

export function createSpacetime({ isSmall }) {
  const lines = isSmall ? 26 : 40;
  const steps = isSmall ? 70 : 120;
  const positions = [];
  const segment = (a, b) => positions.push(...a, ...b);

  // Lines running left–right, then lines running into the distance, each split into short
  // segments so the sheet can bend smoothly
  for (let i = 0; i <= lines; i++) {
    const z = Z_FAR + ((Z_NEAR - Z_FAR) * i) / lines;
    for (let s = 0; s < steps; s++) {
      const x0 = -X_EXTENT + (2 * X_EXTENT * s) / steps;
      const x1 = -X_EXTENT + (2 * X_EXTENT * (s + 1)) / steps;
      segment([x0, FLOOR_Y, z], [x1, FLOOR_Y, z]);
    }
  }
  for (let i = 0; i <= lines; i++) {
    const x = -X_EXTENT + (2 * X_EXTENT * i) / lines;
    for (let s = 0; s < steps; s++) {
      const z0 = Z_FAR + ((Z_NEAR - Z_FAR) * s) / steps;
      const z1 = Z_FAR + ((Z_NEAR - Z_FAR) * (s + 1)) / steps;
      segment([x, FLOOR_Y, z0], [x, FLOOR_Y, z1]);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const uniforms = {
    uWells: { value: [new THREE.Vector4(0, 0, 0, 1), new THREE.Vector4(0, 0, 0, 1)] },
    uRipple: { value: new THREE.Vector4(0, 0, 99, 0) },
    uOpacity: { value: 0 },
    uLine: { value: new THREE.Color('#7c8cff') },
    uGold: { value: new THREE.Color('#f2c46d') },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: gridVertex,
    fragmentShader: gridFragment,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.LineSegments(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  mesh.visible = false;

  const dispose = () => {
    geometry.dispose();
    material.dispose();
  };

  return { object: mesh, wells: uniforms.uWells.value, ripple: uniforms.uRipple.value, opacity: uniforms.uOpacity, dispose };
}

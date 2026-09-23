import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Hero scene: two server racks feed a core switch, which distributes traffic to
 * five client devices. Packets travel rack -> switch -> client (downstream, accent)
 * and back (upstream, neutral). Port LEDs, rack LEDs and client pads react to arrivals.
 */

export interface NetworkSceneOptions {
  reducedMotion: boolean;
  onReady?: () => void;
}

type ClientKind = 'laptop' | 'workstation' | 'monitor';

interface Link {
  kind: 'rack' | 'client';
  node: number;
  port: number;
  curve: THREE.CubicBezierCurve3;
  length: number;
  material: THREE.ShaderMaterial;
  revealDelay: number;
}

interface Packet {
  active: boolean;
  link: Link;
  t: number;
  dir: 1 | -1;
  downstream: boolean;
}

interface IntroItem {
  object: THREE.Object3D;
  baseY: number;
  delay: number;
}

interface ClientNode {
  ring: THREE.MeshBasicMaterial;
  screens: THREE.MeshBasicMaterial[];
  pulse: number;
}

interface LedBank {
  mesh: THREE.InstancedMesh;
  level: Float32Array;
  idle: Float32Array;
  nextBlink: Float32Array;
}

// Brand blue (Tailwind blue-500 for surfaces, blue-400 for emissive packets and LEDs).
const ACCENT = new THREE.Color(0x3b82f6);
const ACCENT_HOT = new THREE.Color(0x60a5fa).multiplyScalar(3.6);
const UPSTREAM_HOT = new THREE.Color(0xe2e8f0).multiplyScalar(1.9);
const LED_DIM = new THREE.Color(0x0b1a33);
// Linear value that lands on the hero background (slate-950, #020617) after ACES tone mapping at exposure 1.05.
const BACKGROUND = new THREE.Color().setRGB(0.00423, 0.00794, 0.0238, THREE.LinearSRGBColorSpace);

const MAX_PACKETS = 64;
const PACKET_SPEED = 2.4;
const PACKETS_START_AT = 1.7;

const CAMERA_TARGET = new THREE.Vector3(0.2, 0.75, 0.6);
const BASE_AZIMUTH = 0.68;
const BASE_ELEVATION = 0.5;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const FLOW_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLOW_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uLength;
  uniform float uDir;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    if (vUv.x > uReveal) discard;
    float dash = fract(vUv.x * uLength * 1.6 - uTime * 0.9 * uDir);
    float stripe = smoothstep(0.0, 0.12, dash) * (1.0 - smoothstep(0.28, 0.42, dash));
    float head = smoothstep(uReveal - 0.04, uReveal, vUv.x);
    vec3 color = uColor * (0.16 + stripe * 0.32 + head * 1.4);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const GRID_VERTEX = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const GRID_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vWorld;
  void main() {
    vec2 coord = vWorld.xz * 1.25;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);
    float fade = 1.0 - smoothstep(2.5, 8.5, length(vWorld.xz - vec2(0.3, 0.6)));
    gl_FragColor = vec4(uColor, line * fade * 0.1);
  }
`;

export class NetworkScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly pmrem: THREE.PMREMGenerator;
  private readonly resizeObserver: ResizeObserver;

  private readonly materials = {
    chassis: new THREE.MeshStandardMaterial({ color: 0x283040, metalness: 0.7, roughness: 0.34 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x434c5c, metalness: 0.6, roughness: 0.38 }),
    panelAlt: new THREE.MeshStandardMaterial({ color: 0x5b6577, metalness: 0.55, roughness: 0.36 }),
    inset: new THREE.MeshStandardMaterial({ color: 0x05070d, metalness: 0.2, roughness: 0.85 }),
    plinth: new THREE.MeshStandardMaterial({ color: 0x151b27, metalness: 0.4, roughness: 0.62 }),
    rail: new THREE.MeshStandardMaterial({ color: 0x7b8598, metalness: 0.9, roughness: 0.25 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x0b1120, metalness: 0.1, roughness: 0.95 }),
    led: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    accentLine: new THREE.MeshBasicMaterial({
      color: ACCENT.clone().multiplyScalar(2.4),
      toneMapped: false,
    }),
  };

  private readonly links: Link[] = [];
  private readonly rackLinks: Link[] = [];
  private readonly clientLinks: Link[] = [];
  private readonly packets: Packet[] = [];
  private readonly intro: IntroItem[] = [];
  private readonly clients: ClientNode[] = [];
  private readonly rackLeds: LedBank[] = [];
  private portLeds!: LedBank;
  private packetMesh!: THREE.InstancedMesh;

  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly tmpMatrix = new THREE.Matrix4();
  private readonly tmpQuat = new THREE.Quaternion();
  private readonly tmpVec = new THREE.Vector3();
  private readonly tmpTangent = new THREE.Vector3();
  private readonly tmpColor = new THREE.Color();
  private readonly packetAxis = new THREE.Vector3(1, 0, 0);
  private readonly unitScale = new THREE.Vector3(1, 1, 1);
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

  private elapsed = 0;
  private lastFrame = 0;
  private spawnTimer = 0;
  private running = false;
  private visible = true;
  private readyNotified = false;
  private cameraRadius = 15;
  private disposed = false;

  constructor(
    private readonly container: HTMLElement,
    private readonly options: NetworkSceneOptions,
  ) {
    const width = Math.max(container.clientWidth, 1);
    const isSmall = width < 768;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !isSmall;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = 'block size-full';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.renderer.domElement);

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.7;
    this.scene.background = BACKGROUND;
    this.scene.fog = new THREE.Fog(BACKGROUND, 22, 42);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, 400), 0.75, 0.55, 0.92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.buildLights(isSmall);
    this.buildFloor();
    this.buildTopology();
    this.buildPackets();

    if (options.reducedMotion) {
      this.applyStaticState();
    } else {
      this.updateIntro();
    }

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    if (!options.reducedMotion) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.updateLoop();
    }
  }

  /** Pause rendering while the hero is scrolled out of view. */
  setVisible(visible: boolean): void {
    this.visible = visible;
    this.updateLoop();
  }

  /** Development aid: simulate `seconds` of animation and render once (works while rAF is throttled). */
  advance(seconds: number): void {
    const step = 1 / 60;
    for (let t = 0; t < seconds; t += step) {
      this.elapsed += step;
      this.updateIntro();
      this.updateCamera(step);
      this.updatePackets(step);
      this.updateLeds(step);
      this.updateClients(step);
    }
    this.render();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((m) => materials.add(m));
      else if (material) materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => {
      const map = (material as THREE.MeshBasicMaterial).map;
      map?.dispose();
      material.dispose();
    });

    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  // ---------------------------------------------------------------------------
  // Scene construction
  // ---------------------------------------------------------------------------

  private buildLights(isSmall: boolean): void {
    this.scene.add(new THREE.HemisphereLight(0xdbe4f3, 0x0a0f1c, 1.1));

    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(5, 9, 6);
    key.castShadow = !isSmall;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x9fb4c8, 1.2);
    rim.position.set(-6, 4, -5);
    this.scene.add(rim);

    const core = new THREE.PointLight(ACCENT, 7, 5.5, 2);
    core.position.set(0, 1.5, 0.6);
    this.scene.add(core);
  }

  private buildFloor(): void {
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShaderMaterial({
        vertexShader: GRID_VERTEX,
        fragmentShader: GRID_FRAGMENT,
        uniforms: { uColor: { value: new THREE.Color(0x64748b) } },
        transparent: true,
        depthWrite: false,
      }),
    );
    grid.rotation.x = -Math.PI / 2;
    this.scene.add(grid);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.55 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.001;
    shadow.receiveShadow = true;
    this.scene.add(shadow);
  }

  private buildTopology(): void {
    const racks = [
      this.buildRack(new THREE.Vector3(-3.35, 0, -2.1), 0.42),
      this.buildRack(new THREE.Vector3(-1.95, 0, -2.75), 0.42),
    ];
    racks.forEach((rack, i) => this.addIntro(rack, i * 0.12));

    const switchGroup = this.buildSwitch();
    this.addIntro(switchGroup, 0.28);

    const clientLayout: { angle: number; kind: ClientKind }[] = [
      { angle: -20, kind: 'workstation' },
      { angle: 12, kind: 'laptop' },
      { angle: 42, kind: 'monitor' },
      { angle: 70, kind: 'workstation' },
      { angle: 98, kind: 'laptop' },
    ];
    const clientRadius = 3.85;
    const clientPositions = clientLayout.map(({ angle, kind }, i) => {
      const rad = THREE.MathUtils.degToRad(angle);
      const position = new THREE.Vector3(Math.cos(rad) * clientRadius + 0.3, 0, Math.sin(rad) * clientRadius);
      const group = this.buildClient(kind, position, i);
      this.addIntro(group, 0.45 + i * 0.09);
      return position;
    });

    // Cables. Every curve starts at the switch plinth so t=0 is always the switch side.
    const switchPorts = [24, 26];
    this.scene.updateMatrixWorld(true);
    racks.forEach((rack, i) => {
      const end = rack.localToWorld(new THREE.Vector3(0, 0.03, 0.72));
      this.rackLinks.push(this.createLink('rack', i, switchPorts[i], end, 0.95 + i * 0.08));
    });
    const clientPorts = [1, 4, 7, 14, 19];
    clientPositions.forEach((position, i) => {
      const toSwitch = new THREE.Vector3(-position.x, 0, -position.z).normalize();
      const end = position.clone().addScaledVector(toSwitch, 0.86).setY(0.03);
      this.clientLinks.push(this.createLink('client', i, clientPorts[i], end, 1.1 + i * 0.07));
    });
  }

  private buildRack(position: THREE.Vector3, rotationY: number): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotationY;
    this.scene.add(group);

    const width = 1.1;
    const height = 2.7;
    const depth = 1.0;
    const front = depth / 2;

    const body = this.mesh(new RoundedBoxGeometry(width, height, depth, 3, 0.035), this.materials.chassis);
    body.position.y = height / 2;
    group.add(body);

    const recess = this.mesh(new THREE.BoxGeometry(width - 0.12, height - 0.18, 0.02), this.materials.inset);
    recess.position.set(0, height / 2, front + 0.001);
    group.add(recess);

    for (const side of [-1, 1]) {
      const rail = this.mesh(new THREE.BoxGeometry(0.035, height - 0.2, 0.03), this.materials.rail);
      rail.position.set(side * (width / 2 - 0.075), height / 2, front + 0.015);
      group.add(rail);
    }

    const units = 8;
    const ledsPerUnit = 3;
    const baysPerUnit = 6;
    const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), this.materials.led, units * ledsPerUnit);
    const bays = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.16, 0.012), this.materials.inset, units * baysPerUnit);

    for (let u = 0; u < units; u++) {
      const y = 0.3 + u * 0.3;
      const unit = this.mesh(
        new RoundedBoxGeometry(width - 0.2, 0.25, 0.05, 2, 0.01),
        u % 3 === 2 ? this.materials.panelAlt : this.materials.panel,
      );
      unit.position.set(0, y, front + 0.025);
      group.add(unit);

      for (let l = 0; l < ledsPerUnit; l++) {
        this.tmpMatrix.makeTranslation(-0.36 + l * 0.06, y + 0.05, front + 0.055);
        leds.setMatrixAt(u * ledsPerUnit + l, this.tmpMatrix);
      }
      for (let b = 0; b < baysPerUnit; b++) {
        this.tmpMatrix.makeTranslation(-0.08 + b * 0.09, y, front + 0.052);
        bays.setMatrixAt(u * baysPerUnit + b, this.tmpMatrix);
      }
    }

    group.add(leds, bays);
    this.rackLeds.push(this.createLedBank(leds, 0.35));
    return group;
  }

  private buildSwitch(): THREE.Group {
    const group = new THREE.Group();
    this.scene.add(group);

    const plinth = this.mesh(new RoundedBoxGeometry(2.6, 0.5, 1.4, 2, 0.05), this.materials.plinth);
    plinth.position.y = 0.25;
    group.add(plinth);

    const trim = this.mesh(new THREE.BoxGeometry(2.3, 0.012, 0.012), this.materials.accentLine);
    trim.castShadow = false;
    trim.position.set(0, 0.46, 0.705);
    group.add(trim);

    const bodyHeight = 0.36;
    const body = this.mesh(new RoundedBoxGeometry(2.2, bodyHeight, 1.0, 2, 0.03), this.materials.panel);
    body.position.y = 0.5 + bodyHeight / 2;
    group.add(body);

    for (let v = 0; v < 9; v++) {
      const vent = this.mesh(new THREE.BoxGeometry(0.02, 0.004, 0.55), this.materials.inset);
      vent.castShadow = false;
      vent.position.set(0.25 + v * 0.08, 0.5 + bodyHeight + 0.002, -0.1);
      group.add(vent);
    }

    const copperPorts = 24;
    const sfpPorts = 4;
    const front = 0.5 + 0.004;
    const rows = [0.61, 0.75];

    const ports = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.08, 0.02), this.materials.inset, copperPorts);
    const sfp = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 0.06, 0.02), this.materials.inset, sfpPorts);
    const leds = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.022, 0.022, 0.012),
      this.materials.led,
      copperPorts + sfpPorts,
    );

    for (let i = 0; i < copperPorts; i++) {
      const x = -0.96 + (i % 12) * 0.13;
      const y = rows[i < 12 ? 1 : 0];
      this.tmpMatrix.makeTranslation(x, y, front);
      ports.setMatrixAt(i, this.tmpMatrix);
      this.tmpMatrix.makeTranslation(x + 0.035, y + (i < 12 ? 0.06 : -0.06), front + 0.004);
      leds.setMatrixAt(i, this.tmpMatrix);
    }
    for (let i = 0; i < sfpPorts; i++) {
      const x = 0.72 + (i % 2) * 0.18;
      const y = rows[i < 2 ? 1 : 0];
      this.tmpMatrix.makeTranslation(x, y, front);
      sfp.setMatrixAt(i, this.tmpMatrix);
      this.tmpMatrix.makeTranslation(x + 0.05, y + (i < 2 ? 0.06 : -0.06), front + 0.004);
      leds.setMatrixAt(copperPorts + i, this.tmpMatrix);
    }

    group.add(ports, sfp, leds);
    this.portLeds = this.createLedBank(leds, 0.25);
    return group;
  }

  private buildClient(kind: ClientKind, position: THREE.Vector3, index: number): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(position);
    this.scene.add(group);

    const pad = this.mesh(new THREE.CircleGeometry(0.78, 48), this.materials.pad);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.004;
    pad.castShadow = false;
    pad.receiveShadow = true;
    group.add(pad);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ACCENT.clone().multiplyScalar(1.4),
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      toneMapped: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.825, 64), ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.006;
    group.add(ring);

    const device = new THREE.Group();
    device.scale.setScalar(1.08);
    // Face the camera side so screens stay readable, with a slight per-device variation.
    device.rotation.y = BASE_AZIMUTH + (index - 2) * 0.12;
    group.add(device);

    const screens: THREE.MeshBasicMaterial[] = [];
    if (kind === 'laptop') {
      screens.push(this.buildLaptop(device, index));
    } else {
      screens.push(this.buildMonitor(device, index, kind === 'workstation' ? -0.18 : 0));
      if (kind === 'workstation') this.buildTower(device);
    }

    this.clients.push({ ring: ringMaterial, screens, pulse: 0 });
    return group;
  }

  private buildMonitor(parent: THREE.Group, seed: number, offsetX: number): THREE.MeshBasicMaterial {
    const base = this.mesh(new RoundedBoxGeometry(0.42, 0.025, 0.26, 2, 0.01), this.materials.chassis);
    base.position.set(offsetX, 0.0125, -0.05);
    const neck = this.mesh(new THREE.BoxGeometry(0.05, 0.42, 0.04), this.materials.rail);
    neck.position.set(offsetX, 0.23, -0.1);

    const housing = this.mesh(new RoundedBoxGeometry(1.15, 0.7, 0.05, 2, 0.02), this.materials.chassis);
    housing.position.set(offsetX, 0.74, -0.06);
    housing.rotation.x = -0.06;

    const screenMaterial = this.createScreenMaterial(seed);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.63), screenMaterial);
    screen.position.z = 0.0265;
    housing.add(screen);

    parent.add(base, neck, housing);
    return screenMaterial;
  }

  private buildTower(parent: THREE.Group): void {
    const tower = this.mesh(new RoundedBoxGeometry(0.26, 0.58, 0.56, 2, 0.02), this.materials.panel);
    tower.position.set(0.66, 0.29, -0.08);
    const strip = this.mesh(new THREE.BoxGeometry(0.012, 0.3, 0.008), this.materials.accentLine);
    strip.castShadow = false;
    strip.position.set(0.66, 0.34, 0.205);
    parent.add(tower, strip);
  }

  private buildLaptop(parent: THREE.Group, seed: number): THREE.MeshBasicMaterial {
    const base = this.mesh(new RoundedBoxGeometry(0.95, 0.035, 0.64, 2, 0.015), this.materials.panelAlt);
    base.position.y = 0.0175;
    const keyboard = this.mesh(new THREE.BoxGeometry(0.8, 0.004, 0.3), this.materials.inset);
    keyboard.castShadow = false;
    keyboard.position.set(0, 0.036, 0.02);

    const lid = new THREE.Group();
    lid.position.set(0, 0.035, -0.31);
    lid.rotation.x = -0.26;
    const shell = this.mesh(new RoundedBoxGeometry(0.95, 0.62, 0.024, 2, 0.01), this.materials.panelAlt);
    shell.position.y = 0.31;
    const screenMaterial = this.createScreenMaterial(seed);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.53), screenMaterial);
    screen.position.set(0, 0.315, 0.0125);
    lid.add(shell, screen);

    parent.add(base, keyboard, lid);
    return screenMaterial;
  }

  private createScreenMaterial(seed: number): THREE.MeshBasicMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 320, 190);
      gradient.addColorStop(0, '#0c1a36');
      gradient.addColorStop(1, '#070b14');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 320, 190);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, 0, 70, 190);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i === seed % 6 ? 'rgba(96,165,250,0.75)' : 'rgba(226,232,240,0.16)';
        ctx.fillRect(14, 22 + i * 24, 42, 7);
      }

      ctx.strokeStyle = 'rgba(96,165,250,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 10; x++) {
        const y = 104 - Math.sin(x * 0.85 + seed * 1.7) * 18 - x * 3.2;
        if (x === 0) ctx.moveTo(90, y);
        else ctx.lineTo(90 + x * 21, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(226,232,240,0.08)';
      ctx.fillRect(90, 140, 100, 32);
      ctx.fillRect(202, 140, 104, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, color: 0xd9d9d9 });
  }

  private createLink(kind: Link['kind'], node: number, port: number, end: THREE.Vector3, revealDelay: number): Link {
    // Leave the plinth from the edge facing the device, then run flat along the floor.
    const halfX = 1.3;
    const halfZ = 0.7;
    const direction = new THREE.Vector3(end.x, 0, end.z).normalize();
    const scale = Math.min(halfX / Math.max(Math.abs(direction.x), 1e-4), halfZ / Math.max(Math.abs(direction.z), 1e-4));
    const start = direction.clone().multiplyScalar(scale + 0.04).setY(0.03);

    const exitNormal =
      Math.abs(start.x) >= halfX - 0.01
        ? new THREE.Vector3(Math.sign(start.x), 0, 0)
        : new THREE.Vector3(0, 0, Math.sign(start.z));
    const span = start.distanceTo(end);
    const c1 = start.clone().addScaledVector(exitNormal, span * 0.45);
    const c2 = end.clone().lerp(start, 0.3);
    const curve = new THREE.CubicBezierCurve3(start, c1, c2, end);
    const length = curve.getLength();

    const material = new THREE.ShaderMaterial({
      vertexShader: FLOW_VERTEX,
      fragmentShader: FLOW_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uLength: { value: length },
        uDir: { value: kind === 'rack' ? -1 : 1 },
        uColor: { value: ACCENT.clone() },
      },
    });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.024, 8, false), material);
    this.scene.add(tube);

    const link: Link = { kind, node, port, curve, length, material, revealDelay };
    this.links.push(link);
    return link;
  }

  private buildPackets(): void {
    this.packetMesh = new THREE.InstancedMesh(
      new RoundedBoxGeometry(0.2, 0.055, 0.055, 2, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      MAX_PACKETS,
    );
    this.packetMesh.frustumCulled = false;
    for (let i = 0; i < MAX_PACKETS; i++) {
      this.packetMesh.setMatrixAt(i, this.hiddenMatrix);
      this.packetMesh.setColorAt(i, ACCENT_HOT);
      this.packets.push({ active: false, link: this.rackLinks[0], t: 0, dir: 1, downstream: true });
    }
    this.scene.add(this.packetMesh);
  }

  // ---------------------------------------------------------------------------
  // Runtime
  // ---------------------------------------------------------------------------

  private readonly frame = (): void => {
    const now = performance.now();
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.elapsed += dt;

    this.updateIntro();
    this.updateCamera(dt);
    this.updatePackets(dt);
    this.updateLeds(dt);
    this.updateClients(dt);
    this.render();
  };

  private updateLoop(): void {
    if (this.disposed || this.options.reducedMotion) return;
    const shouldRun = this.visible && this.container.clientWidth > 0;
    if (shouldRun === this.running) return;
    this.running = shouldRun;
    if (shouldRun) {
      this.lastFrame = performance.now();
      this.renderer.setAnimationLoop(this.frame);
    } else {
      this.renderer.setAnimationLoop(null);
    }
  }

  private render(): void {
    this.composer.render();
    if (!this.readyNotified) {
      this.readyNotified = true;
      this.options.onReady?.();
    }
  }

  private resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 1.75);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.bloom.resolution.set(width, height);

    // On wide layouts the canvas spans the whole hero; shift the projection so the
    // network sits to the right of the headline without changing the perspective.
    const shift = width >= 1024 ? width * 0.19 : 0;
    const fullWidth = width + shift * 2;
    this.camera.aspect = fullWidth / height;
    if (shift > 0) this.camera.setViewOffset(fullWidth, height, 0, 0, width, height);
    else this.camera.clearViewOffset();

    const visibleAspect = (shift > 0 ? width * 0.58 : width) / height;
    this.cameraRadius = THREE.MathUtils.clamp((shift > 0 ? 20.5 : 17.5) / Math.max(visibleAspect, 0.45) ** 0.6, 14, 28);
    this.camera.updateProjectionMatrix();
    this.updateCamera(1);

    if (this.options.reducedMotion || !this.running) this.render();
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    this.pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
  };

  private updateCamera(dt: number): void {
    this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-dt * 2.5));
    const drift = this.options.reducedMotion ? 0 : Math.sin(this.elapsed * 0.07) * 0.1;
    const azimuth = BASE_AZIMUTH + drift + this.pointer.x * 0.08;
    const elevation = BASE_ELEVATION + this.pointer.y * 0.035;
    const r = this.cameraRadius;
    this.camera.position.set(
      CAMERA_TARGET.x + r * Math.cos(elevation) * Math.sin(azimuth),
      CAMERA_TARGET.y + r * Math.sin(elevation),
      CAMERA_TARGET.z + r * Math.cos(elevation) * Math.cos(azimuth),
    );
    this.camera.lookAt(CAMERA_TARGET);
  }

  private updateIntro(): void {
    for (const item of this.intro) {
      const p = easeOutCubic(clamp01((this.elapsed - item.delay) / 0.9));
      item.object.visible = p > 0;
      item.object.position.y = item.baseY - (1 - p) * 0.8;
      item.object.scale.setScalar(0.7 + p * 0.3);
    }
    for (const link of this.links) {
      const reveal = easeOutCubic(clamp01((this.elapsed - link.revealDelay) / 0.85));
      link.material.uniforms['uReveal'].value = reveal * 1.02;
      link.material.uniforms['uTime'].value = this.elapsed;
    }
  }

  private updatePackets(dt: number): void {
    if (this.elapsed > PACKETS_START_AT) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = 0.12 + Math.random() * 0.22;
        this.spawnPacket(Math.random() < 0.62);
      }
    }

    for (let i = 0; i < this.packets.length; i++) {
      const packet = this.packets[i];
      if (!packet.active) continue;

      packet.t += (packet.dir * dt * PACKET_SPEED) / packet.link.length;
      if (packet.t <= 0 || packet.t >= 1) {
        this.arrive(packet);
        if (packet.active) this.packetMesh.setColorAt(i, packet.downstream ? ACCENT_HOT : UPSTREAM_HOT);
      }

      if (!packet.active) {
        this.packetMesh.setMatrixAt(i, this.hiddenMatrix);
        continue;
      }
      this.writePacketMatrix(i, packet);
    }
    this.packetMesh.instanceMatrix.needsUpdate = true;
    if (this.packetMesh.instanceColor) this.packetMesh.instanceColor.needsUpdate = true;
  }

  private writePacketMatrix(index: number, packet: Packet): void {
    const t = clamp01(packet.t);
    packet.link.curve.getPointAt(t, this.tmpVec);
    packet.link.curve.getTangentAt(t, this.tmpTangent);
    this.tmpVec.y += 0.045;
    this.tmpQuat.setFromUnitVectors(this.packetAxis, this.tmpTangent.normalize());
    this.tmpMatrix.compose(this.tmpVec, this.tmpQuat, this.unitScale);
    this.packetMesh.setMatrixAt(index, this.tmpMatrix);
  }

  private spawnPacket(downstream: boolean): void {
    const index = this.packets.findIndex((p) => !p.active);
    if (index === -1) return;
    const packet = this.packets[index];
    packet.active = true;
    packet.downstream = downstream;
    packet.link = downstream ? pick(this.rackLinks) : pick(this.clientLinks);
    packet.t = 1;
    packet.dir = -1;
    this.packetMesh.setColorAt(index, downstream ? ACCENT_HOT : UPSTREAM_HOT);

    if (downstream) this.flashRack(packet.link.node);
    else this.clients[packet.link.node].pulse = Math.max(this.clients[packet.link.node].pulse, 0.35);
  }

  private arrive(packet: Packet): void {
    const link = packet.link;
    if (packet.dir === -1) {
      // Reached the switch: light the port and forward to the next hop.
      this.portLeds.level[link.port] = 1;
      const next = packet.downstream ? pick(this.clientLinks) : pick(this.rackLinks);
      this.portLeds.level[next.port] = 1;
      packet.link = next;
      packet.t = 0;
      packet.dir = 1;
      return;
    }

    packet.active = false;
    if (link.kind === 'client') this.clients[link.node].pulse = 1;
    else this.flashRack(link.node);
  }

  private flashRack(rack: number): void {
    const bank = this.rackLeds[rack];
    bank.level[Math.floor(Math.random() * bank.level.length)] = 1;
  }

  private updateLeds(dt: number): void {
    for (const bank of [...this.rackLeds, this.portLeds]) {
      for (let i = 0; i < bank.level.length; i++) {
        bank.nextBlink[i] -= dt;
        if (bank.nextBlink[i] <= 0) {
          bank.nextBlink[i] = 0.4 + Math.random() * 3;
          bank.idle[i] = Math.random() < 0.7 ? 0.22 + Math.random() * 0.2 : 0.04;
        }
        bank.level[i] = Math.max(bank.level[i] - dt * 3.2, 0);
        const intensity = Math.max(bank.idle[i], bank.level[i]);
        this.tmpColor.copy(LED_DIM).lerp(ACCENT_HOT, intensity);
        bank.mesh.setColorAt(i, this.tmpColor);
      }
      if (bank.mesh.instanceColor) bank.mesh.instanceColor.needsUpdate = true;
    }
  }

  private updateClients(dt: number): void {
    for (const client of this.clients) {
      client.pulse = Math.max(client.pulse - dt * 1.6, 0);
      client.ring.opacity = 0.12 + client.pulse * 0.55;
      const brightness = 0.82 + client.pulse * 0.45;
      for (const screen of client.screens) screen.color.setScalar(brightness);
    }
  }

  /** Reduced motion: final layout, a handful of packets frozen mid-flight, no loop. */
  private applyStaticState(): void {
    this.elapsed = 10;
    this.updateIntro();
    const frozen = [...this.rackLinks, ...this.clientLinks];
    frozen.forEach((link, i) => {
      const packet = this.packets[i];
      packet.active = true;
      packet.link = link;
      packet.t = 0.55;
      packet.downstream = i % 3 !== 2;
      this.packetMesh.setColorAt(i, packet.downstream ? ACCENT_HOT : UPSTREAM_HOT);
      this.writePacketMatrix(i, packet);
    });
    this.packetMesh.instanceMatrix.needsUpdate = true;
    this.updateLeds(0);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private addIntro(object: THREE.Object3D, delay: number): void {
    this.intro.push({ object, baseY: object.position.y, delay });
  }

  private createLedBank(mesh: THREE.InstancedMesh, activeShare: number): LedBank {
    const count = mesh.count;
    const bank: LedBank = {
      mesh,
      level: new Float32Array(count),
      idle: new Float32Array(count),
      nextBlink: new Float32Array(count),
    };
    for (let i = 0; i < count; i++) {
      bank.idle[i] = Math.random() < activeShare ? 0.3 : 0.05;
      bank.nextBlink[i] = Math.random() * 2;
      mesh.setColorAt(i, LED_DIM);
    }
    return bank;
  }
}

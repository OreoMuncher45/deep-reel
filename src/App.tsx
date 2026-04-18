import { useEffect, useRef } from 'react';

// ─── STARDEW VALLEY COLOR PALETTE ────────────────────────────────────────────
const SDV = {
  oakDark:    '#2C1A0E',
  oakMid:     '#3D2410',
  oakLight:   '#5C3618',
  oakPlank:   '#6B4020',
  oakHighlight:'#8B5A2B',
  oakBezel:   '#A0722A',
  parchment:  '#F5E6C8',
  parchDark:  '#D4B896',
  parchFaded: '#A08060',
  uiGreen:    '#5CA020',
  uiGreenLt:  '#80D030',
  uiGreenDk:  '#3A6810',
  waterSurf:  '#3878B0',
  waterMid:   '#1A4878',
  waterDeep:  '#0A1E3C',
  waterFoam:  '#A8D8F8',
  common:     '#C8C8C8',
  uncommon:   '#5CB85C',
  rare:       '#4898F8',
  epic:       '#C868E8',
  legendary:  '#F8C820',
  danger:     '#E03020',
  dangerGlow: '#FF6040',
  coin:       '#F8C820',
  calm:       '#87CEEB',
  stormy:     '#445566',
  foggy:      '#8899AA',
  rainy:      '#334455',
  score:      '#F8C820',
  dmg:        '#E04020',
  miss:       '#CC4444',
};

const S = {
  TITLE: 0, DEPTH: 1, CAST_CHARGE: 2, CASTING: 3, WAITING: 4,
  BITE: 5, REEL: 6, CAUGHT: 7, MISS: 8, ZONE_CLEAR: 9,
  SHOP: 10, GAME_OVER: 11, WIN: 12, TROPHY: 13,
};

const WEATHER_TYPES = [
  { id: 'calm',   label: 'CALM',   icon: '☀',  biteBonus: 1.0,  speedMult: 1.0,  tensionMult: 1.0,  color: SDV.calm },
  { id: 'rainy',  label: 'RAINY',  icon: '🌧', biteBonus: 1.3,  speedMult: 1.1,  tensionMult: 1.1,  color: SDV.rainy },
  { id: 'stormy', label: 'STORMY', icon: '⛈', biteBonus: 0.7,  speedMult: 1.4,  tensionMult: 1.35, color: SDV.stormy },
  { id: 'foggy',  label: 'FOGGY',  icon: '🌫', biteBonus: 1.15, speedMult: 0.85, tensionMult: 0.85, color: SDV.foggy },
];

const ZONES = [
  { name: 'SUNNYSIDE POND',   pool: 's', casts: 8,  quota: 400,  bgSky: ['#6AB0E8','#4888C8','#3060A8'], bgWater: ['#2A7AC8','#1850A0','#0A2860'], stars: 0,  cloudCount: 4 },
  { name: 'PELICAN COVE',     pool: 'm', casts: 9,  quota: 800,  bgSky: ['#E8A060','#C07840','#8A3020'], bgWater: ['#1A6090','#0E3870','#061850'], stars: 10, cloudCount: 3 },
  { name: 'CINDERSAP DEPTHS', pool: 'm', casts: 10, quota: 1400, bgSky: ['#2A3040','#181C28','#0C0E18'], bgWater: ['#0A2848','#061428','#020810'], stars: 30, cloudCount: 2 },
  { name: 'GLITTERING GROTTO',pool: 'd', casts: 10, quota: 2200, bgSky: ['#180C30','#100820','#080410'], bgWater: ['#080418','#04020C','#020108'], stars: 50, cloudCount: 1 },
  { name: 'THE ABYSS',        pool: 'd', casts: 11, quota: 3500, bgSky: ['#060308','#030204','#010102'], bgWater: ['#030208','#010104','#000102'], stars: 80, cloudCount: 0 },
];

const FISH: Record<string, any> = {
  minnow:    { name:'MINNOW',          tier:1, pts:40,  coins:2,  fight:'drift',   w:18, h:8,  col:'#90C880', prob:{s:60,m:20,d:0},  danger:false, trophyColor:'#90C880', desc:'A tiny, harmless fish.' },
  perch:     { name:'PERCH',           tier:1, pts:60,  coins:3,  fight:'drift',   w:22, h:10, col:'#D4A840', prob:{s:40,m:25,d:0},  danger:false, trophyColor:'#D4A840', desc:'Common but tasty.' },
  carp:      { name:'CARP',            tier:1, pts:80,  coins:4,  fight:'shake',   w:26, h:12, col:'#C88020', prob:{s:25,m:35,d:5},  danger:false, trophyColor:'#C88020', desc:'A sturdy fighter.' },
  bass:      { name:'LARGEMOUTH BASS', tier:2, pts:140, coins:6,  fight:'shake',   w:30, h:13, col:'#607840', prob:{s:8, m:30,d:10}, danger:false, trophyColor:'#607840', desc:'Famous sport fish.' },
  catfish:   { name:'CATFISH',         tier:2, pts:180, coins:8,  fight:'surge',   w:34, h:14, col:'#706050', prob:{s:3, m:20,d:20}, danger:false, trophyColor:'#706050', desc:'Bottom dweller.' },
  pike:      { name:'PIKE',            tier:2, pts:220, coins:10, fight:'surge',   w:36, h:12, col:'#708850', prob:{s:2, m:15,d:15}, danger:false, trophyColor:'#708850', desc:'Aggressive predator.' },
  swordfish: { name:'SWORDFISH',       tier:3, pts:360, coins:18, fight:'erratic', w:42, h:14, col:'#6898C8', prob:{s:0, m:5, d:18}, danger:false, trophyColor:'#6898C8', desc:'The ocean champion.' },
  oarfish:   { name:'OARFISH',         tier:3, pts:500, coins:25, fight:'boss',    w:50, h:10, col:'#A878C0', prob:{s:0, m:2, d:12}, danger:false, trophyColor:'#A878C0', desc:'Sea serpent of legend.' },
  kraken:    { name:'KRAKEN',          tier:4, pts:900, coins:50, fight:'boss',    w:56, h:22, col:'#4830A0', prob:{s:0, m:0, d:4},  danger:false, trophyColor:'#4830A0', desc:'The end boss.' },
  moray:     { name:'MORAY EEL',       tier:3, pts:480, coins:22, fight:'erratic', w:44, h:9,  col:'#B84020', prob:{s:0, m:4, d:10}, danger:true,  trophyColor:'#B84020', desc:'DANGER: Snaps your line!', snapRate:0.018 },
  barracuda: { name:'BARRACUDA',       tier:3, pts:520, coins:24, fight:'surge',   w:40, h:11, col:'#C06828', prob:{s:0, m:3, d:12}, danger:true,  trophyColor:'#C06828', desc:'DANGER: Blazing fast!',  snapRate:0.014 },
  piranha:   { name:'PIRANHA',         tier:2, pts:280, coins:14, fight:'erratic', w:26, h:12, col:'#D03A1A', prob:{s:1, m:6, d:6},  danger:true,  trophyColor:'#D03A1A', desc:'DANGER: Pack hunter!',  snapRate:0.012 },
};
const FISH_LIST = Object.keys(FISH);

const BAIT_CATALOG = [
  { id:'worm',      name:'EARTHWORM',    cost:8,  uses:4, bonusTier:0, attract:1,   luckyBonus:false, col:'#C87840', desc:'Basic bait. Works on all fish.' },
  { id:'cricket',   name:'CRICKET',      cost:12, uses:3, bonusTier:1, attract:1.5, luckyBonus:false, col:'#909030', desc:'+50% chance for uncommon fish.' },
  { id:'squid',     name:'SQUID',        cost:18, uses:3, bonusTier:2, attract:1.8, luckyBonus:false, col:'#8090C8', desc:'Attracts rare sea fish.' },
  { id:'glowbug',   name:'GLOWBUG',      cost:22, uses:2, bonusTier:2, attract:2.0, luckyBonus:true,  col:'#70E090', desc:'Lucky! +30 base pts.' },
  { id:'bread',     name:'BREAD CRUST',  cost:6,  uses:5, bonusTier:0, attract:1,   luckyBonus:false, col:'#C8A040', desc:'Cheap and plentiful.' },
  { id:'explosive', name:'DEPTH CHARGE', cost:30, uses:1, bonusTier:3, attract:3.0, luckyBonus:false, col:'#E03020', desc:'GUARANTEED epic+ fish!' },
];
const ROD_UPGRADES = [
  { id:'reel1',     name:'SMOOTH REEL',   cost:20, type:'reel',      col:'#4080C8', desc:'Reel 25% faster.' },
  { id:'reel2',     name:'TURBO REEL',    cost:35, type:'reel',      col:'#2060A8', desc:'Reel 50% faster.' },
  { id:'turbo',     name:'OVERDRIVE',     cost:55, type:'reel',      col:'#1848A0', desc:'Reel 100% faster!' },
  { id:'ironline',  name:'IRON LINE',     cost:25, type:'tension',   col:'#A0A0C0', desc:'40% less tension.' },
  { id:'kevlar',    name:'KEVLAR LINE',   cost:45, type:'tension',   col:'#80C0F8', desc:'70% less tension!' },
  { id:'magnet',    name:'FISH MAGNET',   cost:30, type:'magnet',    col:'#C04040', desc:'Pulls zone toward cursor.' },
  { id:'deepmagnet',name:'DEEP MAGNET',   cost:50, type:'deepmagnet',col:'#A02020', desc:'Strong pull + anchor.' },
  { id:'anchor',    name:'ANCHOR PULSE',  cost:30, type:'anchor',    col:'#30D890', desc:'Brief auto-catch assist.' },
  { id:'calm',      name:'CALM WATERS',   cost:22, type:'calm',      col:'#60C8A0', desc:'Tension drains 2x.' },
  { id:'zen',       name:'ZEN MASTER',    cost:40, type:'zen',       col:'#A0E080', desc:'Tension drains 3x + auto.' },
  { id:'luckrod',   name:'LUCKY ROD',     cost:28, type:'accuracy',  col:'#F8C820', desc:'Score scales with accuracy.' },
  { id:'doubler',   name:'SCORE DOUBLER', cost:50, type:'doubler',   col:'#E868E8', desc:'All scores x1.5.' },
  { id:'castmaster',name:'CAST MASTER',   cost:35, type:'cast',      col:'#F8A040', desc:'Power cast bonus +20%.' },
  { id:'dangerrod', name:'DANGER ROD',    cost:40, type:'danger',    col:'#E03020', desc:'Danger fish snap 40% slower.' },
];
const LURES = [
  { id:'lucky',  name:'LUCKY CHARM',  cost:25, col:'#F8C820', desc:'First catch per zone: 2x score.' },
  { id:'chum',   name:'CHUM BUCKET',  cost:20, col:'#C87840', desc:'+2 casts per zone.' },
  { id:'depth',  name:'DEPTH SOUNDER',cost:30, col:'#38A0F8', desc:'Rare catches stack +15% mult.' },
  { id:'school', name:'SCHOOL LURE',  cost:28, col:'#60D8A0', desc:'Combo same species for bonus.' },
  { id:'moon',   name:'MOON LURE',    cost:22, col:'#C8C0F8', desc:'Odd zones: 1.5x score.' },
  { id:'rusty',  name:'RUSTY HOOK',   cost:15, col:'#A06830', desc:'Early reel still earns 120pts.' },
  { id:'golden', name:'GOLDEN WORM',  cost:40, col:'#F0A000', desc:'10% chance legendary spawn.' },
  { id:'charge', name:'DEPTH CHARGE', cost:35, col:'#E83020', desc:'Every 5 catches: free bonus fish.' },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const cx = canvas.getContext('2d')!;
    cx.imageSmoothingEnabled = false;

    // ── CANVAS SIZING ──────────────────────────────────────────────────────────
    // FIX: Increased max SCALE from 3.5 to fill the screen, ensuring crisp pixels
    let W = 320, H = 240, SCALE = 1;
    const IS_MOBILE = window.innerWidth < 600;

    function resizeCanvas() {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (IS_MOBILE) {
        // FIX: Use floor to avoid sub-pixel scaling that causes blur
        SCALE = Math.floor(Math.min(vw / 320, vh / 480));
        if (SCALE < 1) SCALE = 1;
        W = 320; H = 480;
      } else {
        // FIX: Allow scale up to fill screen (no arbitrary cap at 3.5)
        SCALE = Math.floor(Math.min(vw / 320, vh / 240));
        if (SCALE < 1) SCALE = 1;
        W = 320; H = 240;
      }
      canvas.width = W;
      canvas.height = H;
      canvas.style.width  = `${W * SCALE}px`;
      canvas.style.height = `${H * SCALE}px`;
      // FIX: Re-apply after resize as it resets
      cx.imageSmoothingEnabled = false;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── AUDIO ──────────────────────────────────────────────────────────────────
    let audioCtx: AudioContext | null = null;
    function getAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioCtx;
    }
    function beep(freq: number, dur: number, vol = 0.08, type: OscillatorType = 'square') {
      try {
        const a = getAudio();
        const o = a.createOscillator();
        const g2 = a.createGain();
        o.connect(g2); g2.connect(a.destination);
        o.type = type; o.frequency.value = freq;
        g2.gain.setValueAtTime(vol, a.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
        o.start(); o.stop(a.currentTime + dur);
      } catch {}
    }
    const SFX = {
      cast:      () => { beep(220, 0.1, 0.07); setTimeout(() => beep(330, 0.08), 80); },
      bite:      () => { beep(440, 0.06, 0.1); beep(660, 0.06, 0.08); },
      reel:      () => { beep(180, 0.04, 0.03); },
      caught:    () => { beep(523, 0.1); beep(659, 0.1); setTimeout(() => beep(784, 0.2, 0.1), 100); },
      miss:      () => { beep(150, 0.2, 0.07, 'sawtooth'); },
      buy:       () => { beep(660, 0.06); beep(880, 0.1, 0.08); },
      error:     () => { beep(110, 0.15, 0.08, 'sawtooth'); },
      zoneclear: () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => beep(f, 0.15, 0.09), i*80)); },
      trophy:    () => { [784,880,1047,1175].forEach((f,i) => setTimeout(() => beep(f, 0.2, 0.08), i*60)); },
      danger:    () => { beep(110, 0.05, 0.1, 'sawtooth'); },
      snap:      () => { beep(80, 0.3, 0.12, 'sawtooth'); },
      powercast: () => { beep(330, 0.05); setTimeout(() => beep(440, 0.05), 50); setTimeout(() => beep(660, 0.1, 0.1), 100); },
    };

    // ── GAME STATE ─────────────────────────────────────────────────────────────
    let state = S.TITLE;
    let g: any = {};
    let particles: any[] = [];
    let stars: any[] = [];
    let clouds: any[] = [];
    let underwaterFish: any[] = [];
    let rainDrops: any[] = [];
    let animId = 0;

    function genStars(count: number) {
      stars = Array.from({length: count}, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.5,
        size: Math.random() < 0.15 ? 2 : 1,
        twinkleOff: Math.random() * Math.PI * 2,
      }));
    }
    function genClouds(count: number) {
      clouds = Array.from({length: count}, () => ({
        x: Math.random() * W, y: 10 + Math.random() * 30,
        w: 30 + Math.random() * 50, h: 10 + Math.random() * 12,
        speed: 0.05 + Math.random() * 0.08,
        alpha: 0.5 + Math.random() * 0.4,
      }));
    }
    function genRain() {
      rainDrops = Array.from({length: 80}, () => ({
        x: Math.random() * W, y: Math.random() * H,
        speed: 2 + Math.random() * 2, len: 4 + Math.random() * 6,
      }));
    }
    function genUnderwaterFish(zone: number) {
      const count = 3 + zone;
      const colPalette = ['#2A8060', '#4060A0', '#208040', '#408890', '#306070'];
      underwaterFish = Array.from({length: count}, (_, i) => ({
        x: Math.random() * W, y: getWaterY() + 20 + Math.random() * (H - getWaterY() - 40),
        w: 8 + Math.random() * 12, h: 4 + Math.random() * 4,
        speed: 0.2 + Math.random() * 0.4,
        dir: Math.random() < 0.5 ? 1 : -1,
        t: Math.random() * Math.PI * 2,
        col: colPalette[i % colPalette.length],
        alpha: 0.15 + Math.random() * 0.2,
      }));
    }

    function pickWeather() {
      const roll = Math.random();
      if (roll < 0.40) return WEATHER_TYPES[0];
      if (roll < 0.65) return WEATHER_TYPES[1];
      if (roll < 0.80) return WEATHER_TYPES[2];
      return WEATHER_TYPES[3];
    }

    function newGame() {
      const z = ZONES[0];
      const weather = pickWeather();
      g = {
        zone: 0, score: 0, zScore: 0,
        castsLeft: z.casts, coins: 15,
        depthSel: 1, fish: null,
        biteDelay: 0, castT: 0,
        bobberX: W / 2, bobberY: 100,
        castAimX: W / 2, castAimY: 80,
        reel: null, timer: 0,
        baits: [], lures: [], upgrades: [],
        activeBait: null,
        catches: [], catchCount: 0, totalCatches: 0, totalCasts: 0,
        combo: 0, comboTimer: 0,
        firstFishZone: true,
        multBonus: 1,
        depthSounderMult: 0,
        castBonus: 0,
        shopTab: 0, shopSel: 0,
        shopBaits: [], shopUpgrades: [], shopLures: [],
        speciesCaught: {} as Record<string, number>,
        trophyWall: {} as Record<string, any>,
        waterT: 0,
        catchCardAnim: 0,
        consecutiveMisses: 0,
        newTrophyFish: null,
        weather,
        castChargeT: 0,
        castPower: 0,
        currentDir: Math.random() < 0.5 ? 1 : -1,
        currentStrength: 0,
        zoneClearNewTrophy: null,
      };
      if (weather.id === 'rainy' || weather.id === 'stormy') genRain();
      else rainDrops = [];
      genStars(ZONES[0].stars);
      genClouds(ZONES[0].cloudCount);
      genUnderwaterFish(0);
    }

    // ── HELPERS ────────────────────────────────────────────────────────────────
    function getWaterY(x = W / 2, t = g?.waterT || 0) {
      const base = IS_MOBILE ? H * 0.38 : 115;
      const wave = Math.sin((x / 40 + t) * 1.2) * 3 + Math.sin((x / 20 + t * 1.7) * 0.8) * 1.5;
      const stormExtra = g?.weather?.id === 'stormy' ? Math.sin((x / 15 + t * 2.5) * 2) * 4 : 0;
      return base + wave + stormExtra;
    }
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
    function hasLure(id: string) { return g.lures.some((l: any) => l.id === id); }
    function hasUpgrade(id: string) { return g.upgrades.some((u: any) => u.id === id); }
    function activeBaitData() {
      if (g.activeBait === null || !g.baits[g.activeBait]) return null;
      return g.baits[g.activeBait];
    }
    function reelSpeedMult() {
      let m = 1;
      if (hasUpgrade('reel1')) m += 0.25;
      if (hasUpgrade('reel2')) m += 0.50;
      if (hasUpgrade('turbo')) m += 1.00;
      return m;
    }
    function tensionBuildMult() {
      let m = 1;
      if (hasUpgrade('ironline')) m -= 0.40;
      if (hasUpgrade('kevlar'))   m -= 0.70;
      m *= g.weather.tensionMult;
      return Math.max(0.08, m);
    }
    function tensionDrainMult() {
      let m = 1;
      if (hasUpgrade('calm')) m += 1.0;
      if (hasUpgrade('zen'))  m += 2.0;
      return m;
    }
    function magnetStrength() {
      if (hasUpgrade('deepmagnet')) return 0.32;
      if (hasUpgrade('magnet'))     return 0.16;
      return 0;
    }
    function anchorStrength() {
      if (hasUpgrade('deepmagnet')) return 0.45;
      if (hasUpgrade('anchor'))     return 0.45;
      return 0;
    }
    function zenAutoRecover() { return hasUpgrade('zen') ? 0.80 : 0; }
    function scoreMult() {
      let m = 1;
      if (hasUpgrade('doubler')) m *= 1.5;
      return m;
    }
    function currentPool() {
      const p = ZONES[g.zone].pool;
      if (g.depthSel === 0 && p !== 'd') return 's';
      if (g.depthSel === 2 || p === 'd') return 'd';
      return 'm';
    }
    function pickFish(poolKey: string) {
      let list = FISH_LIST.filter(k => FISH[k].prob[poolKey] > 0);
      if (!list.length) list = ['minnow'];
      const ab = activeBaitData();
      if (ab && ab.id === 'explosive') {
        const epics = FISH_LIST.filter(k => FISH[k].tier >= 3);
        return FISH[epics[Math.floor(Math.random() * epics.length)]];
      }
      if (hasLure('golden') && Math.random() < 0.1) {
        const legs = FISH_LIST.filter(k => FISH[k].tier === 4 && !FISH[k].danger);
        return FISH[legs[Math.floor(Math.random() * legs.length)]];
      }
      const weights: Record<string, number> = {};
      list.forEach(k => { weights[k] = FISH[k].prob[poolKey]; });
      if (ab && ab.bonusTier > 0) {
        list.forEach(k => { if (FISH[k].tier >= ab.bonusTier) weights[k] *= ab.attract; });
      }
      let total = list.reduce((a: number, k: string) => a + weights[k], 0);
      let r = Math.random() * total;
      for (const k of list) {
        r -= weights[k];
        if (r <= 0) return FISH[k];
      }
      return FISH[list[0]];
    }

    // ── POWER CAST ────────────────────────────────────────────────────────────
    function startCastCharge() {
      if (g.castsLeft <= 0) return;
      g.castChargeT = 0;
      g.castPower = 0;
      state = S.CAST_CHARGE;
    }
    function releasePowerCast() {
      if (state !== S.CAST_CHARGE) return;
      const power = g.castPower;
      if (power > 0.7) {
        SFX.powercast();
        addPopup('POWER CAST!', SDV.legendary, W / 2, 80);
      }
      startCast(g.castAimX, g.castAimY, true, power);
    }
    function startCast(aimX: number, aimY: number, keyboard = false, power = 0) {
      if (g.castsLeft <= 0) return;
      g.castsLeft--;
      g.totalCasts++;
      SFX.cast();
      const depthBonus = power > 0.5 ? 1 + (power - 0.5) * 0.6 : 1;
      g.castAimX = keyboard ? (140 + g.depthSel * 40) : (aimX || 180);
      g.castAimY = keyboard ? getWaterY() - 5 : (aimY || getWaterY() - 5);
      const idealX = 160 + g.depthSel * 30;
      const dist = Math.abs(g.castAimX - idealX);
      const accuracyBonus = Math.max(0, 1 - dist / 150);
      g.castBonus = accuracyBonus + power * 0.3;
      if (hasUpgrade('castmaster')) g.castBonus = Math.min(1, g.castBonus * 1.2);
      if (g.activeBait !== null && g.baits[g.activeBait]) {
        g.baits[g.activeBait].usesLeft--;
        if (g.baits[g.activeBait].usesLeft <= 0) {
          g.baits.splice(g.activeBait, 1);
          g.activeBait = g.baits.length > 0 ? 0 : null;
          addPopup('BAIT USED UP!', SDV.parchFaded, W / 2, 90);
        }
      }
      g.fish = pickFish(currentPool());
      const weatherBiteBonus = g.weather.biteBonus;
      g.biteDelay = Math.max(30, (70 + Math.random() * 100 + g.depthSel * 35) / weatherBiteBonus / depthBonus);
      g.castT = 0;
      g.currentDir = Math.random() < 0.5 ? 1 : -1;
      g.currentStrength = Math.random() * 0.4;
      g.bobberX = g.castAimX;
      g.bobberY = g.castAimY;
      addParticle({ type: 'ripple', x: g.bobberX, y: getWaterY(g.bobberX), r: 2, life: 40, maxLife: 40 });
      state = S.CASTING;
    }

    function earlyReel() {
      if (state !== S.WAITING) return;
      if (hasLure('rusty')) {
        g.score += 120; g.zScore += 120;
        addPopup('RUSTY HOOK! +120', SDV.uncommon, W / 2, 90);
      }
      addPopup('EARLY REEL', SDV.parchFaded, W / 2, 90);
      state = S.MISS; g.timer = 0; g.combo = 0;
    }

    // ── REEL MINI-GAME INIT ────────────────────────────────────────────────────
    function startReel() {
      const fish = g.fish;
      SFX.bite();
      if (fish.danger) SFX.danger();

      const barW = IS_MOBILE ? 200 : 220;
      const barH = IS_MOBILE ? 24 : 20;
      const barX = W / 2 - barW / 2;
      const barY = IS_MOBILE ? H - 170 : 195;

      const zoneW = Math.max(20, Math.round(barW * (0.22 - fish.tier * 0.02)));
      const zoneX = Math.floor(Math.random() * (barW - zoneW));
      const startPos = Math.floor(Math.random() * barW);

      // FIX: 'duration' controls how long you need to be in zone. Fish fight type
      // determines base speed. These were tuned to be very playable.
      const fightSpeeds: Record<string, number> = {
        drift: 0.6, shake: 0.9, surge: 1.2, erratic: 1.4, boss: 1.6,
      };
      const baseSpeed = (fightSpeeds[fish.fight] || 1.0) * g.weather.speedMult;

      g.reel = {
        barX, barY, barW, barH,
        zoneX, zoneW,
        cur: startPos,
        vel: (Math.random() < 0.5 ? 1 : -1) * baseSpeed,
        baseSpeed,
        tension: 0,
        success: 0,
        duration: 90,
        currentOffset: 0,
        _anchorPulse: 0,
      };
      state = S.REEL;
    }

    // ── PARTICLES ─────────────────────────────────────────────────────────────
    function addParticle(p: any) { particles.push(p); }
    function addPopup(text: string, col: string, x: number, y: number) {
      particles.push({ type: 'popup', text, col, x, y, life: 80, maxLife: 80 });
    }
    function spawnSplash(x: number, y: number, col = '#A8D8F8') {
      for (let i = 0; i < 6; i++) {
        particles.push({
          type: 'spark', x, y, col,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2 - 1,
          life: 20 + Math.random() * 15,
          maxLife: 35,
          size: 1 + Math.random() * 2,
        });
      }
    }

    // ── DRAWING HELPERS ───────────────────────────────────────────────────────
    function drawWoodBg(x: number, y: number, w: number, h: number) {
      cx.fillStyle = SDV.oakMid;
      cx.fillRect(x, y, w, h);
      cx.fillStyle = SDV.oakDark;
      for (let ly = y; ly < y + h; ly += 6) cx.fillRect(x, ly, w, 1);
      cx.fillStyle = 'rgba(255,200,100,0.04)';
      for (let lx = x; lx < x + w; lx += 18) cx.fillRect(lx, y, 2, h);
    }
    function drawWoodBorder(x: number, y: number, w: number, h: number, highlight = false, gold = false) {
      drawWoodBg(x, y, w, h);
      cx.strokeStyle = gold ? SDV.legendary : highlight ? SDV.oakHighlight : SDV.oakBezel;
      cx.lineWidth = 2;
      cx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      cx.fillStyle = 'rgba(255,255,255,0.08)';
      cx.fillRect(x + 2, y + 2, w - 4, 2);
      cx.fillStyle = 'rgba(0,0,0,0.18)';
      cx.fillRect(x + 2, y + h - 3, w - 4, 2);
    }

    // ── MAIN LOOP ─────────────────────────────────────────────────────────────
    function loop() {
      animId = requestAnimationFrame(loop);
      g.waterT = (g.waterT || 0) + 0.016;
      if (g.comboTimer > 0) g.comboTimer--;
      if (g.comboTimer <= 0 && g.combo > 0) g.combo = 0;
      if (g.catchCardAnim < 1) g.catchCardAnim = Math.min(1, (g.catchCardAnim || 0) + 0.07);
      g.timer = (g.timer || 0) + 1;

      // Particles
      particles = particles.filter(p => {
        p.life--;
        if (p.type === 'spark') { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }
        if (p.type === 'popup') { p.y -= 0.4; }
        if (p.type === 'ripple') { p.r += 1.5; }
        return p.life > 0;
      });

      // Underwater fish
      underwaterFish.forEach(uf => {
        uf.x += uf.speed * uf.dir;
        uf.t += 0.04;
        if (uf.x > W + 20) uf.x = -20;
        if (uf.x < -20) uf.x = W + 20;
      });

      // Clouds
      clouds.forEach(c => { c.x += c.speed; if (c.x > W + c.w) c.x = -c.w; });

      // Power cast charge
      if (state === S.CAST_CHARGE) {
        g.castPower = Math.min(1, (g.castPower || 0) + 0.015);
        g.castChargeT++;
      }

      // Rain
      if (rainDrops.length) {
        rainDrops.forEach(rd => {
          rd.y += rd.speed;
          if (rd.y > H) { rd.y = -rd.len; rd.x = Math.random() * W; }
        });
      }

      // State: CASTING
      if (state === S.CASTING) {
        g.castT++;
        if (g.castT > 20) {
          addParticle({ type: 'ripple', x: g.bobberX, y: getWaterY(g.bobberX), r: 3, life: 30, maxLife: 30 });
          spawnSplash(g.bobberX, getWaterY(g.bobberX));
          state = S.WAITING;
        }
      }

      // State: WAITING for bite
      if (state === S.WAITING) {
        g.biteDelay--;
        if (g.biteDelay <= 0) {
          state = S.BITE;
          g.timer = 0;
          SFX.bite();
          addPopup('⚡ BITE!', SDV.dangerGlow, g.bobberX, getWaterY(g.bobberX) - 15);
        }
      }

      // State: BITE window
      if (state === S.BITE) {
        if (g.timer > 90) {
          addPopup('TOO SLOW!', SDV.miss, W / 2, 90);
          SFX.miss();
          g.combo = 0;
          state = S.MISS;
          g.timer = 0;
        }
      }

      // State: REEL
      if (state === S.REEL) {
        updateReel();
      }

      // Draw everything
      draw();
    }

    function updateReel() {
      const r = g.reel;
      const fish = g.fish;
      const keys = (window as any)._deepReelKeys || {};
      const reeling = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];

      // Fish behavior: move the zone position based on fight style
      const t = g.waterT;
      let zoneDrift = 0;
      if (fish.fight === 'drift') {
        zoneDrift = Math.sin(t * 1.2) * 0.3;
      } else if (fish.fight === 'shake') {
        zoneDrift = (Math.random() - 0.5) * 1.2;
      } else if (fish.fight === 'surge') {
        zoneDrift = Math.sin(t * 2.0) * 0.8 + (Math.random() - 0.5) * 0.5;
      } else if (fish.fight === 'erratic') {
        zoneDrift = (Math.random() - 0.5) * 2.5;
      } else if (fish.fight === 'boss') {
        zoneDrift = Math.sin(t * 3.0) * 1.2 + (Math.random() - 0.5) * 1.5;
      }
      r.zoneX = Math.max(0, Math.min(r.barW - r.zoneW, r.zoneX + zoneDrift * g.weather.speedMult));

      // Current drift on cursor
      r.currentOffset = lerp(r.currentOffset, g.currentDir * g.currentStrength * 25, 0.04);

      // Player cursor movement
      const reelSpeed = 3.5 * reelSpeedMult();
      if (reeling) {
        r.vel += reelSpeed * 0.18;
        if (Math.random() < 0.08) SFX.reel();
      } else {
        r.vel *= 0.88;
      }

      // Magnet pull
      const mag = magnetStrength();
      if (mag > 0) {
        const baseZoneX = r.zoneX;
        const center = r.barW / 2;
        const diff = center - (r.cur + baseZoneX);
        r.vel += diff * mag * 0.018;
      }

      // Anchor pulse
      const anc = anchorStrength();
      if (anc > 0 && r._anchorPulse > 0) {
        r.vel *= (1 - anc * 0.1);
        r._anchorPulse--;
      }

      r.cur = Math.max(0, Math.min(r.barW, r.cur + r.vel));
      const baseZoneX = r.zoneX;
      const inZone = r.cur >= baseZoneX && r.cur < baseZoneX + r.zoneW;

      // ── TENSION BUG FIX ─────────────────────────────────────────────────────
      // Original code had tension building far too fast (~0.7/frame out of zone).
      // Now: base build is 0.15/frame * fish tier factor * tensionBuildMult.
      // At 60fps, 100% tension takes ~10+ seconds without upgrades. Much more fair.
      const tierFactor = 0.8 + fish.tier * 0.15; // tier 1=0.95, tier 2=1.1, tier 3=1.25, tier 4=1.4
      const buildRate  = 0.15 * tierFactor * tensionBuildMult();
      const drainRate  = 0.35 * tensionDrainMult();

      if (inZone) {
        r.tension = Math.max(0, r.tension - drainRate);
        r.success += 1 * reelSpeedMult();
        const zen = zenAutoRecover();
        if (zen > 0 && r.tension > 60) r.tension -= zen * 0.5;
        // Danger fish can snap line even in zone
        if (fish.danger) {
          let snapR = fish.snapRate;
          if (hasUpgrade('dangerrod')) snapR *= 0.6;
          if (Math.random() < snapR) {
            addPopup('SNAP!', SDV.dangerGlow, W / 2, 90);
            SFX.snap();
            g.combo = 0;
            state = S.MISS;
            g.timer = 0;
            return;
          }
        }
      } else {
        r.tension = Math.min(100, r.tension + buildRate);
        if (r.success > 0) r.success -= 0.3;
      }

      const zen2 = zenAutoRecover();
      if (zen2 > 0 && r.tension > 60) r.tension -= zen2 * 0.5;

      if (r.tension >= 100) {
        addPopup('LINE BROKE!', SDV.dmg, W / 2, 90);
        SFX.miss();
        g.combo = 0;
        state = S.MISS;
        g.timer = 0;
        return;
      }

      if (r.success >= r.duration) {
        catchFish();
      }
    }

    function catchFish() {
      const fish = g.fish;
      const sc = calcScore(fish);
      g.zScore += sc.total;
      g.score  += sc.total;
      g.coins  += fish.coins;
      g.catchCount++;
      g.totalCatches++;
      g.consecutiveMisses = 0;
      g.combo++;
      g.comboTimer = 180;
      if (!g.speciesCaught[fish.name]) g.speciesCaught[fish.name] = 0;
      g.speciesCaught[fish.name]++;
      if (!g.trophyWall[fish.name]) {
        g.trophyWall[fish.name] = { fish, score: sc.total, date: g.zone + 1 };
        g.newTrophyFish = fish;
        SFX.trophy();
        addPopup('🏆 TROPHY! ' + fish.name, SDV.legendary, W / 2, 70);
      } else {
        addPopup('+' + sc.total, SDV.score, W / 2, 90);
      }
      if (fish.danger) addPopup('DANGER CATCH! 💀', SDV.dangerGlow, W / 2, 105);
      SFX.caught();
      g.catchCardAnim = 0;
      state = S.CAUGHT;
      g.timer = 0;
    }

    function calcScore(fish: any) {
      let base = fish.pts;
      const ab = activeBaitData();
      if (ab && ab.luckyBonus) base += 30;
      if (hasLure('depth') && fish.tier >= 2) {
        g.depthSounderMult = Math.min(g.depthSounderMult + 15, 75);
      }
      let mult = g.multBonus + g.depthSounderMult / 100;
      const sp = fish.name;
      g.catches.push(sp);
      const sameCount = g.catches.filter((s: string) => s === sp).length;
      if (sameCount >= 5) mult *= 3;
      else if (sameCount >= 3) mult *= 2;
      else if (sameCount >= 2) mult *= 1.5;
      if (hasLure('school') && sameCount >= 2) mult += 1;
      const unique = new Set(g.catches).size;
      if (unique >= 5) mult *= 2;
      const rareCount = g.catches.filter((s: string) => {
        const k = FISH_LIST.find(fk => FISH[fk].name === s);
        return k && FISH[k].tier >= 2;
      }).length;
      if (rareCount >= 3) mult *= 2.5;
      if (hasLure('lucky') && g.firstFishZone) mult *= 2;
      if (hasLure('moon') && (g.zone + 1) % 2 === 1) mult *= 1.5;
      if (hasUpgrade('luckrod')) mult *= (1 + g.castBonus * 0.3);
      g.firstFishZone = false;
      if (g.combo > 0) mult *= (1 + g.combo * 0.1);
      if (fish.danger) mult *= 2.0;
      mult *= scoreMult();
      const total = Math.round(base * mult);
      return { total, base, mult: mult.toFixed(1) };
    }

    function nextCast() {
      if (g.castsLeft <= 0) {
        if (g.zScore >= ZONES[g.zone].quota) {
          state = S.ZONE_CLEAR;
          g.timer = 0;
          SFX.zoneclear();
        } else {
          state = S.GAME_OVER;
        }
        return;
      }
      state = S.DEPTH;
      if (hasLure('charge') && g.catchCount > 0 && g.catchCount % 5 === 0) {
        const bf = pickFish(currentPool());
        const sc = calcScore(bf);
        g.zScore += sc.total;
        g.score  += sc.total;
        g.coins  += bf.coins;
        addPopup('⚡ DEPTH CHARGE! +' + sc.total, SDV.legendary, W / 2, 80);
      }
    }

    function openShop() {
      const avLures    = LURES.filter(l => !g.lures.some((e: any) => e.id === l.id));
      const avUpgrades = ROD_UPGRADES.filter(u => !g.upgrades.some((e: any) => e.id === u.id));
      g.shopLures    = [...avLures].sort(() => Math.random() - 0.5).slice(0, 3);
      g.shopUpgrades = [...avUpgrades].sort(() => Math.random() - 0.5).slice(0, 3);
      g.shopBaits    = [...BAIT_CATALOG].sort(() => Math.random() - 0.5).slice(0, 4);
      g.shopTab = 0; g.shopSel = 0;
      state = S.SHOP;
    }

    function shopPageItems() {
      if (g.shopTab === 0) return g.shopBaits;
      if (g.shopTab === 1) return g.shopUpgrades;
      return g.shopLures;
    }

    function shopBuy() {
      const items = shopPageItems();
      const item  = items[g.shopSel];
      if (!item) return;
      if (g.coins < item.cost) { addPopup('NOT ENOUGH COINS!', SDV.dmg, W / 2, 100); SFX.error(); return; }
      if (g.shopTab === 0) {
        const existing = g.baits.find((b: any) => b.id === item.id);
        if (existing) { existing.usesLeft += item.uses; }
        else { g.baits.push({ ...item, usesLeft: item.uses }); }
        g.coins -= item.cost;
        addPopup('BAIT PURCHASED!', SDV.uncommon, W / 2, 100);
        SFX.buy();
        items.splice(g.shopSel, 1);
        if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
      } else if (g.shopTab === 1) {
        if (g.upgrades.length >= 6) { addPopup('ROD SLOTS FULL!', SDV.dmg, W / 2, 100); return; }
        if (!hasUpgrade(item.id)) {
          g.coins -= item.cost;
          g.upgrades.push(item);
          addPopup('ROD UPGRADED!', SDV.rare, W / 2, 100);
          SFX.buy();
          items.splice(g.shopSel, 1);
          if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
        }
      } else {
        if (g.lures.length >= 5) { addPopup('LURE SLOTS FULL!', SDV.dmg, W / 2, 100); return; }
        if (!hasLure(item.id)) {
          g.coins -= item.cost;
          g.lures.push(item);
          addPopup('LURE EQUIPPED!', SDV.epic, W / 2, 100);
          SFX.buy();
          items.splice(g.shopSel, 1);
          if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
        }
      }
    }

    function leaveShop() {
      g.zone++;
      if (g.zone >= ZONES.length) { state = S.WIN; return; }
      const newZ   = ZONES[g.zone];
      g.castsLeft  = newZ.casts + (hasLure('chum') ? 2 : 0);
      g.zScore     = 0;
      g.catchCount = 0;
      g.firstFishZone = true;
      g.depthSounderMult = 0;
      g.weather    = pickWeather();
      if (g.weather.id === 'rainy' || g.weather.id === 'stormy') genRain();
      else rainDrops = [];
      genStars(newZ.stars);
      genClouds(newZ.cloudCount);
      genUnderwaterFish(g.zone);
      state = S.DEPTH;
    }

    // ── DRAW ──────────────────────────────────────────────────────────────────
    function draw() {
      drawBackground();
      drawParticles();
      if (state === S.TITLE)       { drawTitle(); return; }
      if (state === S.GAME_OVER)   { drawGameOver(); return; }
      if (state === S.WIN)         { drawWin(); return; }
      if (state === S.TROPHY)      { drawTrophyWall(); return; }
      if (state === S.SHOP)        { drawShop(); return; }

      drawHUD();

      if (state === S.DEPTH)       drawDepthSelect();
      if (state === S.CAST_CHARGE) drawCastCharge();
      if (state === S.CASTING || state === S.WAITING || state === S.BITE) drawFishing();
      if (state === S.REEL)        drawReelState();
      if (state === S.CAUGHT)      drawCaughtCard();
      if (state === S.MISS)        drawMiss();
      if (state === S.ZONE_CLEAR)  drawZoneClear();
    }

    // ── BACKGROUND ────────────────────────────────────────────────────────────
    function drawBackground() {
      const zone = ZONES[Math.min(g.zone || 0, ZONES.length - 1)];
      const sky   = zone.bgSky;
      const water = zone.bgWater;
      const waterY = getWaterY();

      // Sky gradient
      const grad = cx.createLinearGradient(0, 0, 0, waterY);
      grad.addColorStop(0,   sky[0]);
      grad.addColorStop(0.5, sky[1]);
      grad.addColorStop(1,   sky[2]);
      cx.fillStyle = grad;
      cx.fillRect(0, 0, W, waterY + 2);

      // Stars
      const t = g.waterT || 0;
      stars.forEach(s => {
        const tw = Math.sin(t * 1.2 + s.twinkleOff);
        cx.globalAlpha = 0.4 + tw * 0.3;
        cx.fillStyle = '#FFFFFF';
        cx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
        cx.globalAlpha = 1;
      });

      // Clouds
      clouds.forEach(c => {
        cx.globalAlpha = c.alpha * (g?.weather?.id === 'foggy' ? 1.5 : 1);
        cx.fillStyle = g?.weather?.id === 'stormy' ? '#778899' : '#FFFFFF';
        cx.fillRect(Math.round(c.x - c.w / 2), Math.round(c.y), Math.round(c.w), Math.round(c.h * 0.6));
        cx.fillRect(Math.round(c.x - c.w / 3), Math.round(c.y - c.h * 0.3), Math.round(c.w * 0.7), Math.round(c.h));
        cx.globalAlpha = 1;
      });

      // Rain
      if (rainDrops.length) {
        cx.strokeStyle = 'rgba(160,200,255,0.4)';
        cx.lineWidth = 1;
        rainDrops.forEach(rd => {
          cx.beginPath();
          cx.moveTo(rd.x, rd.y);
          cx.lineTo(rd.x - 1, rd.y + rd.len);
          cx.stroke();
        });
      }

      // Water body
      const wgrad = cx.createLinearGradient(0, waterY, 0, H);
      wgrad.addColorStop(0,   water[0]);
      wgrad.addColorStop(0.5, water[1]);
      wgrad.addColorStop(1,   water[2]);
      cx.fillStyle = wgrad;
      cx.fillRect(0, waterY, W, H - waterY);

      // Water surface shimmer
      cx.strokeStyle = 'rgba(168,216,248,0.35)';
      cx.lineWidth = 1;
      for (let wx = 0; wx < W; wx += 6) {
        const wy = getWaterY(wx, t);
        cx.beginPath(); cx.moveTo(wx, wy); cx.lineTo(wx + 4, wy); cx.stroke();
      }

      // Underwater fish (decorative)
      underwaterFish.forEach(uf => {
        cx.globalAlpha = uf.alpha;
        const wobble = Math.sin(uf.t * 2) * 1.5;
        const flip = uf.dir > 0 ? 1 : -1;
        cx.save();
        cx.translate(Math.round(uf.x), Math.round(uf.y + wobble));
        cx.scale(flip, 1);
        cx.fillStyle = uf.col;
        cx.fillRect(-uf.w / 2, -uf.h / 2, uf.w, uf.h);
        cx.fillRect(-uf.w / 2 - 4, -uf.h / 2 + 1, 4, uf.h - 2);
        cx.restore();
        cx.globalAlpha = 1;
      });

      // Dock
      const dockX = IS_MOBILE ? 20 : 18;
      const dockY = waterY - 12;
      cx.fillStyle = SDV.oakPlank;
      cx.fillRect(dockX, dockY, 70, 14);
      cx.fillStyle = SDV.oakLight;
      cx.fillRect(dockX, dockY, 70, 2);
      cx.fillStyle = 'rgba(0,0,0,0.2)';
      cx.fillRect(dockX, dockY + 12, 70, 2);
      for (let px = dockX + 14; px < dockX + 70; px += 14) {
        cx.fillStyle = SDV.oakDark; cx.fillRect(px, dockY, 1, 14);
      }
      // Dock posts
      cx.fillStyle = SDV.oakMid;
      cx.fillRect(dockX + 4,  dockY + 14, 6, 10);
      cx.fillRect(dockX + 60, dockY + 14, 6, 10);

      // Bobber & line
      if (state === S.CASTING || state === S.WAITING || state === S.BITE || state === S.REEL) {
        const bx = g.bobberX, by = getWaterY(g.bobberX);
        // Line from dock tip
        cx.strokeStyle = 'rgba(200,180,140,0.7)';
        cx.lineWidth = 1;
        cx.beginPath();
        cx.moveTo(dockX + 68, dockY + 2);
        cx.lineTo(bx, by);
        cx.stroke();
        // Bobber
        const bobberBob = Math.sin((g.waterT || 0) * 3) * 2;
        cx.fillStyle = '#E03020';
        cx.fillRect(Math.round(bx - 3), Math.round(by - 6 + bobberBob), 6, 6);
        cx.fillStyle = '#F5E6C8';
        cx.fillRect(Math.round(bx - 3), Math.round(by - 3 + bobberBob), 6, 3);
        cx.fillStyle = SDV.oakDark;
        cx.fillRect(Math.round(bx - 1), Math.round(by - 8 + bobberBob), 2, 3);
        // Bite animation
        if (state === S.BITE && Math.floor((g.waterT || 0) * 6) % 2 === 0) {
          cx.fillStyle = SDV.dangerGlow;
          cx.fillRect(Math.round(bx - 4), Math.round(by - 4 + bobberBob), 8, 1);
        }
      }
    }

    // ── DEPTH SELECT ──────────────────────────────────────────────────────────
    function drawDepthSelect() {
      const wy = IS_MOBILE ? 196 : 74;
      drawWoodBorder(8, wy, W - 16, IS_MOBILE ? 80 : 70);
      drawText('CHOOSE DEPTH', 4, W / 2, wy + 12, SDV.parchDark, 'center');
      const labels = ['SHALLOW', 'MEDIUM', 'DEEP'];
      const bw = IS_MOBILE ? 86 : 78;
      const gap = IS_MOBILE ? 95 : 82;
      const ox = IS_MOBILE ? 14 : 22;
      labels.forEach((label, i) => {
        const bx = ox + i * gap;
        const sel = g.depthSel === i;
        drawWoodBorder(bx, wy + 20, bw, IS_MOBILE ? 40 : 36, sel, sel);
        if (sel) { cx.fillStyle = 'rgba(255,200,50,0.08)'; cx.fillRect(bx + 2, wy + 22, bw - 4, IS_MOBILE ? 36 : 32); }
        drawText(label, IS_MOBILE ? 4 : 3, bx + bw / 2, wy + (IS_MOBILE ? 36 : 32), sel ? SDV.legendary : SDV.parchment, 'center');
        const poolLabel = i === 0 ? 'POND' : i === 1 ? 'COVE' : 'DEEP';
        drawText(poolLabel, 3, bx + bw / 2, wy + (IS_MOBILE ? 50 : 44), SDV.parchFaded, 'center');
      });

      // Rod upgrades
      const by1 = IS_MOBILE ? 286 : 152;
      drawWoodBorder(8, by1 - 2, W - 16, 22);
      drawText('ROD:', 4, 14, by1 + 12, SDV.parchFaded, 'left');
      g.upgrades.forEach((u: any, i: number) => {
        drawWoodBorder(42 + i * 44, by1 + 2, 40, 14);
        cx.fillStyle = u.col; cx.fillRect(44 + i * 44, by1 + 4, 36, 10);
        drawText(u.name.slice(0, 4), 3, 46 + i * 44, by1 + 12, SDV.parchment, 'left');
      });

      // Lures
      const by1b = IS_MOBILE ? 312 : 178;
      drawWoodBorder(8, by1b - 2, W - 16, 22);
      drawText('LURE:', 4, 14, by1b + 12, SDV.parchFaded, 'left');
      g.lures.forEach((l: any, i: number) => {
        drawWoodBorder(48 + i * 54, by1b + 2, 48, 14);
        cx.fillStyle = l.col; cx.fillRect(50 + i * 54, by1b + 4, 44, 10);
        drawText(l.name.slice(0, 5), 3, 52 + i * 54, by1b + 12, SDV.parchment, 'left');
      });

      // Bait row
      const by2 = IS_MOBILE ? 340 : 158;
      drawText('BAIT:', 4, 14, by2 + 12, SDV.parchFaded, 'left');
      g.baits.forEach((b: any, i: number) => {
        const bx = 45 + i * 58;
        const sel = g.activeBait === i;
        drawWoodBorder(bx, by2 + 2, 52, 20, sel);
        drawText(b.name.slice(0, 6), 4, bx + 4, by2 + 14, sel ? SDV.legendary : SDV.parchment, 'left');
        drawText('x' + b.usesLeft, 4, bx + 40, by2 + 14, SDV.coin, 'left');
      });
      if (g.baits.length === 0) drawText('NONE', 4, 48, by2 + 12, SDV.parchFaded, 'left');

      const hintY = IS_MOBILE ? 388 : 192;
      drawText('HOLD SPACE = POWER CAST', 4, W / 2, hintY, SDV.parchFaded, 'center');

      const zoneY = IS_MOBILE ? 400 : 204;
      drawText(ZONES[g.zone].name, 4, W / 2, zoneY, SDV.parchDark, 'center');

      const tby = IS_MOBILE ? 418 : 218;
      drawWoodBorder(W - 68, tby - 10, 62, 16);
      drawText('🏆 WALL', 4, W - 62, tby, SDV.legendary, 'left');
    }

    // ── POWER CAST CHARGE ─────────────────────────────────────────────────────
    function drawCastCharge() {
      const wy = IS_MOBILE ? 180 : 60;
      drawWoodBorder(W / 2 - 60, wy, 120, 50);
      drawText('CHARGING...', 5, W / 2, wy + 14, SDV.parchDark, 'center');
      const bx = W / 2 - 48, by = wy + 20;
      cx.fillStyle = SDV.oakDark;
      cx.fillRect(bx, by, 96, 12);
      const pw = Math.floor(96 * g.castPower);
      const powerCol = g.castPower > 0.8 ? SDV.legendary : g.castPower > 0.5 ? SDV.uncommon : SDV.rare;
      cx.fillStyle = powerCol;
      cx.fillRect(bx, by, pw, 12);
      cx.strokeStyle = SDV.oakBezel; cx.lineWidth = 1;
      cx.strokeRect(bx, by, 96, 12);
      drawText(Math.round(g.castPower * 100) + '%', 5, W / 2, by + 10, SDV.parchment, 'center');
      drawText('RELEASE TO CAST!', 4, W / 2, wy + 44, SDV.parchFaded, 'center');
    }

    // ── FISHING STATE ─────────────────────────────────────────────────────────
    function drawFishing() {
      const hints: Record<number, string> = {
        [S.CASTING]: 'CASTING...',
        [S.WAITING]: 'WAITING FOR BITE...',
        [S.BITE]:    '⚡ BITE! PRESS SPACE! ⚡',
      };
      const hintY = IS_MOBILE ? 390 : 200;
      const col   = state === S.BITE ? SDV.dangerGlow : SDV.parchDark;
      drawWoodBorder(8, hintY - 10, W - 16, 20);
      drawText(hints[state] || '', 4, W / 2, hintY + 4, col, 'center');
    }

    // ── REEL STATE ────────────────────────────────────────────────────────────
    function drawReelState() {
      const r    = g.reel;
      const fish = g.fish;
      const panelY = IS_MOBILE ? H - 140 : 170;
      drawWoodBorder(8, panelY - 8, W - 16, 70);

      const nameCol = fish.danger ? SDV.dangerGlow : fish.tier === 4 ? SDV.legendary : SDV.parchment;
      if (fish.danger && Math.floor(g.waterT * 4) % 2 === 0) {
        drawText('💀 DANGER FISH! 💀', 5, W / 2, panelY + 4, SDV.dangerGlow, 'center');
      } else {
        drawText(fish.name, 5, W / 2, panelY + 4, nameCol, 'center');
      }

      const { barX, barY, barW, barH } = r;
      drawWoodBg(barX - 2, barY - 2, barW + 4, barH + 4);
      cx.fillStyle = SDV.oakDark;
      cx.fillRect(barX, barY, barW, barH);

      const czo = r.currentOffset * 0.15;
      cx.fillStyle = 'rgba(80,200,80,0.35)';
      cx.fillRect(barX + Math.max(0, r.zoneX - czo), barY, r.zoneW, barH);
      cx.fillStyle = 'rgba(100,255,100,0.5)';
      cx.fillRect(barX + Math.max(0, r.zoneX - czo), barY, r.zoneW, 2);
      cx.fillRect(barX + Math.max(0, r.zoneX - czo), barY + barH - 2, r.zoneW, 2);

      const curArrow = r.currentOffset > 2 ? '→' : r.currentOffset < -2 ? '←' : '—';
      drawText('CUR ' + curArrow, 3, barX + barW + 4, barY + barH / 2 + 2, SDV.parchFaded, 'left');

      // Cursor
      const cursorX = barX + Math.round(r.cur);
      cx.fillStyle = '#FFFFFF';
      cx.fillRect(cursorX - 1, barY - 3, 3, barH + 6);
      cx.fillStyle = SDV.legendary;
      cx.fillRect(cursorX - 1, barY - 3, 3, 3);
      cx.fillRect(cursorX - 1, barY + barH, 3, 3);

      // Tension bar
      const tenY = barY + barH + 6;
      const tenW = Math.floor(barW * r.tension / 100);
      const tenCol = r.tension > 75 ? SDV.danger : r.tension > 45 ? SDV.coin : SDV.uncommon;
      cx.fillStyle = tenCol;
      cx.fillRect(barX, tenY, tenW, 8);
      cx.strokeStyle = SDV.oakPlank; cx.lineWidth = 1;
      cx.strokeRect(barX, tenY, barW, 8);
      drawText('LINE', 4, barX - 2, tenY + 7, SDV.parchFaded, 'right');

      // Progress bar
      const progY = tenY + 12;
      cx.fillStyle = SDV.oakDark;
      cx.fillRect(barX, progY, barW, 5);
      cx.fillStyle = SDV.uiGreen;
      cx.fillRect(barX, progY, Math.floor(barW * r.success / r.duration), 5);
      cx.strokeStyle = SDV.oakPlank; cx.lineWidth = 1;
      cx.strokeRect(barX, progY, barW, 5);

      drawFishSprite(fish, W - 35, panelY + 12, g.waterT, 1.2);
      drawText('HOLD SPACE TO REEL', 4, W / 2, panelY + 58, SDV.parchFaded, 'center');
    }

    // ── CAUGHT CARD ───────────────────────────────────────────────────────────
    function drawCaughtCard() {
      const fish  = g.fish;
      const anim  = g.catchCardAnim;
      const cardW = W - 30;
      const cardH = IS_MOBILE ? 80 : 70;
      const cardX = 15;
      const cardY = H / 2 - cardH / 2;
      cx.globalAlpha = anim;
      cx.fillStyle = 'rgba(0,0,0,0.6)';
      cx.fillRect(cardX + 2, cardY + 2, cardW, cardH);
      drawWoodBorder(cardX, cardY, cardW, cardH, false, true);
      cx.fillStyle = '#2A1A08';
      cx.fillRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12);
      cx.fillStyle = 'rgba(200,160,80,0.08)';
      cx.fillRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12);

      if (g.newTrophyFish && g.newTrophyFish.name === fish.name) {
        drawText('★ NEW TROPHY! ★', 5, W / 2, cardY + 16, SDV.legendary, 'center');
      } else {
        const col = fish.danger ? SDV.dangerGlow : fish.tier === 4 ? SDV.legendary : fish.tier === 3 ? SDV.epic : fish.tier === 2 ? SDV.rare : SDV.parchment;
        drawText(fish.name, fish.tier >= 3 ? 6 : 5, W / 2, cardY + 16, col, 'center');
      }

      drawFishSprite(fish, W / 2 - 20, cardY + cardH / 2 + 4, g.waterT, 1.5);
      const sc = Math.round(fish.pts * 1.2);
      drawText('+' + (g.zScore > 0 ? sc : '??'), 7, W / 2 + 30, cardY + cardH / 2 + 8, SDV.coin, 'center');
      const rarities = ['', 'COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
      const rarCol   = [SDV.parchFaded, SDV.parchDark, SDV.uncommon, SDV.epic, SDV.legendary];
      drawText(rarities[fish.tier] || '', 4, W / 2, cardY + cardH - 10, rarCol[fish.tier], 'center');
      cx.globalAlpha = 1;
      drawText('TAP / SPACE TO CONTINUE', 4, W / 2, cardY + cardH + 10, SDV.parchFaded, 'center');
    }

    // ── MISS ──────────────────────────────────────────────────────────────────
    function drawMiss() {
      const wy = H / 2 - 20;
      drawWoodBorder(W / 2 - 70, wy, 140, 40);
      drawText('MISSED!', 8, W / 2, wy + 16, SDV.dmg, 'center');
      drawText('TAP TO CONTINUE', 4, W / 2, wy + 30, SDV.parchFaded, 'center');
    }

    // ── ZONE CLEAR ────────────────────────────────────────────────────────────
    function drawZoneClear() {
      const wy = IS_MOBILE ? 100 : 50;
      drawWoodBorder(8, wy, W - 16, IS_MOBILE ? 160 : 140);
      drawText('ZONE CLEARED!', 7, W / 2, wy + 14, SDV.uiGreenLt, 'center');
      drawText(ZONES[g.zone].name, 4, W / 2, wy + 26, SDV.parchDark, 'center');
      drawText('SCORE: ' + g.zScore,   5, W / 2, wy + 42, SDV.coin, 'center');
      drawText('CATCHES: ' + g.catchCount, 4, W / 2, wy + 56, SDV.parchDark, 'center');
      drawText('COINS: ' + g.coins,    4, W / 2, wy + 68, SDV.coin, 'center');

      const nextZone = g.zone + 1 < ZONES.length ? ZONES[g.zone + 1] : null;
      if (nextZone) {
        drawText('NEXT: ' + nextZone.name, 4, W / 2, wy + 82, SDV.parchFaded, 'center');
      }

      const by3 = IS_MOBILE ? 350 : 175;
      drawWoodBorder(W / 2 - 60, by3, 120, 24, false, true);
      drawText('VISIT SHOP', 5, W / 2, by3 + 16, SDV.legendary, 'center');
      drawText('(SPACE / TAP)', 4, W / 2, by3 + 34, SDV.parchFaded, 'center');
    }

    // ── SHOP ──────────────────────────────────────────────────────────────────
    function drawShop() {
      drawWoodBg(0, 0, W, H);
      drawWoodBorder(0, 0, W, 30);
      drawText('🎣 SHOP', 6, W / 2, 20, SDV.legendary, 'center');
      drawText('COINS: ' + g.coins, 4, W - 8, 20, SDV.coin, 'right');

      const tabs = ['BAIT', 'ROD', 'LURE'];
      const tabW = Math.floor(W / 3);
      tabs.forEach((tab, i) => {
        const sel = g.shopTab === i;
        drawWoodBorder(i * tabW, 32, tabW, 18, sel, sel);
        drawText(tab, 4, i * tabW + tabW / 2, 44, sel ? SDV.legendary : SDV.parchment, 'center');
      });

      const items    = shopPageItems();
      const colCount = 2;
      const itemW    = IS_MOBILE ? 148 : 148;
      const itemH    = IS_MOBILE ? 68 : 62;
      const itemStartY = 54;
      const gapX = 8, startX = 8;

      items.forEach((item: any, i: number) => {
        const col    = i % colCount;
        const row    = Math.floor(i / colCount);
        const bx     = startX + col * (itemW + gapX);
        const by     = itemStartY + row * (itemH + 4);
        const canBuy = g.coins >= item.cost;
        const sel    = g.shopSel === i;
        drawWoodBorder(bx, by, itemW, itemH, sel, canBuy);
        if (!canBuy) { cx.fillStyle = 'rgba(0,0,0,0.4)'; cx.fillRect(bx + 3, by + 3, itemW - 6, itemH - 6); }
        cx.fillStyle = SDV.oakDark;
        cx.fillRect(bx + 6, by + 6, 24, 24);
        drawItemPixelIcon(bx + 18, by + 18, item, g.shopTab);
        const nameLines = wrapText(item.name, 14);
        nameLines.forEach((line: string, li: number) => drawText(line, 4, bx + 34, by + 13 + li * 9, SDV.parchment, 'left'));
        const descLines = wrapText(item.desc, 20);
        descLines.slice(0, 2).forEach((line: string, li: number) => drawText(line, 3, bx + 6, by + 38 + li * 8, SDV.parchFaded, 'left'));
        cx.fillStyle = canBuy ? SDV.coin : SDV.parchFaded;
        cx.fillRect(bx + itemW - 36, by + itemH - 14, 30, 11);
        cx.fillStyle = SDV.oakDark;
        cx.fillRect(bx + itemW - 35, by + itemH - 13, 28, 9);
        drawText(item.cost + 'G', 4, bx + itemW - 22, by + itemH - 5, canBuy ? SDV.coin : SDV.dmg, 'center');
      });

      if (items.length === 0) {
        drawWoodBorder(8, 60, W - 16, 40);
        drawText('SOLD OUT!', 7, W / 2, 85, SDV.parchFaded, 'center');
      }

      const bottomY = IS_MOBILE ? H - 50 : 208;
      drawWoodBorder(8, bottomY, 100, 18, false, false);
      drawText('LEAVE SHOP', 4, 58, bottomY + 12, SDV.parchDark, 'center');
      drawWoodBorder(W - 110, bottomY, 102, 18, false, true);
      drawText('REROLL (15G)', 4, W - 59, bottomY + 12, SDV.coin, 'center');
    }

    function wrapText(text: string, maxChars: number): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let cur = '';
      words.forEach(w => {
        if ((cur + w).length > maxChars) { if (cur) lines.push(cur.trim()); cur = w + ' '; }
        else cur += w + ' ';
      });
      if (cur.trim()) lines.push(cur.trim());
      return lines;
    }

    // ── TROPHY WALL ───────────────────────────────────────────────────────────
    function drawTrophyWall() {
      drawWoodBg(0, 0, W, H);
      drawWoodBorder(0, 0, W, 24);
      drawText('🏆 TROPHY WALL', 6, W / 2, 16, SDV.legendary, 'center');
      const trophies = Object.entries(g.trophyWall) as [string, any][];
      if (trophies.length === 0) {
        drawWoodBorder(20, 40, W - 40, 40);
        drawText('NO TROPHIES YET!', 5, W / 2, 65, SDV.parchFaded, 'center');
        drawText('CATCH NEW FISH SPECIES', 4, W / 2, 76, SDV.parchFaded, 'center');
      } else {
        const cols = 3;
        const tw   = (W - 16) / cols;
        const th   = 58;
        trophies.forEach(([name, data], i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const tx  = 8 + col * tw;
          const ty  = 28 + row * (th + 4);
          drawWoodBorder(tx, ty, tw - 4, th, false, true);
          drawFishSprite(data.fish, tx + tw / 2 - 10, ty + 20, g.waterT || 0, 0.9);
          const shortName = name.split(' ')[0];
          drawText(shortName, 4, tx + tw / 2 - 2, ty + 36, data.fish.danger ? SDV.dangerGlow : SDV.parchDark, 'center');
          drawText('Z' + data.date, 3, tx + tw / 2 - 2, ty + 46, SDV.parchFaded, 'center');
          const stars2 = '★'.repeat(data.fish.tier);
          drawText(stars2, 4, tx + tw / 2 - 2, ty + 56, SDV.legendary, 'center');
        });
      }
      drawText(trophies.length + '/' + FISH_LIST.length + ' SPECIES', 4, W / 2, H - 20, SDV.parchDark, 'center');
      drawText('PRESS SPACE / TAP TO RETURN', 4, W / 2, H - 8, SDV.parchFaded, 'center');
    }

    // ── HUD ───────────────────────────────────────────────────────────────────
    function drawHUD() {
      drawWoodBorder(0, 0, W, 18);
      drawText(g.score.toLocaleString(), 5, 6, 13, SDV.coin, 'left');
      const prog = Math.min(1, g.zScore / ZONES[g.zone].quota);
      const barW = 80, barX = W / 2 - barW / 2;
      cx.fillStyle = SDV.oakDark;
      cx.fillRect(barX, 4, barW, 9);
      cx.fillStyle = SDV.uiGreen;
      cx.fillRect(barX, 4, Math.floor(barW * prog), 9);
      cx.strokeStyle = SDV.oakBezel; cx.lineWidth = 1;
      cx.strokeRect(barX, 4, barW, 9);
      drawText(g.zScore + '/' + ZONES[g.zone].quota, 3, W / 2, 12, SDV.parchment, 'center');
      drawText('🎣' + g.castsLeft, 4, W - 58, 13, SDV.parchDark, 'left');
      drawText('🪙' + g.coins, 4, W - 30, 13, SDV.coin, 'left');
      if (g.combo > 1) {
        drawText('x' + g.combo + ' COMBO!', 4, W / 2, IS_MOBILE ? H - 8 : H - 4, SDV.legendary, 'center');
      }
    }

    // ── TITLE SCREEN ──────────────────────────────────────────────────────────
    function drawTitle() {
      const t = Date.now() / 1000;
      const skyGrad = cx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0,   '#1A3050');
      skyGrad.addColorStop(0.45,'#2A5080');
      skyGrad.addColorStop(0.7, '#3D7AAA');
      skyGrad.addColorStop(1,   '#205870');
      cx.fillStyle = skyGrad;
      cx.fillRect(0, 0, W, H);

      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
        const sy = (Math.sin(i * 37.9) * 0.5 + 0.5) * H * 0.55;
        const tw2 = Math.sin(t * 1.1 + i) * 0.5 + 0.5;
        cx.globalAlpha = tw2 * 0.8;
        cx.fillStyle = '#FFFFFF';
        cx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        cx.globalAlpha = 1;
      }

      const waterY = IS_MOBILE ? H * 0.38 : 115;
      const wgrad = cx.createLinearGradient(0, waterY, 0, H);
      wgrad.addColorStop(0, '#2A7AC8'); wgrad.addColorStop(1, '#0A2860');
      cx.fillStyle = wgrad;
      cx.fillRect(0, waterY, W, H - waterY);

      cx.strokeStyle = 'rgba(168,216,248,0.3)'; cx.lineWidth = 1;
      for (let wx = 0; wx < W; wx += 8) {
        const wy2 = waterY + Math.sin((wx / 30 + t) * 1.2) * 3;
        cx.beginPath(); cx.moveTo(wx, wy2); cx.lineTo(wx + 5, wy2); cx.stroke();
      }

      const titleY = IS_MOBILE ? H * 0.18 : H * 0.22;
      drawTextShadow('DEEP', IS_MOBILE ? 20 : 18, W / 2, titleY, SDV.waterFoam, 'center');
      drawTextShadow('REEL', IS_MOBILE ? 20 : 18, W / 2, titleY + (IS_MOBILE ? 26 : 22), SDV.legendary, 'center');

      const noteY = IS_MOBILE ? H * 0.52 : H * 0.52;
      const features = ['PIXEL FISHING ROGUELITE', '12 FISH + DANGER SPECIES', '5 ZONES • SHOP • TROPHIES'];
      features.forEach((f, i) => drawText(f, IS_MOBILE ? 4 : 4, W / 2, noteY + 8 + i * (IS_MOBILE ? 13 : 13), SDV.parchDark, 'center'));

      const blink = Math.floor(t * 2) % 2 === 0;
      if (blink) {
        drawWoodBorder(W / 2 - 72, IS_MOBILE ? H * 0.84 : H * 0.86, 144, 16);
        drawTextShadow('PRESS SPACE TO FISH', IS_MOBILE ? 5 : 5, W / 2, IS_MOBILE ? H * 0.84 + 12 : H * 0.86 + 11, SDV.uiGreenLt, 'center');
      }
      drawText('v3.0', 4, W - 8, H - 6, SDV.parchFaded, 'right');
    }

    // ── GAME OVER ─────────────────────────────────────────────────────────────
    function drawGameOver() {
      drawWoodBg(0, 0, W, H);
      drawWoodBorder(8, 20, W - 16, IS_MOBILE ? 200 : 180);
      drawTextShadow('GAME OVER', IS_MOBILE ? 12 : 10, W / 2, 40, SDV.dmg, 'center');
      drawText('The fish won this time...', 4, W / 2, 56, SDV.parchFaded, 'center');
      drawText('FINAL SCORE', 5, W / 2, 76, SDV.parchDark, 'center');
      drawTextShadow(g.score.toLocaleString(), IS_MOBILE ? 10 : 9, W / 2, 96, SDV.coin, 'center');
      drawText('ZONE: ' + ZONES[Math.min(g.zone, ZONES.length - 1)].name, 4, W / 2, 112, SDV.parchDark, 'center');
      drawText('CATCHES: ' + g.totalCatches, 4, W / 2, 124, SDV.parchDark, 'center');
      drawText('TROPHIES: ' + Object.keys(g.trophyWall).length, 4, W / 2, 136, SDV.legendary, 'center');
      const blink = Math.floor(Date.now() / 600) % 2 === 0;
      if (blink) {
        drawWoodBorder(W / 2 - 60, 155, 120, 16);
        drawText('PRESS SPACE', 5, W / 2, 167, SDV.uiGreenLt, 'center');
      }
    }

    // ── WIN SCREEN ────────────────────────────────────────────────────────────
    function drawWin() {
      drawWoodBg(0, 0, W, H);
      const t = Date.now() / 1000;
      for (let i = 0; i < 6; i++) {
        cx.fillStyle = `hsla(${i * 60 + t * 40}, 70%, 50%, 0.04)`;
        cx.fillRect(0, i * (H / 6), W, H / 6);
      }
      drawWoodBorder(8, 10, W - 16, IS_MOBILE ? 200 : 185);
      drawTextShadow('YOU WIN!', IS_MOBILE ? 14 : 12, W / 2, 28, SDV.legendary, 'center');
      drawText('THE ABYSS IS CONQUERED!', 4, W / 2, 42, SDV.uiGreenLt, 'center');
      drawFishSprite(FISH.kraken, W / 2, IS_MOBILE ? 100 : 90, t, IS_MOBILE ? 1.8 : 2.2);
      drawText('FINAL SCORE', 5, W / 2, IS_MOBILE ? 155 : 142, SDV.parchDark, 'center');
      drawTextShadow(g.score.toLocaleString(), IS_MOBILE ? 10 : 9, W / 2, IS_MOBILE ? 172 : 158, SDV.coin, 'center');
      drawText('TROPHIES: ' + Object.keys(g.trophyWall).length + '/' + FISH_LIST.length, 4, W / 2, IS_MOBILE ? 188 : 172, SDV.legendary, 'center');
      drawText('CATCHES: ' + g.totalCatches, 4, W / 2, IS_MOBILE ? 200 : 184, SDV.parchDark, 'center');
      const blink2 = Math.floor(t * 1.5) % 2 === 0;
      if (blink2) {
        drawWoodBorder(W / 2 - 60, IS_MOBILE ? H - 30 : H - 24, 120, 16);
        drawText('PLAY AGAIN', 5, W / 2, IS_MOBILE ? H - 18 : H - 12, SDV.uiGreenLt, 'center');
      }
    }

    // ── FISH SPRITE ───────────────────────────────────────────────────────────
    function drawFishSprite(fish: any, x: number, y: number, t4: number, scale = 1) {
      cx.save();
      cx.translate(Math.round(x), Math.round(y));
      const flip = Math.sin((t4 || 0) * 0.3) > 0 ? 1 : -1;
      cx.scale(flip * scale, scale);
      const w = fish.w, h = fish.h, col = fish.col;
      cx.fillStyle = 'rgba(0,0,0,0.2)';
      cx.fillRect(-w / 2 + 2, -h / 2 + 2, w, h);
      cx.fillStyle = col;
      cx.fillRect(-w / 2, -h / 2, w, h);
      cx.fillStyle = 'rgba(255,255,255,0.22)';
      cx.fillRect(-w / 2 + 2, 0, w - 4, h / 2 - 1);
      cx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let s = 0; s < 3; s++) cx.fillRect(-w / 2 + 5 + s * 7, -h / 4, 5, h / 2);
      cx.fillStyle = col;
      cx.fillRect(-w / 2 - 7, -h / 2, 7, h);
      cx.fillStyle = 'rgba(0,0,0,0.2)';
      cx.fillRect(-w / 2 - 7, -h / 2, 7, 2);
      cx.fillRect(-w / 2 - 7, h / 2 - 2, 7, 2);
      cx.fillStyle = col;
      cx.fillRect(-w / 4, -h / 2 - 4, w / 3, 4);
      cx.fillStyle = 'rgba(255,255,255,0.2)';
      cx.fillRect(-w / 4, -h / 2 - 4, 2, 4);
      cx.fillStyle = '#fff'; cx.fillRect(w / 2 - 7, -h / 4, 5, 5);
      cx.fillStyle = '#000'; cx.fillRect(w / 2 - 6, -h / 4 + 1, 3, 3);
      cx.fillStyle = 'rgba(255,255,255,0.8)'; cx.fillRect(w / 2 - 6, -h / 4 + 1, 1, 1);
      if (fish.tier === 4) {
        for (let i = 0; i < 5; i++) {
          cx.fillStyle = col;
          cx.fillRect(-w / 2 + 3 + i * 7, h / 2, 4, 5 + Math.sin((t4 || 0) * 2 + i) * 3);
        }
        cx.fillStyle = SDV.legendary;
        cx.fillRect(w / 2 - 7, -h / 4, 5, 5);
        cx.fillStyle = '#000'; cx.fillRect(w / 2 - 6, -h / 4 + 1, 3, 3);
      }
      if (fish.name === 'SWORDFISH') {
        cx.fillStyle = '#D0D8E8'; cx.fillRect(w / 2, -1, 16, 3);
        cx.fillStyle = 'rgba(255,255,255,0.4)'; cx.fillRect(w / 2, -1, 4, 1);
      }
      if (fish.name === 'OARFISH') {
        cx.fillStyle = fish.col; cx.fillRect(w / 2, h / 4, 14, 3);
        for (let i = 0; i < 4; i++) cx.fillRect(w / 2 + i * 3, h / 4 - 3, 2, 3);
      }
      if (fish.danger) {
        cx.fillStyle = SDV.dangerGlow;
        cx.fillRect(-w / 2 + 2, -h / 2, w - 4, 2);
        cx.fillRect(-w / 2 + 2, h / 2 - 2, w - 4, 2);
        if (fish.name === 'MORAY EEL') {
          cx.fillStyle = '#FFF8E0';
          cx.fillRect(w / 2 - 3, -h / 4 + 4, 2, 4);
          cx.fillRect(w / 2 - 7, -h / 4 + 4, 2, 3);
        }
      }
      cx.restore();
    }

    // ── ITEM PIXEL ICONS ──────────────────────────────────────────────────────
    function drawItemPixelIcon(cx2: number, cy2: number, item: any, tab: number) {
      const col = item.col || '#808080';
      cx.save();
      cx.translate(cx2, cy2);
      if (tab === 0) {
        if (item.id === 'worm') {
          cx.fillStyle = '#C87840';
          cx.fillRect(-4, -3, 4, 4); cx.fillRect(-1, -6, 4, 4); cx.fillRect(2, -3, 4, 4);
        } else if (item.id === 'cricket') {
          cx.fillStyle = '#909030';
          cx.fillRect(-5, -3, 10, 6); cx.fillRect(-3, -5, 6, 2);
          cx.fillStyle = '#707020';
          for (let i = -1; i <= 1; i++) { cx.fillRect(-7, i * 2, 3, 1); cx.fillRect(4, i * 2, 3, 1); }
        } else if (item.id === 'squid') {
          cx.fillStyle = '#B0C0E8'; cx.fillRect(-5, -6, 10, 8); cx.fillRect(-7, -4, 3, 4); cx.fillRect(4, -4, 3, 4);
          for (let i = 0; i < 4; i++) cx.fillRect(-6 + i * 3, 2, 2, 5);
        } else if (item.id === 'glowbug') {
          cx.fillStyle = 'rgba(100,255,150,0.3)'; cx.fillRect(-7, -7, 14, 14);
          cx.fillStyle = '#70E090'; cx.fillRect(-4, -4, 8, 8);
          cx.fillStyle = '#B0FFD0'; cx.fillRect(-2, -2, 4, 4);
        } else if (item.id === 'bread') {
          cx.fillStyle = '#C8A040'; cx.fillRect(-6, -2, 12, 6); cx.fillRect(-4, -5, 8, 3);
          cx.fillStyle = '#E8C070'; cx.fillRect(-5, -4, 6, 2);
        } else if (item.id === 'explosive') {
          cx.fillStyle = '#202020'; cx.fillRect(-5, -4, 10, 9); cx.fillRect(-3, -6, 6, 2);
          cx.fillStyle = '#E03020'; cx.fillRect(-4, -3, 8, 7);
          cx.fillStyle = '#FF8030'; cx.fillRect(3, -7, 2, 4);
          cx.fillStyle = '#FFE050'; cx.fillRect(3, -9, 2, 2);
        } else { cx.fillStyle = col; cx.fillRect(-6, -5, 12, 10); }
      } else if (tab === 1) {
        if (item.type === 'reel') {
          cx.fillStyle = '#4080C0'; cx.fillRect(-6, -6, 12, 12);
          cx.fillStyle = '#80C0F8'; cx.fillRect(-4, -4, 8, 8);
          cx.fillStyle = '#1A3060'; cx.fillRect(-1, -6, 2, 12); cx.fillRect(-6, -1, 12, 2);
          cx.fillStyle = col; cx.fillRect(-2, -2, 4, 4);
        } else if (item.type === 'tension') {
          cx.fillStyle = col;
          for (let i = 0; i < 4; i++) { cx.fillRect(-6 + i * 3, -3, 2, 6); cx.fillRect(-5 + i * 3, -4, 2, 2); cx.fillRect(-5 + i * 3, 2, 2, 2); }
        } else if (item.type === 'magnet' || item.type === 'deepmagnet') {
          cx.fillStyle = col; cx.fillRect(-6, -6, 5, 10); cx.fillRect(1, -6, 5, 10); cx.fillRect(-6, -6, 12, 4);
          cx.fillStyle = '#FF4040'; cx.fillRect(-6, 2, 5, 3);
          cx.fillStyle = '#4040FF'; cx.fillRect(1, 2, 5, 3);
        } else if (item.type === 'anchor') {
          cx.fillStyle = col; cx.fillRect(-1, -7, 2, 13); cx.fillRect(-5, -6, 10, 2);
          cx.fillStyle = '#30D890'; cx.fillRect(-6, 4, 12, 2); cx.fillRect(-6, 2, 2, 4); cx.fillRect(4, 2, 2, 4);
        } else if (item.type === 'danger') {
          cx.fillStyle = SDV.dangerGlow; cx.fillRect(-6, -2, 12, 4);
          cx.fillStyle = '#FFF8E0'; cx.fillRect(-4, -6, 2, 4); cx.fillRect(2, -6, 2, 4);
          cx.fillStyle = SDV.oakDark; cx.fillRect(-3, -1, 6, 2);
        } else { cx.fillStyle = col; cx.fillRect(-5, -5, 10, 10); cx.fillStyle = SDV.oakDark; cx.fillRect(-2, -2, 4, 4); }
      } else {
        if (item.id === 'lucky') {
          cx.fillStyle = col;
          cx.fillRect(-1, -6, 2, 12); cx.fillRect(-6, -1, 12, 2);
          cx.fillRect(-4, -4, 2, 2); cx.fillRect(2, -4, 2, 2); cx.fillRect(-4, 2, 2, 2); cx.fillRect(2, 2, 2, 2);
        } else if (item.id === 'golden') {
          cx.fillStyle = '#F09000';
          cx.fillRect(-5, -2, 5, 4); cx.fillRect(-1, -5, 4, 4); cx.fillRect(2, -2, 4, 8); cx.fillRect(-3, 5, 6, 3);
          cx.fillStyle = '#FFD040'; cx.fillRect(-4, -1, 2, 2);
        } else if (item.id === 'moon') {
          cx.fillStyle = col; cx.fillRect(-5, -5, 10, 10);
          cx.fillStyle = SDV.oakDark; cx.fillRect(-2, -4, 9, 8);
        } else { cx.fillStyle = col; cx.fillRect(-5, -4, 10, 8); }
      }
      cx.restore();
    }

    // ── PARTICLES ─────────────────────────────────────────────────────────────
    function drawParticles() {
      particles.forEach((p: any) => {
        if (p.type === 'popup') {
          const a = p.life / p.maxLife;
          cx.globalAlpha = a;
          drawTextShadow(p.text, IS_MOBILE ? 6 : 5, p.x, p.y, p.col, 'center');
          cx.globalAlpha = 1;
        } else if (p.type === 'ripple') {
          const a = p.life / p.maxLife;
          cx.strokeStyle = `rgba(160,210,255,${a * 0.6})`;
          cx.lineWidth = 1;
          cx.beginPath(); cx.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, Math.PI * 2); cx.stroke();
        } else {
          const a = p.life / p.maxLife;
          cx.fillStyle = p.col; cx.globalAlpha = a;
          cx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
          cx.globalAlpha = 1;
        }
      });
    }

    // ── TEXT HELPERS ──────────────────────────────────────────────────────────
    function drawText(txt: string, size: number, x: number, y: number, col = SDV.parchment, align: CanvasTextAlign = 'left') {
      cx.font = `${size}px 'Press Start 2P', monospace`;
      cx.textAlign = align;
      cx.fillStyle = col;
      cx.fillText(String(txt), x, y);
    }
    function drawTextShadow(txt: string, size: number, x: number, y: number, col = SDV.parchment, align: CanvasTextAlign = 'left') {
      cx.font = `${size}px 'Press Start 2P', monospace`;
      cx.textAlign = align;
      cx.fillStyle = 'rgba(0,0,0,0.7)';
      cx.fillText(String(txt), x + 2, y + 2);
      cx.fillStyle = col;
      cx.fillText(String(txt), x, y);
    }

    // ── INPUT ─────────────────────────────────────────────────────────────────
    const keys: Record<string, boolean> = {};
    (window as any)._deepReelKeys = keys;

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!keys[e.code]) handleKey(e.code, true);
      keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    });
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === S.CAST_CHARGE) releasePowerCast();
      keys[e.code] = false;
    });

    let castDragActive = false;
    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      const { mx, my } = canvasMouse(e);
      handlePointerDown(mx, my);
    });
    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!e.buttons && !castDragActive) return;
      const { mx, my } = canvasMouse(e);
      handlePointerMove(mx, my);
    });
    canvas.addEventListener('pointerup', (e: PointerEvent) => {
      const { mx, my } = canvasMouse(e);
      handlePointerUp(mx, my);
      castDragActive = false;
    });

    function canvasMouse(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return { mx: (e.clientX - rect.left) / SCALE, my: (e.clientY - rect.top) / SCALE };
    }

    function handlePointerDown(mx: number, my: number) {
      if (state === S.TITLE)     { newGame(); state = S.DEPTH; return; }
      if (state === S.TROPHY)    { state = S.DEPTH; return; }
      if (state === S.DEPTH) {
        const tby = IS_MOBILE ? 418 : 218;
        if (my > tby - 10 && my < tby + 10 && mx > W - 70) { state = S.TROPHY; return; }
        const wy = IS_MOBILE ? 220 : 88;
        if (my > wy + 8 && my < wy + 50) {
          const bw = IS_MOBILE ? 86 : 78;
          const gap = IS_MOBILE ? 95 : 82;
          const ox = IS_MOBILE ? 14 : 22;
          for (let i = 0; i < 3; i++) {
            if (mx > ox + i * gap && mx < ox + i * gap + bw) { g.depthSel = i; }
          }
        }
        const by2 = IS_MOBILE ? 345 : 158;
        if (my > by2 + 2 && my < by2 + 22) {
          g.baits.forEach((_b2: any, i: number) => {
            const bx = 45 + i * 58;
            if (mx > bx && mx < bx + 52) { g.activeBait = g.activeBait === i ? null : i; }
          });
        }
        startCastCharge();
        return;
      }
      if (state === S.CAST_CHARGE) { releasePowerCast(); return; }
      if (state === S.WAITING)    { earlyReel(); return; }
      if (state === S.BITE)       { startReel(); return; }
      if (state === S.CAUGHT || state === S.MISS) { if (g.timer > 30) nextCast(); return; }
      if (state === S.ZONE_CLEAR) {
        const by3 = IS_MOBILE ? 350 : 175;
        if (my > by3 && my < by3 + 30) openShop();
        return;
      }
      if (state === S.GAME_OVER || state === S.WIN) { state = S.TITLE; return; }
      if (state === S.SHOP)       { handleShopClick(mx, my); return; }
    }

    function handlePointerMove(mx: number, my: number) {
      if ((state === S.DEPTH || state === S.CAST_CHARGE) && g.castHeld) {
        g.castAimX = mx;
        g.castAimY = Math.min(my, getWaterY() - 5);
        castDragActive = true;
      }
    }

    function handlePointerUp(mx: number, my: number) {
      if (state === S.CAST_CHARGE) { releasePowerCast(); return; }
      if (state === S.DEPTH && g.castHeld) {
        g.castHeld = false;
        startCast(mx, my);
      }
    }

    function handleKey(code: string, _down: boolean) {
      if (state === S.TITLE)    { if (code === 'Space' || code === 'Enter') { newGame(); state = S.DEPTH; } return; }
      if (state === S.TROPHY)   { if (code === 'Space' || code === 'Escape' || code === 'Enter') state = S.DEPTH; return; }
      if (state === S.DEPTH) {
        if (code === 'ArrowLeft'  || code === 'KeyA') g.depthSel = Math.max(0, g.depthSel - 1);
        if (code === 'ArrowRight' || code === 'KeyD') g.depthSel = Math.min(2, g.depthSel + 1);
        if (code === 'KeyT') { state = S.TROPHY; return; }
        if (code === 'Tab')  { g.activeBait = g.baits.length ? (g.activeBait === null ? 0 : (g.activeBait + 1) % g.baits.length) : null; }
        if (code === 'Space' || code === 'Enter') startCastCharge();
        return;
      }
      if (state === S.CAST_CHARGE) return;
      if (state === S.WAITING)  { if (code === 'Space') earlyReel(); return; }
      if (state === S.BITE)     { if (code === 'Space' || code === 'Enter') startReel(); return; }
      if (state === S.CAUGHT || state === S.MISS) { if (code === 'Space' || code === 'Enter') nextCast(); return; }
      if (state === S.ZONE_CLEAR) { if (code === 'Space' || code === 'Enter') openShop(); return; }
      if (state === S.GAME_OVER || state === S.WIN) { if (code === 'Space' || code === 'Enter') state = S.TITLE; return; }
      if (state === S.SHOP) {
        if (code === 'ArrowLeft'  || code === 'KeyA') g.shopSel = Math.max(0, g.shopSel - 1);
        if (code === 'ArrowRight' || code === 'KeyD') g.shopSel = Math.min(shopPageItems().length - 1, g.shopSel + 1);
        if (code === 'Tab')    { g.shopTab = (g.shopTab + 1) % 3; g.shopSel = 0; }
        if (code === 'Space' || code === 'Enter') shopBuy();
        if (code === 'Escape') leaveShop();
        return;
      }
    }

    function handleShopClick(mx: number, my: number) {
      const tabY = 32, tabH = 18;
      if (my > tabY && my < tabY + tabH) {
        const tabW = Math.floor(W / 3);
        for (let i = 0; i < 3; i++) {
          if (mx > i * tabW && mx < (i + 1) * tabW) { g.shopTab = i; g.shopSel = 0; return; }
        }
      }
      const items = shopPageItems();
      const colCount = 2;
      const itemW = IS_MOBILE ? 148 : 148;
      const itemH = IS_MOBILE ? 68 : 62;
      const itemStartY = 54;
      const gapX = 8, startX = 8;
      items.forEach((_item: any, i: number) => {
        const col = i % colCount;
        const row = Math.floor(i / colCount);
        const bx  = startX + col * (itemW + gapX);
        const by  = itemStartY + row * (itemH + 4);
        if (mx > bx && mx < bx + itemW && my > by && my < by + itemH) { g.shopSel = i; shopBuy(); }
      });
      const bottomY = IS_MOBILE ? H - 50 : 208;
      if (my > bottomY && my < bottomY + 18 && mx < 110) leaveShop();
      if (my > bottomY && my < bottomY + 18 && mx > W - 110) {
        if (g.coins >= 15) {
          g.coins -= 15;
          if (g.shopTab === 0) g.shopBaits = [...BAIT_CATALOG].sort(() => Math.random() - 0.5).slice(0, 4);
          else if (g.shopTab === 1) {
            const av = ROD_UPGRADES.filter(u => !g.upgrades.some((e: any) => e.id === u.id));
            g.shopUpgrades = [...av].sort(() => Math.random() - 0.5).slice(0, 3);
          } else {
            const av = LURES.filter(l => !g.lures.some((e: any) => e.id === l.id));
            g.shopLures = [...av].sort(() => Math.random() - 0.5).slice(0, 3);
          }
          addPopup('SHOP REROLLED!', SDV.parchDark, W / 2, 80);
        } else addPopup('NEED 15G!', SDV.dmg, W / 2, 80);
      }
    }

    // ── START ─────────────────────────────────────────────────────────────────
    newGame();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      delete (window as any)._deepReelKeys;
    };
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0A0604',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}

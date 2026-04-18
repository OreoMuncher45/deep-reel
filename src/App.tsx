import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // ══════════════════════════════════════════════════════
    //  REEL DEEP — v2.1 (cabin shop, speed fix, magnet nerf)
    // ══════════════════════════════════════════════════════

    // ── MOBILE DETECTION ──────────────────────────────────
    const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 600;

    // ── CANVAS SETUP ─────────────────────────────────────
    const W = 320, H = IS_MOBILE ? 480 : 240;
    const canvas = document.getElementById('c') as HTMLCanvasElement;
    let SCALE: number;

    function resizeCanvas() {
      const mbar = document.getElementById('mobile-bar') as HTMLElement;
      if (IS_MOBILE) {
        const barH = 64;
        const avW = window.innerWidth;
        const avH = window.innerHeight - barH;
        SCALE = Math.min(avW / W, avH / H);
        canvas.width = Math.floor(W * SCALE);
        canvas.height = Math.floor(H * SCALE);
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        mbar.style.display = 'flex';
      } else {
        SCALE = Math.min(Math.floor(window.innerWidth / W), Math.floor(window.innerHeight / H), 4) || 3;
        canvas.width = W * SCALE;
        canvas.height = H * SCALE;
        canvas.style.width = '';
        canvas.style.height = '';
      }
      cx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      cx.imageSmoothingEnabled = false;
    }

    const cx = canvas.getContext('2d')!;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── PALETTE ──────────────────────────────────────────
    const P = {
      sky0:'#050d1a', sky1:'#0a1f3a', sky2:'#0f2d52',
      water0:'#0d3d6b', water1:'#1155a0', water2:'#1a6bbf', waterFoam:'#4090c8',
      sand:'#c8a060', boat:'#8b5e3c', boatDark:'#5c3d20', boatLight:'#c88a5a',
      line:'#d4c090', bobber0:'#e03030', bobber1:'#f0f0f0',
      ui:'#e8e0c8', uiDark:'#a09070', uiHl:'#f8e040', uiBg:'rgba(5,13,26,0.92)',
      common:'#b0c8d8', uncommon:'#60c860', rare:'#4898f8', epic:'#c060f0', legendary:'#f8c820',
      hp:'#e03030', hpBg:'#3a1010', coin:'#f8c820', coinBg:'#3a2a00',
      btn:'#204060', btnHl:'#2860a0', btnBorder:'#4898f8',
      dmg:'#f03030', score:'#f8e040',
      cloud:'rgba(200,220,255,0.18)',
      moonGlow:'rgba(200,220,255,0.12)',
      // cabin wood tones
      wood:'#8B5E2A', woodDark:'#5C3A10', woodLight:'#C4873C', woodMid:'#A0672A',
      plankEdge:'#3A2008', plankHL:'#D4A050', cabin:'#6B4520', cabinRoof:'#4A2E10',
    };

    // ══════════════════════════════════════════════════════
    // SOUND ENGINE
    // ══════════════════════════════════════════════════════
    let audioCtx: AudioContext | null = null;
    function getAudio() {
      if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) { audioCtx = null; }
      }
      return audioCtx;
    }
    function resumeAudio() {
      const ac = getAudio();
      if (ac && ac.state === 'suspended') ac.resume();
    }

    function playTone(freq: number, type: OscillatorType, dur: number, vol: number, startFreq?: number, attack=0.01, decay=0.1, release=0.05) {
      const ac = getAudio(); if (!ac) return;
      resumeAudio();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = type || 'square';
      const now = ac.currentTime;
      if (startFreq) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.linearRampToValueAtTime(freq, now + dur * 0.4);
      } else {
        osc.frequency.setValueAtTime(freq, now);
      }
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol || 0.18, now + attack);
      gain.gain.setValueAtTime(vol || 0.18, now + attack + decay);
      gain.gain.linearRampToValueAtTime(0, now + dur + release);
      osc.start(now);
      osc.stop(now + dur + release + 0.05);
    }

    function playNoise(dur: number, vol: number, hipass=400) {
      const ac = getAudio(); if (!ac) return;
      resumeAudio();
      const bufSize = ac.sampleRate * dur;
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const filt = ac.createBiquadFilter();
      filt.type = 'highpass'; filt.frequency.value = hipass;
      const gain = ac.createGain();
      src.connect(filt); filt.connect(gain); gain.connect(ac.destination);
      const now = ac.currentTime;
      gain.gain.setValueAtTime(vol || 0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + dur);
      src.start(now); src.stop(now + dur + 0.05);
    }

    const SFX = {
      cast:      () => { playTone(800, 'sine', 0.18, 0.10, 200); playNoise(0.12, 0.06, 2000); },
      splash:    () => { playNoise(0.25, 0.14, 500); playTone(180, 'sine', 0.2, 0.06, 400); },
      bite:      () => {
        playTone(440, 'square', 0.08, 0.15);
        setTimeout(() => playTone(550, 'square', 0.08, 0.15), 100);
        setTimeout(() => playTone(660, 'square', 0.1, 0.2), 200);
      },
      reel:      () => playTone(120, 'sawtooth', 0.06, 0.04),
      inZone:    () => playTone(880, 'sine', 0.04, 0.06),
      snap:      () => { playNoise(0.3, 0.2, 100); playTone(80, 'sawtooth', 0.3, 0.12, 300); },
      caught:    (tier: number) => {
        const freqs = [[262,330,392,523],[330,415,494,659],[392,494,587,784],[494,622,740,988],[659,830,988,1319]];
        const fs = freqs[Math.min(tier, 4)];
        fs.forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.18, 0.14 + i*0.02), i * 80));
      },
      miss:      () => { playTone(200, 'sawtooth', 0.3, 0.15, 400); playNoise(0.2, 0.08, 200); },
      buy:       () => { playTone(523, 'sine', 0.1, 0.12); setTimeout(() => playTone(659, 'sine', 0.12, 0.14), 90); },
      error:     () => playTone(150, 'square', 0.2, 0.12),
      zoneclear: () => {
        [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f,'square',0.22,0.15+i*0.02), i*100));
      },
      magnet:    () => playTone(600, 'sine', 0.05, 0.05, 400),
    };

    // ── ZONE SKY THEMES ──────────────────────────────────
    const SKY_THEMES = [
      { topCol:'#0d1a2e', botCol:'#1a3550', horizCol:'#c86030', wCol:'#1060b8', moonPhase:'crescent', stars:20, cloudCount:4, fog:0, ambient:'dawn' },
      { topCol:'#040e1e', botCol:'#082035', horizCol:'#204080', wCol:'#0e509a', moonPhase:'half', stars:35, cloudCount:3, fog:0.05, ambient:'day' },
      { topCol:'#080518', botCol:'#150a28', horizCol:'#502060', wCol:'#0c4080', moonPhase:'gibbous', stars:55, cloudCount:2, fog:0.1, ambient:'dusk' },
      { topCol:'#020409', botCol:'#050812', horizCol:'#0a0a20', wCol:'#082868', moonPhase:'full', stars:80, cloudCount:1, fog:0.2, ambient:'night' },
      { topCol:'#010102', botCol:'#020308', horizCol:'#050510', wCol:'#050f30', moonPhase:'none', stars:100, cloudCount:0, fog:0.35, ambient:'abyss' },
    ];

    // ── FISH CATALOG ─────────────────────────────────────
    // FIXED: erratic speed 2.4→1.6, boss speed 3.0→1.9 (rare fish were too fast)
    const FISH: Record<string, any> = {
      minnow:    {name:'MINNOW',    tier:0, pts:55,   coins:6,   col:'#7bc8f0', w:16,h:7,  fight:'drift',   prob:{s:40,m:15,d:0},  depth:0.1},
      carp:      {name:'CARP',      tier:0, pts:90,   coins:9,   col:'#c8a060', w:20,h:9,  fight:'drift',   prob:{s:35,m:15,d:0},  depth:0.15},
      perch:     {name:'PERCH',     tier:1, pts:170,  coins:14,  col:'#f0a830', w:19,h:9,  fight:'shake',   prob:{s:15,m:28,d:5},  depth:0.25},
      bass:      {name:'BASS',      tier:1, pts:210,  coins:17,  col:'#50b850', w:23,h:10, fight:'shake',   prob:{s:10,m:27,d:5},  depth:0.3},
      trout:     {name:'TROUT',     tier:2, pts:650,  coins:28,  col:'#e87060', w:25,h:10, fight:'surge',   prob:{s:0, m:12,d:18}, depth:0.45},
      tuna:      {name:'TUNA',      tier:2, pts:950,  coins:32,  col:'#3870d8', w:29,h:11, fight:'surge',   prob:{s:0, m:3, d:20}, depth:0.5},
      swordfish: {name:'SWORDFISH', tier:3, pts:2800, coins:65,  col:'#a050e0', w:35,h:9,  fight:'erratic', prob:{s:0, m:0, d:13}, depth:0.65},
      oarfish:   {name:'OARFISH',   tier:3, pts:4500, coins:85,  col:'#c040b0', w:40,h:7,  fight:'erratic', prob:{s:0, m:0, d:6},  depth:0.72},
      kraken:    {name:'KRAKEN',    tier:4, pts:18000,coins:220, col:'#f8c820', w:38,h:18, fight:'boss',    prob:{s:0, m:0, d:3},  depth:0.85},
    };
    const FISH_LIST = Object.keys(FISH);
    const TIER_COLS = [P.common, P.uncommon, P.rare, P.epic, P.legendary];
    const TIER_NAMES = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];

    // ── BAITS ────────────────────────────────────────────
    const BAIT_CATALOG = [
      {id:'worm',    name:'EARTHWORM',  cost:12, uses:5, col:'#c87840', icon:'🪱', desc:'Basic. All fish.',   bonusTier:0, attract:1.0, missProtect:false, luckyBonus:false},
      {id:'cricket', name:'CRICKET',    cost:18, uses:4, col:'#a0a030', icon:'🦗', desc:'+20% uncommon rate', bonusTier:1, attract:1.2, missProtect:false, luckyBonus:false},
      {id:'squid',   name:'RAW SQUID',  cost:30, uses:3, col:'#c0d0f0', icon:'🦑', desc:'+35% rare rate',     bonusTier:2, attract:1.35,missProtect:false, luckyBonus:false},
      {id:'glowbug', name:'GLOWBUG',    cost:45, uses:3, col:'#80f0a0', icon:'✨', desc:'Deep fish only',     bonusTier:3, attract:1.5, missProtect:false, luckyBonus:false},
      {id:'bread',   name:'BREAD BALL', cost:8,  uses:6, col:'#e8c880', icon:'🍞', desc:'Common+coin +5',     bonusTier:0, attract:0.9, missProtect:false, luckyBonus:true},
      {id:'explosive',name:'BOMB BAIT', cost:70, uses:2, col:'#f04020', icon:'💣', desc:'EPIC+ guaranteed',   bonusTier:3, attract:2.0, missProtect:false, luckyBonus:false},
    ];

    // ── LURES ────────────────────────────────────────────
    const LURES = [
      {id:'lucky',   name:'LUCKY BOBBER',  cost:55,  col:'#f8e040', desc:'1st fish/zone: x2'},
      {id:'chum',    name:'CHUM SLICK',    cost:45,  col:'#90c830', desc:'+2 casts per zone'},
      {id:'depth',   name:'DEPTH SOUNDER', cost:110, col:'#38a0f8', desc:'Rare+: +15% mult'},
      {id:'school',  name:'SCHOOL FINDER', cost:85,  col:'#30d8a0', desc:'Species combo +1x'},
      {id:'moon',    name:'MOON LURE',     cost:95,  col:'#9060f8', desc:'Odd zones: x1.5'},
      {id:'rusty',   name:'RUSTY REEL',    cost:65,  col:'#a07840', desc:'Miss = +120 pts'},
      {id:'golden',  name:'GOLDEN WORM',   cost:160, col:'#f09000', desc:'10%: legendary fish'},
      {id:'charge',  name:'DEPTH CHARGE',  cost:130, col:'#f05030', desc:'Every 5th: bonus'},
    ];

    // ── ROD UPGRADES ─────────────────────────────────────
    const ROD_UPGRADES = [
      {id:'reel1',    name:'SWIFT REEL I',   cost:70,  col:'#60d8f8', desc:'Cursor speed +25%',      type:'reel',     val:0.25, tier:0},
      {id:'reel2',    name:'SWIFT REEL II',  cost:130, col:'#30b0f0', desc:'Cursor speed +50%',      type:'reel',     val:0.50, tier:1},
      {id:'turbo',    name:'TURBO REEL',     cost:210, col:'#f8e040', desc:'Cursor speed x2!',        type:'reel',     val:1.00, tier:2},
      {id:'ironline', name:'IRON LINE',      cost:90,  col:'#c0c8d8', desc:'Tension builds -40%',    type:'tension',  val:0.40, tier:0},
      {id:'kevlar',   name:'KEVLAR LINE',    cost:160, col:'#90f0f0', desc:'Tension builds -70%',    type:'tension',  val:0.70, tier:1},
      // MAGNET NERFED: 0.18 → 0.162 (10% reduction), deepmagnet 0.35 → 0.315
      {id:'magnet',   name:'LURE MAGNET',    cost:120, col:'#f060f0', desc:'Zone pulls cursor in',   type:'magnet',   val:0.162,tier:1},
      {id:'anchor',   name:'ZONE ANCHOR',    cost:150, col:'#40f8a0', desc:'Zone slows when inside', type:'anchor',   val:0.45, tier:1},
      {id:'deepmagnet',name:'DEEP MAGNET',   cost:220, col:'#ff80ff', desc:'Strong pull + anchor',   type:'deepmagnet',val:0.315,tier:2},
      {id:'calm',     name:'ANGLER CALM',    cost:75,  col:'#80f0a0', desc:'Zone drains tension x2', type:'calm',     val:2.00, tier:0},
      {id:'zen',      name:'ZEN MASTER',     cost:180, col:'#c0ffd0', desc:'Auto-recover tension',   type:'zen',      val:0.80, tier:1},
      {id:'cast1',    name:'LONG ROD',       cost:60,  col:'#c8a060', desc:'Cast range +30%',        type:'cast',     val:0.30, tier:0},
      {id:'cast2',    name:'CARBON ROD',     cost:110, col:'#a0a0c8', desc:'Cast power x1.5',        type:'cast',     val:0.50, tier:1},
      {id:'luckrod',  name:'LUCKY ROD',      cost:85,  col:'#f8c820', desc:'Accuracy bonus x1.3',   type:'accuracy', val:0.30, tier:0},
      {id:'doubler',  name:'REEL DOUBLER',   cost:250, col:'#ff6060', desc:'Catch score x1.5!',      type:'doubler',  val:0.50, tier:2},
    ];

    // ── ZONES ────────────────────────────────────────────
    const ZONES = [
      {name:'SHALLOWS',   quota:500,   casts:10, pool:'s', desc:'Calm waters, easy fish'},
      {name:'THE REEF',   quota:2000,  casts:12, pool:'m', desc:'Colourful & tricky'},
      {name:'OPEN WATER', quota:6000,  casts:14, pool:'m', desc:'Vast and unpredictable'},
      {name:'THE DEEP',   quota:16000, casts:14, pool:'d', desc:'Rare monsters lurk'},
      {name:'THE ABYSS',  quota:40000, casts:12, pool:'d', desc:'Face the unknown'},
    ];

    // ── GAME STATES ──────────────────────────────────────
    const S = {TITLE:0,DEPTH:1,CASTING:2,WAITING:3,BITE:4,REEL:5,CAUGHT:6,MISS:7,SHOP:8,ZONE_CLEAR:9,GAME_OVER:10,WIN:11,STATS:12};
    let state = S.TITLE;
    let g: any = {};

    let starField: any[] = [];
    function genStars(count: number) {
      starField = [];
      for (let i = 0; i < count; i++) {
        starField.push({
          x: Math.random() * W,
          y: Math.random() * (IS_MOBILE ? H * 0.45 : H * 0.55),
          r: Math.random(),
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOff: Math.random() * Math.PI * 2,
          size: Math.random() < 0.1 ? 2 : 1,
        });
      }
    }

    let clouds: any[] = [];
    function genClouds(count: number) {
      clouds = [];
      for (let i = 0; i < count; i++) {
        clouds.push({
          x: Math.random() * W,
          y: 20 + Math.random() * 50,
          w: 40 + Math.random() * 60,
          h: 10 + Math.random() * 18,
          speed: 0.05 + Math.random() * 0.12,
          alpha: 0.08 + Math.random() * 0.15,
        });
      }
    }

    let particles: any[] = [];
    function spawnSplash(x: number, y: number, count: number, col: string) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 0.5 + Math.random() * 3;
        particles.push({x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd - 2,
          life: 30 + Math.random()*20, maxLife: 50, col: col || P.water2, size: 1 + Math.random()*2});
      }
    }
    function spawnRipple(x: number, y: number) {
      particles.push({x, y, type:'ripple', r:0, maxR:20, life:40, maxLife:40, col:P.waterFoam});
    }

    let underwaterFish: any[] = [];
    function genUnderwaterFish(zone: number) {
      underwaterFish = [];
      const count = 4 + zone;
      for (let i = 0; i < count; i++) {
        const keys = FISH_LIST.filter(k => FISH[k].prob[ZONES[zone].pool] > 0);
        const fk = keys[Math.floor(Math.random() * keys.length)];
        const f = FISH[fk];
        underwaterFish.push({
          fish: f, x: Math.random() * W,
          y: getWaterY() + 15 + f.depth * 60 + Math.random() * 20,
          speed: 0.2 + Math.random() * 0.5,
          dir: Math.random() < 0.5 ? 1 : -1,
          t: Math.random() * 100, alpha: 0.15 + Math.random() * 0.2,
        });
      }
    }

    function newGame() {
      g = {
        zone:0, score:0, coins:80, lures:[], upgrades:[], baits:[],
        activeBait:null,
        zScore:0, castsLeft:ZONES[0].casts, misses:0, catchCount:0,
        speciesCaught:{}, catches:[], firstFishZone:true,
        fish:null, reel:null, shopItems:[], shopTab:0, shopSel:0,
        timer:0, msg:'', msgTimer:0, popups:[], waterT:0,
        bobberX:200, bobberY:0,
        linePhase:0, biteAnim:0,
        castPhase:0, castPower:0, castAngle:-0.9,
        castHeld:false, castHoldT:0,
        castAimX:200, castAimY:140,
        depthSel:1,
        depthSounderMult:0, multBonus:1,
        consecutiveMisses:0, catchDisplay:null,
        catchCardAnim:0,
        combo:0, comboTimer:0,
        totalCasts:0, totalCatches:0, biggestScore:0,
        castBonus:1.0,
      };
      g.bobberY = getWaterY();
      genStars(SKY_THEMES[0].stars);
      genClouds(SKY_THEMES[0].cloudCount);
      genUnderwaterFish(0);
      particles = [];
    }

    const keys: Record<string, boolean> = {};
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!keys[e.code]) handleKey(e.code);
      keys[e.code] = true;
    });
    document.addEventListener('keyup', (e: KeyboardEvent) => { keys[e.code] = false; });

    let castDragActive = false;

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      const {mx, my} = canvasMouse(e);
      handlePointerDown(mx, my);
    });
    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!e.buttons && !castDragActive) return;
      const {mx, my} = canvasMouse(e);
      handlePointerMove(mx, my);
    });
    canvas.addEventListener('pointerup', (e: PointerEvent) => {
      const {mx, my} = canvasMouse(e);
      handlePointerUp(mx, my);
      castDragActive = false;
    });

    function canvasMouse(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        mx: (e.clientX - rect.left) / SCALE,
        my: (e.clientY - rect.top) / SCALE,
      };
    }

    function handlePointerDown(mx: number, my: number) {
      if (state === S.TITLE) { newGame(); state = S.DEPTH; return; }
      if (state === S.DEPTH) {
        const wy = IS_MOBILE ? 220 : 90;
        if (my > wy - 5 && my < wy + 65) {
          const bw = IS_MOBILE ? 90 : 80;
          const gap = IS_MOBILE ? 100 : 85;
          const ox = IS_MOBILE ? 15 : 25;
          for (let i = 0; i < 3; i++) {
            if (mx > ox + i * gap && mx < ox + i * gap + bw) { g.depthSel = i; }
          }
        }
        const by2 = IS_MOBILE ? 310 : 155;
        if (my > by2 && my < by2 + 50) {
          g.baits.forEach((_b2: any, i: number) => {
            const bx = 20 + i * 60;
            if (mx > bx && mx < bx + 52) { g.activeBait = g.activeBait === i ? null : i; }
          });
        }
        return;
      }
      if (state === S.WAITING) { earlyReel(); return; }
      if (state === S.CAUGHT || state === S.MISS) { if (g.timer > 30) nextCast(); return; }
      if (state === S.ZONE_CLEAR) {
        const by3 = IS_MOBILE ? 350 : 175;
        if (my > by3 && my < by3 + 25) openShop();
        return;
      }
      if (state === S.GAME_OVER || state === S.WIN) { state = S.TITLE; return; }
      if (state === S.SHOP) { handleShopClick(mx, my); return; }
      if (state === S.STATS) { state = S.DEPTH; return; }
    }

    function handlePointerMove(mx: number, my: number) {
      if (state === S.DEPTH && g.castHeld) {
        g.castAimX = mx;
        g.castAimY = Math.min(my, getWaterY() - 5);
        castDragActive = true;
      }
    }

    function handlePointerUp(mx: number, my: number) {
      if (state === S.DEPTH && g.castHeld) {
        g.castHeld = false;
        startCast(mx, my);
      }
    }

    function handleKey(code: string) {
      if (state === S.TITLE) { if (code === 'Space' || code === 'Enter') { newGame(); state = S.DEPTH; } return; }
      if (state === S.DEPTH) {
        if (code === 'ArrowLeft' || code === 'KeyA') g.depthSel = Math.max(0, g.depthSel - 1);
        if (code === 'ArrowRight' || code === 'KeyD') g.depthSel = Math.min(2, g.depthSel + 1);
        if (code === 'Space' || code === 'Enter') startCast(g.castAimX, g.castAimY, true);
        if (code === 'Tab') { g.activeBait = g.baits.length ? (g.activeBait === null ? 0 : (g.activeBait + 1) % g.baits.length) : null; }
        return;
      }
      if (state === S.WAITING) { if (code === 'Space') earlyReel(); return; }
      if (state === S.CAUGHT || state === S.MISS) { if (code === 'Space' || code === 'Enter') nextCast(); return; }
      if (state === S.ZONE_CLEAR) { if (code === 'Space' || code === 'Enter') openShop(); return; }
      if (state === S.GAME_OVER || state === S.WIN) { if (code === 'Space' || code === 'Enter') state = S.TITLE; return; }
      if (state === S.SHOP) {
        if (code === 'ArrowLeft' || code === 'KeyA') g.shopSel = Math.max(0, g.shopSel - 1);
        if (code === 'ArrowRight' || code === 'KeyD') g.shopSel = Math.min(shopPageItems().length, g.shopSel + 1);
        if (code === 'Tab') { g.shopTab = (g.shopTab + 1) % 3; g.shopSel = 0; }
        if (code === 'Space' || code === 'Enter') shopBuy();
        if (code === 'Escape') leaveShop();
        return;
      }
      if (state === S.STATS) { if (code === 'Space' || code === 'Enter' || code === 'Escape') state = S.DEPTH; return; }
    }

    // Mobile button handlers exposed to window
    (window as any).mobileBaitCycle = () => {
      if (g.baits.length === 0) return;
      g.activeBait = g.activeBait === null ? 0 : (g.activeBait + 1) % g.baits.length;
    };
    (window as any).mobileCast = () => {
      if (state === S.DEPTH) startCast(g.castAimX, g.castAimY, true);
      if (state === S.WAITING) earlyReel();
    };
    (window as any).mobileShop = () => {
      if (state === S.ZONE_CLEAR) openShop();
    };

    const mbReel = document.getElementById('mb-reel');
    if (mbReel) {
      mbReel.addEventListener('pointerdown', () => { keys['Space'] = true; });
      mbReel.addEventListener('pointerup', () => { keys['Space'] = false; });
      mbReel.addEventListener('touchstart', (e) => { e.preventDefault(); keys['Space'] = true; }, {passive:false});
      mbReel.addEventListener('touchend', (e) => { e.preventDefault(); keys['Space'] = false; }, {passive:false});
    }

    function getWaterY(x=W/2, t=g?.waterT||0) {
      const base = IS_MOBILE ? H * 0.42 : 118;
      return base + Math.sin((x/40 + t) * 1.2) * 3 + Math.sin((x/20 + t*1.7) * 0.8) * 1.5;
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
        const legs = FISH_LIST.filter(k => FISH[k].tier === 4);
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

    function currentPool() {
      const p = ZONES[g.zone].pool;
      if (g.depthSel === 0 && p !== 'd') return 's';
      if (g.depthSel === 2 || p === 'd') return 'd';
      return 'm';
    }

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
      return Math.max(0.08, m);
    }
    function tensionDrainMult() {
      let m = 1;
      if (hasUpgrade('calm')) m += 1.0;
      if (hasUpgrade('zen'))  m += 2.0;
      return m;
    }
    // MAGNET NERFED by 10%
    function magnetStrength() {
      if (hasUpgrade('deepmagnet')) return 0.315;
      if (hasUpgrade('magnet'))     return 0.162;
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
      mult *= scoreMult();
      const total = Math.round(base * mult);
      return {total, base, mult: mult.toFixed(1)};
    }

    function startCast(aimX: number, aimY: number, keyboard=false) {
      if (g.castsLeft <= 0) return;
      g.castsLeft--;
      g.totalCasts++;
      g.castAimX = keyboard ? (140 + g.depthSel * 40) : (aimX || 180);
      g.castAimY = keyboard ? getWaterY() - 5 : (aimY || getWaterY() - 5);
      const idealX = 160 + g.depthSel * 30;
      const dist = Math.abs(g.castAimX - idealX);
      g.castBonus = Math.max(0, 1 - dist / 150);
      if (g.activeBait !== null && g.baits[g.activeBait]) {
        g.baits[g.activeBait].usesLeft--;
        if (g.baits[g.activeBait].usesLeft <= 0) {
          g.baits.splice(g.activeBait, 1);
          g.activeBait = g.baits.length > 0 ? 0 : null;
          addPopup('BAIT USED UP!', P.uiDark, W/2, 90);
        }
      }
      g.fish = pickFish(currentPool());
      g.biteDelay = 70 + Math.random() * 100 + g.depthSel * 35;
      g.castT = 0;
      state = S.CASTING;
      SFX.cast();
      spawnSplash(g.castAimX, g.castAimY + 5, 8, P.waterFoam);
      spawnRipple(g.castAimX, g.castAimY);
    }

    function earlyReel() {
      if (state !== S.WAITING) return;
      g.consecutiveMisses++;
      if (hasLure('rusty')) { g.zScore += 120; g.score += 120; addPopup('+120', P.score, W/2, 90); }
      addPopup('TOO EARLY!', P.dmg, W/2, 100);
      SFX.miss();
      g.combo = 0;
      state = S.MISS; g.timer = 0;
    }

    function startReel() {
      const fish = g.fish;
      const zoneW = IS_MOBILE ? 260 : 220;
      let sw: number, sp: number;
      // FIXED: Rare fish (erratic/boss) had too-high zone speeds — slowed down significantly
      switch(fish.fight) {
        case 'drift':   sw = 58; sp = 1.0; break;
        case 'shake':   sw = 48; sp = 1.4; break;
        case 'surge':   sw = 40; sp = 1.6; break;  // was 1.8
        case 'erratic': sw = 36; sp = 1.55; break;  // was 2.4 — MAJOR fix
        case 'boss':    sw = 30; sp = 1.85; break;  // was 3.0 — MAJOR fix
        default:        sw = 50; sp = 1.0;
      }
      const by = IS_MOBILE ? H - 130 : 183;
      g.reel = {
        barX: IS_MOBILE ? 30 : 50, barY: by, barW: zoneW, barH: 20,
        cur: zoneW / 2, vel: 0,
        zoneX: zoneW / 2 - sw / 2, zoneW: sw,
        tension: 0, t: 0, speed: sp,
        success: 0, duration: fish.tier * 28 + 55,
        fishFightT: 0, done: false,
        _wasInZone: false, _anchorPulse: 0,
      };
      state = S.REEL;
    }

    function nextCast() {
      if (g.castsLeft <= 0 || g.zScore >= ZONES[g.zone].quota) {
        if (g.zScore >= ZONES[g.zone].quota) { state = S.ZONE_CLEAR; g.timer = 0; SFX.zoneclear(); }
        else state = S.GAME_OVER;
        return;
      }
      state = S.DEPTH;
      if (hasLure('charge') && g.catchCount > 0 && g.catchCount % 5 === 0) {
        const bf = pickFish(currentPool());
        const sc = calcScore(bf);
        g.zScore += sc.total; g.score += sc.total;
        g.coins += bf.coins;
        addPopup('⚡ DEPTH CHARGE! +' + sc.total, P.legendary, W/2, 80);
      }
    }

    function openShop() {
      const avLures = LURES.filter(l => !g.lures.some((e: any) => e.id === l.id));
      const avUpgrades = ROD_UPGRADES.filter(u => !g.upgrades.some((e: any) => e.id === u.id));
      g.shopLures = [...avLures].sort(() => Math.random() - 0.5).slice(0, 3);
      g.shopUpgrades = [...avUpgrades].sort(() => Math.random() - 0.5).slice(0, 3);
      g.shopBaits = [...BAIT_CATALOG].sort(() => Math.random() - 0.5).slice(0, 4);
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
      const item = items[g.shopSel];
      if (!item) return;
      if (g.coins < item.cost) { addPopup('NEED MORE COINS!', P.dmg, W/2, 100); SFX.error(); return; }
      if (g.shopTab === 0) {
        const existing = g.baits.find((b: any) => b.id === item.id);
        if (existing) { existing.usesLeft += item.uses; }
        else { g.baits.push({...item, usesLeft: item.uses}); }
        g.coins -= item.cost;
        addPopup('BAIT BOUGHT!', P.uncommon, W/2, 100);
        SFX.buy();
        items.splice(g.shopSel, 1);
        if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
      } else if (g.shopTab === 1) {
        if (g.upgrades.length >= 6) { addPopup('UPGRADE SLOTS FULL!', P.dmg, W/2, 100); return; }
        if (!hasUpgrade(item.id)) {
          g.coins -= item.cost;
          g.upgrades.push(item);
          addPopup('UPGRADED!', P.rare, W/2, 100);
          SFX.buy();
          items.splice(g.shopSel, 1);
          if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
        }
      } else {
        if (g.lures.length >= 5) { addPopup('LURE SLOTS FULL!', P.dmg, W/2, 100); return; }
        if (!hasLure(item.id)) {
          g.coins -= item.cost;
          g.lures.push(item);
          addPopup('LURE EQUIPPED!', P.epic, W/2, 100);
          SFX.buy();
          items.splice(g.shopSel, 1);
          if (g.shopSel >= items.length) g.shopSel = Math.max(0, items.length - 1);
        }
      }
    }

    function handleShopClick(mx: number, my: number) {
      const tabY = IS_MOBILE ? 50 : 40;
      const tabH = IS_MOBILE ? 28 : 22;
      if (my > tabY && my < tabY + tabH) {
        const tabW = W / 3;
        for (let i = 0; i < 3; i++) {
          if (mx > i * tabW && mx < (i+1) * tabW) { g.shopTab = i; g.shopSel = 0; return; }
        }
      }
      const items = shopPageItems();
      const colCount = IS_MOBILE ? 2 : 3;
      const itemW = IS_MOBILE ? 140 : 88;
      const itemH = IS_MOBILE ? 100 : 95;
      const itemStartY = IS_MOBILE ? 85 : 68;
      const gapX = IS_MOBILE ? 15 : 8;
      const startX = IS_MOBILE ? 10 : 10;
      items.forEach((_item: any, i: number) => {
        const col2 = i % colCount;
        const row = Math.floor(i / colCount);
        const bx = startX + col2 * (itemW + gapX);
        const by = itemStartY + row * (itemH + 5);
        if (mx > bx && mx < bx + itemW && my > by && my < by + itemH) {
          g.shopSel = i;
          shopBuy();
        }
      });
      const leaveY = IS_MOBILE ? H - 55 : 215;
      if (my > leaveY && my < leaveY + 25) leaveShop();
      const rerollY = IS_MOBILE ? H - 90 : 195;
      if (my > rerollY && my < rerollY + 18 && mx > W - 90 && mx < W - 10) {
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
          addPopup('SHOP REROLLED!', P.uiDark, W/2, 80);
        } else addPopup('NEED 15 COINS!', P.dmg, W/2, 80);
      }
    }

    function leaveShop() {
      g.zone++;
      if (g.zone >= ZONES.length) { state = S.WIN; return; }
      const z = ZONES[g.zone];
      g.castsLeft = z.casts + (hasLure('chum') ? 2 : 0);
      g.zScore = 0; g.catches = []; g.catchCount = 0;
      g.firstFishZone = true; g.depthSel = 1;
      g.combo = 0; g.comboTimer = 0;
      genStars(SKY_THEMES[g.zone].stars);
      genClouds(SKY_THEMES[g.zone].cloudCount);
      genUnderwaterFish(g.zone);
      state = S.DEPTH;
    }

    function addPopup(text: string, col: string, x: number, y: number) {
      particles.push({type:'popup', text, col, x, y: y || 100, vy: -0.7, life: 90, maxLife: 90});
    }

    let last = 0;
    let animId: number;
    function loop(ts: number) {
      const dt = Math.min(ts - last, 50); last = ts;
      if (g.waterT !== undefined) g.waterT += (dt / 1000) * 0.8;
      update(dt);
      draw();
      animId = requestAnimationFrame(loop);
    }

    function update(_dt: number) {
      particles.forEach((p: any) => {
        if (p.type === 'popup') { p.y += p.vy; p.life--; }
        else if (p.type === 'ripple') { p.r += 0.5; p.life--; }
        else { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--; }
      });
      particles = particles.filter((p: any) => p.life > 0);
      clouds.forEach((cl: any) => {
        cl.x += cl.speed;
        if (cl.x > W + cl.w) cl.x = -cl.w;
      });
      underwaterFish.forEach((uf: any) => {
        uf.x += uf.speed * uf.dir;
        uf.t += 0.05;
        if (uf.x > W + 30) uf.x = -30;
        if (uf.x < -30) uf.x = W + 30;
      });
      if (g.comboTimer > 0) { g.comboTimer--; if (g.comboTimer <= 0) g.combo = 0; }

      if (state === S.CASTING) {
        g.castT = (g.castT || 0) + 1;
        const dur = 35;
        const t = Math.min(g.castT / dur, 1);
        const sx = 96, sy = getWaterY(80) - 18;
        const cpx = (sx + g.castAimX) / 2, cpy = Math.min(sy, g.castAimY) - 50;
        g.bobberX = lerp(lerp(sx, cpx, t), lerp(cpx, g.castAimX, t), t);
        g.bobberY = lerp(lerp(sy, cpy, t), lerp(cpy, g.castAimY, t), t);
        if (g.castT >= dur + 15) {
          g.bobberX = g.castAimX;
          g.bobberY = getWaterY(g.castAimX);
          spawnRipple(g.bobberX, g.bobberY);
          state = S.WAITING; g.timer = 0;
        }
        return;
      }
      if (state === S.WAITING) {
        g.timer++;
        g.bobberY = getWaterY(g.bobberX);
        if (g.timer >= g.biteDelay) { state = S.BITE; g.biteAnim = 0; }
        return;
      }
      if (state === S.BITE) {
        g.biteAnim++;
        g.bobberY = getWaterY(g.bobberX) + Math.sin(g.biteAnim * 0.6) * 5;
        if (g.biteAnim === 1) SFX.bite();
        if (g.biteAnim === 8) spawnSplash(g.bobberX, g.bobberY, 12, P.waterFoam);
        if (g.biteAnim > 28) startReel();
        return;
      }
      if (state === S.REEL) updateReel();
      if (state === S.CAUGHT || state === S.MISS) {
        g.timer++;
        if (state === S.CAUGHT && g.catchCardAnim < 1) g.catchCardAnim = Math.min(1, g.catchCardAnim + 0.06);
        if (g.timer > 160) nextCast();
      }
      if (state === S.ZONE_CLEAR || state === S.GAME_OVER || state === S.WIN) g.timer++;
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function updateReel() {
      const r = g.reel;
      const fish = g.fish;
      r.t++;

      const inZonePrev = r.cur >= r.zoneX && r.cur <= r.zoneX + r.zoneW;
      const anchored = inZonePrev && anchorStrength() > 0;
      const speedScale = anchored ? (1 - anchorStrength()) : 1.0;
      r.fishFightT += (r.speed / 60) * speedScale;

      const mid = r.barW / 2;
      let tz = mid - r.zoneW / 2;
      const ft = r.fishFightT;
      switch(fish.fight) {
        case 'drift':   tz = mid - r.zoneW/2 + Math.sin(ft * 0.9) * 60; break;
        case 'shake':   tz = mid - r.zoneW/2 + Math.sin(ft * 1.8) * 65 + Math.sin(ft * 5) * 20; break;
        case 'surge':   tz = mid - r.zoneW/2 + Math.sin(ft * 1.2) * 75 + Math.sin(ft * 0.4) * 35; break;
        // FIXED: erratic zone movement — was too fast/chaotic, now more readable
        case 'erratic': tz = mid - r.zoneW/2 + Math.sin(ft * 1.5 + Math.sin(ft * 0.9) * 1.8) * 72; break;
        case 'boss': {
          const ph = Math.floor(ft / 5) % 3;
          if (ph === 0) tz = mid - r.zoneW/2 + Math.sin(ft * 1.8) * 78;
          else if (ph === 1) tz = mid - r.zoneW/2 + (ft % 5 / 5) * 150;
          else tz = mid - r.zoneW/2 + Math.sin(ft * 1.0) * 72 + Math.cos(ft * 2.2) * 22;
          break;
        }
      }
      r.zoneX = Math.max(0, Math.min(r.barW - r.zoneW, tz));

      const spd = reelSpeedMult();
      if (keys['Space'] || keys['ArrowRight'] || keys['KeyD']) r.vel += 0.4 * spd;
      else r.vel -= 0.3 * spd;

      // MAGNET: strength already nerfed in magnetStrength(), but also reduce the pull multiplier here
      const mag = magnetStrength();
      if (mag > 0) {
        const zoneCtr = r.zoneX + r.zoneW / 2;
        const diff = zoneCtr - r.cur;
        // multiplier reduced from 0.08 to 0.065 for extra nerf
        r.vel += diff * mag * 0.065;
        if (r.t % 20 === 0) SFX.magnet();
      }

      r.vel = Math.max(-4 * spd, Math.min(4 * spd, r.vel));
      r.cur += r.vel;
      r.cur = Math.max(0, Math.min(r.barW, r.cur));

      const inZone = r.cur >= r.zoneX && r.cur <= r.zoneX + r.zoneW;
      if (inZone) {
        r.tension = Math.max(0, r.tension - 3 * tensionDrainMult());
        r.success++;
        if (!r._wasInZone) SFX.inZone();
        if (anchored) r._anchorPulse = (r._anchorPulse || 0) + 1;
      } else {
        r.tension += 0.35 * tensionBuildMult();
        r.success = Math.max(0, r.success - 0.5);
        r._anchorPulse = 0;
      }
      r._wasInZone = inZone;

      const zenVal = zenAutoRecover();
      if (zenVal > 0 && r.tension > 0) r.tension = Math.max(0, r.tension - zenVal * 0.05);
      if (r.t % 8 === 0 && (keys['Space'] || keys['ArrowRight'] || keys['KeyD'])) SFX.reel();

      if (r.tension >= 100) {
        g.consecutiveMisses++;
        if (hasLure('rusty')) { g.zScore += 120; g.score += 120; addPopup('+120 RUSTY', P.score, W/2, 90); }
        if (g.consecutiveMisses >= 3) {
          g.castsLeft = Math.max(0, g.castsLeft - 1);
          addPopup('LINE SNAP! -1 CAST', P.dmg, W/2, 80);
          g.consecutiveMisses = 0;
        }
        spawnSplash(g.bobberX, g.bobberY, 6, P.dmg);
        addPopup('LINE SNAPPED!', P.dmg, W/2, 100);
        SFX.snap();
        g.combo = 0;
        state = S.MISS; g.timer = 0;
        return;
      }
      if (r.success >= r.duration) {
        g.consecutiveMisses = 0;
        const sc = calcScore(g.fish);
        g.zScore += sc.total; g.score += sc.total;
        if (g.score > g.biggestScore) g.biggestScore = g.score;
        g.coins += g.fish.coins + (activeBaitData()?.luckyBonus ? 5 : 0);
        g.catchCount++; g.totalCatches++;
        g.speciesCaught[g.fish.name] = (g.speciesCaught[g.fish.name] || 0) + 1;
        g.catchDisplay = {fish: g.fish, score: sc};
        g.catchCardAnim = 0;
        g.combo++;
        g.comboTimer = 300;
        spawnSplash(g.bobberX, g.bobberY, 20, TIER_COLS[g.fish.tier]);
        SFX.caught(g.fish.tier);
        addPopup('+' + sc.total, P.score, W/2, IS_MOBILE ? H/2 - 20 : 80);
        if (g.combo > 1) addPopup('x' + g.combo + ' COMBO!', '#f0a0ff', W/2, IS_MOBILE ? H/2 - 40 : 65);
        state = S.CAUGHT; g.timer = 0;
      }
    }

    // ══════════════════════════════════════════════════════
    // DRAW
    // ══════════════════════════════════════════════════════
    function draw() {
      cx.clearRect(0, 0, W, H);
      if (state === S.TITLE) { drawTitle(); return; }
      if (state === S.WIN) { drawWin(); return; }
      const sk = SKY_THEMES[g.zone] || SKY_THEMES[0];
      drawSky(sk);
      drawClouds(sk);
      drawMoon(sk);
      drawStars(sk);
      drawWaterBody(sk);
      if (state !== S.SHOP && state !== S.STATS) {
        drawBoat();
        drawUnderwaterFish();
        if (state !== S.DEPTH) drawLine();
      }
      if (state === S.DEPTH) drawDepthSelect();
      else if (state === S.CASTING || state === S.WAITING || state === S.BITE) drawWaitingState();
      else if (state === S.REEL) drawReel();
      else if (state === S.CAUGHT) drawCaught();
      else if (state === S.MISS) drawMiss();
      else if (state === S.ZONE_CLEAR) drawZoneClear();
      else if (state === S.GAME_OVER) drawGameOver();
      else if (state === S.SHOP) drawShop();
      else if (state === S.STATS) drawStats();
      if (state !== S.SHOP && state !== S.TITLE && state !== S.WIN && state !== S.STATS) drawHUD();
      drawParticles();
    }

    function drawSky(sk: any) {
      const grad = cx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, sk.topCol);
      grad.addColorStop(0.7, sk.botCol);
      if (sk.ambient === 'dawn' || sk.ambient === 'dusk') grad.addColorStop(0.85, sk.horizCol);
      grad.addColorStop(1, sk.wCol);
      cx.fillStyle = grad;
      cx.fillRect(0, 0, W, H);
      if (sk.fog > 0) {
        const fg = cx.createLinearGradient(0, getWaterY() - 30, 0, getWaterY() + 20);
        fg.addColorStop(0, `rgba(100,140,200,0)`);
        fg.addColorStop(1, `rgba(100,140,200,${sk.fog})`);
        cx.fillStyle = fg;
        cx.fillRect(0, getWaterY() - 30, W, 50);
      }
    }

    function drawStars(_sk: any) {
      const t = g.waterT;
      starField.forEach(s => {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * s.twinkleSpeed + s.twinkleOff));
        cx.fillStyle = `rgba(255,255,255,${twinkle * 0.85})`;
        cx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      });
    }

    function drawClouds(_sk: any) {
      clouds.forEach(cl => {
        cx.fillStyle = `rgba(200,220,255,${cl.alpha})`;
        cx.beginPath();
        cx.ellipse(cl.x, cl.y, cl.w/2, cl.h/2, 0, 0, Math.PI*2);
        cx.fill();
        cx.beginPath();
        cx.ellipse(cl.x - cl.w*0.2, cl.y + 4, cl.w*0.35, cl.h*0.45, 0, 0, Math.PI*2);
        cx.fill();
        cx.beginPath();
        cx.ellipse(cl.x + cl.w*0.2, cl.y + 3, cl.w*0.3, cl.h*0.4, 0, 0, Math.PI*2);
        cx.fill();
      });
    }

    function drawMoon(sk: any) {
      if (sk.moonPhase === 'none') return;
      const mx2 = 270, my2 = IS_MOBILE ? 55 : 35;
      const r = 12;
      const grd = cx.createRadialGradient(mx2, my2, r*0.5, mx2, my2, r*3);
      grd.addColorStop(0, 'rgba(220,230,255,0.18)');
      grd.addColorStop(1, 'rgba(220,230,255,0)');
      cx.fillStyle = grd;
      cx.beginPath(); cx.arc(mx2, my2, r*3, 0, Math.PI*2); cx.fill();
      cx.fillStyle = '#d8e4f8';
      cx.beginPath(); cx.arc(mx2, my2, r, 0, Math.PI*2); cx.fill();
      if (sk.moonPhase === 'crescent') {
        cx.fillStyle = SKY_THEMES[g.zone].topCol;
        cx.beginPath(); cx.arc(mx2 - 5, my2, r * 0.85, 0, Math.PI*2); cx.fill();
      } else if (sk.moonPhase === 'half') {
        cx.fillStyle = SKY_THEMES[g.zone].topCol;
        cx.fillRect(mx2, my2 - r, r+2, r*2+2);
      } else if (sk.moonPhase === 'gibbous') {
        cx.fillStyle = SKY_THEMES[g.zone].topCol;
        cx.beginPath(); cx.arc(mx2 + 4, my2, r * 0.7, 0, Math.PI*2); cx.fill();
      }
      if (sk.moonPhase === 'full') {
        cx.fillStyle = 'rgba(180,195,225,0.5)';
        cx.beginPath(); cx.arc(mx2-3, my2-3, 3, 0, Math.PI*2); cx.fill();
        cx.beginPath(); cx.arc(mx2+4, my2+4, 2, 0, Math.PI*2); cx.fill();
        cx.beginPath(); cx.arc(mx2-2, my2+5, 1.5, 0, Math.PI*2); cx.fill();
      }
    }

    function drawWaterBody(sk: any) {
      cx.fillStyle = sk.wCol;
      cx.beginPath(); cx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) cx.lineTo(x, getWaterY(x));
      cx.lineTo(W, H); cx.closePath(); cx.fill();
      for (let i = 0; i < 3; i++) {
        const alpha = 0.06 + i * 0.04;
        cx.strokeStyle = `rgba(180,220,255,${alpha})`;
        cx.lineWidth = 1;
        cx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = getWaterY(x) + i * 3 + Math.sin((x/30 + g.waterT * 1.5 + i) * 1.1) * 1.5;
          if (x === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
        }
        cx.stroke();
      }
    }

    function drawUnderwaterFish() {
      underwaterFish.forEach(uf => {
        cx.save();
        cx.globalAlpha = uf.alpha * (0.7 + 0.3 * Math.sin(uf.t));
        cx.translate(Math.round(uf.x), Math.round(uf.y));
        cx.scale(uf.dir < 0 ? -1 : 1, 1);
        const f = uf.fish;
        cx.fillStyle = f.col;
        cx.fillRect(-f.w/2, -f.h/2, f.w, f.h);
        cx.fillRect(-f.w/2 - 5, -f.h/2, 5, f.h);
        cx.globalAlpha = 1;
        cx.restore();
      });
    }

    function drawBoat() {
      const bx = 80, by = getWaterY(80) - 8;
      cx.fillStyle = 'rgba(0,0,0,0.2)';
      cx.fillRect(bx - 26, by + 14, 52, 4);
      cx.fillStyle = P.boatDark;
      cx.fillRect(bx - 28, by + 8, 56, 7);
      cx.fillStyle = P.boat;
      cx.fillRect(bx - 24, by, 48, 10);
      cx.fillStyle = P.boatLight;
      cx.fillRect(bx - 22, by, 44, 3);
      cx.fillStyle = '#3a2810';
      cx.fillRect(bx - 9, by - 13, 18, 13);
      cx.fillStyle = '#5a3a1a';
      cx.fillRect(bx - 7, by - 11, 14, 9);
      cx.fillStyle = '#a8d0f8';
      cx.fillRect(bx - 4, by - 9, 8, 5);
      cx.fillStyle = 'rgba(255,255,255,0.4)';
      cx.fillRect(bx - 3, by - 9, 2, 2);
      cx.strokeStyle = '#7a5a30'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(bx + 14, by); cx.lineTo(bx + 18, by - 22); cx.stroke();
      cx.strokeStyle = '#6a4a20'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(bx - 22, by); cx.lineTo(bx - 22, by - 6); cx.stroke();
      cx.beginPath(); cx.moveTo(bx + 22, by); cx.lineTo(bx + 22, by - 6); cx.stroke();
      cx.beginPath(); cx.moveTo(bx - 22, by - 6); cx.lineTo(bx + 22, by - 6); cx.stroke();
    }

    function drawLine() {
      const rodTip = {x: 96 + 14, y: getWaterY(80) - 18 - 22};
      if (state === S.CASTING) {
        cx.strokeStyle = P.line; cx.lineWidth = 1;
        cx.setLineDash([2, 2]);
        cx.beginPath(); cx.moveTo(rodTip.x, rodTip.y); cx.lineTo(g.bobberX, g.bobberY); cx.stroke();
        cx.setLineDash([]);
        return;
      }
      cx.strokeStyle = P.line; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(rodTip.x, rodTip.y); cx.lineTo(g.bobberX, g.bobberY); cx.stroke();
      if (state !== S.REEL && state !== S.CAUGHT && state !== S.MISS) {
        cx.fillStyle = P.bobber0;
        cx.fillRect(g.bobberX - 3, g.bobberY - 5, 6, 6);
        cx.fillStyle = P.bobber1;
        cx.fillRect(g.bobberX - 3, g.bobberY - 5, 6, 2);
        cx.fillStyle = P.line;
        cx.fillRect(g.bobberX - 1, g.bobberY + 1, 2, 4);
      }
    }

    function drawDepthSelect() {
      const wY = getWaterY();
      const panelY = IS_MOBILE ? wY + 15 : wY + 10;
      const panelH = IS_MOBILE ? H - panelY - 10 : H - panelY - 5;
      cx.fillStyle = 'rgba(5,13,26,0.82)';
      cx.fillRect(0, panelY, W, panelH);
      cx.strokeStyle = 'rgba(72,152,248,0.25)';
      cx.lineWidth = 1;
      cx.strokeRect(0, panelY, W, panelH);
      const headY = panelY + (IS_MOBILE ? 18 : 14);
      drawText('CHOOSE CAST', 7, W/2, headY, P.ui, 'center');
      const depths = [
        {name:'SHALLOW', sub:'Common fish', col:'#4898f8'},
        {name:'MID WATER', sub:'Uncommon+', col:'#60c860'},
        {name:'DEEP CAST', sub:'Rare+', col:'#c060f0'},
      ];
      const bw = IS_MOBILE ? 88 : 82, bh = IS_MOBILE ? 62 : 55;
      const gap = IS_MOBILE ? 5 : 4;
      const totalW = bw * 3 + gap * 2;
      const startX = (W - totalW) / 2;
      const btnY = panelY + (IS_MOBILE ? 28 : 22);
      for (let i = 0; i < 3; i++) {
        const bx = startX + i * (bw + gap);
        const sel = i === g.depthSel;
        cx.fillStyle = sel ? `rgba(${i===0?'72,152,248':i===1?'96,200,96':'192,96,240'},0.22)` : 'rgba(10,22,40,0.85)';
        cx.fillRect(bx, btnY, bw, bh);
        cx.strokeStyle = sel ? depths[i].col : 'rgba(255,255,255,0.12)';
        cx.lineWidth = sel ? 2 : 1;
        cx.strokeRect(bx, btnY, bw, bh);
        for (let d = 0; d < 3; d++) {
          cx.fillStyle = d <= i ? depths[i].col : 'rgba(255,255,255,0.15)';
          cx.fillRect(bx + 8 + d * 10, btnY + 8, 8, 3 + d * 2);
        }
        drawText(depths[i].name, IS_MOBILE ? 5 : 5, bx + bw/2, btnY + (IS_MOBILE ? 30 : 26), sel ? depths[i].col : P.uiDark, 'center');
        drawText(depths[i].sub, IS_MOBILE ? 4 : 4, bx + bw/2, btnY + (IS_MOBILE ? 44 : 40), P.uiDark, 'center');
      }
      const baitY = btnY + bh + (IS_MOBILE ? 12 : 10);
      drawText('BAIT:', 5, 8, baitY + 8, P.uiDark, 'left');
      if (g.baits.length === 0) {
        drawText('NONE', 5, 45, baitY + 8, P.uiDark, 'left');
      } else {
      g.baits.forEach((bait: any, i: number) => {
        const bx2 = 45 + i * (IS_MOBILE ? 58 : 52);
          const sel = i === g.activeBait;
          cx.fillStyle = sel ? 'rgba(72,152,248,0.3)' : 'rgba(10,22,40,0.7)';
          cx.fillRect(bx2 - 3, baitY - 2, IS_MOBILE ? 52 : 48, IS_MOBILE ? 18 : 16);
          cx.strokeStyle = sel ? P.btnBorder : 'rgba(255,255,255,0.15)';
          cx.lineWidth = 1;
          cx.strokeRect(bx2 - 3, baitY - 2, IS_MOBILE ? 52 : 48, IS_MOBILE ? 18 : 16);
          cx.fillStyle = bait.col;
          cx.fillRect(bx2, baitY + 2, 8, 8);
          drawText(bait.name.slice(0, 5), 4, bx2 + 11, baitY + 10, sel ? P.ui : P.uiDark, 'left');
          drawText('x' + bait.usesLeft, 4, bx2 + (IS_MOBILE ? 36 : 32), baitY + 10, sel ? P.coin : P.uiDark, 'left');
        });
      }
      const aimX = g.castAimX || 180;
      const aimY = getWaterY(aimX) - 2;
      cx.strokeStyle = 'rgba(72,152,248,0.3)';
      cx.lineWidth = 1;
      cx.setLineDash([3, 3]);
      cx.beginPath();
      cx.moveTo(110, getWaterY(80) - 18);
      const cpx = (110 + aimX) / 2, cpy = Math.min(getWaterY(80) - 18, aimY) - 30;
      cx.quadraticCurveTo(cpx, cpy, aimX, aimY);
      cx.stroke();
      cx.setLineDash([]);
      cx.fillStyle = 'rgba(72,152,248,0.6)';
      cx.beginPath(); cx.arc(aimX, aimY, 4, 0, Math.PI*2); cx.fill();
      const castBtnY = panelY + panelH - (IS_MOBILE ? 22 : 20);
      drawBox(W/2 - 55, castBtnY, 110, IS_MOBILE ? 18 : 16, P.btnBorder, 'rgba(5,13,26,0.9)');
      drawText('SPACE/CLICK = CAST', 5, W/2, castBtnY + (IS_MOBILE ? 12 : 11), P.uiHl, 'center');
    }

    function drawWaitingState() {
      if (state === S.WAITING) {
        const prog = g.timer / g.biteDelay;
        const bw2 = 40;
        cx.fillStyle = 'rgba(72,152,248,0.12)';
        cx.fillRect(W/2 - bw2, IS_MOBILE ? H - 80 : H - 30, bw2 * 2, 4);
        cx.fillStyle = 'rgba(72,152,248,0.4)';
        cx.fillRect(W/2 - bw2, IS_MOBILE ? H - 80 : H - 30, bw2 * 2 * prog, 4);
        const rp = (g.timer % 50) / 50;
        cx.strokeStyle = `rgba(72,152,248,${0.5 - rp * 0.5})`;
        cx.lineWidth = 1;
        cx.beginPath(); cx.arc(g.bobberX, g.bobberY, rp * 18, 0, Math.PI*2); cx.stroke();
        drawText('WAITING...', 5, W/2, IS_MOBILE ? H - 55 : H - 18, P.uiDark, 'center');
      }
      if (state === S.BITE) {
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          const r2 = g.biteAnim * 1.5;
          cx.fillStyle = `rgba(26,107,191,${0.9 - g.biteAnim/28 * 0.9})`;
          cx.fillRect(g.bobberX + Math.cos(a)*r2 - 1, g.bobberY + Math.sin(a)*r2*0.5 - 1, 2, 2);
        }
        drawTextShadow('BITE!', IS_MOBILE ? 20 : 16, W/2, IS_MOBILE ? H/2 - 10 : 88, P.uiHl, 'center');
        drawText('REEL IT IN!', 6, W/2, IS_MOBILE ? H/2 + 15 : 105, P.uiDark, 'center');
      }
    }

    function drawReel() {
      const r = g.reel;
      const fish = g.fish;
      const fishY = IS_MOBILE ? H * 0.38 : 150;
      const fx = W/2 + Math.sin(r.fishFightT * 2.5) * 28;
      const fy = fishY + Math.cos(r.fishFightT * 1.8) * 10;
      cx.save();
      cx.globalAlpha = 0.85;
      drawFish(fish, fx, fy, r.fishFightT, IS_MOBILE ? 1.6 : 1.2);
      cx.globalAlpha = 1;
      cx.restore();
      const tc = TIER_COLS[fish.tier];
      drawTextShadow(fish.name, IS_MOBILE ? 10 : 9, W/2, IS_MOBILE ? 28 : 22, tc, 'center');
      drawText(TIER_NAMES[fish.tier], 5, W/2, IS_MOBILE ? 42 : 34, tc + 'aa', 'center');
      const bx = r.barX, by = r.barY, bw = r.barW, bh = r.barH;
      cx.fillStyle = 'rgba(5,13,26,0.9)';
      cx.fillRect(bx - 6, by - 18, bw + 12, bh + 40);
      cx.strokeStyle = 'rgba(72,152,248,0.4)';
      cx.lineWidth = 1;
      cx.strokeRect(bx - 6, by - 18, bw + 12, bh + 40);
      drawText('CATCH', 5, bx, by - 12, P.uiDark, 'left');
      cx.fillStyle = 'rgba(30,200,80,0.15)';
      cx.fillRect(bx, by - 9, bw, 5);
      cx.fillStyle = 'rgba(30,200,80,0.8)';
      cx.fillRect(bx, by - 9, Math.round((r.success / r.duration) * bw), 5);
      cx.fillStyle = '#080f1e';
      cx.fillRect(bx, by, bw, bh);
      const pulse = 0.5 + Math.sin(r.t * 0.3) * 0.25;
      const zg = cx.createLinearGradient(bx + r.zoneX, by, bx + r.zoneX + r.zoneW, by);
      zg.addColorStop(0, `rgba(30,200,80,${pulse * 0.3})`);
      zg.addColorStop(0.5, `rgba(30,200,80,${pulse * 0.8})`);
      zg.addColorStop(1, `rgba(30,200,80,${pulse * 0.3})`);
      cx.fillStyle = zg;
      cx.fillRect(bx + r.zoneX, by, r.zoneW, bh);
      const inZone = r.cur >= r.zoneX && r.cur <= r.zoneX + r.zoneW;
      const curCol = inZone ? '#f8e040' : '#e03030';
      cx.fillStyle = curCol;
      cx.fillRect(bx + r.cur - 3, by - 4, 6, bh + 8);
      cx.fillStyle = inZone ? 'rgba(248,224,64,0.3)' : 'rgba(224,48,48,0.3)';
      cx.fillRect(bx + r.cur - 6, by - 4, 12, bh + 8);
      const tenW = Math.round((r.tension / 100) * bw);
      const tenGrad = cx.createLinearGradient(bx, by + bh + 4, bx + tenW, by + bh + 4);
      tenGrad.addColorStop(0, 'rgba(80,220,80,0.8)');
      tenGrad.addColorStop(0.5, 'rgba(220,180,0,0.8)');
      tenGrad.addColorStop(1, 'rgba(224,48,48,0.9)');
      cx.fillStyle = 'rgba(255,255,255,0.08)';
      cx.fillRect(bx, by + bh + 4, bw, 6);
      cx.fillStyle = tenGrad;
      cx.fillRect(bx, by + bh + 4, tenW, 6);
      if (r.tension > 70) {
        cx.fillStyle = `rgba(224,48,48,${0.3 + Math.sin(r.t * 0.5) * 0.3})`;
        cx.fillRect(bx, by + bh + 4, tenW, 6);
      }
      drawText('TENSION', 4, bx, by + bh + 17, P.uiDark, 'left');
      drawText(Math.round(r.tension) + '%', 4, bx + bw, by + bh + 17, r.tension > 70 ? P.dmg : P.uiDark, 'right');
      const instY = by - 22;
      drawText(IS_MOBILE ? 'HOLD REEL BTN' : 'HOLD SPACE TO REEL', 5, W/2, instY, P.uiDark, 'center');
    }

    function drawCaught() {
      const cd = g.catchDisplay;
      if (!cd) return;
      const a = g.catchCardAnim;
      const cardH = IS_MOBILE ? 180 : 140;
      const cardY = IS_MOBILE ? H/2 - cardH/2 + (1-a)*50 : 55 + (1-a)*30;
      cx.fillStyle = `rgba(5,13,26,${0.75 * a})`;
      cx.fillRect(0, 0, W, H);
      const tc = TIER_COLS[cd.fish.tier];
      cx.strokeStyle = tc;
      cx.lineWidth = 2;
      cx.strokeRect(30, cardY, W - 60, cardH);
      cx.fillStyle = 'rgba(5,13,26,0.92)';
      cx.fillRect(31, cardY+1, W-62, cardH-2);
      cx.fillStyle = tc;
      cx.fillRect(30, cardY, W-60, IS_MOBILE ? 16 : 14);
      drawText(TIER_NAMES[cd.fish.tier], IS_MOBILE ? 6 : 5, W/2, cardY + (IS_MOBILE ? 11 : 10), '#000', 'center');
      drawFish(cd.fish, W/2, cardY + (IS_MOBILE ? 60 : 52), g.timer * 0.04, IS_MOBILE ? 2 : 1.5);
      drawTextShadow(cd.fish.name, IS_MOBILE ? 10 : 8, W/2, cardY + (IS_MOBILE ? 95 : 78), tc, 'center');
      drawText('BASE: ' + cd.fish.pts, IS_MOBILE ? 6 : 5, W/2, cardY + (IS_MOBILE ? 114 : 96), P.uiDark, 'center');
      drawTextShadow('+' + cd.score.total, IS_MOBILE ? 14 : 11, W/2, cardY + (IS_MOBILE ? 136 : 114), P.uiHl, 'center');
      drawText('x' + cd.score.mult + ' MULT', IS_MOBILE ? 6 : 5, W/2, cardY + (IS_MOBILE ? 152 : 126), '#f0a0ff', 'center');
      cx.fillStyle = P.coin; cx.fillRect(W/2 - 30, cardY + (IS_MOBILE ? 160 : 132), 8, 8);
      drawText('+' + cd.fish.coins, IS_MOBILE ? 6 : 5, W/2 - 18, cardY + (IS_MOBILE ? 169 : 140), P.coin, 'left');
      if (g.combo > 1) drawText('COMBO x' + g.combo + '!', IS_MOBILE ? 7 : 6, W/2, cardY - 12, '#f0a0ff', 'center');
      if (g.timer > 60) drawText('TAP TO CONTINUE', 5, W/2, cardY + cardH + 14, P.uiDark, 'center');
    }

    function drawMiss() {
      cx.fillStyle = 'rgba(224,48,48,0.1)';
      cx.fillRect(0, 0, W, H);
      const my = IS_MOBILE ? H/2 - 20 : 95;
      drawTextShadow('MISSED!', IS_MOBILE ? 16 : 14, W/2, my, P.dmg, 'center');
      if (g.consecutiveMisses > 0)
        drawText('MISS STREAK: ' + g.consecutiveMisses, 6, W/2, my + 22, P.dmg, 'center');
      drawText('KEEP YOUR LINE STEADY', 5, W/2, my + 40, P.uiDark, 'center');
      if (g.timer > 60) drawText('TAP TO CONTINUE', 5, W/2, my + 58, P.uiDark, 'center');
    }

    function drawZoneClear() {
      const boxY = IS_MOBILE ? 80 : 45, boxH = IS_MOBILE ? 230 : 160;
      cx.fillStyle = 'rgba(5,13,26,0.9)';
      cx.fillRect(20, boxY, W - 40, boxH);
      cx.strokeStyle = P.legendary; cx.lineWidth = 2;
      cx.strokeRect(20, boxY, W - 40, boxH);
      drawTextShadow('ZONE CLEAR!', IS_MOBILE ? 13 : 11, W/2, boxY + (IS_MOBILE ? 28 : 22), P.legendary, 'center');
      drawText(ZONES[g.zone].name, IS_MOBILE ? 8 : 7, W/2, boxY + (IS_MOBILE ? 50 : 40), P.uiDark, 'center');
      const scoreY = boxY + (IS_MOBILE ? 72 : 60);
      drawText('ZONE SCORE', 6, W/2, scoreY, P.uiDark, 'center');
      drawTextShadow(g.zScore.toLocaleString(), IS_MOBILE ? 12 : 10, W/2, scoreY + 20, P.uiHl, 'center');
      drawText('TOTAL: ' + g.score.toLocaleString(), 6, W/2, scoreY + 38, P.ui, 'center');
      drawText('COINS: ' + g.coins, 6, W/2, scoreY + 54, P.coin, 'center');
      drawText('CAUGHT: ' + g.catchCount + ' FISH', 6, W/2, scoreY + 70, P.uncommon, 'center');
      if (g.zone < ZONES.length - 1) {
        drawText('NEXT ZONE:', 5, W/2, scoreY + 92, P.uiDark, 'center');
        drawText(ZONES[g.zone + 1].name, 6, W/2, scoreY + 108, P.btnBorder, 'center');
        if (g.timer > 30) {
          const btnY = boxY + boxH - (IS_MOBILE ? 28 : 22);
          drawBox(W/2 - 55, btnY, 110, IS_MOBILE ? 20 : 18, P.legendary, 'rgba(5,13,26,0.9)');
          drawText('ENTER SHOP', IS_MOBILE ? 7 : 6, W/2, btnY + (IS_MOBILE ? 14 : 12), P.legendary, 'center');
        }
      }
    }

    function drawGameOver() {
      cx.fillStyle = 'rgba(5,13,26,0.94)'; cx.fillRect(0, 0, W, H);
      const cy = IS_MOBILE ? H/2 - 60 : 70;
      drawTextShadow('EXPEDITION', IS_MOBILE ? 13 : 11, W/2, cy, P.dmg, 'center');
      drawTextShadow('FAILED', IS_MOBILE ? 13 : 11, W/2, cy + (IS_MOBILE ? 22 : 18), P.dmg, 'center');
      drawText('QUOTA: ' + ZONES[g.zone].quota.toLocaleString(), 7, W/2, cy + 50, P.uiDark, 'center');
      drawText('SCORED: ' + g.zScore.toLocaleString(), 7, W/2, cy + 66, P.ui, 'center');
      drawText('TOTAL: ' + g.score.toLocaleString(), 7, W/2, cy + 82, P.uiHl, 'center');
      drawText('FISH CAUGHT: ' + g.totalCatches, 6, W/2, cy + 98, P.uncommon, 'center');
      if (g.timer > 60) {
        drawBox(W/2 - 60, cy + 118, 120, IS_MOBILE ? 22 : 20, P.dmg, 'rgba(5,13,26,0.9)');
        drawText('TRY AGAIN', IS_MOBILE ? 7 : 6, W/2, cy + 132, P.ui, 'center');
      }
    }

    function drawHUD() {
      const z = ZONES[g.zone];
      const hudH = IS_MOBILE ? 26 : 20;
      cx.fillStyle = 'rgba(5,13,26,0.88)';
      cx.fillRect(0, 0, W, hudH);
      cx.strokeStyle = 'rgba(72,152,248,0.3)';
      cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(0, hudH); cx.lineTo(W, hudH); cx.stroke();
      drawText(z.name, IS_MOBILE ? 5 : 5, 4, IS_MOBILE ? 16 : 13, P.uiDark, 'left');
      const qp = Math.min(g.zScore / z.quota, 1);
      const qbx = IS_MOBILE ? W/2 - 50 : W/2 - 38, qbw = IS_MOBILE ? 100 : 76;
      cx.fillStyle = 'rgba(72,152,248,0.15)'; cx.fillRect(qbx, IS_MOBILE ? 6 : 4, qbw, IS_MOBILE ? 11 : 9);
      const qGrad = cx.createLinearGradient(qbx, 0, qbx + qbw, 0);
      qGrad.addColorStop(0, '#1060b8'); qGrad.addColorStop(1, qp >= 1 ? P.legendary : P.btnBorder);
      cx.fillStyle = qGrad;
      cx.fillRect(qbx, IS_MOBILE ? 6 : 4, Math.round(qp * qbw), IS_MOBILE ? 11 : 9);
      cx.strokeStyle = 'rgba(72,152,248,0.5)'; cx.lineWidth = 1;
      cx.strokeRect(qbx, IS_MOBILE ? 6 : 4, qbw, IS_MOBILE ? 11 : 9);
      drawText(Math.round(qp * 100) + '%', IS_MOBILE ? 5 : 5, W/2, IS_MOBILE ? 15 : 12, P.ui, 'center');
      const castCol = g.castsLeft <= 3 ? P.dmg : P.uiDark;
      drawText('x' + g.castsLeft, IS_MOBILE ? 5 : 5, W - 4, IS_MOBILE ? 16 : 13, castCol, 'right');
      drawText('CASTS', IS_MOBILE ? 4 : 4, W - 6 - (IS_MOBILE ? 18 : 16), IS_MOBILE ? 10 : 8, P.uiDark, 'right');
      const botY = IS_MOBILE ? H - 70 : H - 18;
      const botH = IS_MOBILE ? 22 : 18;
      cx.fillStyle = 'rgba(5,13,26,0.88)';
      cx.fillRect(0, botY, W, botH);
      cx.strokeStyle = 'rgba(72,152,248,0.3)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(0, botY); cx.lineTo(W, botY); cx.stroke();
      drawText(g.score.toLocaleString(), IS_MOBILE ? 6 : 6, 4, botY + botH - 4, P.uiHl, 'left');
      cx.fillStyle = P.coin; cx.fillRect(W/2 - 24, botY + 5, 8, 8);
      drawText(g.coins, IS_MOBILE ? 6 : 6, W/2 - 12, botY + botH - 4, P.coin, 'left');
      const ab = activeBaitData();
      if (ab) {
        cx.fillStyle = ab.col; cx.fillRect(W - 52, botY + 5, 8, 8);
        drawText(ab.name.slice(0,4) + ' x' + ab.usesLeft, 4, W - 40, botY + botH - 4, P.uiDark, 'left');
      }
      if (g.combo > 1 && g.comboTimer > 0) {
        const comboAlpha = Math.min(1, g.comboTimer / 60);
        cx.globalAlpha = comboAlpha;
        drawText('COMBO x' + g.combo, 6, W/2, IS_MOBILE ? 42 : 32, '#f0a0ff', 'center');
        cx.globalAlpha = 1;
      }
    }

    // ══════════════════════════════════════════════════════
    // CABIN-THEMED SHOP — pixel wood planks, no triangles
    // ══════════════════════════════════════════════════════
    function drawShop() {
      drawSky(SKY_THEMES[g.zone] || SKY_THEMES[0]);

      // Full cabin background - dark wood wall
      drawCabinWall(0, 0, W, H);

      // Roofline at top
      drawRoofline();

      // Header sign - hanging wood plank
      drawHangingSign(W/2, IS_MOBILE ? 24 : 19, 'BAIT SHOP', IS_MOBILE ? 8 : 7);

      // Coin display - embedded in wood plank
      drawWoodPlankLabel(6, IS_MOBILE ? 32 : 26, 52, IS_MOBILE ? 14 : 12, P.coin, g.coins + 'c', 5);

      // Reroll - small wood button
      drawWoodButton(W - 88, IS_MOBILE ? 30 : 24, 80, IS_MOBILE ? 14 : 12, 'REROLL 15c', 4,
        () => {
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
          }
        }
      );

      // Tab shelf - looks like a wood shelf with labels on bark
      const tabY = IS_MOBILE ? 48 : 38;
      const tabH = IS_MOBILE ? 20 : 18;
      const tabNames = ['BAIT', 'UPGRADES', 'LURES'];
      tabNames.forEach((tn, i) => {
        const tw = W / 3;
        const sel = i === g.shopTab;
        // Tab plank
        cx.fillStyle = sel ? P.woodLight : P.woodDark;
        cx.fillRect(i * tw + 1, tabY, tw - 2, tabH);
        // Plank grain lines
        for (let g2 = 0; g2 < 3; g2++) {
          cx.fillStyle = sel ? 'rgba(90,50,10,0.25)' : 'rgba(0,0,0,0.3)';
          cx.fillRect(i * tw + 1, tabY + g2 * (tabH/3), tw - 2, 1);
        }
        // Plank edge highlight
        cx.fillStyle = sel ? P.plankHL : P.woodMid;
        cx.fillRect(i * tw + 1, tabY, tw - 2, 2);
        // Plank edge shadow
        cx.fillStyle = P.plankEdge;
        cx.fillRect(i * tw + 1, tabY + tabH - 2, tw - 2, 2);
        // Nail dots
        cx.fillStyle = '#2a1a08';
        cx.fillRect(i * tw + 4, tabY + 4, 2, 2);
        cx.fillRect((i+1) * tw - 6, tabY + 4, 2, 2);
        // Text
        drawText(tn, IS_MOBILE ? 5 : 5, i * tw + tw/2, tabY + tabH - (IS_MOBILE ? 4 : 4),
          sel ? '#FFF8E0' : '#9A7050', 'center');
      });

      // Items grid on wood panels
      const items = shopPageItems();
      const colCount = IS_MOBILE ? 2 : 3;
      const itemW = IS_MOBILE ? 142 : 88;
      const itemH = IS_MOBILE ? 95 : 90;
      const gapX = IS_MOBILE ? 8 : 6;
      const gapY = 6;
      const totalCols = colCount;
      const startX2 = (W - (itemW * totalCols + gapX * (totalCols-1))) / 2;
      const startY2 = tabY + tabH + 5;

      items.forEach((item: any, i: number) => {
        const col2 = i % colCount;
        const row = Math.floor(i / colCount);
        const bx = startX2 + col2 * (itemW + gapX);
        const by = startY2 + row * (itemH + gapY);
        const canBuy = g.coins >= item.cost;
        const owned = g.shopTab === 1 ? hasUpgrade(item.id) : g.shopTab === 2 ? hasLure(item.id) : false;

        // Item card as wood panel
        drawWoodPanel(bx, by, itemW, itemH, owned, canBuy, i === g.shopSel);

        // Item icon (drawn in canvas, no triangles)
        drawItemIcon(bx + itemW/2, by + 18, item, g.shopTab);

        // Owned stamp
        if (owned) {
          cx.fillStyle = 'rgba(80,220,80,0.18)';
          cx.fillRect(bx + 2, by + 2, itemW - 4, itemH - 4);
          drawText('OWNED', 4, bx + itemW/2, by + 22, P.uncommon, 'center');
        }

        // Name on wood plank strip
        cx.fillStyle = P.woodDark;
        cx.fillRect(bx + 2, by + 30, itemW - 4, IS_MOBILE ? 14 : 12);
        cx.fillStyle = P.plankHL;
        cx.fillRect(bx + 2, by + 30, itemW - 4, 1);
        drawText(item.name, IS_MOBILE ? 4 : 3, bx + itemW/2, by + (IS_MOBILE ? 41 : 40),
          canBuy ? '#FFF8E0' : '#7A6048', 'center');

        // Description - carved into wood look
        const words = item.desc.split(' ');
        let line2 = '', liy = by + (IS_MOBILE ? 55 : 52);
        words.forEach((w: string, wi: number) => {
          if ((line2 + w).length > (IS_MOBILE ? 16 : 12)) {
            drawText(line2.trim(), 4, bx + itemW/2, liy, P.uiDark, 'center');
            line2 = w + ' '; liy += 10;
          } else line2 += w + ' ';
          if (wi === words.length - 1) drawText(line2.trim(), 4, bx + itemW/2, liy, P.uiDark, 'center');
        });

        // Cost badge - looks like a coin nailed to the plank
        drawCostBadge(bx + 6, by + itemH - 14, item.cost, canBuy);

        if (g.shopTab === 0 && item.uses) {
          drawText('x' + item.uses, 4, bx + itemW - 6, by + itemH - 7, P.uiDark, 'right');
        }
      });

      // Loadout shelf - bottom plank
      const loadY = IS_MOBILE ? H - 68 : H - 50;
      drawHorizontalPlank(0, loadY, W, IS_MOBILE ? 20 : 18);
      drawText('LURES:' + g.lures.length + '/5  UPG:' + g.upgrades.length + '/6  BAIT:' + g.baits.length,
        4, W/2, loadY + (IS_MOBILE ? 13 : 12), '#C4A060', 'center');

      // Equipped upgrades - shown as tool pegs on wall
      if (g.upgrades.length > 0) {
        const upgY = loadY - (IS_MOBILE ? 18 : 16);
        drawText('EQUIPPED:', 4, 4, upgY + (IS_MOBILE ? 11 : 10), '#8B6030', 'left');
        g.upgrades.slice(0, 6).forEach((u: any, i: number) => {
          const ux = 62 + i * (IS_MOBILE ? 42 : 38);
          // Peg on wall
          cx.fillStyle = P.woodMid;
          cx.fillRect(ux, upgY + 2, IS_MOBILE ? 36 : 32, IS_MOBILE ? 12 : 10);
          cx.fillStyle = P.plankHL;
          cx.fillRect(ux, upgY + 2, IS_MOBILE ? 36 : 32, 1);
          cx.fillStyle = P.plankEdge;
          cx.fillRect(ux, upgY + (IS_MOBILE ? 12 : 10), IS_MOBILE ? 36 : 32, 1);
          // Color indicator dot
          cx.fillStyle = u.col;
          cx.fillRect(ux + 2, upgY + 4, 5, IS_MOBILE ? 7 : 5);
          drawText(u.name.slice(0,4), 3, ux + 9, upgY + (IS_MOBILE ? 12 : 9), '#E0C090', 'left');
        });
      }

      // Continue button - big wood plank button
      const contY = IS_MOBILE ? H - 46 : H - 28;
      const nextName = g.zone + 1 < ZONES.length ? ZONES[g.zone+1].name : 'VICTORY';
      drawBigWoodButton(W/2 - 70, contY, 140, IS_MOBILE ? 20 : 18, 'DIVE: ' + nextName, IS_MOBILE ? 5 : 5);
    }

    // ── CABIN DRAW HELPERS ────────────────────────────────

    function drawCabinWall(x: number, y: number, w: number, h: number) {
      // Dark wood wall base
      cx.fillStyle = '#2A1A08';
      cx.fillRect(x, y, w, h);
      // Horizontal plank lines
      const plankH = IS_MOBILE ? 20 : 16;
      for (let py = 0; py < h; py += plankH) {
        // Plank face
        const shade = 0.05 + (py / h) * 0.08;
        cx.fillStyle = `rgba(80,45,12,${0.9 - shade})`;
        cx.fillRect(x, y + py, w, plankH - 2);
        // Grain lines
        for (let g2 = 0; g2 < 3; g2++) {
          const gx = (py * 37 + g2 * 80) % w;
          cx.fillStyle = 'rgba(0,0,0,0.12)';
          cx.fillRect(x + gx, y + py, (w * 0.3) | 0, 1);
        }
        // Plank gap (dark)
        cx.fillStyle = '#150C03';
        cx.fillRect(x, y + py + plankH - 2, w, 2);
        // Top highlight
        cx.fillStyle = 'rgba(180,100,30,0.15)';
        cx.fillRect(x, y + py, w, 1);
        // Nail marks
        cx.fillStyle = '#1A0E04';
        cx.fillRect(x + 8, y + py + 4, 3, 3);
        cx.fillRect(x + w - 11, y + py + 4, 3, 3);
      }
    }

    function drawRoofline() {
      // Roof overhang - dark planks
      cx.fillStyle = '#1A0E04';
      cx.fillRect(0, 0, W, IS_MOBILE ? 10 : 8);
      cx.fillStyle = P.cabinRoof;
      cx.fillRect(0, IS_MOBILE ? 10 : 8, W, IS_MOBILE ? 4 : 3);
      cx.fillStyle = P.woodLight;
      cx.fillRect(0, IS_MOBILE ? 14 : 11, W, 1);
    }

    function drawHangingSign(cx2: number, cy2: number, text: string, fontSize: number) {
      const sw = IS_MOBILE ? 160 : 140, sh = IS_MOBILE ? 18 : 15;
      const sx = cx2 - sw/2, sy = cy2 - sh/2;
      // Chains
      cx.fillStyle = '#4A3820';
      cx.fillRect(sx + 15, 0, 2, sy + 2);
      cx.fillRect(sx + sw - 17, 0, 2, sy + 2);
      // Sign plank
      cx.fillStyle = P.wood;
      cx.fillRect(sx, sy, sw, sh);
      for (let g2 = 0; g2 < 4; g2++) {
        cx.fillStyle = 'rgba(60,30,5,0.2)';
        cx.fillRect(sx, sy + g2 * (sh/4), sw, 1);
      }
      cx.fillStyle = P.plankHL;
      cx.fillRect(sx, sy, sw, 2);
      cx.fillStyle = P.plankEdge;
      cx.fillRect(sx, sy + sh - 2, sw, 2);
      // Nail holes
      cx.fillStyle = '#2A1A08';
      cx.fillRect(sx + 8, sy + sh/2 - 1, 3, 3);
      cx.fillRect(sx + sw - 11, sy + sh/2 - 1, 3, 3);
      // Text
      drawTextShadow(text, fontSize, cx2, sy + sh - 3, '#FFF0C0', 'center');
    }

    function drawWoodPlankLabel(x: number, y: number, w: number, h: number, col: string, text: string, fontSize: number) {
      cx.fillStyle = P.woodDark;
      cx.fillRect(x, y, w, h);
      cx.fillStyle = P.plankHL;
      cx.fillRect(x, y, w, 1);
      cx.fillStyle = P.plankEdge;
      cx.fillRect(x, y + h - 1, w, 1);
      cx.fillStyle = col;
      cx.fillRect(x + 3, y + 3, 6, 6);
      drawText(text, fontSize, x + 12, y + h - 3, col, 'left');
    }

    function drawWoodButton(x: number, y: number, w: number, h: number, text: string, fontSize: number, _action?: () => void) {
      cx.fillStyle = P.woodMid;
      cx.fillRect(x, y, w, h);
      for (let g2 = 0; g2 < 3; g2++) {
        cx.fillStyle = 'rgba(60,30,5,0.2)';
        cx.fillRect(x, y + g2 * (h/3), w, 1);
      }
      cx.fillStyle = P.plankHL;
      cx.fillRect(x, y, w, 2);
      cx.fillStyle = P.plankEdge;
      cx.fillRect(x, y + h - 2, w, 2);
      drawText(text, fontSize, x + w/2, y + h - 3, '#E0C090', 'center');
    }

    function drawHorizontalPlank(x: number, y: number, w: number, h: number) {
      cx.fillStyle = P.woodDark;
      cx.fillRect(x, y, w, h);
      cx.fillStyle = P.woodMid;
      cx.fillRect(x, y + 1, w, h - 3);
      for (let g2 = 0; g2 < 3; g2++) {
        const gx = (g2 * 97) % w;
        cx.fillStyle = 'rgba(180,100,30,0.12)';
        cx.fillRect(x + gx, y + 1, w / 4, 1);
      }
      cx.fillStyle = P.plankHL;
      cx.fillRect(x, y + 1, w, 1);
      cx.fillStyle = P.plankEdge;
      cx.fillRect(x, y + h - 2, w, 2);
      // Nails
      cx.fillStyle = '#1A0E04';
      cx.fillRect(x + 10, y + h/2 - 1, 3, 3);
      cx.fillRect(x + w - 13, y + h/2 - 1, 3, 3);
    }

    function drawBigWoodButton(x: number, y: number, w: number, h: number, text: string, fontSize: number) {
      // Main plank
      cx.fillStyle = P.woodLight;
      cx.fillRect(x, y, w, h);
      // Grain
      for (let g2 = 0; g2 < 4; g2++) {
        cx.fillStyle = 'rgba(90,50,10,0.2)';
        cx.fillRect(x, y + g2 * (h/4), w, 1);
      }
      cx.fillStyle = P.plankHL;
      cx.fillRect(x, y, w, 2);
      cx.fillStyle = P.plankEdge;
      cx.fillRect(x, y + h - 2, w, 2);
      cx.fillStyle = '#3A2008';
      cx.fillRect(x, y, 2, h);
      cx.fillRect(x + w - 2, y, 2, h);
      // Nails
      cx.fillStyle = '#2A1A08';
      cx.fillRect(x + 5, y + 3, 3, 3);
      cx.fillRect(x + w - 8, y + 3, 3, 3);
      cx.fillRect(x + 5, y + h - 6, 3, 3);
      cx.fillRect(x + w - 8, y + h - 6, 3, 3);
      drawTextShadow(text, fontSize, x + w/2, y + h - 4, P.legendary, 'center');
    }

    function drawWoodPanel(x: number, y: number, w: number, h: number, owned: boolean, canBuy: boolean, selected: boolean) {
      // Panel base - slightly lighter than wall
      cx.fillStyle = owned ? '#3A2814' : canBuy ? '#362010' : '#231408';
      cx.fillRect(x, y, w, h);
      // Horizontal wood grain lines
      const grainCount = Math.floor(h / (IS_MOBILE ? 8 : 6));
      for (let g2 = 0; g2 < grainCount; g2++) {
        cx.fillStyle = 'rgba(0,0,0,0.15)';
        cx.fillRect(x, y + g2 * (h/grainCount), w, 1);
      }
      // Vertical panel dividers (plank seams)
      cx.fillStyle = 'rgba(0,0,0,0.3)';
      cx.fillRect(x + Math.floor(w/3), y, 1, h);
      cx.fillRect(x + Math.floor(w*2/3), y, 1, h);
      // Border - wood frame
      if (selected) {
        cx.strokeStyle = P.legendary;
        cx.lineWidth = 2;
      } else {
        cx.strokeStyle = owned ? '#5A4020' : canBuy ? '#6B4A20' : '#3A2810';
        cx.lineWidth = 1;
      }
      cx.strokeRect(x, y, w, h);
      // Top highlight
      cx.fillStyle = owned ? 'rgba(100,220,100,0.1)' : canBuy ? 'rgba(180,110,30,0.2)' : 'rgba(80,50,20,0.15)';
      cx.fillRect(x + 1, y + 1, w - 2, 2);
      // Nail holes at corners
      cx.fillStyle = '#1A0E04';
      cx.fillRect(x + 3, y + 3, 2, 2);
      cx.fillRect(x + w - 5, y + 3, 2, 2);
      cx.fillRect(x + 3, y + h - 5, 2, 2);
      cx.fillRect(x + w - 5, y + h - 5, 2, 2);
    }

    // Draw item icon based on type (no triangles — pixel art shapes)
    function drawItemIcon(cx2: number, cy2: number, item: any, tab: number) {
      const col = item.col || '#808080';
      cx.save();
      cx.translate(cx2, cy2 - 8);

      if (tab === 0) {
        // Bait icons — pixel art
        if (item.id === 'worm') {
          // Worm: squiggly pixel segments
          cx.fillStyle = '#C87840';
          cx.fillRect(-4, -3, 4, 4);
          cx.fillRect(-1, -6, 4, 4);
          cx.fillRect(2, -3, 4, 4);
          cx.fillRect(-1, 0, 3, 3);
        } else if (item.id === 'cricket') {
          // Cricket: oval + legs
          cx.fillStyle = '#909030';
          cx.fillRect(-5, -3, 10, 6);
          cx.fillRect(-3, -5, 6, 2);
          cx.fillStyle = '#707020';
          for (let i = -1; i <= 1; i++) {
            cx.fillRect(-7, i * 2, 3, 1);
            cx.fillRect(4, i * 2, 3, 1);
          }
        } else if (item.id === 'squid') {
          // Squid: rounded body + tentacles
          cx.fillStyle = '#B0C0E8';
          cx.fillRect(-5, -6, 10, 8);
          cx.fillRect(-7, -4, 3, 4);
          cx.fillRect(4, -4, 3, 4);
          for (let i = 0; i < 4; i++) {
            cx.fillRect(-6 + i * 3, 2, 2, 5);
          }
        } else if (item.id === 'glowbug') {
          // Glowbug: round with glow
          cx.fillStyle = 'rgba(100,255,150,0.3)';
          cx.fillRect(-7, -7, 14, 14);
          cx.fillStyle = '#70E090';
          cx.fillRect(-4, -4, 8, 8);
          cx.fillStyle = '#B0FFD0';
          cx.fillRect(-2, -2, 4, 4);
        } else if (item.id === 'bread') {
          // Bread: loaf shape
          cx.fillStyle = '#C8A040';
          cx.fillRect(-6, -2, 12, 6);
          cx.fillRect(-4, -5, 8, 3);
          cx.fillStyle = '#E8C070';
          cx.fillRect(-5, -4, 6, 2);
        } else if (item.id === 'explosive') {
          // Bomb: round + fuse
          cx.fillStyle = '#202020';
          cx.fillRect(-5, -4, 10, 9);
          cx.fillRect(-3, -6, 6, 2);
          cx.fillStyle = '#E03020';
          cx.fillRect(-4, -3, 8, 7);
          cx.fillStyle = '#FF8030';
          cx.fillRect(3, -7, 2, 4);
          cx.fillStyle = '#FFE050';
          cx.fillRect(3, -9, 2, 2);
        } else {
          cx.fillStyle = col;
          cx.fillRect(-6, -5, 12, 10);
        }
      } else if (tab === 1) {
        // Upgrade icons — drawn as tool/gear pixel art
        if (item.type === 'reel') {
          // Reel: circle with spokes
          cx.fillStyle = '#4080C0';
          cx.fillRect(-6, -6, 12, 12);
          cx.fillStyle = '#80C0F8';
          cx.fillRect(-4, -4, 8, 8);
          cx.fillStyle = '#1A3060';
          cx.fillRect(-1, -6, 2, 12);
          cx.fillRect(-6, -1, 12, 2);
          cx.fillStyle = col;
          cx.fillRect(-2, -2, 4, 4);
        } else if (item.type === 'tension') {
          // Line: coiled chain links
          cx.fillStyle = col;
          for (let i = 0; i < 4; i++) {
            cx.fillRect(-6 + i * 3, -3, 2, 6);
            cx.fillRect(-5 + i * 3, -4, 2, 2);
            cx.fillRect(-5 + i * 3, 2, 2, 2);
          }
        } else if (item.type === 'magnet' || item.type === 'deepmagnet') {
          // Magnet: U-shape
          cx.fillStyle = col;
          cx.fillRect(-6, -6, 5, 10);
          cx.fillRect(1, -6, 5, 10);
          cx.fillRect(-6, -6, 12, 4);
          cx.fillStyle = '#FF4040';
          cx.fillRect(-6, 2, 5, 3);
          cx.fillStyle = '#4040FF';
          cx.fillRect(1, 2, 5, 3);
        } else if (item.type === 'anchor') {
          // Anchor
          cx.fillStyle = col;
          cx.fillRect(-1, -7, 2, 13);
          cx.fillRect(-5, -6, 10, 2);
          cx.fillRect(-1, -7, 2, 2);
          cx.fillStyle = '#30D890';
          cx.fillRect(-6, 4, 12, 2);
          cx.fillRect(-6, 2, 2, 4);
          cx.fillRect(4, 2, 2, 4);
        } else if (item.type === 'calm' || item.type === 'zen') {
          // Leaf / calm: simple leaf shape
          cx.fillStyle = col;
          cx.fillRect(-3, -6, 6, 6);
          cx.fillRect(-5, -2, 10, 6);
          cx.fillRect(-3, 2, 6, 3);
          cx.fillStyle = 'rgba(0,0,0,0.3)';
          cx.fillRect(0, -6, 1, 12);
        } else if (item.type === 'cast') {
          // Fishing rod: long stick
          cx.fillStyle = col;
          cx.fillRect(-7, -6, 14, 3);
          cx.fillRect(-5, -3, 2, 9);
          cx.fillStyle = P.line;
          cx.fillRect(-3, 3, 8, 1);
          cx.fillStyle = P.bobber0;
          cx.fillRect(4, 2, 4, 4);
        } else if (item.type === 'accuracy') {
          // Star pattern
          cx.fillStyle = col;
          cx.fillRect(-1, -7, 2, 14);
          cx.fillRect(-7, -1, 14, 2);
          cx.fillRect(-5, -5, 2, 2);
          cx.fillRect(3, -5, 2, 2);
          cx.fillRect(-5, 3, 2, 2);
          cx.fillRect(3, 3, 2, 2);
        } else if (item.type === 'doubler') {
          // Diamond gem
          cx.fillStyle = col;
          cx.fillRect(-3, -6, 6, 2);
          cx.fillRect(-5, -4, 10, 4);
          cx.fillRect(-3, 0, 6, 4);
          cx.fillRect(-1, 4, 2, 2);
          cx.fillStyle = 'rgba(255,255,255,0.4)';
          cx.fillRect(-2, -5, 3, 2);
        } else {
          // Generic gear
          cx.fillStyle = col;
          cx.fillRect(-5, -5, 10, 10);
          cx.fillStyle = '#1A1020';
          cx.fillRect(-2, -2, 4, 4);
        }
      } else {
        // Lure icons — fishing lure shapes
        if (item.id === 'lucky') {
          // Four-leaf clover / star
          cx.fillStyle = col;
          cx.fillRect(-1, -6, 2, 12);
          cx.fillRect(-6, -1, 12, 2);
          cx.fillRect(-4, -4, 2, 2);
          cx.fillRect(2, -4, 2, 2);
          cx.fillRect(-4, 2, 2, 2);
          cx.fillRect(2, 2, 2, 2);
        } else if (item.id === 'chum') {
          // Splash drops
          cx.fillStyle = col;
          cx.fillRect(-5, -1, 4, 5);
          cx.fillRect(1, -3, 4, 7);
          cx.fillRect(-2, -5, 3, 4);
        } else if (item.id === 'depth') {
          // Sonar waves
          cx.fillStyle = col;
          cx.fillRect(-1, -1, 2, 2);
          cx.strokeStyle = col;
          cx.lineWidth = 1;
          for (let i = 1; i <= 3; i++) {
            cx.strokeStyle = `rgba(56,160,248,${1 - i*0.25})`;
            cx.strokeRect(-i*2, -i*2, i*4, i*4);
          }
        } else if (item.id === 'school') {
          // 3 small fish
          for (let i = 0; i < 3; i++) {
            cx.fillStyle = col;
            cx.fillRect(-6 + i * 4, -3 + i * 2, 8, 4);
            cx.fillRect(-9 + i * 4, -3 + i * 2, 3, 4);
          }
        } else if (item.id === 'moon') {
          // Crescent
          cx.fillStyle = col;
          cx.fillRect(-5, -5, 10, 10);
          cx.fillStyle = '#2A1A08';
          cx.fillRect(-2, -4, 9, 8);
        } else if (item.id === 'rusty') {
          // Rusty hook
          cx.fillStyle = '#806030';
          cx.fillRect(-1, -6, 3, 9);
          cx.fillRect(-1, 3, 5, 2);
          cx.fillRect(2, 1, 2, 4);
          cx.fillStyle = '#A08040';
          cx.fillRect(0, -6, 1, 3);
        } else if (item.id === 'golden') {
          // Gold worm spiral
          cx.fillStyle = '#F09000';
          cx.fillRect(-5, -2, 5, 4);
          cx.fillRect(-1, -5, 4, 4);
          cx.fillRect(2, -2, 4, 8);
          cx.fillRect(-3, 5, 6, 3);
          cx.fillStyle = '#FFD040';
          cx.fillRect(-4, -1, 2, 2);
        } else if (item.id === 'charge') {
          // Bomb + lightning
          cx.fillStyle = '#E03020';
          cx.fillRect(-5, -4, 10, 8);
          cx.fillStyle = '#FFE050';
          cx.fillRect(1, -7, 2, 4);
          cx.fillRect(-1, -3, 2, 5);
        } else {
          cx.fillStyle = col;
          cx.fillRect(-5, -4, 10, 8);
        }
      }

      cx.restore();
    }

    function drawCostBadge(x: number, y: number, cost: number, canBuy: boolean) {
      // Small coin-nail on plank
      cx.fillStyle = canBuy ? '#F8A000' : '#604020';
      cx.fillRect(x, y, 8, 8);
      cx.fillStyle = canBuy ? '#FFD040' : '#3A2010';
      cx.fillRect(x + 1, y + 1, 3, 3);
      drawText(cost + 'c', 4, x + 11, y + 8, canBuy ? P.coin : P.dmg, 'left');
    }

    function drawStats() {
      cx.fillStyle = 'rgba(5,13,26,0.96)'; cx.fillRect(0, 0, W, H);
      drawTextShadow('LOGBOOK', 10, W/2, 25, P.uiHl, 'center');
      const stats = [
        ['Total Score', g.score.toLocaleString()],
        ['Fish Caught', g.totalCatches],
        ['Total Casts', g.totalCasts],
        ['Zone Reached', ZONES[Math.min(g.zone,4)].name],
        ['Species Found', Object.keys(g.speciesCaught).length + '/9'],
        ['Coins Held', g.coins],
        ['Lures Active', g.lures.length],
        ['Upgrades', g.upgrades.length],
      ];
      stats.forEach(([label, val], i) => {
        const sy = 45 + i * (IS_MOBILE ? 22 : 18);
        drawText(String(label), IS_MOBILE ? 5 : 5, 12, sy, P.uiDark, 'left');
        drawText(String(val), IS_MOBILE ? 5 : 5, W - 12, sy, P.ui, 'right');
        cx.fillStyle = 'rgba(72,152,248,0.1)';
        cx.fillRect(10, sy + 3, W - 20, 1);
      });
      const speciesY = 45 + stats.length * (IS_MOBILE ? 22 : 18) + 8;
      drawText('SPECIES:', 5, 10, speciesY, P.uiDark, 'left');
      Object.entries(g.speciesCaught).forEach(([name, cnt], i) => {
        drawText(name + ' x' + cnt, 4, 10 + (i % 2) * (W/2 - 5), speciesY + 14 + Math.floor(i/2) * 14, P.ui, 'left');
      });
      drawText('TAP TO RETURN', 5, W/2, H - 20, P.uiDark, 'center');
    }

    function drawTitle() {
      const grad2 = cx.createLinearGradient(0, 0, 0, H);
      grad2.addColorStop(0, '#030810');
      grad2.addColorStop(0.6, '#0a1628');
      grad2.addColorStop(1, '#0d3d6b');
      cx.fillStyle = grad2; cx.fillRect(0, 0, W, H);
      const t2 = Date.now() / 1000;
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5) % W);
        const sy = ((i * 97.3) % (H * 0.55));
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t2 * (0.5 + i * 0.1)));
        cx.fillStyle = `rgba(255,255,255,${twinkle * 0.85})`;
        cx.fillRect(Math.round(sx), Math.round(sy), i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
      }
      cx.fillStyle = '#d8e4f8';
      cx.beginPath(); cx.arc(260, IS_MOBILE ? 55 : 35, 14, 0, Math.PI*2); cx.fill();
      cx.fillStyle = '#030810';
      cx.beginPath(); cx.arc(255, IS_MOBILE ? 52 : 32, 11, 0, Math.PI*2); cx.fill();
      for (let i = 0; i < 3; i++) {
        const cx3 = ((t2 * 12 + i * 120) % (W + 80)) - 40;
        cx.fillStyle = `rgba(180,210,255,0.08)`;
        cx.beginPath(); cx.ellipse(cx3, IS_MOBILE ? 80 + i*25 : 45 + i*12, 45+i*10, 12+i*4, 0, 0, Math.PI*2); cx.fill();
      }
      const wBase = IS_MOBILE ? H * 0.58 : H * 0.52;
      cx.fillStyle = '#0d3d6b';
      cx.beginPath(); cx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) {
        cx.lineTo(x, wBase + Math.sin((x/40 + t2) * 1.2) * 3 + Math.sin((x/20 + t2*1.7) * 0.8) * 1.5);
      }
      cx.lineTo(W, H); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(72,152,200,0.2)'; cx.lineWidth = 1;
      cx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = wBase + Math.sin((x/40 + t2) * 1.2) * 3 + Math.sin((x/20 + t2*1.7) * 0.8) * 1.5;
        if (x === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
      }
      cx.stroke();
      cx.fillStyle = 'rgba(26,107,191,0.35)';
      for (let i = 0; i < 5; i++) {
        const fx = ((t2 * 18 + i * 80) % (W + 50)) - 25;
        const fy = wBase + 18 + Math.sin(t2 * 0.8 + i) * 10;
        cx.fillRect(fx, fy, i % 2 === 0 ? 20 : 14, i % 2 === 0 ? 8 : 6);
        cx.fillRect(fx - (i % 2 === 0 ? 7 : 5), fy, i % 2 === 0 ? 7 : 5, i % 2 === 0 ? 8 : 6);
      }
      const titleY = IS_MOBILE ? H * 0.28 : H * 0.3;
      drawTextShadow('REEL', IS_MOBILE ? 28 : 24, W/2, titleY, P.legendary, 'center');
      drawTextShadow('DEEP', IS_MOBILE ? 28 : 24, W/2, titleY + (IS_MOBILE ? 38 : 30), '#4898f8', 'center');
      drawText('PIXEL FISHING ROGUELITE', IS_MOBILE ? 5 : 5, W/2, titleY + (IS_MOBILE ? 60 : 50), P.uiDark, 'center');
      const featY = IS_MOBILE ? titleY + 80 : titleY + 65;
      const features = IS_MOBILE
        ? ['5 ZONES  •  9 FISH  •  6 BAITS', '8 LURES  •  14 UPGRADES', 'REACH THE ABYSS']
        : ['5 ZONES • 9 FISH • 6 BAITS • 8 LURES', 'REACH THE ABYSS'];
      features.forEach((f, i) => drawText(f, IS_MOBILE ? 4 : 4, W/2, featY + i*(IS_MOBILE?14:12), P.uiDark, 'center'));
      const blink = Math.floor(t2 * 2) % 2 === 0;
      if (blink) drawTextShadow(IS_MOBILE ? 'TAP TO DIVE' : 'PRESS SPACE TO DIVE', IS_MOBILE ? 7 : 7, W/2, IS_MOBILE ? H * 0.82 : H * 0.83, P.ui, 'center');
      drawText('v2.1', 4, W - 8, H - 6, P.uiDark, 'right');
    }

    function drawWin() {
      cx.fillStyle = '#050d1a'; cx.fillRect(0, 0, W, H);
      const t3 = Date.now() / 1000;
      for (let i = 0; i < 8; i++) {
        cx.fillStyle = `hsla(${i*45 + t3*30},80%,50%,0.06)`;
        cx.fillRect(0, i * (H/8), W, H/8);
      }
      for (let i = 0; i < 80; i++) {
        const sx2 = (i * 137.5) % W, sy2 = (i * 97.3) % H;
        const tw2 = 0.3 + 0.7 * Math.abs(Math.sin(t3 * (0.5 + i*0.08)));
        cx.fillStyle = `rgba(255,255,255,${tw2 * 0.7})`;
        cx.fillRect(sx2, sy2, 1, 1);
      }
      const cy2 = IS_MOBILE ? 40 : 30;
      drawTextShadow('YOU REACHED', IS_MOBILE ? 10 : 9, W/2, cy2, P.legendary, 'center');
      drawTextShadow('THE ABYSS!', IS_MOBILE ? 12 : 10, W/2, cy2 + (IS_MOBILE ? 20 : 16), P.legendary, 'center');
      drawText('THE KRAKEN BOWS', 6, W/2, cy2 + (IS_MOBILE ? 44 : 36), P.uiDark, 'center');
      drawFish(FISH.kraken, W/2, IS_MOBILE ? H*0.48 : H*0.5, t3, IS_MOBILE ? 2 : 2.5);
      drawText('FINAL SCORE', 7, W/2, IS_MOBILE ? H*0.72 : H*0.73, P.uiDark, 'center');
      drawTextShadow(g.score.toLocaleString(), IS_MOBILE ? 14 : 12, W/2, IS_MOBILE ? H*0.79 : H*0.8, P.uiHl, 'center');
      drawText('SPECIES: ' + Object.keys(g.speciesCaught).length + '/9', 6, W/2, IS_MOBILE ? H*0.86 : H*0.87, P.ui, 'center');
      drawText('CATCHES: ' + g.totalCatches, 6, W/2, IS_MOBILE ? H*0.91 : H*0.92, P.uncommon, 'center');
      const blink2 = Math.floor(t3 * 1.5) % 2 === 0;
      if (blink2) drawText(IS_MOBILE ? 'TAP TO PLAY AGAIN' : 'SPACE TO PLAY AGAIN', 6, W/2, IS_MOBILE ? H*0.96 : H*0.97, P.uiDark, 'center');
    }

    function drawFish(fish: any, x: number, y: number, t4: number, scale=1) {
      cx.save();
      cx.translate(Math.round(x), Math.round(y));
      const flip = Math.sin((t4||0) * 0.3) > 0 ? 1 : -1;
      cx.scale(flip * scale, scale);
      const w = fish.w, h = fish.h, col = fish.col;
      cx.fillStyle = 'rgba(0,0,0,0.25)';
      cx.fillRect(-w/2+2, -h/2+2, w, h);
      cx.fillStyle = col;
      cx.fillRect(-w/2, -h/2, w, h);
      cx.fillStyle = 'rgba(255,255,255,0.28)';
      cx.fillRect(-w/2+2, 0, w-4, h/2-1);
      cx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let s = 0; s < 3; s++) cx.fillRect(-w/2+6+s*7, -h/4, 5, h/2);
      cx.fillStyle = col;
      cx.fillRect(-w/2-7, -h/2, 7, h);
      cx.fillStyle = 'rgba(0,0,0,0.25)';
      cx.fillRect(-w/2-7, -h/2, 7, 2);
      cx.fillRect(-w/2-7, h/2-2, 7, 2);
      cx.fillStyle = col;
      cx.fillRect(-w/4, -h/2-5, w/3, 5);
      cx.fillStyle = 'rgba(255,255,255,0.2)';
      cx.fillRect(-w/4, -h/2-5, 2, 5);
      cx.fillStyle = '#fff'; cx.fillRect(w/2-7, -h/4, 5, 5);
      cx.fillStyle = '#000'; cx.fillRect(w/2-6, -h/4+1, 3, 3);
      cx.fillStyle = 'rgba(255,255,255,0.8)'; cx.fillRect(w/2-6, -h/4+1, 1, 1);
      if (fish.tier === 4) {
        for (let i = 0; i < 5; i++) {
          cx.fillStyle = col;
          cx.fillRect(-w/2+3+i*7, h/2, 4, 5+Math.sin((t4||0)*2+i)*3);
        }
        cx.fillStyle = '#f8c820';
        cx.fillRect(w/2-7, -h/4, 5, 5);
        cx.fillStyle = '#000'; cx.fillRect(w/2-6, -h/4+1, 3, 3);
      }
      if (fish.name === 'SWORDFISH') {
        cx.fillStyle = '#d0d0e0'; cx.fillRect(w/2, -1, 16, 3);
        cx.fillStyle = 'rgba(255,255,255,0.4)'; cx.fillRect(w/2, -1, 4, 1);
      }
      if (fish.name === 'OARFISH') {
        cx.fillStyle = fish.col; cx.fillRect(w/2, h/4, 14, 3);
        for (let i = 0; i < 4; i++) cx.fillRect(w/2+i*3, h/4-3, 2, 3);
      }
      cx.restore();
    }

    function drawParticles() {
      particles.forEach((p: any) => {
        if (p.type === 'popup') {
          const a = p.life / p.maxLife;
          cx.globalAlpha = a;
          drawTextShadow(p.text, IS_MOBILE ? 7 : 6, p.x, p.y, p.col, 'center');
          cx.globalAlpha = 1;
        } else if (p.type === 'ripple') {
          const a = p.life / p.maxLife;
          cx.strokeStyle = `rgba(64,144,200,${a * 0.6})`;
          cx.lineWidth = 1;
          cx.beginPath(); cx.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, Math.PI*2); cx.stroke();
        } else {
          const a = p.life / p.maxLife;
          cx.fillStyle = p.col;
          cx.globalAlpha = a;
          cx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
          cx.globalAlpha = 1;
        }
      });
    }

    function drawText(txt: string, size: number, x: number, y: number, col='#fff', align: CanvasTextAlign='left') {
      cx.font = `${size}px 'Press Start 2P',monospace`;
      cx.textAlign = align;
      cx.fillStyle = col;
      cx.fillText(String(txt), x, y);
    }
    function drawTextShadow(txt: string, size: number, x: number, y: number, col='#fff', align: CanvasTextAlign='left') {
      cx.font = `${size}px 'Press Start 2P',monospace`;
      cx.textAlign = align;
      cx.fillStyle = 'rgba(0,0,0,0.65)';
      cx.fillText(String(txt), x+2, y+2);
      cx.fillStyle = col;
      cx.fillText(String(txt), x, y);
    }
    function drawBox(x: number, y: number, w: number, h: number, stroke: string, fill: string) {
      if (fill) { cx.fillStyle = fill; cx.fillRect(x, y, w, h); }
      if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = 1; cx.strokeRect(x, y, w, h); }
    }

    newGame();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div style={{
      margin: 0, padding: 0,
      width: '100vw', height: '100vh',
      background: '#050d1a',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', flexDirection: 'column',
    }}>
      <canvas id="c" style={{ imageRendering: 'pixelated', touchAction: 'none' }} />
      <div id="mobile-bar" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0,
        width: '100%', height: 64,
        background: 'rgba(5,13,26,0.97)',
        borderTop: '2px solid #1a4080',
        zIndex: 100, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-around',
        padding: '0 8px',
        fontFamily: "'Press Start 2P', monospace",
      }}>
        <button onClick={() => (window as any).mobileBaitCycle()} style={mbBtnStyle()}>🪱<br/>BAIT</button>
        <button onClick={() => (window as any).mobileCast()} style={mbBtnStyle()}>🎣<br/>CAST</button>
        <button id="mb-reel" style={mbBtnStyle()}>🌀<br/>REEL</button>
        <button onClick={() => (window as any).mobileShop()} style={mbBtnStyle()}>🏪<br/>SHOP</button>
      </div>
    </div>
  );
}

function mbBtnStyle(): React.CSSProperties {
  return {
    background: 'rgba(20,60,120,0.9)',
    border: '2px solid #4898f8',
    color: '#e8e0c8',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 9,
    borderRadius: 8,
    padding: '8px 6px',
    minWidth: 64,
    minHeight: 48,
    cursor: 'pointer',
    lineHeight: 1.4,
    textAlign: 'center',
  };
}

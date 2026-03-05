/*
 * Skill Tree Plugin for Obsidian
 * Version 7.2.0 — Category Rendering Fixed
 */

const {
  Plugin, ItemView, WorkspaceLeaf,
  Modal, Setting, Notice, PluginSettingTab
} = require('obsidian');

const VIEW_TYPE_SKILL_TREE = 'skill-tree-view';

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ─── Default Categories (now data-driven, fully editable) ────────────────────

const DEFAULT_CATEGORIES = [
  { id: 'core', label: 'Core', icon: '🔴', color: '#e8d96a', builtIn: true },
  { id: 'mental', label: 'Mental', icon: '🧠', color: '#e8d96a', builtIn: true },
  { id: 'physical', label: 'Physical', icon: '💪', color: '#e05252', builtIn: true },
  { id: 'creative', label: 'Creative', icon: '🎨', color: '#4dd9e8', builtIn: true },
];

const DEFAULT_UI_COLORS = {
  background: '#080c10',
  hudBg: '#0d1520',
  toolbarBg: '#0d1520',
  panelBg: '#080c10',
  nodeCircleBg: '#0e141c',
  pointsColor: '#e8d96a',
  unlockedColor: '#4dd9e8',
  masteredColor: '#e05252',
};

// ─── Achievements Definition ──────────────────────────────────────────────────

const ACHIEVEMENTS_DEF = [
  { id: 'first_unlock', icon: '🔓', name: 'Primeiro Passo', desc: 'Desbloqueie sua primeira skill.', check: (t) => t.nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length >= 1 },
  { id: 'three_unlocked', icon: '🌟', name: 'Em Ritmo', desc: 'Desbloqueie 3 skills.', check: (t) => t.nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length >= 3 },
  { id: 'first_master', icon: '🏆', name: 'Mestre', desc: 'Domine completamente uma skill.', check: (t) => t.nodes.filter(n => n.state === 'mastered').length >= 1 },
  { id: 'three_mastered', icon: '👑', name: 'Grande Mestre', desc: 'Domine 3 skills ao máximo.', check: (t) => t.nodes.filter(n => n.state === 'mastered').length >= 3 },
  { id: 'broke', icon: '💸', name: 'Gastador', desc: 'Fique com 0 pontos.', check: (t) => t.points === 0 },
  { id: 'rich', icon: '💰', name: 'Poupador', desc: 'Acumule 20 ou mais pontos.', check: (t) => t.points >= 20 },
  { id: 'half_tree', icon: '🌲', name: 'Metade da Jornada', desc: 'Desbloqueie metade da árvore.', check: (t) => { const n = t.nodes.length; return t.nodes.filter(x => x.state === 'unlocked' || x.state === 'mastered').length >= Math.ceil(n / 2); } },
  { id: 'full_tree', icon: '🌳', name: 'Árvore Completa', desc: 'Desbloqueie todos os nós da árvore.', check: (t) => t.nodes.every(n => n.state === 'unlocked' || n.state === 'mastered') },
  { id: 'pomodoro_1', icon: '🍅', name: 'Primeiro Foco', desc: 'Complete seu primeiro Pomodoro.', check: (t, s) => (s.pomodorosCompleted || 0) >= 1 },
  { id: 'pomodoro_5', icon: '🔥', name: 'Em Chamas', desc: 'Complete 5 sessões Pomodoro.', check: (t, s) => (s.pomodorosCompleted || 0) >= 5 },
  { id: 'daily_used', icon: '🎲', name: 'Destino Aceito', desc: 'Use a skill do dia.', check: (t, s) => !!s.dailyUsed },
  { id: 'creative_master', icon: '🎨', name: 'Artista', desc: 'Domine uma skill do tipo Creative.', check: (t) => t.nodes.some(n => n.state === 'mastered' && n.category === 'creative') },
];

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_TREE = {
  id: 'default',
  name: 'Minha Skill Tree',
  points: 10,
  flipped: false,
  nodes: [
    { id: 'root', name: 'Core', icon: '❤️', description: 'Ponto de partida.', x: 700, y: 130, state: 'unlocked', level: 1, maxLevel: 1, cost: 0, requires: [], category: 'core' },
    { id: 'math', name: 'Math', icon: '📐', description: 'Matemática e lógica.', x: 300, y: 320, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['root'], category: 'mental' },
    { id: 'facul', name: 'Facul', icon: '🎓', description: 'Habilidades acadêmicas.', x: 530, y: 320, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['root'], category: 'mental' },
    { id: 'fisica', name: 'Física', icon: '⚛️', description: 'Física e ciências.', x: 700, y: 320, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['root'], category: 'core' },
    { id: 'etc1', name: 'Inglês', icon: '🌍', description: 'Domínio do inglês.', x: 870, y: 320, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['root'], category: 'creative' },
    { id: 'etc2', name: 'Código', icon: '💻', description: 'Programação.', x: 1100, y: 320, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['root'], category: 'physical' },
    { id: 'calc', name: 'Cálculo', icon: '∫', description: 'Cálculo diferencial.', x: 180, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['math'], category: 'mental' },
    { id: 'algebra', name: 'Álgebra', icon: '🔢', description: 'Álgebra linear.', x: 380, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['math'], category: 'mental' },
    { id: 'tcc', name: 'TCC', icon: '📝', description: 'Trabalho de conclusão.', x: 530, y: 520, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['facul'], category: 'mental' },
    { id: 'mec', name: 'Mecânica', icon: '⚙️', description: 'Mecânica clássica.', x: 650, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['fisica'], category: 'core' },
    { id: 'eletro', name: 'Elétrica', icon: '⚡', description: 'Eletromagnetismo.', x: 810, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['fisica'], category: 'core' },
    { id: 'speak', name: 'Speaking', icon: '🗣️', description: 'Fluência oral.', x: 930, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['etc1'], category: 'creative' },
    { id: 'webdev', name: 'Web Dev', icon: '🌐', description: 'Desenvolvimento web.', x: 1060, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['etc2'], category: 'physical' },
    { id: 'algo', name: 'Algoritmos', icon: '🧩', description: 'Algoritmos e estruturas.', x: 1190, y: 520, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['etc2'], category: 'physical' },
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function computeStates(nodes) {
  let changed = true, passes = 0;
  const maxPasses = nodes.length * 2 + 4;
  while (changed && passes < maxPasses) {
    changed = false; passes++;
    for (const node of nodes) {
      if (node.state === 'mastered' || node.state === 'unlocked') continue;
      const allMet = node.requires.every(rid => {
        const r = nodes.find(n => n.id === rid);
        return r && (r.state === 'unlocked' || r.state === 'mastered');
      });
      if (allMet && node.state === 'locked') { node.state = 'available'; changed = true; }
      else if (!allMet && node.state === 'available') { node.state = 'locked'; changed = true; }
    }
  }
  return nodes;
}

function wouldCreateCycle(nodes, fromId, toId) {
  const visited = new Set(), stack = [toId];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === fromId) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const node = nodes.find(n => n.id === cur);
    if (node) node.requires.forEach(r => stack.push(r));
  }
  return false;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hexToRgba(hex, alpha = 0.5) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const SKILL_TREE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

.skill-tree-container {
  position:relative; width:100%; height:100%; overflow:hidden;
  background:var(--st-bg,#080c10); cursor:grab;
  font-family:'Rajdhani',sans-serif;
}
.skill-tree-container.panning { cursor:grabbing; }
.skill-tree-container::after {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.65) 100%);
  pointer-events:none; z-index:1;
}
.skill-tree-stage { position:absolute; top:0; left:0; transform-origin:0 0; will-change:transform; }
.skill-tree-canvas { position:absolute; top:0; left:0; pointer-events:none; overflow:visible; }
.skill-tree-world  { position:absolute; top:0; left:0; width:6000px; height:6000px; }

/* ── HUD ── */
.skill-hud {
  position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:50;
  display:flex; align-items:center; gap:18px;
  background:var(--st-hud-bg,rgba(8,12,16,0.75));
  border:1px solid rgba(255,255,255,0.07); border-radius:20px;
  padding:5px 20px; backdrop-filter:blur(8px); pointer-events:none;
}
.skill-hud-stat { display:flex; flex-direction:column; align-items:center; gap:2px; }
.skill-hud-label { font-size:9px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; }
.skill-hud-value { font-size:14px; font-weight:700; letter-spacing:0.04em; color:#fff; font-family:'Share Tech Mono',monospace; }
.skill-hud-value.gold  { color:var(--st-points-color,#e8d96a); }
.skill-hud-value.cyan  { color:var(--st-unlocked-color,#4dd9e8); }
.skill-hud-value.red   { color:var(--st-mastered-color,#e05252); }
.skill-hud-sep { width:1px; height:28px; background:rgba(255,255,255,0.07); }

/* ── Toolbar ── */
.skill-toolbar {
  position:absolute; top:16px; left:16px; z-index:50;
  display:flex; flex-direction:column; gap:4px;
}
.skill-toolbar-btn {
  background:var(--st-toolbar-bg,rgba(8,12,16,0.8));
  border:1px solid rgba(255,255,255,0.1); border-radius:3px;
  padding:6px 14px; cursor:pointer; font-size:11px; font-weight:600;
  letter-spacing:0.12em; text-transform:uppercase;
  color:rgba(255,255,255,0.55); text-align:left;
  transition:all 0.15s; white-space:nowrap; font-family:'Rajdhani',sans-serif;
}
.skill-toolbar-btn:hover  { border-color:rgba(255,255,255,0.25); color:#fff; background:rgba(20,26,32,0.95); }
.skill-toolbar-btn.active { border-color:#e8d96a; color:#e8d96a; background:rgba(232,217,106,0.08); }
.skill-toolbar-btn.flip-active  { border-color:#4dd9e8; color:#4dd9e8; background:rgba(77,217,232,0.08); }
.skill-toolbar-btn.daily-active { border-color:#b48aff; color:#b48aff; background:rgba(180,138,255,0.08); border-style:dashed; }

/* ── Controls ── */
.skill-controls {
  position:absolute; bottom:20px; right:20px; z-index:50;
  display:flex; flex-direction:column; gap:4px;
}
.skill-btn {
  width:32px; height:32px;
  background:var(--st-toolbar-bg,rgba(8,12,16,0.8));
  border:1px solid rgba(255,255,255,0.1); border-radius:3px;
  cursor:pointer; font-size:16px; color:rgba(255,255,255,0.55);
  display:flex; align-items:center; justify-content:center; transition:all 0.15s;
}
.skill-btn:hover { border-color:rgba(255,255,255,0.25); color:#fff; }

/* ── Side Panel (skill list) — RIGHT ── */
.skill-panel {
  position:absolute; top:0; right:0; width:260px; height:100%;
  background:var(--st-panel-bg,rgba(8,12,16,0.92));
  border-left:1px solid rgba(255,255,255,0.07); z-index:40;
  overflow-y:auto; padding:16px 12px;
  transform:translateX(100%); transition:transform 0.2s ease;
  backdrop-filter:blur(10px);
}
.skill-panel.open { transform:translateX(0); }
.skill-panel h3 { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.18em; color:rgba(255,255,255,0.25); margin:14px 0 6px; font-family:'Share Tech Mono',monospace; }
.skill-panel-skill-item { display:flex; align-items:center; gap:8px; padding:5px 6px; border-radius:3px; cursor:pointer; font-size:12px; font-weight:600; transition:background 0.12s; letter-spacing:0.04em; }
.skill-panel-skill-item:hover { background:rgba(255,255,255,0.05); }
.skill-panel-skill-icon { font-size:14px; }
.skill-panel-skill-name { flex:1; color:rgba(255,255,255,0.7); }
.skill-panel-skill-badge { font-size:9px; padding:1px 5px; border-radius:2px; background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; letter-spacing:0.05em; }
.skill-panel-skill-badge.unlocked  { background:rgba(232,217,106,0.12); color:#e8d96a; }
.skill-panel-skill-badge.mastered  { background:rgba(77,217,232,0.12);  color:#4dd9e8; }
.skill-panel-skill-badge.available { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.4); }

/* ── Color Panel — RIGHT ── */
.skill-color-panel {
  position:absolute; top:0; right:0; width:280px; height:100%;
  background:rgba(6,10,14,0.97); border-left:1px solid rgba(255,255,255,0.07);
  z-index:44; overflow-y:auto; padding:16px 14px;
  transform:translateX(100%); transition:transform 0.22s ease;
  backdrop-filter:blur(14px);
}
.skill-color-panel.open { transform:translateX(0); }
.skill-color-panel-title { font-size:9px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin:0 0 16px; font-family:'Share Tech Mono',monospace; }
.skill-color-section { margin-bottom:18px; }
.skill-color-section-label { font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-bottom:10px; font-family:'Share Tech Mono',monospace; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05); }
.skill-color-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.skill-color-row-label { flex:1; font-size:11px; font-weight:600; color:rgba(255,255,255,0.55); letter-spacing:0.06em; font-family:'Rajdhani',sans-serif; }
.skill-color-swatch { width:28px; height:28px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); cursor:pointer; transition:transform 0.15s,border-color 0.15s; position:relative; overflow:hidden; flex-shrink:0; }
.skill-color-swatch:hover { transform:scale(1.14); border-color:rgba(255,255,255,0.4); }
.skill-color-swatch input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100%+8px); height:calc(100%+8px); }
.skill-color-divider { height:1px; background:rgba(255,255,255,0.05); margin:14px 0; }
.skill-color-reset-btn { margin-top:14px; width:100%; background:rgba(224,82,82,0.08); border:1px solid rgba(224,82,82,0.2); border-radius:3px; padding:6px 10px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#e05252; cursor:pointer; font-family:'Rajdhani',sans-serif; transition:background 0.15s; }
.skill-color-reset-btn:hover { background:rgba(224,82,82,0.18); }

/* ── Nodes ── */
.skill-node { position:absolute; transform:translate(-50%,-50%); cursor:pointer; text-align:center; z-index:10; user-select:none; display:flex; flex-direction:column; align-items:center; gap:6px; }
.skill-node-circle { width:54px; height:54px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); background:var(--st-node-bg,rgba(14,20,28,0.9)); display:flex; align-items:center; justify-content:center; font-size:22px; transition:all 0.2s ease; position:relative; box-shadow:0 0 0 0 transparent,inset 0 1px 0 rgba(255,255,255,0.07); }
.skill-node-circle.root-circle { width:66px; height:66px; font-size:28px; }
.skill-node:hover .skill-node-circle { transform:scale(1.1); }
.skill-node.locked    .skill-node-circle { border-color:rgba(255,255,255,0.1); opacity:0.45; }
.skill-node.available .skill-node-circle { border-color:rgba(255,255,255,0.5); animation:nodeRingPulse 2.4s ease-in-out infinite; }
.skill-node.unlocked  .skill-node-circle { border-color:var(--node-color,#e8d96a); box-shadow:0 0 10px var(--node-glow,rgba(232,217,106,0.3)),0 0 24px var(--node-glow,rgba(232,217,106,0.15)); }
.skill-node.mastered  .skill-node-circle { border-color:var(--node-color,#e8d96a); border-width:3px; box-shadow:0 0 14px var(--node-glow,rgba(232,217,106,0.5)),0 0 36px var(--node-glow,rgba(232,217,106,0.2)); }
.skill-node.edit-mode { cursor:move; }
.skill-node.daily-highlight .skill-node-circle { box-shadow:0 0 0 3px #b48aff,0 0 20px rgba(180,138,255,0.6) !important; }
.skill-node-lock { position:absolute; bottom:-3px; right:-3px; width:16px; height:16px; background:rgba(8,12,16,0.95); border:1px solid rgba(255,255,255,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:8px; color:rgba(255,255,255,0.4); }
.skill-node-level-badge { position:absolute; top:-4px; left:-4px; width:18px; height:18px; background:var(--node-color,#e8d96a); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#080c10; font-family:'Share Tech Mono',monospace; }
.skill-node-name { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.5); white-space:nowrap; font-family:'Rajdhani',sans-serif; transition:color 0.2s; }
.skill-node.unlocked .skill-node-name,
.skill-node.mastered  .skill-node-name { color:rgba(255,255,255,0.85); }
.skill-node.available .skill-node-name { color:rgba(255,255,255,0.7); }
.skill-node-cost { position:absolute; bottom:30px; right:-22px; font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; white-space:nowrap; }

@keyframes nodeRingPulse {
  0%,100% { box-shadow:0 0 0 0 rgba(255,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.07); }
  50%      { box-shadow:0 0 0 6px rgba(255,255,255,0.06),inset 0 1px 0 rgba(255,255,255,0.07); }
}

/* ── Edges ── */
.skill-connection { fill:none; stroke:rgba(255,255,255,0.1); stroke-width:1.5; transition:stroke 0.3s,opacity 0.3s; }
.skill-connection.available { stroke:rgba(255,255,255,0.22); stroke-width:1.5; }
.skill-connection.unlocked  { stroke-width:2.5; opacity:0.9; }
.skill-connection.mastered  { stroke-width:3;   opacity:1; }
.skill-connection-glow { fill:none; stroke-width:6; opacity:0.12; pointer-events:none; }

/* ── Tooltip ── */
.skill-tooltip { position:fixed; pointer-events:none; z-index:9999; background:rgba(8,12,16,0.97); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px 16px; width:220px; box-shadow:0 8px 32px rgba(0,0,0,0.6); opacity:0; transition:opacity 0.1s; font-family:'Rajdhani',sans-serif; }
.skill-tooltip.visible { opacity:1; }
.skill-tooltip-header { display:flex; gap:10px; align-items:center; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.07); }
.skill-tooltip-icon  { font-size:24px; }
.skill-tooltip-title { font-size:15px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#fff; }
.skill-tooltip-state { font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; }
.skill-tooltip-desc  { font-size:12px; color:rgba(255,255,255,0.45); line-height:1.5; margin-bottom:8px; }
.skill-tooltip-stats { display:flex; gap:12px; font-size:11px; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-stat  { display:flex; flex-direction:column; gap:2px; }
.skill-tooltip-stat-label { font-size:8px; letter-spacing:0.15em; color:rgba(255,255,255,0.25); text-transform:uppercase; }
.skill-tooltip-stat-val   { font-size:14px; font-weight:700; color:#e8d96a; }
.skill-tooltip-req    { font-size:10px; color:rgba(255,255,255,0.3); margin-top:6px; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-action { margin-top:8px; padding:4px 10px; border-radius:2px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; text-align:center; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-action.can-afford  { background:rgba(232,217,106,0.1); color:#e8d96a; border:1px solid rgba(232,217,106,0.2); }
.skill-tooltip-action.cant-afford { background:rgba(224,82,82,0.08);  color:#e05252; border:1px solid rgba(224,82,82,0.15); }

/* ── Particles ── */
@keyframes skillParticleFade {
  0%   { opacity:1; transform:scale(1); }
  100% { opacity:0; transform:scale(0.2); }
}

/* ── Modal ── */
.skill-modal h2 { font-size:18px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px; font-family:'Rajdhani',sans-serif; }
.skill-modal-sub { font-size:11px; color:var(--text-muted); margin-bottom:12px; margin-top:-10px; font-family:'Share Tech Mono',monospace; }
.skill-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; flex-wrap:wrap; }
.skill-modal-btn { padding:6px 14px; border-radius:3px; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; border:1px solid transparent; transition:opacity 0.15s; font-family:'Rajdhani',sans-serif; }
.skill-modal-btn.primary   { background:rgba(232,217,106,0.12); color:#e8d96a; border-color:rgba(232,217,106,0.3); }
.skill-modal-btn.primary:hover { opacity:0.85; }
.skill-modal-btn.secondary { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); border-color:rgba(255,255,255,0.1); }
.skill-modal-btn.danger    { background:rgba(224,82,82,0.08); color:#e05252; border-color:rgba(224,82,82,0.2); }
.skill-modal-btn.danger:hover { background:rgba(224,82,82,0.15); }
.skill-modal-btn.sm { padding:2px 8px; font-size:10px; }
.skill-modal-btn.purple { background:rgba(180,138,255,0.1); color:#b48aff; border-color:rgba(180,138,255,0.3); }
.skill-modal-empty { font-size:11px; color:var(--text-muted); font-style:italic; margin-bottom:6px; font-family:'Share Tech Mono',monospace; }
.skill-req-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-size:12px; }
.skill-req-row span { flex:1; }
.skill-modal-select { width:100%; margin-top:6px; padding:4px 8px; border-radius:3px; border:1px solid var(--background-modifier-border); background:var(--background-secondary); color:var(--text-normal); font-size:12px; font-family:'Rajdhani',sans-serif; }

/* ── Hint ── */
.skill-hint { position:absolute; bottom:76px; left:50%; transform:translateX(-50%); font-size:9px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.15); pointer-events:none; z-index:30; white-space:nowrap; font-family:'Share Tech Mono',monospace; }
.skill-flip-indicator { position:absolute; top:16px; right:16px; font-size:9px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.18); pointer-events:none; z-index:30; font-family:'Share Tech Mono',monospace; }

/* ── Achievements Panel — RIGHT ── */
.skill-ach-panel {
  position:absolute; top:0; right:0; width:280px; height:100%;
  background:rgba(6,10,14,0.97); border-left:1px solid rgba(255,255,255,0.07);
  z-index:45; overflow-y:auto; padding:16px 14px;
  transform:translateX(100%); transition:transform 0.22s ease;
  backdrop-filter:blur(14px);
}
.skill-ach-panel.open { transform:translateX(0); }
.skill-ach-panel-title { font-size:9px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin:0 0 14px; font-family:'Share Tech Mono',monospace; }
.skill-ach-item { display:flex; align-items:center; gap:10px; padding:8px 8px; border-radius:4px; margin-bottom:6px; border:1px solid rgba(255,255,255,0.04); transition:background 0.12s; }
.skill-ach-item.earned { background:rgba(232,217,106,0.05); border-color:rgba(232,217,106,0.12); }
.skill-ach-item.locked-ach { opacity:0.35; filter:grayscale(0.8); }
.skill-ach-icon { font-size:22px; flex-shrink:0; }
.skill-ach-info { flex:1; }
.skill-ach-name { font-size:12px; font-weight:700; letter-spacing:0.06em; color:rgba(255,255,255,0.8); font-family:'Rajdhani',sans-serif; }
.skill-ach-desc { font-size:10px; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; margin-top:1px; }
.skill-ach-badge { font-size:8px; font-family:'Share Tech Mono',monospace; padding:1px 5px; border-radius:2px; }
.skill-ach-badge.earned { background:rgba(232,217,106,0.15); color:#e8d96a; }
.skill-ach-badge.locked-ach { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.2); }
.skill-ach-progress { font-size:10px; color:rgba(255,255,255,0.25); margin-top:10px; font-family:'Share Tech Mono',monospace; text-align:center; letter-spacing:0.1em; }

/* ── Achievement Toast ── */
@keyframes achSlideIn  { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
@keyframes achSlideOut { from { opacity:1; } to { transform:translateX(120%); opacity:0; } }
.skill-ach-toast {
  position:fixed; bottom:80px; right:20px; z-index:99999;
  background:rgba(8,12,16,0.98); border:1px solid rgba(232,217,106,0.3);
  border-radius:6px; padding:12px 16px; display:flex; align-items:center; gap:12px;
  box-shadow:0 4px 24px rgba(0,0,0,0.7); max-width:280px;
  animation:achSlideIn 0.4s ease forwards;
}
.skill-ach-toast.hiding { animation:achSlideOut 0.4s ease forwards; }
.skill-ach-toast-icon { font-size:26px; }
.skill-ach-toast-body {}
.skill-ach-toast-title { font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#e8d96a; font-family:'Share Tech Mono',monospace; }
.skill-ach-toast-name  { font-size:14px; font-weight:700; color:#fff; font-family:'Rajdhani',sans-serif; margin-top:2px; }
.skill-ach-toast-desc  { font-size:11px; color:rgba(255,255,255,0.4); font-family:'Share Tech Mono',monospace; }

/* ── Pomodoro Widget ── */
.skill-pomodoro {
  position:absolute; bottom:20px; left:50%; transform:translateX(-50%);
  z-index:50; display:flex; flex-direction:column; align-items:center; gap:8px;
  background:var(--st-hud-bg,rgba(8,12,16,0.9));
  border:1px solid rgba(255,255,255,0.08); border-radius:12px;
  padding:10px 20px; backdrop-filter:blur(10px);
  transition:opacity 0.3s; min-width:200px;
}
.skill-pomodoro.hidden { opacity:0; pointer-events:none; }
.skill-pomodoro-skill { font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; }
.skill-pomodoro-timer { font-size:28px; font-weight:700; color:#e8d96a; font-family:'Share Tech Mono',monospace; letter-spacing:0.1em; line-height:1; }
.skill-pomodoro-phase { font-size:9px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.25); font-family:'Share Tech Mono',monospace; }
.skill-pomodoro-btns { display:flex; gap:6px; }
.skill-pomodoro-btn { padding:3px 10px; border-radius:3px; border:1px solid rgba(255,255,255,0.1); background:transparent; cursor:pointer; font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.4); font-family:'Rajdhani',sans-serif; transition:all 0.15s; }
.skill-pomodoro-btn:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
.skill-pomodoro-btn.running { border-color:#e8d96a; color:#e8d96a; background:rgba(232,217,106,0.07); }
.skill-pomodoro-dots { display:flex; gap:5px; }
.skill-pomodoro-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.1); transition:background 0.3s; }
.skill-pomodoro-dot.done { background:#e05252; }

/* ── Stats Panel — RIGHT ── */
.skill-stats-panel {
  position:absolute; top:0; right:0; width:280px; height:100%;
  background:rgba(6,10,14,0.97); border-left:1px solid rgba(255,255,255,0.07);
  z-index:46; overflow-y:auto; padding:16px 14px;
  transform:translateX(100%); transition:transform 0.22s ease;
  backdrop-filter:blur(14px);
}
.skill-stats-panel.open { transform:translateX(0); }
.skill-stats-title { font-size:9px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin:0 0 16px; font-family:'Share Tech Mono',monospace; }
.skill-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
.skill-stats-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:5px; padding:10px 12px; }
.skill-stats-card-val { font-size:22px; font-weight:700; color:#e8d96a; font-family:'Share Tech Mono',monospace; }
.skill-stats-card-label { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.25); font-family:'Share Tech Mono',monospace; margin-top:2px; }
.skill-stats-section { font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin:14px 0 8px; font-family:'Share Tech Mono',monospace; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05); }
.skill-stats-bar-row { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
.skill-stats-bar-label { font-size:11px; font-weight:600; color:rgba(255,255,255,0.5); width:80px; font-family:'Rajdhani',sans-serif; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.skill-stats-bar-track { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
.skill-stats-bar-fill  { height:100%; border-radius:3px; transition:width 0.5s ease; }
.skill-stats-bar-pct   { font-size:9px; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; width:28px; text-align:right; }
.skill-stats-pomodoro-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; font-size:11px; }
.skill-stats-pomodoro-key { color:rgba(255,255,255,0.4); font-family:'Share Tech Mono',monospace; font-size:10px; }
.skill-stats-pomodoro-val { color:#e8d96a; font-family:'Share Tech Mono',monospace; font-size:11px; font-weight:700; }

/* ── Daily Skill Banner ── */
.skill-daily-banner {
  position:absolute; top:58px; left:50%; transform:translateX(-50%);
  z-index:48; display:flex; align-items:center; gap:10px;
  background:rgba(20,12,36,0.92); border:1px solid rgba(180,138,255,0.25);
  border-radius:10px; padding:6px 16px; backdrop-filter:blur(8px);
  pointer-events:none; transition:opacity 0.4s;
}
.skill-daily-banner.hidden { opacity:0; }
.skill-daily-banner-label { font-size:8px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(180,138,255,0.6); font-family:'Share Tech Mono',monospace; }
.skill-daily-banner-name  { font-size:13px; font-weight:700; color:#b48aff; font-family:'Rajdhani',sans-serif; letter-spacing:0.08em; }

/* ── Category Manager ── */
.skill-cat-row {
  display:flex; align-items:center; gap:8px; padding:7px 6px;
  border-bottom:1px solid rgba(255,255,255,0.04);
  border-radius:3px; transition:background 0.1s;
}
.skill-cat-row:hover { background:rgba(255,255,255,0.02); }
.skill-cat-row.builtin-row { border-left:2px solid rgba(255,255,255,0.08); padding-left:8px; }
.skill-cat-color-dot { width:22px; height:22px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); flex-shrink:0; position:relative; overflow:hidden; cursor:pointer; }
.skill-cat-color-dot input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100%+8px); height:calc(100%+8px); }
.skill-cat-name-input {
  flex:1; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.08);
  color:rgba(255,255,255,0.75); font-size:12px; font-weight:600; font-family:'Rajdhani',sans-serif;
  padding:2px 4px; outline:none; transition:border-color 0.15s;
}
.skill-cat-name-input:focus { border-bottom-color:rgba(255,255,255,0.3); }
.skill-cat-icon-input {
  width:38px; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.08);
  color:rgba(255,255,255,0.75); font-size:14px; text-align:center; font-family:'Rajdhani',sans-serif;
  padding:2px 2px; outline:none; transition:border-color 0.15s;
}
.skill-cat-icon-input:focus { border-bottom-color:rgba(255,255,255,0.3); }
.skill-cat-del-btn { background:transparent; border:1px solid rgba(224,82,82,0.2); border-radius:3px; padding:2px 7px; font-size:10px; color:#e05252; cursor:pointer; font-family:'Rajdhani',sans-serif; font-weight:700; flex-shrink:0; }
.skill-cat-del-btn:hover { background:rgba(224,82,82,0.12); }
.skill-cat-del-btn:disabled { opacity:0.3; cursor:not-allowed; }
.skill-cat-add-form { margin-top:10px; display:flex; flex-direction:column; gap:6px; }
.skill-cat-add-row { display:flex; gap:6px; align-items:center; }
.skill-cat-input { flex:1; padding:4px 8px; border-radius:3px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:#fff; font-size:12px; font-family:'Rajdhani',sans-serif; }
.skill-cat-add-btn { padding:4px 12px; border-radius:3px; border:1px solid rgba(232,217,106,0.3); background:rgba(232,217,106,0.07); color:#e8d96a; cursor:pointer; font-size:11px; font-weight:700; letter-spacing:0.08em; font-family:'Rajdhani',sans-serif; white-space:nowrap; }
.skill-cat-add-btn:hover { background:rgba(232,217,106,0.14); }
.skill-cat-section-header { font-size:9px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin:14px 0 6px; font-family:'Share Tech Mono',monospace; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:4px; }
/* in-use badge for category rows */
.skill-cat-inuse { font-size:9px; color:rgba(255,200,80,0.6); font-family:'Share Tech Mono',monospace; white-space:nowrap; flex-shrink:0; }
`;

// ─── View ─────────────────────────────────────────────────────────────────────

class SkillTreeView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tree = null;
    this.scale = 1; this.panX = 0; this.panY = 0;
    this.isPanning = false; this.isDraggingNode = false;
    this.lastMouse = { x: 0, y: 0 };
    this.editMode = false; this.connectMode = false; this.connectFrom = null;
    this.tooltip = null;
    this.panelOpen = false; this.colorPanelOpen = false;
    this.achPanelOpen = false; this.statsPanelOpen = false;
    this._onMouseMove = null; this._onMouseUp = null;
    this.uiColors = JSON.parse(JSON.stringify(DEFAULT_UI_COLORS));
    this.allCategories = [];

    // Pomodoro state
    this.pomo = {
      active: false, running: false,
      workMin: 25, breakMin: 5,
      remaining: 25 * 60, phase: 'work',
      targetNodeId: null, sessionsInCycle: 0, totalDone: 0,
      intervalId: null,
    };

    // Daily skill
    this.dailyNodeId = null;
  }

  getViewType() { return VIEW_TYPE_SKILL_TREE; }
  getDisplayText() { return this.tree ? this.tree.name : 'Skill Tree'; }
  getIcon() { return 'star'; }

  async onOpen() { this.injectCSS(); await this.loadTree(); this.render(); }
  async onClose() {
    await this.saveTree();
    this.stopPomodoro(true);
    if (this.tooltip && this.tooltip.parentNode) this.tooltip.parentNode.removeChild(this.tooltip);
    this.tooltip = null;
    if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp);
  }

  injectCSS() {
    const id = 'skill-tree-plugin-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id; style.textContent = SKILL_TREE_CSS;
    document.head.appendChild(style);
  }

  async loadTree() {
    const saved = this.plugin.settings.trees[this.plugin.settings.activeTree];
    this.tree = saved
      ? JSON.parse(JSON.stringify(saved))
      : JSON.parse(JSON.stringify(DEFAULT_TREE));
    if (this.tree.flipped === undefined) this.tree.flipped = false;
    this.tree.nodes = computeStates(this.tree.nodes);

    // Load unified categories
    if (this.plugin.settings.allCategories && this.plugin.settings.allCategories.length > 0) {
      this.allCategories = JSON.parse(JSON.stringify(this.plugin.settings.allCategories));
    } else {
      this.allCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      if (this.plugin.settings.customCategories && this.plugin.settings.customCategories.length) {
        this.plugin.settings.customCategories.forEach(c => {
          if (!this.allCategories.find(a => a.id === c.id)) {
            this.allCategories.push({ id: c.id, label: c.label, icon: c.icon || '📌', color: c.color, builtIn: false });
          }
        });
      }
      if (this.plugin.settings.catColors) {
        const cc = this.plugin.settings.catColors;
        this.allCategories.forEach(cat => {
          if (cc[cat.id] && cc[cat.id].stroke) cat.color = cc[cat.id].stroke;
        });
      }
    }

    if (this.plugin.settings.uiColors)
      this.uiColors = JSON.parse(JSON.stringify(this.plugin.settings.uiColors));

    if (this.plugin.settings.pomo)
      this.pomo.totalDone = this.plugin.settings.pomo.totalDone || 0;

    this.pickDailySkill();
  }

  async saveTree() {
    if (!this.tree) return;
    this.plugin.settings.trees[this.tree.id] = JSON.parse(JSON.stringify(this.tree));
    this.plugin.settings.allCategories = JSON.parse(JSON.stringify(this.allCategories));
    this.plugin.settings.uiColors = JSON.parse(JSON.stringify(this.uiColors));
    this.plugin.settings.pomo = { totalDone: this.pomo.totalDone };
    this.plugin.settings.achievements = this.plugin.settings.achievements || {};
    await this.plugin.saveSettings();
  }

  // ─── Category helpers ───────────────────────────────────────────────────────

  getAllCategories() { return this.allCategories; }

  // FIX: catColor now always returns a valid color, even for unknown category IDs
  catColor(cat) {
    const found = this.allCategories.find(c => c.id === cat);
    if (found && found.color) {
      const color = found.color.startsWith('#') ? found.color : '#e8d96a';
      return { stroke: color, glow: hexToRgba(color, 0.5), text: color };
    }
    // Fallback for unknown/deleted categories
    return { stroke: '#888', glow: 'rgba(136,136,136,0.4)', text: '#888' };
  }

  // FIX: Get the effective category id for a node — falls back to first available cat
  getNodeCategoryId(node) {
    if (this.allCategories.find(c => c.id === node.category)) return node.category;
    return this.allCategories[0]?.id || 'core';
  }

  // ─── Achievement System ─────────────────────────────────────────────────────

  checkAchievements() {
    const earned = this.plugin.settings.achievements || {};
    const stats = this.plugin.settings.pomo || {};
    const dailyStats = { dailyUsed: this.plugin.settings.dailyUsed || false };

    ACHIEVEMENTS_DEF.forEach(ach => {
      if (earned[ach.id]) return;
      try {
        const ok = ach.check(this.tree, { ...stats, ...dailyStats });
        if (ok) {
          earned[ach.id] = Date.now();
          this.plugin.settings.achievements = earned;
          this.plugin.saveSettings();
          this.showAchievementToast(ach);
          if (this.achPanelOpen) this.renderAchPanel();
        }
      } catch (e) { }
    });
  }

  showAchievementToast(ach) {
    const toast = document.createElement('div');
    toast.className = 'skill-ach-toast';
    toast.innerHTML = `
      <div class="skill-ach-toast-icon">${ach.icon}</div>
      <div class="skill-ach-toast-body">
        <div class="skill-ach-toast-title">🏆 Conquista Desbloqueada!</div>
        <div class="skill-ach-toast-name">${ach.name}</div>
        <div class="skill-ach-toast-desc">${ach.desc}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 450);
    }, 4000);
  }

  // ─── Daily Skill ────────────────────────────────────────────────────────────

  pickDailySkill() {
    const key = todayKey();
    const saved = this.plugin.settings.dailySkill;
    if (saved && saved.key === key) { this.dailyNodeId = saved.nodeId; return; }
    const candidates = this.tree.nodes.filter(n => n.id !== 'root' && n.state !== 'mastered');
    if (!candidates.length) { this.dailyNodeId = null; return; }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.dailyNodeId = pick.id;
    this.plugin.settings.dailySkill = { key, nodeId: pick.id };
    this.plugin.saveSettings();
  }

  // ─── Color helpers ──────────────────────────────────────────────────────────

  updateCSSVars() {
    const el = this.contentEl; if (!el) return;
    el.style.setProperty('--st-bg', this.uiColors.background);
    el.style.setProperty('--st-hud-bg', this.uiColors.hudBg);
    el.style.setProperty('--st-toolbar-bg', this.uiColors.toolbarBg);
    el.style.setProperty('--st-panel-bg', this.uiColors.panelBg);
    el.style.setProperty('--st-node-bg', this.uiColors.nodeCircleBg);
    el.style.setProperty('--st-points-color', this.uiColors.pointsColor);
    el.style.setProperty('--st-unlocked-color', this.uiColors.unlockedColor);
    el.style.setProperty('--st-mastered-color', this.uiColors.masteredColor);
  }

  rgbaToHex(val) {
    if (val && val.startsWith('#')) return val;
    const m = val && val.match(/[\d.]+/g);
    if (!m || m.length < 3) return '#e8d96a';
    return '#' + [0, 1, 2].map(i => Math.round(parseFloat(m[i])).toString(16).padStart(2, '0')).join('');
  }

  // ─── Flip ───────────────────────────────────────────────────────────────────

  flipTree() {
    const ys = this.tree.nodes.map(n => n.y);
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    this.tree.nodes.forEach(n => { n.y = Math.round(midY * 2 - n.y); });
    this.tree.flipped = !this.tree.flipped;
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  render() {
    const container = this.contentEl;
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.position = 'absolute';
    container.style.inset = '0';
    container.parentElement.style.padding = '0';
    container.parentElement.style.overflow = 'hidden';
    container.empty();
    container.addClass('skill-tree-container');
    this.updateCSSVars();

    this.stageEl = container.createDiv({ cls: 'skill-tree-stage' });

    // SVG
    this.svgEl = document.createElementNS(SVG_NS, 'svg');
    this.svgEl.setAttribute('class', 'skill-tree-canvas');
    this.svgEl.setAttribute('width', '6000');
    this.svgEl.setAttribute('height', '6000');
    const defs = svgEl('defs');
    const filter = svgEl('filter', { id: 'edge-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    const feBlur = svgEl('feGaussianBlur', { stdDeviation: '3', result: 'coloredBlur' });
    const feMerge = svgEl('feMerge');
    feMerge.appendChild(svgEl('feMergeNode', { in: 'coloredBlur' }));
    feMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
    filter.appendChild(feBlur); filter.appendChild(feMerge);
    defs.appendChild(filter); this.svgEl.appendChild(defs);
    this.stageEl.appendChild(this.svgEl);

    this.worldEl = this.stageEl.createDiv({ cls: 'skill-tree-world' });

    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'skill-tooltip';
    document.body.appendChild(this.tooltip);

    // HUD
    this.hudEl = container.createDiv({ cls: 'skill-hud' });
    this.renderHUD();

    // Daily banner
    this.dailyBannerEl = container.createDiv({ cls: 'skill-daily-banner' });
    this.renderDailyBanner();

    // ── RIGHT SIDE panels ──
    this.statsPanelEl = container.createDiv({ cls: 'skill-stats-panel' });
    this.renderStatsPanel();

    this.colorPanelEl = container.createDiv({ cls: 'skill-color-panel' });
    this.renderColorPanel();

    this.achPanelEl = container.createDiv({ cls: 'skill-ach-panel' });
    this.renderAchPanel();

    this.panelEl = container.createDiv({ cls: 'skill-panel' });
    this.renderPanel();

    // Toolbar (left)
    this.toolbarEl = container.createDiv({ cls: 'skill-toolbar' });
    this.renderToolbar();

    // Controls
    const controls = container.createDiv({ cls: 'skill-controls' });
    this.renderControls(controls);

    // Pomodoro widget
    this.pomodoroEl = container.createDiv({ cls: 'skill-pomodoro hidden' });
    this.renderPomodoro();

    // Flip indicator
    this.flipIndicatorEl = container.createDiv({ cls: 'skill-flip-indicator' });
    this.updateFlipIndicator();

    // Hint
    container.createDiv({ cls: 'skill-hint', text: 'SCROLL — ZOOM  ·  DRAG — PAN  ·  CLICK — UNLOCK' });

    this.renderEdges();
    this.renderNodes();
    this.setupPan(container);
    requestAnimationFrame(() => this.centerView());
  }

  updateFlipIndicator() {
    if (!this.flipIndicatorEl) return;
    this.flipIndicatorEl.textContent = this.tree.flipped ? '↑ BOTTOM → TOP' : '↓ TOP → BOTTOM';
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────

  renderHUD() {
    const nodes = this.tree.nodes;
    const unlocked = nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
    const mastered = nodes.filter(n => n.state === 'mastered').length;
    this.hudEl.empty();
    const mk = (label, value, cls) => {
      const s = this.hudEl.createDiv({ cls: 'skill-hud-stat' });
      s.createDiv({ cls: 'skill-hud-label', text: label });
      s.createDiv({ cls: `skill-hud-value ${cls}`, text: String(value) });
    };
    mk('Points', this.tree.points, 'gold');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('Unlocked', `${unlocked}/${nodes.length}`, 'cyan');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('Mastered', mastered, 'red');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('🍅', this.pomo.totalDone, '');
  }

  // ─── Daily Banner ────────────────────────────────────────────────────────────

  renderDailyBanner() {
    if (!this.dailyBannerEl) return;
    this.dailyBannerEl.empty();
    const node = this.tree.nodes.find(n => n.id === this.dailyNodeId);
    if (!node) { this.dailyBannerEl.addClass('hidden'); return; }
    this.dailyBannerEl.removeClass('hidden');
    this.dailyBannerEl.createDiv({ cls: 'skill-daily-banner-label', text: '⚡ skill do dia' });
    this.dailyBannerEl.createDiv({ cls: 'skill-daily-banner-name', text: `${node.icon} ${node.name}` });
  }

  // ─── Close all right panels ─────────────────────────────────────────────────

  closeAllRightPanels() {
    this.panelOpen = false; this.panelEl.removeClass('open');
    this.colorPanelOpen = false; this.colorPanelEl.removeClass('open');
    this.achPanelOpen = false; this.achPanelEl.removeClass('open');
    this.statsPanelOpen = false; this.statsPanelEl.removeClass('open');
  }

  // ─── Toolbar ────────────────────────────────────────────────────────────────

  renderToolbar() {
    this.toolbarEl.empty();
    const mk = (text, extraCls, onClick) => {
      const btn = this.toolbarEl.createEl('button', {
        cls: `skill-toolbar-btn${extraCls ? ' ' + extraCls : ''}`, text,
      });
      btn.addEventListener('click', onClick);
      return btn;
    };

    mk('+ Skill', '', () => this.openAddNodeModal());
    mk('🗂 Categorias', '', () => this.openCategoryModal());

    mk('✏ Edit', this.editMode ? 'active' : '', () => {
      this.editMode = !this.editMode; this.connectMode = false; this.connectFrom = null;
      this.renderToolbar(); this.renderNodes();
    });
    mk('⇌ Connect', this.connectMode ? 'active' : '', () => {
      this.connectMode = !this.connectMode; this.connectFrom = null; this.editMode = false;
      this.renderToolbar(); this.renderNodes();
    });
    mk('+ 5 Points', '', () => {
      this.tree.points += 5; this.saveTree(); this.renderHUD();
      this.checkAchievements(); new Notice('+ 5 points');
    });

    mk(this.tree.flipped ? '⇅ Desinverter' : '⇅ Inverter', this.tree.flipped ? 'flip-active' : '', () => {
      this.flipTree(); this.saveTree(); this.renderToolbar();
      this.renderEdges(); this.renderNodes(); this.updateFlipIndicator(); this.centerView();
      new Notice(this.tree.flipped ? '↑ Árvore invertida' : '↓ Árvore normalizada');
    });

    mk('🎲 Skill do Dia', this.dailyNodeId ? 'daily-active' : '', () => {
      if (!this.dailyNodeId) { new Notice('Nenhuma skill do dia disponível.'); return; }
      const node = this.tree.nodes.find(n => n.id === this.dailyNodeId);
      if (node) {
        this.centerOnNode(node);
        this.plugin.settings.dailyUsed = true;
        this.plugin.saveSettings();
        this.checkAchievements();
        new Notice(`🎲 Skill do dia: ${node.icon} ${node.name}`);
      }
    });

    mk('📊 Stats', this.statsPanelOpen ? 'active' : '', () => {
      const opening = !this.statsPanelOpen;
      this.closeAllRightPanels();
      if (opening) { this.statsPanelOpen = true; this.statsPanelEl.addClass('open'); this.renderStatsPanel(); }
      this.renderToolbar();
    });

    mk('🏆 Conquistas', this.achPanelOpen ? 'active' : '', () => {
      const opening = !this.achPanelOpen;
      this.closeAllRightPanels();
      if (opening) { this.achPanelOpen = true; this.achPanelEl.addClass('open'); this.renderAchPanel(); }
      this.renderToolbar();
    });

    mk('🍅 Foco', this.pomo.active ? 'active' : '', () => this.openPomodoroModal());

    mk('🎨 Cores', this.colorPanelOpen ? 'active' : '', () => {
      const opening = !this.colorPanelOpen;
      this.closeAllRightPanels();
      if (opening) { this.colorPanelOpen = true; this.colorPanelEl.addClass('open'); this.renderColorPanel(); }
      this.renderToolbar();
    });

    mk('≡ List', this.panelOpen ? 'active' : '', () => {
      const opening = !this.panelOpen;
      this.closeAllRightPanels();
      if (opening) { this.panelOpen = true; this.panelEl.addClass('open'); this.renderPanel(); }
      this.renderToolbar();
    });

    mk('⊙ Center', '', () => this.centerView());
  }

  // ─── Controls ───────────────────────────────────────────────────────────────

  renderControls(el) {
    const mk = (text, cb) => {
      const b = el.createEl('button', { cls: 'skill-btn', text });
      b.addEventListener('click', cb);
    };
    mk('+', () => this.zoom(0.15));
    mk('−', () => this.zoom(-0.15));
    mk('⊙', () => { this.scale = 1; this.centerView(); });
  }

  // ─── Category Modal ─────────────────────────────────────────────────────────

  openCategoryModal() {
    new CategoryModal(this.app, this.allCategories, this.tree.nodes, (updatedCats) => {
      // FIX: reassign orphaned node categories to first available category
      const firstCatId = updatedCats[0]?.id;
      this.tree.nodes.forEach(node => {
        if (!updatedCats.find(c => c.id === node.category)) {
          node.category = firstCatId || 'core';
        }
      });
      this.allCategories = updatedCats;
      this.saveTree();
      if (this.colorPanelOpen) this.renderColorPanel();
      this.renderToolbar();
      this.renderEdges();
      this.renderNodes();
      this.renderPanel();
      if (this.statsPanelOpen) this.renderStatsPanel();
    }).open();
  }

  // ─── Achievements Panel ──────────────────────────────────────────────────────

  renderAchPanel() {
    if (!this.achPanelEl) return;
    this.achPanelEl.empty();
    this.achPanelEl.createDiv({ cls: 'skill-ach-panel-title', text: '🏆 Conquistas' });
    const earned = this.plugin.settings.achievements || {};
    let earnedCount = 0;
    ACHIEVEMENTS_DEF.forEach(ach => {
      const isEarned = !!earned[ach.id];
      if (isEarned) earnedCount++;
      const item = this.achPanelEl.createDiv({ cls: `skill-ach-item ${isEarned ? 'earned' : 'locked-ach'}` });
      item.createDiv({ cls: 'skill-ach-icon', text: isEarned ? ach.icon : '🔒' });
      const info = item.createDiv({ cls: 'skill-ach-info' });
      info.createDiv({ cls: 'skill-ach-name', text: isEarned ? ach.name : '???' });
      info.createDiv({ cls: 'skill-ach-desc', text: isEarned ? ach.desc : 'Continue progredindo...' });
      item.createDiv({ cls: `skill-ach-badge ${isEarned ? 'earned' : 'locked-ach'}`, text: isEarned ? 'EARNED' : 'LOCKED' });
    });
    this.achPanelEl.createDiv({ cls: 'skill-ach-progress', text: `${earnedCount} / ${ACHIEVEMENTS_DEF.length} desbloqueadas` });
  }

  // ─── Stats Panel ─────────────────────────────────────────────────────────────

  renderStatsPanel() {
    if (!this.statsPanelEl) return;
    this.statsPanelEl.empty();
    this.statsPanelEl.createDiv({ cls: 'skill-stats-title', text: '📊 Estatísticas' });

    const nodes = this.tree.nodes;
    const total = nodes.length;
    const unlocked = nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
    const mastered = nodes.filter(n => n.state === 'mastered').length;
    const locked = nodes.filter(n => n.state === 'locked').length;
    const avail = nodes.filter(n => n.state === 'available').length;
    const pct = v => total > 0 ? Math.round(v / total * 100) : 0;
    const earned = Object.keys(this.plugin.settings.achievements || {}).length;

    const grid = this.statsPanelEl.createDiv({ cls: 'skill-stats-grid' });
    const mkCard = (val, label) => {
      const c = grid.createDiv({ cls: 'skill-stats-card' });
      c.createDiv({ cls: 'skill-stats-card-val', text: String(val) });
      c.createDiv({ cls: 'skill-stats-card-label', text: label });
    };
    mkCard(unlocked, 'Desbloqueadas');
    mkCard(mastered, 'Dominadas');
    mkCard(`${pct(unlocked)}%`, 'Progresso');
    mkCard(earned, 'Conquistas');

    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Por Categoria' });
    // FIX: include all categories, including those with 0 nodes of known categories
    this.getAllCategories().forEach(cat => {
      const catNodes = nodes.filter(n => n.category === cat.id);
      if (!catNodes.length) return;
      const done = catNodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
      const p = catNodes.length > 0 ? done / catNodes.length : 0;
      const cc = this.catColor(cat.id);
      const row = this.statsPanelEl.createDiv({ cls: 'skill-stats-bar-row' });
      row.createDiv({ cls: 'skill-stats-bar-label', text: `${cat.icon} ${cat.label}` });
      const track = row.createDiv({ cls: 'skill-stats-bar-track' });
      const fill = track.createDiv({ cls: 'skill-stats-bar-fill' });
      fill.style.width = `${Math.round(p * 100)}%`;
      fill.style.background = cc.stroke;
      row.createDiv({ cls: 'skill-stats-bar-pct', text: `${Math.round(p * 100)}%` });
    });

    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Pomodoro' });
    const mkRow = (key, val) => {
      const row = this.statsPanelEl.createDiv({ cls: 'skill-stats-pomodoro-row' });
      row.createDiv({ cls: 'skill-stats-pomodoro-key', text: key });
      row.createDiv({ cls: 'skill-stats-pomodoro-val', text: String(val) });
    };
    mkRow('Sessões concluídas', this.pomo.totalDone);
    mkRow('Ciclo atual', `${this.pomo.sessionsInCycle}/4`);
    mkRow('Tempo total (min)', this.pomo.totalDone * this.pomo.workMin);

    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Skills' });
    mkRow('Total', total);
    mkRow('Disponíveis', avail);
    mkRow('Bloqueadas', locked);
    mkRow('Pontos atuais', this.tree.points);
  }

  // ─── Pomodoro ────────────────────────────────────────────────────────────────

  openPomodoroModal() {
    new PomodoroSetupModal(this.app, this.tree.nodes, this.pomo, (nodeId, workMin, breakMin) => {
      this.pomo.targetNodeId = nodeId;
      this.pomo.workMin = workMin;
      this.pomo.breakMin = breakMin;
      this.pomo.remaining = workMin * 60;
      this.pomo.phase = 'work';
      this.pomo.active = true;
      this.pomo.running = false;
      this.pomodoroEl.removeClass('hidden');
      this.renderPomodoro();
      this.renderToolbar();
    }).open();
  }

  startPomodoro() {
    if (this.pomo.intervalId) return;
    this.pomo.running = true;
    this.pomo.intervalId = setInterval(() => {
      this.pomo.remaining--;
      if (this.pomo.remaining <= 0) {
        if (this.pomo.phase === 'work') {
          this.pomo.totalDone++;
          this.pomo.sessionsInCycle++;
          this.plugin.settings.pomo = { totalDone: this.pomo.totalDone };
          this.plugin.saveSettings();
          this.checkAchievements();
          this.renderHUD();
          this.renderStatsPanel();
          if (this.pomo.sessionsInCycle >= 4) {
            this.pomo.sessionsInCycle = 0;
            this.pomo.phase = 'longbreak';
            this.pomo.remaining = 15 * 60;
            new Notice('🎉 4 sessões! Pausa longa de 15 min.');
          } else {
            this.pomo.phase = 'break';
            this.pomo.remaining = this.pomo.breakMin * 60;
            new Notice('✅ Foco concluído! Pausa de ' + this.pomo.breakMin + ' min.');
          }
          if (this.pomo.totalDone % 2 === 0) {
            this.tree.points += 1;
            this.saveTree(); this.renderHUD();
            new Notice('🍅 Bônus! +1 ponto por 2 sessões focadas.');
          }
        } else {
          this.pomo.phase = 'work';
          this.pomo.remaining = this.pomo.workMin * 60;
          new Notice('⏱️ Pausa encerrada! Hora de focar.');
        }
      }
      this.updatePomodoroDisplay();
    }, 1000);
  }

  stopPomodoro(silent = false) {
    if (this.pomo.intervalId) { clearInterval(this.pomo.intervalId); this.pomo.intervalId = null; }
    this.pomo.running = false;
    if (!silent) this.renderPomodoro();
  }

  resetPomodoro() {
    this.stopPomodoro(true);
    this.pomo.active = false; this.pomo.phase = 'work';
    this.pomo.remaining = this.pomo.workMin * 60;
    this.pomodoroEl.addClass('hidden');
    this.renderToolbar();
  }

  updatePomodoroDisplay() {
    if (!this.pomTimerEl) return;
    const m = Math.floor(this.pomo.remaining / 60);
    const s = this.pomo.remaining % 60;
    this.pomTimerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const phaseLabels = { work: 'FOCO', break: 'PAUSA', longbreak: 'PAUSA LONGA' };
    if (this.pomPhaseEl) this.pomPhaseEl.textContent = phaseLabels[this.pomo.phase] || 'FOCO';
    if (this.pomDotsEl) {
      this.pomDotsEl.querySelectorAll('.skill-pomodoro-dot').forEach((d, i) => {
        d.classList.toggle('done', i < this.pomo.sessionsInCycle);
      });
    }
    const phaseColor = { work: '#e8d96a', break: '#4dd9e8', longbreak: '#b48aff' };
    if (this.pomTimerEl) this.pomTimerEl.style.color = phaseColor[this.pomo.phase] || '#e8d96a';
  }

  renderPomodoro() {
    const el = this.pomodoroEl; el.empty();
    const node = this.tree.nodes.find(n => n.id === this.pomo.targetNodeId);
    el.createDiv({ cls: 'skill-pomodoro-skill', text: node ? `${node.icon} ${node.name}` : '🍅 Foco Livre' });
    this.pomTimerEl = el.createDiv({ cls: 'skill-pomodoro-timer', text: '25:00' });
    this.pomPhaseEl = el.createDiv({ cls: 'skill-pomodoro-phase', text: 'FOCO' });
    this.pomDotsEl = el.createDiv({ cls: 'skill-pomodoro-dots' });
    for (let i = 0; i < 4; i++) this.pomDotsEl.createDiv({ cls: 'skill-pomodoro-dot' });
    const btns = el.createDiv({ cls: 'skill-pomodoro-btns' });
    const startBtn = btns.createEl('button', { cls: `skill-pomodoro-btn${this.pomo.running ? ' running' : ''}`, text: this.pomo.running ? '⏸ Pausar' : '▶ Iniciar' });
    startBtn.addEventListener('click', () => {
      if (this.pomo.running) { this.stopPomodoro(); }
      else { this.startPomodoro(); }
      this.renderPomodoro();
    });
    const resetBtn = btns.createEl('button', { cls: 'skill-pomodoro-btn', text: '✕ Encerrar' });
    resetBtn.addEventListener('click', () => { this.resetPomodoro(); new Notice('Pomodoro encerrado.'); });
    this.updatePomodoroDisplay();
  }

  // ─── Color Panel ─────────────────────────────────────────────────────────────

  renderColorPanel() {
    const el = this.colorPanelEl; el.empty();
    el.createDiv({ cls: 'skill-color-panel-title', text: '🎨 Personalizar Cores' });

    const mkSwatch = (parent, label, hex, onChange) => {
      const row = parent.createDiv({ cls: 'skill-color-row' });
      row.createDiv({ cls: 'skill-color-row-label', text: label });
      const swatch = row.createDiv({ cls: 'skill-color-swatch' });
      swatch.style.background = hex;
      const input = swatch.createEl('input'); input.type = 'color';
      input.value = hex.startsWith('#') ? hex : '#e8d96a';
      input.addEventListener('input', e => { const h = e.target.value; swatch.style.background = h; onChange(h); });
    };

    // All categories
    const catSec = el.createDiv({ cls: 'skill-color-section' });
    catSec.createDiv({ cls: 'skill-color-section-label', text: 'Categorias' });
    this.allCategories.forEach(cat => {
      const safeColor = (cat.color && cat.color.startsWith('#')) ? cat.color : '#e8d96a';
      mkSwatch(catSec, `${cat.icon || ''} ${cat.label}`.trim(), safeColor, hex => {
        cat.color = hex;
        this.renderEdges(); this.renderNodes(); this.saveTree();
      });
    });

    el.createDiv({ cls: 'skill-color-divider' });

    // UI Colors
    const uiSec = el.createDiv({ cls: 'skill-color-section' });
    uiSec.createDiv({ cls: 'skill-color-section-label', text: 'Interface' });
    [
      { key: 'background', label: 'Background' },
      { key: 'nodeCircleBg', label: 'Nó (fundo)' },
      { key: 'hudBg', label: 'HUD' },
      { key: 'toolbarBg', label: 'Toolbar' },
      { key: 'panelBg', label: 'Painel' },
      { key: 'pointsColor', label: 'Pontos' },
      { key: 'unlockedColor', label: 'Desbloqueados' },
      { key: 'masteredColor', label: 'Dominados' },
    ].forEach(({ key, label }) => mkSwatch(uiSec, label, this.rgbaToHex(this.uiColors[key]), hex => {
      this.uiColors[key] = hex; this.updateCSSVars(); this.saveTree();
    }));

    el.createDiv({ cls: 'skill-color-divider' });
    const resetBtn = el.createEl('button', { cls: 'skill-color-reset-btn', text: '↺ Resetar Cores' });
    resetBtn.addEventListener('click', () => {
      DEFAULT_CATEGORIES.forEach(dc => {
        const cat = this.allCategories.find(c => c.id === dc.id);
        if (cat) cat.color = dc.color;
      });
      this.uiColors = JSON.parse(JSON.stringify(DEFAULT_UI_COLORS));
      this.updateCSSVars(); this.renderColorPanel();
      this.renderEdges(); this.renderNodes(); this.renderHUD(); this.saveTree();
      new Notice('Cores resetadas.');
    });
  }

  // ─── Panel ───────────────────────────────────────────────────────────────────

  renderPanel() {
    this.panelEl.empty();

    // FIX: Build catMap with ALL known categories plus a fallback "Outros" bucket
    const catMap = {};
    this.allCategories.forEach(c => { catMap[c.id] = { label: `${c.icon || ''} ${c.label}`.trim(), nodes: [] }; });
    // Bucket for nodes with unknown/deleted category IDs
    catMap['__outros__'] = { label: '📦 Outros', nodes: [] };

    this.tree.nodes.forEach(n => {
      if (catMap[n.category]) {
        catMap[n.category].nodes.push(n);
      } else {
        catMap['__outros__'].nodes.push(n);
      }
    });

    Object.entries(catMap).forEach(([catId, { label, nodes }]) => {
      if (!nodes.length) return;
      this.panelEl.createEl('h3', { text: label });
      nodes.forEach(node => {
        const item = this.panelEl.createDiv({ cls: 'skill-panel-skill-item' });
        item.createSpan({ cls: 'skill-panel-skill-icon', text: node.icon });
        item.createSpan({ cls: 'skill-panel-skill-name', text: node.name });
        item.createSpan({ cls: `skill-panel-skill-badge ${node.state}`, text: node.state });
        item.addEventListener('click', () => this.centerOnNode(node));
      });
    });
  }

  // ─── Edges ───────────────────────────────────────────────────────────────────

  renderEdges() {
    const toRemove = [];
    for (const child of this.svgEl.childNodes) if (child.tagName !== 'defs') toRemove.push(child);
    toRemove.forEach(c => this.svgEl.removeChild(c));
    const order = ['locked', 'available', 'unlocked', 'mastered'];
    this.tree.nodes.forEach(node => {
      node.requires.forEach(reqId => {
        const from = this.tree.nodes.find(n => n.id === reqId); if (!from) return;
        const si = Math.min(order.indexOf(from.state), order.indexOf(node.state));
        const stateClass = order[Math.max(si, 0)];
        // FIX: use effective category for color lookup
        const cc = this.catColor(this.getNodeCategoryId(node));
        const isActive = stateClass === 'unlocked' || stateClass === 'mastered';
        const dx = node.x - from.x, dy = node.y - from.y, dist = Math.sqrt(dx * dx + dy * dy) || 1, R = 30;
        const x1 = from.x + (dx / dist) * R, y1 = from.y + (dy / dist) * R, x2 = node.x - (dx / dist) * R, y2 = node.y - (dy / dist) * R;
        const d = `M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) * 0.5}, ${x2} ${y2 - (y2 - y1) * 0.5}, ${x2} ${y2}`;
        if (isActive) this.svgEl.appendChild(svgEl('path', { class: 'skill-connection-glow', d, stroke: cc.stroke, filter: 'url(#edge-glow)' }));
        this.svgEl.appendChild(svgEl('path', { class: `skill-connection ${stateClass}`, d, stroke: isActive ? cc.stroke : 'rgba(255,255,255,0.12)', 'stroke-width': stateClass === 'mastered' ? 3 : stateClass === 'unlocked' ? 2.5 : 1.5, 'data-from': from.id, 'data-to': node.id }));
      });
    });
  }

  // ─── Nodes ───────────────────────────────────────────────────────────────────

  renderNodes() {
    this.worldEl.empty();
    this.tree.nodes.forEach(node => this.renderNode(node));
  }

  renderNode(node) {
    // FIX: always use effective category id for color
    const effectiveCatId = this.getNodeCategoryId(node);
    const cc = this.catColor(effectiveCatId);
    const isRoot = node.id === 'root';
    const isDaily = node.id === this.dailyNodeId;
    const el = this.worldEl.createDiv({ cls: `skill-node ${node.state}${this.editMode ? ' edit-mode' : ''}${isDaily ? ' daily-highlight' : ''}` });
    el.style.left = `${node.x}px`; el.style.top = `${node.y}px`;
    el.style.setProperty('--node-color', cc.stroke);
    el.style.setProperty('--node-glow', cc.glow);
    el.dataset.id = node.id;
    const circle = el.createDiv({ cls: `skill-node-circle${isRoot ? ' root-circle' : ''}` });
    circle.createSpan({ text: node.icon });
    if (node.state === 'locked') circle.createDiv({ cls: 'skill-node-lock', text: '🔒' });
    if ((node.state === 'unlocked' || node.state === 'mastered') && node.maxLevel > 1 && node.level > 0) {
      const badge = circle.createDiv({ cls: 'skill-node-level-badge' });
      badge.style.background = cc.stroke; badge.textContent = String(node.level);
    }
    if (node.cost > 0 && (node.state === 'available' || node.state === 'locked')) {
      const costEl = el.createDiv({ cls: 'skill-node-cost' });
      costEl.style.color = cc.stroke; costEl.textContent = `${node.cost}✦`;
    }
    el.createDiv({ cls: 'skill-node-name', text: node.name });
    el.addEventListener('mouseenter', e => this.showTooltip(e, node));
    el.addEventListener('mouseleave', () => this.hideTooltip());
    el.addEventListener('mousemove', e => this.moveTooltip(e));
    el.addEventListener('click', e => { e.stopPropagation(); this.handleNodeClick(node); });
    if (this.editMode) this.makeDraggable(el, node);
  }

  // ─── Draggable ───────────────────────────────────────────────────────────────

  makeDraggable(el, node) {
    el.addEventListener('mousedown', e => {
      if (!this.editMode || e.button !== 0) return;
      e.stopPropagation(); e.preventDefault();
      this.isDraggingNode = true;
      let moved = false; const sx = e.clientX, sy = e.clientY, snx = node.x, sny = node.y;
      const onMove = e2 => { moved = true; node.x = Math.round(snx + (e2.clientX - sx) / this.scale); node.y = Math.round(sny + (e2.clientY - sy) / this.scale); el.style.left = `${node.x}px`; el.style.top = `${node.y}px`; this.renderEdges(); };
      const onUp = () => { this.isDraggingNode = false; if (moved) this.saveTree(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });
  }

  // ─── Node Click ──────────────────────────────────────────────────────────────

  handleNodeClick(node) {
    this.hideTooltip();
    if (this.connectMode) {
      if (!this.connectFrom) { this.connectFrom = node.id; new Notice(`Conectar de "${node.name}" — clique no destino`); return; }
      if (this.connectFrom === node.id) { this.connectFrom = null; new Notice('Cancelado.'); return; }
      const src = this.tree.nodes.find(n => n.id === this.connectFrom); if (!src) { this.connectFrom = null; return; }
      if (wouldCreateCycle(this.tree.nodes, src.id, node.id)) { new Notice('⚠️ Criaria um ciclo!'); this.connectFrom = null; return; }
      if (!node.requires.includes(src.id)) { node.requires.push(src.id); this.tree.nodes = computeStates(this.tree.nodes); this.renderEdges(); this.renderNodes(); this.saveTree(); new Notice('Conexão criada.'); }
      else { new Notice('Conexão já existe.'); }
      this.connectFrom = null; return;
    }
    if (this.editMode) { this.openEditNodeModal(node); return; }
    this.handleUnlock(node);
  }

  handleUnlock(node) {
    if (node.state === 'locked') { new Notice(`Bloqueado — requer: ${node.requires.map(id => { const n = this.tree.nodes.find(x => x.id === id); return n ? n.name : id; }).join(', ') || '?'}`); return; }
    if (node.state === 'available') {
      if (this.tree.points < node.cost) { new Notice(`Precisa de ${node.cost} pts (você tem ${this.tree.points})`); return; }
      this.tree.points -= node.cost; node.state = 'unlocked'; node.level = 1;
      this.tree.nodes = computeStates(this.tree.nodes);
      this.spawnParticles(node, this.catColor(this.getNodeCategoryId(node)).stroke);
      new Notice(`✦ ${node.name} desbloqueada`);
    } else if (node.state === 'unlocked') {
      if (node.level >= node.maxLevel) { new Notice(`${node.name} já está no nível máximo`); return; }
      if (this.tree.points < node.cost) { new Notice(`Precisa de ${node.cost} pts para evoluir`); return; }
      this.tree.points -= node.cost; node.level++;
      if (node.level >= node.maxLevel) { node.state = 'mastered'; this.spawnParticles(node, '#4dd9e8'); new Notice(`★ ${node.name} — DOMINADA!`); }
      else { this.spawnParticles(node, this.catColor(this.getNodeCategoryId(node)).stroke); new Notice(`↑ ${node.name} → nível ${node.level}`); }
      this.tree.nodes = computeStates(this.tree.nodes);
    } else if (node.state === 'mastered') { new Notice(`${node.name} já está completamente dominada`); return; }
    this.saveTree();
    this.checkAchievements();
    this.renderHUD(); this.renderEdges(); this.renderNodes(); this.renderPanel();
    if (this.statsPanelOpen) this.renderStatsPanel();
    if (this.dailyNodeId === node.id) this.renderDailyBanner();
  }

  // ─── Particles ───────────────────────────────────────────────────────────────

  spawnParticles(node, color) {
    const el = this.worldEl.querySelector(`[data-id="${node.id}"]`); if (!el) return;
    const rect = (el.querySelector('.skill-node-circle') || el).getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const sz = 3 + Math.random() * 5, angle = (i / 20) * Math.PI * 2, dist = 20 + Math.random() * 60;
      p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};left:${cx + Math.cos(angle) * dist}px;top:${cy + Math.sin(angle) * dist}px;pointer-events:none;z-index:9999;animation:skillParticleFade ${0.5 + Math.random() * 0.6}s ease-out forwards;animation-delay:${Math.random() * 0.15}s;`;
      document.body.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 1200);
    }
  }

  // ─── Tooltip ─────────────────────────────────────────────────────────────────

  showTooltip(e, node) {
    if (!this.tooltip) return;
    const stateLabels = { locked: 'BLOQUEADA', available: 'DISPONÍVEL', unlocked: 'DESBLOQUEADA', mastered: 'DOMINADA' };
    const effectiveCatId = this.getNodeCategoryId(node);
    const cc = this.catColor(effectiveCatId);
    const catDef = this.allCategories.find(c => c.id === effectiveCatId);
    const catLabel = catDef ? `${catDef.icon || ''} ${catDef.label}`.trim() : node.category;
    const reqNames = node.requires.map(id => { const n = this.tree.nodes.find(x => x.id === id); return n ? n.name : id; }).join(', ');
    const isDaily = node.id === this.dailyNodeId;
    let action = '';
    if (node.state === 'available') action = this.tree.points >= node.cost ? '<div class="skill-tooltip-action can-afford">CLIQUE PARA DESBLOQUEAR ✦</div>' : '<div class="skill-tooltip-action cant-afford">PONTOS INSUFICIENTES</div>';
    else if (node.state === 'unlocked' && node.level < node.maxLevel) action = this.tree.points >= node.cost ? '<div class="skill-tooltip-action can-afford">CLIQUE PARA EVOLUIR ↑</div>' : '<div class="skill-tooltip-action cant-afford">PONTOS INSUFICIENTES</div>';
    this.tooltip.innerHTML = `
      <div class="skill-tooltip-header">
        <span class="skill-tooltip-icon">${node.icon}</span>
        <div>
          <div class="skill-tooltip-title" style="color:${cc.stroke}">${node.name}${isDaily ? ' 🎲' : ''}</div>
          <div class="skill-tooltip-state">${stateLabels[node.state] || node.state} · ${catLabel}</div>
        </div>
      </div>
      <div class="skill-tooltip-desc">${node.description}</div>
      <div class="skill-tooltip-stats">
        <div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Custo</div><div class="skill-tooltip-stat-val" style="color:${cc.stroke}">${node.cost}</div></div>
        <div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Pontos</div><div class="skill-tooltip-stat-val">${this.tree.points}</div></div>
        ${node.maxLevel > 1 ? `<div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Nível</div><div class="skill-tooltip-stat-val">${node.level}/${node.maxLevel}</div></div>` : ''}
      </div>
      ${reqNames ? `<div class="skill-tooltip-req">REQ: ${reqNames}</div>` : ''}
      ${action}
    `;
    this.moveTooltip(e);
    this.tooltip.classList.add('visible');
  }

  moveTooltip(e) { if (!this.tooltip) return; const tw = 230, th = 190; let x = e.clientX + 18, y = e.clientY + 18; if (x + tw > window.innerWidth) x = e.clientX - tw - 8; if (y + th > window.innerHeight) y = e.clientY - th - 8; this.tooltip.style.left = `${x}px`; this.tooltip.style.top = `${y}px`; }
  hideTooltip() { if (this.tooltip) this.tooltip.classList.remove('visible'); }

  // ─── Pan / Zoom ──────────────────────────────────────────────────────────────

  setupPan(container) {
    this._onMouseMove = e => { if (!this.isPanning || this.isDraggingNode) return; this.panX += e.clientX - this.lastMouse.x; this.panY += e.clientY - this.lastMouse.y; this.lastMouse = { x: e.clientX, y: e.clientY }; this.applyTransform(); };
    this._onMouseUp = () => { if (this.isPanning) { this.isPanning = false; container.removeClass('panning'); } };
    container.addEventListener('mousedown', e => {
      if (e.button !== 0 || this.isDraggingNode) return;
      if (e.target.closest('.skill-node,.skill-toolbar,.skill-controls,.skill-hud,.skill-panel,.skill-color-panel,.skill-ach-panel,.skill-stats-panel,.skill-pomodoro')) return;
      this.isPanning = true; this.lastMouse = { x: e.clientX, y: e.clientY }; container.addClass('panning');
    });
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    container.addEventListener('wheel', e => { e.preventDefault(); this.zoom(e.deltaY > 0 ? -0.1 : 0.1, e.clientX, e.clientY); }, { passive: false });
  }

  zoom(delta, cx, cy) {
    const newScale = Math.min(Math.max(this.scale + delta, 0.2), 3);
    if (cx !== undefined && cy !== undefined) {
      const rect = this.contentEl.getBoundingClientRect();
      const mx = cx - rect.left, my = cy - rect.top;
      this.panX = mx - (mx - this.panX) * (newScale / this.scale);
      this.panY = my - (my - this.panY) * (newScale / this.scale);
    }
    this.scale = newScale; this.applyTransform();
  }

  applyTransform() { this.stageEl.style.transform = `translate(${this.panX}px,${this.panY}px) scale(${this.scale})`; this.stageEl.style.transformOrigin = '0 0'; }

  centerView() {
    const rect = this.contentEl.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const xs = this.tree.nodes.map(n => n.x), ys = this.tree.nodes.map(n => n.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    this.panX = rect.width / 2 - cx * this.scale; this.panY = rect.height / 2 - cy * this.scale;
    this.applyTransform();
  }

  centerOnNode(node) {
    const rect = this.contentEl.getBoundingClientRect();
    this.panX = rect.width / 2 - node.x * this.scale; this.panY = rect.height / 2 - node.y * this.scale;
    this.applyTransform();
    this.closeAllRightPanels(); this.renderToolbar();
  }

  // ─── Modals ──────────────────────────────────────────────────────────────────

  openAddNodeModal() {
    new AddNodeModal(this.app, this.getAllCategories(), data => {
      const node = {
        id: `skill_${Date.now()}`, name: data.name, icon: data.icon || '⚡', description: data.description || '',
        x: Math.round((-this.panX + this.contentEl.clientWidth / 2) / this.scale),
        y: Math.round((-this.panY + this.contentEl.clientHeight / 2) / this.scale),
        state: 'locked', level: 0, maxLevel: parseInt(data.maxLevel) || 3, cost: parseInt(data.cost) || 2,
        requires: [], category: data.category || this.allCategories[0]?.id || 'core'
      };
      this.tree.nodes.push(node);
      this.tree.nodes = computeStates(this.tree.nodes);
      this.renderEdges(); this.renderNodes(); this.renderPanel(); this.saveTree();
    }).open();
  }

  openEditNodeModal(node) {
    new EditNodeModal(this.app, node, this.tree.nodes, this.getAllCategories(), (action, data) => {
      if (action === 'delete') { this.tree.nodes = this.tree.nodes.filter(n => n.id !== node.id); this.tree.nodes.forEach(n => { n.requires = n.requires.filter(r => r !== node.id); }); }
      else if (action === 'save') { Object.assign(node, data); node.cost = parseInt(data.cost) || node.cost; node.maxLevel = parseInt(data.maxLevel) || node.maxLevel; if (node.level > node.maxLevel) node.level = node.maxLevel; }
      else if (action === 'reset') { this.tree.points += node.cost * node.level; node.level = 0; node.state = 'available'; }
      this.tree.nodes = computeStates(this.tree.nodes);
      this.renderHUD(); this.renderEdges(); this.renderNodes(); this.renderPanel(); this.saveTree();
      this.checkAchievements();
    }).open();
  }
}

// ─── Unified Category Modal ────────────────────────────────────────────────────

class CategoryModal extends Modal {
  // FIX: now receives allNodes to check which categories are in use
  constructor(app, allCategories, allNodes, onSave) {
    super(app);
    this.categories = JSON.parse(JSON.stringify(allCategories));
    this.allNodes = allNodes;
    this.onSave = onSave;
  }

  // FIX: returns set of category IDs currently used by at least one node
  getUsedCategoryIds() {
    const used = new Set();
    this.allNodes.forEach(n => used.add(n.category));
    return used;
  }

  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass('skill-modal');
    contentEl.createEl('h2', { text: '🗂 Gerenciar Categorias' });
    contentEl.createDiv({ cls: 'skill-modal-sub', text: 'Edite nome, ícone e cor de qualquer categoria.' });

    const listEl = contentEl.createDiv();

    const renderList = () => {
      listEl.empty();
      const builtIns = this.categories.filter(c => c.builtIn);
      const customs = this.categories.filter(c => !c.builtIn);

      if (builtIns.length) {
        listEl.createDiv({ cls: 'skill-cat-section-header', text: '● Categorias Padrão' });
        builtIns.forEach(cat => this.renderCatRow(listEl, cat, renderList));
      }
      if (customs.length) {
        listEl.createDiv({ cls: 'skill-cat-section-header', text: '◆ Categorias Customizadas' });
        customs.forEach(cat => this.renderCatRow(listEl, cat, renderList));
      }
      if (!this.categories.length) {
        listEl.createDiv({ cls: 'skill-modal-empty', text: 'Nenhuma categoria. Adicione pelo menos uma!' });
      }
    };

    renderList();

    // Add new category form
    const formWrap = contentEl.createDiv();
    formWrap.style.cssText = 'margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.07);';
    formWrap.createDiv({ cls: 'skill-cat-section-header', text: '+ Nova Categoria' });

    const addRow = formWrap.createDiv({ cls: 'skill-cat-add-row' });

    const colorWrap = addRow.createDiv({ cls: 'skill-cat-color-dot' });
    let newColor = '#7b61ff';
    colorWrap.style.background = newColor;
    const colorIn = colorWrap.createEl('input'); colorIn.type = 'color'; colorIn.value = newColor;
    colorIn.addEventListener('input', e => { newColor = e.target.value; colorWrap.style.background = newColor; });

    const iconIn = addRow.createEl('input', { cls: 'skill-cat-input', placeholder: '🎯' });
    iconIn.style.maxWidth = '52px'; iconIn.style.textAlign = 'center';
    const nameIn = addRow.createEl('input', { cls: 'skill-cat-input', placeholder: 'Nome da categoria...' });

    const addBtn = addRow.createEl('button', { cls: 'skill-cat-add-btn', text: '+ Adicionar' });
    addBtn.addEventListener('click', () => {
      const name = nameIn.value.trim();
      if (!name) { new Notice('Nome da categoria é obrigatório.'); return; }
      const icon = iconIn.value.trim() || '📌';
      const id = 'cat_' + name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      this.categories.push({ id, label: name, icon, color: newColor, builtIn: false });
      nameIn.value = ''; iconIn.value = '';
      renderList();
    });

    const actions = contentEl.createDiv({ cls: 'skill-modal-actions' });
    actions.createEl('button', { cls: 'skill-modal-btn secondary', text: 'Cancelar' })
      .addEventListener('click', () => this.close());
    actions.createEl('button', { cls: 'skill-modal-btn primary', text: '💾 Salvar' })
      .addEventListener('click', () => {
        if (!this.categories.length) { new Notice('Precisa de pelo menos uma categoria.'); return; }
        this.onSave(this.categories);
        this.close();
        new Notice('Categorias salvas!');
      });
  }

  renderCatRow(container, cat, onUpdate) {
    const usedIds = this.getUsedCategoryIds();
    const isInUse = usedIds.has(cat.id);
    const isOnlyCat = this.categories.length <= 1;

    const row = container.createDiv({ cls: `skill-cat-row${cat.builtIn ? ' builtin-row' : ''}` });

    // Color swatch
    const dot = row.createDiv({ cls: 'skill-cat-color-dot' });
    dot.style.background = cat.color || '#e8d96a';
    const colorIn = dot.createEl('input'); colorIn.type = 'color';
    colorIn.value = (cat.color && cat.color.startsWith('#')) ? cat.color : '#e8d96a';
    colorIn.addEventListener('input', e => { cat.color = e.target.value; dot.style.background = cat.color; });

    // Icon input
    const iconIn = row.createEl('input', { cls: 'skill-cat-icon-input' });
    iconIn.value = cat.icon || '';
    iconIn.placeholder = '📌';
    iconIn.addEventListener('input', e => { cat.icon = e.target.value.trim() || '📌'; });

    // Name input
    const nameIn = row.createEl('input', { cls: 'skill-cat-name-input' });
    nameIn.value = cat.label;
    nameIn.placeholder = 'Nome...';
    nameIn.addEventListener('input', e => { cat.label = e.target.value || cat.label; });

    // FIX: show in-use indicator instead of hiding delete button
    if (isInUse) {
      row.createDiv({ cls: 'skill-cat-inuse', text: `${usedIds.has(cat.id) ? '●' : ''} em uso` });
    }

    // Delete button
    const canDelete = !isOnlyCat && !isInUse;
    const delBtn = row.createEl('button', { cls: 'skill-cat-del-btn', text: '✕' });
    delBtn.disabled = !canDelete;
    delBtn.title = isOnlyCat
      ? 'Precisa de pelo menos uma categoria'
      : isInUse
        ? 'Categoria em uso por skills — reatribua as skills antes de deletar'
        : 'Deletar categoria';
    delBtn.addEventListener('click', () => {
      if (!canDelete) {
        if (isInUse) new Notice('⚠️ Esta categoria está em uso por skills. Reatribua as skills antes de deletar.');
        else new Notice('Precisa de pelo menos uma categoria.');
        return;
      }
      const idx = this.categories.indexOf(cat);
      if (idx >= 0) { this.categories.splice(idx, 1); onUpdate(); }
    });
  }

  onClose() { this.contentEl.empty(); }
}

// ─── Add Node Modal ────────────────────────────────────────────────────────────

class AddNodeModal extends Modal {
  constructor(app, allCategories, onSubmit) {
    super(app); this.allCategories = allCategories; this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass('skill-modal');
    contentEl.createEl('h2', { text: '+ Nova Skill' });
    contentEl.createDiv({ cls: 'skill-modal-sub', text: 'Adicione um novo nó à skill tree.' });
    const data = { name: '', icon: '⚡', description: '', cost: '2', maxLevel: '3', category: this.allCategories[0]?.id || 'core' };
    new Setting(contentEl).setName('Nome').addText(t => { t.setValue(data.name).onChange(v => data.name = v); t.inputEl.style.width = '100%'; setTimeout(() => t.inputEl.focus(), 50); });
    new Setting(contentEl).setName('Ícone (emoji)').addText(t => t.setValue(data.icon).onChange(v => data.icon = v));
    new Setting(contentEl).setName('Descrição').addTextArea(t => { t.setValue(data.description).onChange(v => data.description = v); t.inputEl.style.width = '100%'; });
    new Setting(contentEl).setName('Custo (pontos)').addText(t => { t.setValue(data.cost).onChange(v => data.cost = v); t.inputEl.type = 'number'; t.inputEl.min = '0'; });
    new Setting(contentEl).setName('Nível Máximo').addText(t => { t.setValue(data.maxLevel).onChange(v => data.maxLevel = v); t.inputEl.type = 'number'; t.inputEl.min = '1'; });
    new Setting(contentEl).setName('Categoria').addDropdown(d => {
      this.allCategories.forEach(c => d.addOption(c.id, `${c.icon || ''} ${c.label}`.trim()));
      d.setValue(data.category).onChange(v => data.category = v);
    });
    const actions = contentEl.createDiv({ cls: 'skill-modal-actions' });
    actions.createEl('button', { cls: 'skill-modal-btn secondary', text: 'Cancelar' }).addEventListener('click', () => this.close());
    actions.createEl('button', { cls: 'skill-modal-btn primary', text: 'Criar Skill' }).addEventListener('click', () => { if (!data.name.trim()) { new Notice('Nome obrigatório'); return; } this.onSubmit(data); this.close(); });
  }
  onClose() { this.contentEl.empty(); }
}

// ─── Edit Node Modal ───────────────────────────────────────────────────────────

class EditNodeModal extends Modal {
  constructor(app, node, allNodes, allCategories, onAction) {
    super(app); this.node = node; this.allNodes = allNodes; this.allCategories = allCategories; this.onAction = onAction;
  }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass('skill-modal');
    const n = this.node;
    contentEl.createEl('h2', { text: `${n.icon} Editar Skill` });
    contentEl.createDiv({ cls: 'skill-modal-sub', text: `id: ${n.id}` });
    const data = { name: n.name, icon: n.icon, description: n.description, cost: String(n.cost), maxLevel: String(n.maxLevel), category: n.category };
    new Setting(contentEl).setName('Nome').addText(t => { t.setValue(data.name).onChange(v => data.name = v); t.inputEl.style.width = '100%'; });
    new Setting(contentEl).setName('Ícone (emoji)').addText(t => t.setValue(data.icon).onChange(v => data.icon = v));
    new Setting(contentEl).setName('Descrição').addTextArea(t => { t.setValue(data.description).onChange(v => data.description = v); t.inputEl.style.width = '100%'; });
    new Setting(contentEl).setName('Custo (pontos)').addText(t => { t.setValue(data.cost).onChange(v => data.cost = v); t.inputEl.type = 'number'; t.inputEl.min = '0'; });
    new Setting(contentEl).setName('Nível Máximo').addText(t => { t.setValue(data.maxLevel).onChange(v => data.maxLevel = v); t.inputEl.type = 'number'; t.inputEl.min = '1'; });
    new Setting(contentEl).setName('Categoria').addDropdown(d => {
      this.allCategories.forEach(c => d.addOption(c.id, `${c.icon || ''} ${c.label}`.trim()));
      // FIX: if node's current category doesn't exist in list, default to first
      const currentCat = this.allCategories.find(c => c.id === data.category);
      d.setValue(currentCat ? data.category : (this.allCategories[0]?.id || '')).onChange(v => data.category = v);
    });
    contentEl.createEl('h3', { text: 'Pré-requisitos' });
    const reqList = contentEl.createDiv();
    const updateReqList = () => {
      reqList.empty();
      if (!n.requires.length) reqList.createDiv({ cls: 'skill-modal-empty', text: 'Nenhum.' });
      n.requires.forEach(reqId => { const req = this.allNodes.find(x => x.id === reqId); const row = reqList.createDiv({ cls: 'skill-req-row' }); row.createSpan({ text: req ? `${req.icon} ${req.name}` : reqId }); const rem = row.createEl('button', { text: '✕', cls: 'skill-modal-btn danger sm' }); rem.addEventListener('click', () => { n.requires = n.requires.filter(r => r !== reqId); updateReqList(); }); });
      const others = this.allNodes.filter(x => x.id !== n.id && !n.requires.includes(x.id));
      if (others.length) { const sel = reqList.createEl('select', { cls: 'skill-modal-select' }); sel.createEl('option', { value: '', text: '+ Adicionar pré-requisito...' }); others.forEach(x => sel.createEl('option', { value: x.id, text: `${x.icon} ${x.name}` })); sel.addEventListener('change', () => { if (sel.value) { n.requires.push(sel.value); updateReqList(); } }); }
    };
    updateReqList();
    const actions = contentEl.createDiv({ cls: 'skill-modal-actions' });
    actions.createEl('button', { cls: 'skill-modal-btn danger', text: '↺ Resetar' }).addEventListener('click', () => { this.onAction('reset', data); this.close(); });
    actions.createEl('button', { cls: 'skill-modal-btn danger', text: '🗑 Deletar' }).addEventListener('click', () => { if (confirm(`Deletar "${n.name}"?`)) { this.onAction('delete', null); this.close(); } });
    actions.createEl('button', { cls: 'skill-modal-btn secondary', text: 'Cancelar' }).addEventListener('click', () => this.close());
    actions.createEl('button', { cls: 'skill-modal-btn primary', text: 'Salvar' }).addEventListener('click', () => { this.onAction('save', data); this.close(); });
  }
  onClose() { this.contentEl.empty(); }
}

// ─── Pomodoro Setup Modal ──────────────────────────────────────────────────────

class PomodoroSetupModal extends Modal {
  constructor(app, nodes, pomo, onStart) { super(app); this.nodes = nodes; this.pomo = pomo; this.onStart = onStart; }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass('skill-modal');
    contentEl.createEl('h2', { text: '🍅 Modo Foco — Pomodoro' });
    contentEl.createDiv({ cls: 'skill-modal-sub', text: 'Associe uma skill e defina sua sessão de foco.' });
    let nodeId = this.pomo.targetNodeId || '', workMin = this.pomo.workMin || 25, breakMin = this.pomo.breakMin || 5;
    new Setting(contentEl).setName('Skill de foco').setDesc('Opcional — qual skill você vai praticar?').addDropdown(d => {
      d.addOption('', '— Foco Livre —');
      this.nodes.filter(n => n.id !== 'root').forEach(n => d.addOption(n.id, `${n.icon} ${n.name}`));
      d.setValue(nodeId); d.onChange(v => nodeId = v);
    });
    new Setting(contentEl).setName('Duração foco (min)').addSlider(s => { s.setLimits(5, 60, 5).setValue(workMin).setDynamicTooltip().onChange(v => workMin = v); });
    new Setting(contentEl).setName('Duração pausa (min)').addSlider(s => { s.setLimits(1, 30, 1).setValue(breakMin).setDynamicTooltip().onChange(v => breakMin = v); });
    const info = contentEl.createDiv();
    info.style.cssText = 'background:rgba(232,217,106,0.05);border:1px solid rgba(232,217,106,0.1);border-radius:4px;padding:10px 14px;margin-top:10px;font-size:11px;color:rgba(255,255,255,0.4);font-family:Share Tech Mono,monospace;line-height:1.7;';
    info.innerHTML = '🍅 A cada 2 sessões concluídas você ganha <b style="color:#e8d96a">+1 ponto</b> bônus.<br>🔥 Após 4 sessões, uma pausa longa de 15 min é ativada.<br>🏆 Conquistas de foco são desbloqueadas automaticamente.';
    const actions = contentEl.createDiv({ cls: 'skill-modal-actions' });
    actions.createEl('button', { cls: 'skill-modal-btn secondary', text: 'Cancelar' }).addEventListener('click', () => this.close());
    actions.createEl('button', { cls: 'skill-modal-btn primary', text: '▶ Iniciar Foco' }).addEventListener('click', () => { this.onStart(nodeId || null, workMin, breakMin); this.close(); });
  }
  onClose() { this.contentEl.empty(); }
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

class SkillTreeSettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this; containerEl.empty();
    containerEl.createEl('h2', { text: 'Skill Tree — Configurações' });
    new Setting(containerEl).setName('Nome da Árvore').addText(t => {
      t.setValue(this.plugin.settings.trees?.default?.name || 'Skill Tree');
      t.onChange(async v => { if (this.plugin.settings.trees?.default) { this.plugin.settings.trees.default.name = v; await this.plugin.saveSettings(); } });
    });
    new Setting(containerEl).setName('Resetar Árvore').setDesc('⚠️ Apaga todo progresso e restaura o layout padrão.').addButton(btn => { btn.setButtonText('Resetar').setWarning(); btn.onClick(async () => { delete this.plugin.settings.trees['default']; await this.plugin.saveSettings(); new Notice('Árvore resetada — reabra a view.'); }); });
    new Setting(containerEl).setName('Resetar Cores').setDesc('⚠️ Restaura todas as cores para o padrão.').addButton(btn => { btn.setButtonText('Resetar Cores').setWarning(); btn.onClick(async () => { delete this.plugin.settings.uiColors; await this.plugin.saveSettings(); new Notice('Cores resetadas — reabra a view.'); }); });
    new Setting(containerEl).setName('Resetar Conquistas').setDesc('⚠️ Apaga todas as conquistas.').addButton(btn => { btn.setButtonText('Resetar Conquistas').setWarning(); btn.onClick(async () => { this.plugin.settings.achievements = {}; await this.plugin.saveSettings(); new Notice('Conquistas resetadas.'); }); });
    new Setting(containerEl).setName('Resetar Categorias').setDesc('⚠️ Restaura todas as categorias ao padrão.').addButton(btn => { btn.setButtonText('Resetar Categorias').setWarning(); btn.onClick(async () => { this.plugin.settings.allCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)); await this.plugin.saveSettings(); new Notice('Categorias restauradas ao padrão — reabra a view.'); }); });
  }
}

// ─── Plugin ────────────────────────────────────────────────────────────────────

class SkillTreePlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE_SKILL_TREE, leaf => new SkillTreeView(leaf, this));
    this.addRibbonIcon('star', 'Skill Tree', () => this.activateView());
    this.addCommand({ id: 'open-skill-tree', name: 'Abrir Skill Tree', callback: () => this.activateView() });
    this.addSettingTab(new SkillTreeSettingTab(this.app, this));
  }
  onunload() {
    const style = document.getElementById('skill-tree-plugin-styles');
    if (style) style.remove();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SKILL_TREE);
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_SKILL_TREE)[0];
    if (!leaf) { leaf = workspace.getLeaf(false); await leaf.setViewState({ type: VIEW_TYPE_SKILL_TREE, active: true }); }
    workspace.revealLeaf(leaf);
  }
  async loadSettings() {
    this.settings = Object.assign({
      activeTree: 'default', trees: {},
      allCategories: null,
      uiColors: null,
      achievements: {}, pomo: { totalDone: 0 },
      dailySkill: null, dailyUsed: false,
      catColors: null, customCategories: [],
    }, await this.loadData());
  }
  async saveSettings() { await this.saveData(this.settings); }
}

module.exports = SkillTreePlugin;

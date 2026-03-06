/*
 * Skill Tree Plugin for Obsidian
 * Version 8.1.0 — Minimal SVG Icons
 */

const {
  Plugin, ItemView, WorkspaceLeaf,
  Modal, Setting, Notice, PluginSettingTab
} = require('obsidian');

const VIEW_TYPE_SKILL_TREE = 'skill-tree-view';

const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ─── Minimal SVG Icons ────────────────────────────────────────────────────────
// All icons are 24x24 viewBox, stroke-based, minimal line style
const ICONS = {
  // Roots
  conditioning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v4l3 2-3 2v4"/><path d="M11 4v4L8 10l3 2v4"/><circle cx="12" cy="19" r="1.5"/><circle cx="12" cy="5" r="1.5"/></svg>`,
  mobility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5"/><path d="M12 7v5l-3 4"/><path d="M12 12l3 4"/><path d="M9 11H7m10 0h-2"/></svg>`,
  survival: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L4 7v6c0 4 3.5 7.5 8 9 4.5-1.5 8-5 8-9V7z"/></svg>`,

  // Level 1
  strength: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h2l1-2h6l1 2h2"/><path d="M6 8v4h12V8"/><circle cx="4.5" cy="8" r="1.5"/><circle cx="19.5" cy="8" r="1.5"/><path d="M3 8h1.5m16 0H19"/></svg>`,
  cardio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,12 6,12 8,6 10,18 12,10 14,14 16,12 22,12"/></svg>`,
  speed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 7l5 5-5 5"/><path d="M3 7l2 2-2 2"/></svg>`,
  flex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M12 6v4l-4 3"/><path d="M12 10l4 3"/><path d="M8 13l-2 5"/><path d="M16 13l2 5"/><path d="M6 18h4m4 0h4"/></svg>`,
  balance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M5 8l7-3 7 3"/><path d="M5 16l7 3 7-3"/></svg>`,
  agility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M9 7l-3 5h4l-2 6"/><path d="M15 7l3 5h-4l2 6"/><path d="M9 13h6"/></svg>`,
  health: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C12 21 4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 12-8 12z"/></svg>`,
  recovery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="14.5" y2="14.5"/></svg>`,
  resilience: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M21 15v4a2 2 0 0 1-2 2h-4"/><circle cx="12" cy="12" r="3"/></svg>`,

  // Level 2
  power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>`,
  bulk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="8" rx="1"/><path d="M8 10V8a4 4 0 0 1 8 0v2"/><line x1="12" y1="14" x2="12" y2="16"/></svg>`,
  endurance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c0-5.5 10-9 10-9s10 3.5 10 9-4.5 9-10 9S2 17.5 2 12z"/><path d="M12 8v4l3 3"/></svg>`,
  sprint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2"/><path d="M15 7l-4 5-4-2-4 5"/><path d="M11 12l2 5"/></svg>`,
  yoga: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M12 6c0 4-6 6-6 10"/><path d="M12 6c0 4 6 6 6 10"/><line x1="6" y1="16" x2="18" y2="16"/></svg>`,
  coordination: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="7" y1="7" x2="10" y2="10"/><line x1="17" y1="7" x2="14" y2="10"/><line x1="7" y1="17" x2="10" y2="14"/><line x1="17" y1="17" x2="14" y2="14"/></svg>`,
  reflex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>`,
  immune: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L4 7v6c0 4 3.5 7.5 8 9 4.5-1.5 8-5 8-9V7z"/><polyline points="9,12 11,14 15,10"/></svg>`,
  sleep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  nutrition: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  mindset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5l3 7H5l7 11 7-11h-3l3-7h-4"/></svg>`,

  // Level 3
  athlete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
  warrior: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><path d="M18 6l-5 1 4 4z"/><path d="M3 21l4-4"/><rect x="12" y="2" width="3" height="8" rx="1" transform="rotate(45 12 2)"/></svg>`,
  flow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8c2 0 4 1 4 4s-2 4-4 4-4-1-4-4 2-4 4-4z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
  precision: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`,
  longevity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,15"/><line x1="5" y1="3" x2="5" y2="5"/><line x1="19" y1="3" x2="19" y2="5"/></svg>`,
  peak_mind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5l3 7H5l7 11 7-11h-3l3-7h-4"/><circle cx="12" cy="10" r="1" fill="currentColor"/></svg>`,

  // Apex
  legend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,

  // UI icons
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4m14 4h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v8a6 6 0 0 1-12 0z"/><path d="M9 21h6m-3-8v8"/></svg>`,
  tomato: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="7"/><path d="M12 7V5"/><path d="M10 5c0-1 1-2 2-2 1 0 2 1 2 2"/><path d="M8 7c-1-1-1-3 1-3"/></svg>`,
  dice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.55-.2-1.05-.53-1.44-.32-.38-.49-.86-.49-1.36 0-1.1.9-2 2-2h2.36c3.08 0 5.66-2.58 5.66-5.66C22 6.05 17.52 2 12 2z"/><circle cx="7" cy="14" r="1.2" fill="currentColor"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="16" cy="9" r="1.2" fill="currentColor"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  center: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5"/><path d="M16 3c1.7.8 3 2.6 3 4.5 0 2.6-2 4.9-4.5 5.4"/><path d="M16 13c1.7.8 3 2.6 3 4.5 0 2.6-2 4.9-4.5 5.4"/><circle cx="8" cy="16" r="5"/></svg>`,

  // Achievements icons
  unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.56-1.85"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20l2-8 6 4 6-4 2 8"/><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="20" cy="10" r="1.5" fill="currentColor"/></svg>`,
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-4-4-5-4-9z"/><path d="M8 17c0 2 1.5 3 4 3s4-1 4-3"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><circle cx="17" cy="16" r="1.5" fill="currentColor"/></svg>`,
  tree: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L6 9h4l-4 7h5v6"/><path d="M12 2l6 7h-4l4 7h-5v6"/></svg>`,
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-1.5a2.5 2.5 0 0 1-2.5-2.5 2.5 2.5 0 0 1-1-2 2.5 2.5 0 0 1 1-4 3 3 0 0 1 5-2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0v-1.5a2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0 1-2 2.5 2.5 0 0 0-1-4 3 3 0 0 0-5-2z"/></svg>`,
  hourglass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2h14M5 22h14"/><path d="M5 2l7 9-7 11"/><path d="M19 2l-7 9 7 11"/></svg>`,
};

function getIcon(id) {
  return ICONS[id] || ICONS.star;
}

// ─── Node Size Config ─────────────────────────────────────────────────────────
const NODE_SIZES = {
  xs: { px: 28, fontSize: 13, labelSize: 8, badgeSize: 7, costOffset: 18, iconSize: 14 },
  small: { px: 38, fontSize: 16, labelSize: 9, badgeSize: 8, costOffset: 22, iconSize: 18 },
  medium: { px: 52, fontSize: 22, labelSize: 10, badgeSize: 9, costOffset: 28, iconSize: 24 },
  large: { px: 68, fontSize: 28, labelSize: 12, badgeSize: 10, costOffset: 36, iconSize: 32 },
  xl: { px: 90, fontSize: 36, labelSize: 14, badgeSize: 12, costOffset: 46, iconSize: 44 },
};
function getNodeSize(node) { return NODE_SIZES[node.size] || NODE_SIZES.small; }

// ─── Categories ───────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'physical', label: 'Físico', icon: '', color: '#e05252', builtIn: true },
  { id: 'core', label: 'Core', icon: '', color: '#e8c84a', builtIn: true },
  { id: 'mental', label: 'Mental', icon: '', color: '#4dd9e8', builtIn: true },
  { id: 'creative', label: 'Criativo', icon: '', color: '#b48aff', builtIn: true },
];

const DEFAULT_UI_COLORS = {
  background: '#000913',
  hudBg: 'rgba(0,9,19,0.85)',
  toolbarBg: 'rgba(0,9,19,0.85)',
  panelBg: '#000913',
  nodeCircleBg: '#060f1a',
  pointsColor: '#e8c84a',
  unlockedColor: '#4dd9e8',
  masteredColor: '#e05252',
};

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS_DEF = [
  { id: 'first_unlock', iconId: 'unlock', name: 'Primeiro Passo', desc: 'Desbloqueie sua primeira skill.', check: (t) => t.nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length >= 1 },
  { id: 'three_unlocked', iconId: 'star', name: 'Em Ritmo', desc: 'Desbloqueie 3 skills.', check: (t) => t.nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length >= 3 },
  { id: 'first_master', iconId: 'trophy', name: 'Mestre', desc: 'Domine completamente uma skill.', check: (t) => t.nodes.filter(n => n.state === 'mastered').length >= 1 },
  { id: 'three_mastered', iconId: 'crown', name: 'Grande Mestre', desc: 'Domine 3 skills ao máximo.', check: (t) => t.nodes.filter(n => n.state === 'mastered').length >= 3 },
  { id: 'broke', iconId: 'wallet', name: 'Gastador', desc: 'Fique com 0 pontos.', check: (t) => t.points === 0 },
  { id: 'rich', iconId: 'coins', name: 'Poupador', desc: 'Acumule 20 ou mais pontos.', check: (t) => t.points >= 20 },
  { id: 'half_tree', iconId: 'tree', name: 'Metade da Jornada', desc: 'Desbloqueie metade da árvore.', check: (t) => { const n = t.nodes.length; return t.nodes.filter(x => x.state === 'unlocked' || x.state === 'mastered').length >= Math.ceil(n / 2); } },
  { id: 'full_tree', iconId: 'legend', name: 'Árvore Completa', desc: 'Desbloqueie todos os nós.', check: (t) => t.nodes.every(n => n.state === 'unlocked' || n.state === 'mastered') },
  { id: 'pomodoro_1', iconId: 'tomato', name: 'Primeiro Foco', desc: 'Complete seu primeiro Pomodoro.', check: (t, s) => (s.pomodorosCompleted || 0) >= 1 },
  { id: 'pomodoro_5', iconId: 'fire', name: 'Em Chamas', desc: 'Complete 5 sessões Pomodoro.', check: (t, s) => (s.pomodorosCompleted || 0) >= 5 },
  { id: 'daily_used', iconId: 'dice', name: 'Destino Aceito', desc: 'Use a skill do dia.', check: (t, s) => !!s.dailyUsed },
  { id: 'mental_master', iconId: 'brain', name: 'Mente Afiada', desc: 'Domine uma skill Mental.', check: (t) => t.nodes.some(n => n.state === 'mastered' && n.category === 'mental') },
];

// ─── Default Tree ─────────────────────────────────────────────────────────────
const DEFAULT_TREE = {
  id: 'default',
  name: 'Skill Tree',
  points: 10,
  flipped: true,
  nodes: [
    { id: 'conditioning', name: 'Conditioning', iconId: 'conditioning', description: 'Fundação física. Resistência e força bruta.', x: 360, y: 800, state: 'unlocked', level: 1, maxLevel: 1, cost: 0, requires: [], category: 'physical', size: 'large' },
    { id: 'mobility', name: 'Mobility', iconId: 'mobility', description: 'Equilíbrio central. Flexibilidade e controle.', x: 720, y: 800, state: 'unlocked', level: 1, maxLevel: 1, cost: 0, requires: [], category: 'core', size: 'large' },
    { id: 'survival', name: 'Survival', iconId: 'survival', description: 'Resistência mental. Recuperação e saúde.', x: 1080, y: 800, state: 'unlocked', level: 1, maxLevel: 1, cost: 0, requires: [], category: 'mental', size: 'large' },

    { id: 'strength', name: 'Força', iconId: 'strength', description: 'Hipertrofia e força muscular.', x: 160, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['conditioning'], category: 'physical', size: 'small' },
    { id: 'cardio', name: 'Cardio', iconId: 'cardio', description: 'Resistência cardiovascular.', x: 340, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['conditioning'], category: 'physical', size: 'small' },
    { id: 'speed', name: 'Velocidade', iconId: 'speed', description: 'Velocidade de reação e sprint.', x: 500, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['conditioning'], category: 'physical', size: 'small' },
    { id: 'flex', name: 'Flexib.', iconId: 'flex', description: 'Amplitude de movimento e mobilidade.', x: 620, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['mobility'], category: 'core', size: 'small' },
    { id: 'balance', name: 'Equilíbrio', iconId: 'balance', description: 'Controle postural e propriocepção.', x: 720, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['mobility'], category: 'core', size: 'small' },
    { id: 'agility', name: 'Agilidade', iconId: 'agility', description: 'Mudança de direção e coordenação.', x: 820, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['mobility'], category: 'core', size: 'small' },
    { id: 'health', name: 'Saúde', iconId: 'health', description: 'Saúde geral e prevenção de lesões.', x: 940, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['survival'], category: 'mental', size: 'small' },
    { id: 'recovery', name: 'Recuperação', iconId: 'recovery', description: 'Recuperação muscular e sono.', x: 1100, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['survival'], category: 'mental', size: 'small' },
    { id: 'resilience', name: 'Resiliência', iconId: 'resilience', description: 'Força mental e controle emocional.', x: 1260, y: 600, state: 'available', level: 0, maxLevel: 3, cost: 2, requires: ['survival'], category: 'mental', size: 'small' },

    { id: 'power', name: 'Potência', iconId: 'power', description: 'Força explosiva e potência muscular.', x: 80, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['strength'], category: 'physical', size: 'xs' },
    { id: 'bulk', name: 'Massa', iconId: 'bulk', description: 'Ganho de massa muscular seca.', x: 210, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['strength'], category: 'physical', size: 'xs' },
    { id: 'endurance', name: 'Endurance', iconId: 'endurance', description: 'Resistência de longa duração.', x: 340, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['cardio'], category: 'physical', size: 'xs' },
    { id: 'sprint', name: 'Sprint', iconId: 'sprint', description: 'Velocidade máxima em curta distância.', x: 470, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['speed'], category: 'physical', size: 'xs' },
    { id: 'yoga', name: 'Yoga', iconId: 'yoga', description: 'Flexibilidade profunda e respiração.', x: 600, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['flex'], category: 'core', size: 'xs' },
    { id: 'coordination', name: 'Coord.', iconId: 'coordination', description: 'Coordenação motora fina e grossa.', x: 720, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['balance', 'agility'], category: 'core', size: 'xs' },
    { id: 'reflex', name: 'Reflexo', iconId: 'reflex', description: 'Tempo de resposta e percepção.', x: 840, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['agility'], category: 'core', size: 'xs' },
    { id: 'immune', name: 'Imunidade', iconId: 'immune', description: 'Sistema imunológico e prevenção.', x: 960, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['health'], category: 'mental', size: 'xs' },
    { id: 'sleep', name: 'Sono', iconId: 'sleep', description: 'Qualidade do sono e ciclo circadiano.', x: 1080, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['recovery'], category: 'mental', size: 'xs' },
    { id: 'nutrition', name: 'Nutrição', iconId: 'nutrition', description: 'Alimentação balanceada e suplementação.', x: 1200, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['recovery'], category: 'mental', size: 'xs' },
    { id: 'mindset', name: 'Mindset', iconId: 'mindset', description: 'Mentalidade de crescimento e foco.', x: 1340, y: 420, state: 'locked', level: 0, maxLevel: 3, cost: 3, requires: ['resilience'], category: 'mental', size: 'xs' },

    { id: 'athlete', name: 'Atleta', iconId: 'athlete', description: 'Pico de performance física.', x: 145, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['power', 'bulk'], category: 'physical', size: 'xs' },
    { id: 'warrior', name: 'Guerreiro', iconId: 'warrior', description: 'Resistência e velocidade de elite.', x: 405, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['endurance', 'sprint'], category: 'physical', size: 'xs' },
    { id: 'flow', name: 'Flow', iconId: 'flow', description: 'Estado de fluxo e performance ótima.', x: 660, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['yoga', 'coordination'], category: 'core', size: 'xs' },
    { id: 'precision', name: 'Precisão', iconId: 'precision', description: 'Precisão e controle absoluto.', x: 840, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['reflex'], category: 'core', size: 'xs' },
    { id: 'longevity', name: 'Longevidade', iconId: 'longevity', description: 'Saúde duradoura e bem-estar.', x: 1020, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['immune', 'sleep'], category: 'mental', size: 'xs' },
    { id: 'peak_mind', name: 'Mente Pico', iconId: 'peak_mind', description: 'Performance cognitiva e mental máxima.', x: 1270, y: 260, state: 'locked', level: 0, maxLevel: 1, cost: 4, requires: ['nutrition', 'mindset'], category: 'mental', size: 'xs' },

    { id: 'legend', name: 'Lenda', iconId: 'legend', description: 'O ápice absoluto — corpo, mente e espírito unidos.', x: 720, y: 120, state: 'locked', level: 0, maxLevel: 1, cost: 6, requires: ['athlete', 'warrior', 'flow', 'precision', 'longevity', 'peak_mind'], category: 'core', size: 'large' },
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
  background:var(--st-bg,#000913); cursor:grab;
  font-family:'Rajdhani',sans-serif;
}
.skill-tree-container.panning { cursor:grabbing; }
.skill-tree-container::after {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.7) 100%);
  pointer-events:none; z-index:1;
}
.skill-tree-stage { position:absolute; top:0; left:0; transform-origin:0 0; will-change:transform; }
.skill-tree-canvas { position:absolute; top:0; left:0; pointer-events:none; overflow:visible; }
.skill-tree-world  { position:absolute; top:0; left:0; width:6000px; height:6000px; }

/* ── HUD ── */
.skill-hud {
  position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:50;
  display:flex; align-items:center; gap:18px;
  background:var(--st-hud-bg,rgba(0,9,19,0.85));
  border:1px solid rgba(255,255,255,0.06); border-radius:3px;
  padding:5px 20px; backdrop-filter:blur(12px); pointer-events:none;
}
.skill-hud-stat { display:flex; flex-direction:column; align-items:center; gap:2px; }
.skill-hud-label { font-size:8px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.25); font-family:'Share Tech Mono',monospace; }
.skill-hud-value { font-size:15px; font-weight:700; letter-spacing:0.05em; color:#fff; font-family:'Share Tech Mono',monospace; }
.skill-hud-value.gold { color:var(--st-points-color,#e8c84a); }
.skill-hud-value.cyan { color:var(--st-unlocked-color,#4dd9e8); }
.skill-hud-value.red  { color:var(--st-mastered-color,#e05252); }
.skill-hud-sep { width:1px; height:28px; background:rgba(255,255,255,0.06); }
.skill-hud-icon { display:inline-flex; align-items:center; }
.skill-hud-icon svg { width:14px; height:14px; color:rgba(255,255,255,0.4); }

/* ── Toolbar ── */
.skill-toolbar {
  position:absolute; top:16px; left:16px; z-index:50;
  display:flex; flex-direction:column; gap:3px;
}
.skill-toolbar-btn {
  background:var(--st-toolbar-bg,rgba(0,9,19,0.85));
  border:1px solid rgba(255,255,255,0.08); border-radius:2px;
  padding:5px 12px; cursor:pointer; font-size:10px; font-weight:700;
  letter-spacing:0.14em; text-transform:uppercase;
  color:rgba(255,255,255,0.45); text-align:left;
  transition:all 0.12s; white-space:nowrap; font-family:'Share Tech Mono',monospace;
  display:flex; align-items:center; gap:7px;
}
.skill-toolbar-btn svg { width:12px; height:12px; flex-shrink:0; }
.skill-toolbar-btn:hover  { border-color:rgba(255,255,255,0.22); color:#fff; }
.skill-toolbar-btn.active { border-color:#e8c84a; color:#e8c84a; background:rgba(232,200,74,0.07); }
.skill-toolbar-btn.flip-active  { border-color:#4dd9e8; color:#4dd9e8; background:rgba(77,217,232,0.07); }
.skill-toolbar-btn.daily-active { border-color:#b48aff; color:#b48aff; border-style:dashed; }

/* ── Controls ── */
.skill-controls {
  position:absolute; bottom:20px; right:20px; z-index:50;
  display:flex; flex-direction:column; gap:3px;
}
.skill-btn {
  width:30px; height:30px;
  background:var(--st-toolbar-bg,rgba(0,9,19,0.85));
  border:1px solid rgba(255,255,255,0.08); border-radius:2px;
  cursor:pointer; font-size:15px; color:rgba(255,255,255,0.45);
  display:flex; align-items:center; justify-content:center; transition:all 0.12s;
}
.skill-btn:hover { border-color:rgba(255,255,255,0.25); color:#fff; }

/* ── Side panels ── */
.skill-panel, .skill-color-panel, .skill-ach-panel, .skill-stats-panel {
  position:absolute; top:0; right:0; width:260px; height:100%;
  background:rgba(0,6,14,0.97); border-left:1px solid rgba(255,255,255,0.06);
  z-index:40; overflow-y:auto; padding:16px 12px;
  transform:translateX(100%); transition:transform 0.2s ease;
  backdrop-filter:blur(14px);
}
.skill-color-panel { width:280px; z-index:44; }
.skill-ach-panel   { width:280px; z-index:45; }
.skill-stats-panel { width:280px; z-index:46; }
.skill-panel.open, .skill-color-panel.open, .skill-ach-panel.open, .skill-stats-panel.open { transform:translateX(0); }
.skill-panel h3 { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:rgba(255,255,255,0.2); margin:14px 0 6px; font-family:'Share Tech Mono',monospace; }
.skill-panel-skill-item { display:flex; align-items:center; gap:8px; padding:5px 6px; border-radius:2px; cursor:pointer; font-size:11px; font-weight:700; transition:background 0.1s; letter-spacing:0.06em; }
.skill-panel-skill-item:hover { background:rgba(255,255,255,0.04); }
.skill-panel-skill-icon { width:16px; height:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.skill-panel-skill-icon svg { width:14px; height:14px; }
.skill-panel-skill-name { flex:1; color:rgba(255,255,255,0.6); }
.skill-panel-skill-badge { font-size:8px; padding:1px 5px; border-radius:2px; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.25); font-family:'Share Tech Mono',monospace; }
.skill-panel-skill-badge.unlocked { background:rgba(232,200,74,0.12); color:#e8c84a; }
.skill-panel-skill-badge.mastered { background:rgba(77,217,232,0.12); color:#4dd9e8; }

/* ── Color Panel ── */
.skill-color-panel-title, .skill-ach-panel-title, .skill-stats-title { font-size:8px; font-weight:700; letter-spacing:0.24em; text-transform:uppercase; color:rgba(255,255,255,0.25); margin:0 0 16px; font-family:'Share Tech Mono',monospace; }
.skill-color-section { margin-bottom:16px; }
.skill-color-section-label { font-size:8px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.18); margin-bottom:10px; font-family:'Share Tech Mono',monospace; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.04); }
.skill-color-row { display:flex; align-items:center; gap:10px; margin-bottom:7px; }
.skill-color-row-label { flex:1; font-size:10px; font-weight:700; color:rgba(255,255,255,0.45); letter-spacing:0.08em; font-family:'Share Tech Mono',monospace; }
.skill-color-swatch { width:26px; height:26px; border-radius:50%; border:2px solid rgba(255,255,255,0.12); cursor:pointer; transition:transform 0.14s; position:relative; overflow:hidden; flex-shrink:0; }
.skill-color-swatch:hover { transform:scale(1.15); }
.skill-color-swatch input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100%+8px); height:calc(100%+8px); }
.skill-color-divider { height:1px; background:rgba(255,255,255,0.04); margin:12px 0; }
.skill-color-reset-btn { width:100%; background:rgba(224,82,82,0.07); border:1px solid rgba(224,82,82,0.18); border-radius:2px; padding:5px 10px; font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#e05252; cursor:pointer; font-family:'Share Tech Mono',monospace; transition:background 0.14s; }
.skill-color-reset-btn:hover { background:rgba(224,82,82,0.16); }

/* ══ NODES ══ */
.skill-node {
  position:absolute; transform:translate(-50%,-50%); cursor:pointer;
  text-align:center; z-index:10; user-select:none;
  display:flex; flex-direction:column; align-items:center; gap:3px;
  transition:transform 0.15s;
}
.skill-node-circle {
  border-radius:50%;
  border:2px solid rgba(255,255,255,0.12);
  background:var(--st-node-bg,rgba(6,15,26,0.95));
  display:flex; align-items:center; justify-content:center;
  transition:all 0.18s; position:relative;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}
.skill-node:hover .skill-node-circle { transform:scale(1.12); }
.skill-node-circle .node-svg-icon { display:flex; align-items:center; justify-content:center; color:currentColor; }
.skill-node-circle .node-svg-icon svg { width:100%; height:100%; }

.skill-node.locked .skill-node-circle {
  border-color:rgba(255,255,255,0.07); opacity:0.38; filter:grayscale(1);
}
.skill-node.available .skill-node-circle {
  border-color:rgba(255,255,255,0.45);
  animation:nodeRingPulse 2.2s ease-in-out infinite;
}
.skill-node.available .node-svg-icon { color:rgba(255,255,255,0.55); }
.skill-node.unlocked .skill-node-circle {
  border-color:var(--node-color,#e8c84a); border-width:2.5px;
  box-shadow: 0 0 8px var(--node-glow,rgba(232,200,74,0.4)), 0 0 20px var(--node-glow,rgba(232,200,74,0.2)), inset 0 1px 0 rgba(255,255,255,0.08);
}
.skill-node.unlocked .node-svg-icon { color:var(--node-color,#e8c84a); }
.skill-node.mastered .skill-node-circle {
  border-color:var(--node-color,#e8c84a); border-width:3px;
  box-shadow: 0 0 0 4px var(--node-glow2,rgba(232,200,74,0.12)), 0 0 14px var(--node-glow,rgba(232,200,74,0.6)), 0 0 34px var(--node-glow,rgba(232,200,74,0.25)), inset 0 1px 0 rgba(255,255,255,0.1);
}
.skill-node.mastered .node-svg-icon { color:var(--node-color,#e8c84a); filter:drop-shadow(0 0 4px var(--node-glow,rgba(232,200,74,0.6))); }
.skill-node.locked .node-svg-icon { color:rgba(255,255,255,0.25); }

.skill-node.edit-mode { cursor:move; }
.skill-node.daily-highlight .skill-node-circle {
  box-shadow:0 0 0 3px #b48aff,0 0 18px rgba(180,138,255,0.55) !important;
}

.skill-node-lock {
  position:absolute; bottom:-2px; right:-2px;
  width:14px; height:14px; background:rgba(0,9,19,0.98);
  border:1px solid rgba(255,255,255,0.12); border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,0.3);
}
.skill-node-lock svg { width:8px; height:8px; }

.skill-node-level-badge {
  position:absolute; top:-4px; left:-4px;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:700; color:#000; font-family:'Share Tech Mono',monospace;
}

.skill-node-name {
  font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
  color:rgba(255,255,255,0.3); white-space:nowrap;
  font-family:'Share Tech Mono',monospace; transition:color 0.2s;
}
.skill-node.unlocked .skill-node-name { color:rgba(255,255,255,0.75); }
.skill-node.mastered  .skill-node-name { color:#fff; }
.skill-node.available .skill-node-name { color:rgba(255,255,255,0.55); }
.skill-node.unlocked[data-size="large"] .skill-node-name,
.skill-node.mastered[data-size="large"]  .skill-node-name {
  color:var(--node-color,#e8c84a);
  text-shadow:0 0 10px var(--node-glow,rgba(232,200,74,0.5));
  font-size:11px !important; letter-spacing:0.18em;
}

.skill-node-cost {
  position:absolute; font-size:8px; font-weight:700;
  color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace;
  white-space:nowrap; right:-20px; top:50%; transform:translateY(-50%);
}
.skill-node-size-badge {
  position:absolute; top:-4px; right:-4px; width:12px; height:12px;
  border-radius:50%; background:rgba(180,138,255,0.16);
  border:1px solid rgba(180,138,255,0.3);
  display:flex; align-items:center; justify-content:center;
  font-size:6px; color:#b48aff; font-family:'Share Tech Mono',monospace; pointer-events:none;
}

@keyframes nodeRingPulse {
  0%,100% { box-shadow:0 0 0 0 rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06); }
  50%      { box-shadow:0 0 0 5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06); }
}

/* ══ EDGES ══ */
.skill-connection { fill:none; stroke:rgba(255,255,255,0.06); stroke-width:2; stroke-linecap:round; transition:stroke 0.3s, opacity 0.3s; }
.skill-connection.available { stroke:rgba(255,255,255,0.15); stroke-width:2.5; }
.skill-connection.unlocked { stroke-width:5; opacity:0.9; stroke-linecap:round; }
.skill-connection.mastered { stroke-width:7; opacity:1; stroke-linecap:round; }
.skill-connection-glow { fill:none; stroke-width:14; opacity:0.18; pointer-events:none; stroke-linecap:round; }
.skill-connection-glow2 { fill:none; stroke-width:24; opacity:0.07; pointer-events:none; stroke-linecap:round; }

/* ── Tooltip ── */
.skill-tooltip {
  position:fixed; pointer-events:none; z-index:9999;
  background:rgba(0,9,19,0.98); border:1px solid rgba(255,255,255,0.08);
  border-radius:3px; padding:12px 16px; width:220px;
  box-shadow:0 8px 32px rgba(0,0,0,0.7); opacity:0; transition:opacity 0.08s;
  font-family:'Rajdhani',sans-serif;
}
.skill-tooltip.visible { opacity:1; }
.skill-tooltip-header { display:flex; gap:10px; align-items:center; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06); }
.skill-tooltip-icon { width:28px; height:28px; display:flex; align-items:center; justify-content:center; }
.skill-tooltip-icon svg { width:22px; height:22px; }
.skill-tooltip-title { font-size:14px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#fff; }
.skill-tooltip-state { font-size:9px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.25); font-family:'Share Tech Mono',monospace; }
.skill-tooltip-desc  { font-size:11px; color:rgba(255,255,255,0.4); line-height:1.5; margin-bottom:8px; }
.skill-tooltip-stats { display:flex; gap:12px; font-size:11px; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-stat  { display:flex; flex-direction:column; gap:2px; }
.skill-tooltip-stat-label { font-size:7px; letter-spacing:0.18em; color:rgba(255,255,255,0.22); text-transform:uppercase; }
.skill-tooltip-stat-val   { font-size:13px; font-weight:700; color:#e8c84a; }
.skill-tooltip-req    { font-size:9px; color:rgba(255,255,255,0.25); margin-top:6px; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-action { margin-top:8px; padding:3px 10px; border-radius:2px; font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; text-align:center; font-family:'Share Tech Mono',monospace; }
.skill-tooltip-action.can-afford  { background:rgba(232,200,74,0.1); color:#e8c84a; border:1px solid rgba(232,200,74,0.22); }
.skill-tooltip-action.cant-afford { background:rgba(224,82,82,0.08); color:#e05252; border:1px solid rgba(224,82,82,0.14); }

/* ── Size Picker ── */
.skill-size-picker { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:4px; }
.skill-size-option { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; padding:6px 8px; border-radius:3px; border:1px solid rgba(255,255,255,0.08); transition:all 0.14s; background:rgba(255,255,255,0.02); }
.skill-size-option:hover { border-color:rgba(255,255,255,0.22); }
.skill-size-option.selected { border-color:#b48aff; background:rgba(180,138,255,0.08); }
.skill-size-option-circle { border-radius:50%; border:2px solid rgba(255,255,255,0.25); background:rgba(6,15,26,0.9); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.5); }
.skill-size-option-circle svg { width:10px; height:10px; }
.skill-size-option.selected .skill-size-option-circle { border-color:#b48aff; color:#b48aff; }
.skill-size-option-label { font-size:8px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.3); font-family:'Share Tech Mono',monospace; }
.skill-size-option.selected .skill-size-option-label { color:#b48aff; }

/* ── Particles ── */
@keyframes skillParticleFade { 0% { opacity:1; transform:scale(1); } 100% { opacity:0; transform:scale(0.1); } }

/* ── Modal ── */
.skill-modal h2 { font-size:16px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:14px; font-family:'Rajdhani',sans-serif; }
.skill-modal-sub { font-size:10px; color:var(--text-muted); margin-bottom:12px; margin-top:-10px; font-family:'Share Tech Mono',monospace; }
.skill-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; flex-wrap:wrap; }
.skill-modal-btn { padding:5px 14px; border-radius:2px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; border:1px solid transparent; transition:opacity 0.14s; font-family:'Share Tech Mono',monospace; }
.skill-modal-btn.primary   { background:rgba(232,200,74,0.1); color:#e8c84a; border-color:rgba(232,200,74,0.28); }
.skill-modal-btn.primary:hover { opacity:0.82; }
.skill-modal-btn.secondary { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); border-color:rgba(255,255,255,0.08); }
.skill-modal-btn.danger    { background:rgba(224,82,82,0.07); color:#e05252; border-color:rgba(224,82,82,0.18); }
.skill-modal-btn.danger:hover { background:rgba(224,82,82,0.14); }
.skill-modal-btn.sm { padding:2px 8px; font-size:9px; }
.skill-modal-empty { font-size:10px; color:var(--text-muted); font-style:italic; margin-bottom:6px; font-family:'Share Tech Mono',monospace; }
.skill-req-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-size:11px; }
.skill-req-row span { flex:1; }
.skill-modal-select { width:100%; margin-top:6px; padding:4px 8px; border-radius:2px; border:1px solid var(--background-modifier-border); background:var(--background-secondary); color:var(--text-normal); font-size:11px; font-family:'Share Tech Mono',monospace; }

/* ── Hint ── */
.skill-hint { position:absolute; bottom:72px; left:50%; transform:translateX(-50%); font-size:8px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.1); pointer-events:none; z-index:30; white-space:nowrap; font-family:'Share Tech Mono',monospace; }
.skill-flip-indicator { position:absolute; top:16px; right:16px; font-size:8px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.14); pointer-events:none; z-index:30; font-family:'Share Tech Mono',monospace; }

/* ── Achievements ── */
.skill-ach-item { display:flex; align-items:center; gap:10px; padding:8px; border-radius:3px; margin-bottom:5px; border:1px solid rgba(255,255,255,0.04); }
.skill-ach-item.earned { background:rgba(232,200,74,0.04); border-color:rgba(232,200,74,0.1); }
.skill-ach-item.locked-ach { opacity:0.3; filter:grayscale(0.9); }
.skill-ach-icon { width:28px; height:28px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.skill-ach-icon svg { width:22px; height:22px; }
.skill-ach-icon.earned svg { color:#e8c84a; }
.skill-ach-info { flex:1; }
.skill-ach-name { font-size:11px; font-weight:700; letter-spacing:0.06em; color:rgba(255,255,255,0.75); font-family:'Rajdhani',sans-serif; }
.skill-ach-desc { font-size:9px; color:rgba(255,255,255,0.28); font-family:'Share Tech Mono',monospace; margin-top:1px; }
.skill-ach-badge { font-size:7px; font-family:'Share Tech Mono',monospace; padding:1px 5px; border-radius:2px; }
.skill-ach-badge.earned { background:rgba(232,200,74,0.14); color:#e8c84a; }
.skill-ach-badge.locked-ach { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.18); }
.skill-ach-progress { font-size:9px; color:rgba(255,255,255,0.22); margin-top:10px; font-family:'Share Tech Mono',monospace; text-align:center; letter-spacing:0.12em; }

/* ── Achievement Toast ── */
@keyframes achSlideIn  { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
@keyframes achSlideOut { from { opacity:1; } to { transform:translateX(120%); opacity:0; } }
.skill-ach-toast {
  position:fixed; bottom:80px; right:20px; z-index:99999;
  background:rgba(0,9,19,0.99); border:1px solid rgba(232,200,74,0.28);
  border-radius:4px; padding:12px 16px; display:flex; align-items:center; gap:12px;
  box-shadow:0 4px 24px rgba(0,0,0,0.8); max-width:280px;
  animation:achSlideIn 0.35s ease forwards;
}
.skill-ach-toast.hiding { animation:achSlideOut 0.35s ease forwards; }
.skill-ach-toast-icon { width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#e8c84a; }
.skill-ach-toast-icon svg { width:28px; height:28px; }
.skill-ach-toast-title { font-size:8px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#e8c84a; font-family:'Share Tech Mono',monospace; }
.skill-ach-toast-name  { font-size:14px; font-weight:700; color:#fff; font-family:'Rajdhani',sans-serif; margin-top:2px; }
.skill-ach-toast-desc  { font-size:10px; color:rgba(255,255,255,0.35); font-family:'Share Tech Mono',monospace; }

/* ── Pomodoro ── */
.skill-pomodoro {
  position:absolute; bottom:20px; left:50%; transform:translateX(-50%);
  z-index:50; display:flex; flex-direction:column; align-items:center; gap:7px;
  background:rgba(0,9,19,0.92); border:1px solid rgba(255,255,255,0.07);
  border-radius:3px; padding:10px 20px; backdrop-filter:blur(12px);
  transition:opacity 0.3s; min-width:200px;
}
.skill-pomodoro.hidden { opacity:0; pointer-events:none; }
.skill-pomodoro-skill { font-size:8px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.28); font-family:'Share Tech Mono',monospace; display:flex; align-items:center; gap:6px; }
.skill-pomodoro-skill svg { width:11px; height:11px; }
.skill-pomodoro-timer { font-size:28px; font-weight:700; color:#e8c84a; font-family:'Share Tech Mono',monospace; letter-spacing:0.08em; line-height:1; }
.skill-pomodoro-phase { font-size:8px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.22); font-family:'Share Tech Mono',monospace; }
.skill-pomodoro-btns { display:flex; gap:5px; }
.skill-pomodoro-btn { padding:3px 10px; border-radius:2px; border:1px solid rgba(255,255,255,0.08); background:transparent; cursor:pointer; font-size:9px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.38); font-family:'Share Tech Mono',monospace; transition:all 0.14s; }
.skill-pomodoro-btn:hover { border-color:rgba(255,255,255,0.28); color:#fff; }
.skill-pomodoro-btn.running { border-color:#e8c84a; color:#e8c84a; background:rgba(232,200,74,0.06); }
.skill-pomodoro-dots { display:flex; gap:5px; }
.skill-pomodoro-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.08); transition:background 0.3s; }
.skill-pomodoro-dot.done { background:#e05252; }

/* ── Stats Panel ── */
.skill-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:14px; }
.skill-stats-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:3px; padding:9px 12px; }
.skill-stats-card-val { font-size:20px; font-weight:700; color:#e8c84a; font-family:'Share Tech Mono',monospace; }
.skill-stats-card-label { font-size:8px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.22); font-family:'Share Tech Mono',monospace; margin-top:2px; }
.skill-stats-section { font-size:8px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.18); margin:12px 0 8px; font-family:'Share Tech Mono',monospace; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.04); }
.skill-stats-bar-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.skill-stats-bar-label { font-size:10px; font-weight:700; color:rgba(255,255,255,0.45); width:80px; font-family:'Share Tech Mono',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.skill-stats-bar-track { flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; }
.skill-stats-bar-fill  { height:100%; border-radius:2px; transition:width 0.5s ease; }
.skill-stats-bar-pct   { font-size:8px; color:rgba(255,255,255,0.28); font-family:'Share Tech Mono',monospace; width:28px; text-align:right; }
.skill-stats-pomodoro-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
.skill-stats-pomodoro-key { color:rgba(255,255,255,0.35); font-family:'Share Tech Mono',monospace; font-size:9px; }
.skill-stats-pomodoro-val { color:#e8c84a; font-family:'Share Tech Mono',monospace; font-size:10px; font-weight:700; }

/* ── Daily Banner ── */
.skill-daily-banner {
  position:absolute; top:56px; left:50%; transform:translateX(-50%);
  z-index:48; display:flex; align-items:center; gap:10px;
  background:rgba(14,8,28,0.94); border:1px solid rgba(180,138,255,0.22);
  border-radius:3px; padding:5px 16px; backdrop-filter:blur(8px);
  pointer-events:none; transition:opacity 0.4s;
}
.skill-daily-banner.hidden { opacity:0; }
.skill-daily-banner-label { font-size:7px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:rgba(180,138,255,0.55); font-family:'Share Tech Mono',monospace; }
.skill-daily-banner-name  { font-size:12px; font-weight:700; color:#b48aff; font-family:'Rajdhani',sans-serif; letter-spacing:0.1em; display:flex; align-items:center; gap:5px; }
.skill-daily-banner-name svg { width:14px; height:14px; }

/* ── Category Manager ── */
.skill-cat-row { display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid rgba(255,255,255,0.04); border-radius:2px; }
.skill-cat-row.builtin-row { border-left:2px solid rgba(255,255,255,0.07); padding-left:8px; }
.skill-cat-color-dot { width:20px; height:20px; border-radius:50%; border:2px solid rgba(255,255,255,0.18); flex-shrink:0; position:relative; overflow:hidden; cursor:pointer; }
.skill-cat-color-dot input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100%+8px); height:calc(100%+8px); }
.skill-cat-name-input { flex:1; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.7); font-size:11px; font-weight:700; font-family:'Share Tech Mono',monospace; padding:2px 4px; outline:none; transition:border-color 0.14s; }
.skill-cat-name-input:focus { border-bottom-color:rgba(255,255,255,0.28); }
.skill-cat-icon-input { width:36px; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.7); font-size:13px; text-align:center; font-family:'Share Tech Mono',monospace; padding:2px; outline:none; }
.skill-cat-del-btn { background:transparent; border:1px solid rgba(224,82,82,0.18); border-radius:2px; padding:2px 7px; font-size:9px; color:#e05252; cursor:pointer; font-family:'Share Tech Mono',monospace; font-weight:700; flex-shrink:0; }
.skill-cat-del-btn:hover { background:rgba(224,82,82,0.1); }
.skill-cat-del-btn:disabled { opacity:0.25; cursor:not-allowed; }
.skill-cat-add-form { margin-top:10px; display:flex; flex-direction:column; gap:6px; }
.skill-cat-add-row { display:flex; gap:6px; align-items:center; }
.skill-cat-input { flex:1; padding:4px 8px; border-radius:2px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#fff; font-size:11px; font-family:'Share Tech Mono',monospace; }
.skill-cat-add-btn { padding:4px 12px; border-radius:2px; border:1px solid rgba(232,200,74,0.28); background:rgba(232,200,74,0.06); color:#e8c84a; cursor:pointer; font-size:10px; font-weight:700; letter-spacing:0.1em; font-family:'Share Tech Mono',monospace; white-space:nowrap; }
.skill-cat-add-btn:hover { background:rgba(232,200,74,0.12); }
.skill-cat-section-header { font-size:8px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.18); margin:12px 0 6px; font-family:'Share Tech Mono',monospace; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:4px; }
.skill-cat-inuse { font-size:8px; color:rgba(255,200,80,0.55); font-family:'Share Tech Mono',monospace; white-space:nowrap; flex-shrink:0; }
`;

const MODAL_CSS_V2 = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

/* ═══ Modal V2 Shell ═══ */
.skill-modal-v2 {
  font-family: 'Rajdhani', sans-serif;
  background: #000913 !important;
  color: rgba(255,255,255,0.75);
  padding: 0 !important;
  overflow: hidden;
  border-radius: 4px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.skill-modal-v2 .modal-content { 
  padding: 0 !important; 
  background: #000913 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.skill-modal-v2 .modal-close-button { color: rgba(255,255,255,0.3); top: 14px; right: 14px; z-index: 10; }
.skill-modal-v2 .modal-close-button:hover { color: #fff; }

/* Header */
.smv2-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.smv2-title {
  font-size: 9px; font-weight: 700; letter-spacing: 0.28em;
  text-transform: uppercase; color: rgba(255,255,255,0.3);
  font-family: 'Share Tech Mono', monospace;
}
.smv2-id {
  font-size: 8px; color: rgba(255,255,255,0.14);
  font-family: 'Share Tech Mono', monospace; letter-spacing: 0.1em;
}

/* Live preview strip */
.smv2-preview {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(0,0,0,0.25);
  position: relative; overflow: hidden;
}
.smv2-preview::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 50%, var(--preview-glow, rgba(232,200,74,0.05)) 0%, transparent 70%);
  pointer-events: none;
}
.smv2-preview-circle {
  width: 52px; height: 52px; border-radius: 50%;
  border: 2px solid var(--preview-color, rgba(255,255,255,0.15));
  background: rgba(6,15,26,0.95);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.25s;
  box-shadow: 0 0 10px var(--preview-glow, transparent),
              0 0 26px var(--preview-glow2, transparent);
  color: var(--preview-color, rgba(255,255,255,0.35));
}
.smv2-preview-circle svg { width: 24px; height: 24px; }
.smv2-preview-info { flex: 1; min-width: 0; }
.smv2-preview-name {
  font-size: 18px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #fff;
  font-family: 'Rajdhani', sans-serif; line-height: 1.1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.2s;
}
.smv2-preview-meta { display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap; }
.smv2-preview-cat {
  font-size: 8px; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; font-family: 'Share Tech Mono', monospace;
  padding: 2px 7px; border-radius: 2px;
  background: var(--preview-bg, rgba(255,255,255,0.04));
  color: var(--preview-color, rgba(255,255,255,0.4));
  border: 1px solid var(--preview-color, rgba(255,255,255,0.08));
  transition: all 0.2s;
}
.smv2-preview-cost {
  font-size: 8px; font-weight: 700; letter-spacing: 0.12em;
  font-family: 'Share Tech Mono', monospace; color: rgba(255,255,255,0.22);
}
.smv2-preview-sz {
  font-size: 8px; font-family: 'Share Tech Mono', monospace;
  color: rgba(180,138,255,0.5); letter-spacing: 0.1em;
}

/* Scrollable body */
.smv2-body {
  padding: 16px 20px 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;   
  display: flex; 
  flex-direction: column; 
  gap: 13px;
}
.smv2-body::-webkit-scrollbar { width: 3px; }
.smv2-body::-webkit-scrollbar-track { background: transparent; }
.smv2-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Field label */
.smv2-label {
  font-size: 7px; font-weight: 700; letter-spacing: 0.22em;
  text-transform: uppercase; color: rgba(255,255,255,0.2);
  font-family: 'Share Tech Mono', monospace; margin-bottom: 5px;
  display: flex; align-items: center; gap: 8px;
}
.smv2-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }

/* Inputs */
.smv2-input {
  width: 100%; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
  padding: 7px 10px; color: #fff;
  font-size: 13px; font-weight: 700; font-family: 'Rajdhani', sans-serif;
  outline: none; transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}
.smv2-input:focus { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
.smv2-textarea {
  width: 100%; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
  padding: 7px 10px; color: rgba(255,255,255,0.55);
  font-size: 11px; font-family: 'Share Tech Mono', monospace;
  outline: none; resize: vertical; min-height: 58px;
  transition: border-color 0.15s; box-sizing: border-box; line-height: 1.5;
}
.smv2-textarea:focus { border-color: rgba(255,255,255,0.22); }
.smv2-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.smv2-field { display: flex; flex-direction: column; gap: 4px; }
.smv2-num-input {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
  padding: 7px 10px; color: #e8c84a;
  font-size: 16px; font-weight: 700; font-family: 'Share Tech Mono', monospace;
  outline: none; width: 100%; text-align: center;
  transition: border-color 0.15s; box-sizing: border-box;
}
.smv2-num-input:focus { border-color: rgba(232,200,74,0.35); }
.smv2-num-input::-webkit-inner-spin-button,
.smv2-num-input::-webkit-outer-spin-button { opacity: 0.4; }

/* Icon grid picker */
.smv2-icon-grid {
  display: grid; grid-template-columns: repeat(8, 1fr);
  gap: 4px; max-height: 160px; overflow-y: auto;
  padding: 5px; background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 3px;
}
.smv2-icon-grid::-webkit-scrollbar { width: 3px; }
.smv2-icon-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
.smv2-icon-item {
  aspect-ratio: 1; border-radius: 3px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.02);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.12s;
  color: rgba(255,255,255,0.28);
}
.smv2-icon-item svg { width: 14px; height: 14px; pointer-events: none; }
.smv2-icon-item:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.8);
}
.smv2-icon-item.selected {
  background: rgba(232,200,74,0.1);
  border-color: rgba(232,200,74,0.45);
  color: #e8c84a;
  box-shadow: 0 0 6px rgba(232,200,74,0.18);
}

/* Category chips */
.smv2-cat-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.smv2-cat-chip {
  padding: 4px 11px; border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.02);
  cursor: pointer; font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  font-family: 'Share Tech Mono', monospace;
  color: rgba(255,255,255,0.32);
  transition: all 0.14s; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
}
.smv2-cat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.smv2-cat-chip.selected {
  color: var(--chip-color, #e8c84a);
  border-color: var(--chip-color, rgba(232,200,74,0.5));
  background: var(--chip-bg, rgba(232,200,74,0.08));
}
.smv2-cat-chip:hover:not(.selected) {
  border-color: rgba(255,255,255,0.24); color: rgba(255,255,255,0.65);
}

/* Size picker */
.smv2-size-row { display: flex; gap: 5px; }
.smv2-size-opt {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 5px; padding: 7px 4px;
  border-radius: 3px; border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.14s;
}
.smv2-size-opt:hover { border-color: rgba(255,255,255,0.2); }
.smv2-size-opt.selected { border-color: #b48aff; background: rgba(180,138,255,0.08); }
.smv2-size-circle {
  border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.18);
  background: rgba(6,15,26,0.9); display: flex;
  align-items: center; justify-content: center;
  color: rgba(255,255,255,0.28); transition: all 0.14s; flex-shrink: 0;
}
.smv2-size-opt.selected .smv2-size-circle { border-color: #b48aff; color: #b48aff; }
.smv2-size-lbl {
  font-size: 7px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; font-family: 'Share Tech Mono', monospace;
  color: rgba(255,255,255,0.22);
}
.smv2-size-opt.selected .smv2-size-lbl { color: #b48aff; }

/* Prerequisite tags */
.smv2-req-tags { display: flex; flex-wrap: wrap; gap: 5px; min-height: 20px; margin-bottom: 5px; }
.smv2-req-tag {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 8px 3px 10px; border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
  font-family: 'Share Tech Mono', monospace; color: rgba(255,255,255,0.45);
}
.smv2-req-rm {
  width: 14px; height: 14px; border-radius: 50%;
  border: none; background: rgba(224,82,82,0.18); color: #e05252;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 11px; line-height: 1;
  padding: 0; transition: background 0.12s;
}
.smv2-req-rm:hover { background: rgba(224,82,82,0.42); }
.smv2-req-empty {
  font-size: 9px; color: rgba(255,255,255,0.18);
  font-family: 'Share Tech Mono', monospace; font-style: italic;
  line-height: 2;
}
.smv2-req-select {
  width: 100%; padding: 6px 10px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.1); border-radius: 2px;
  color: rgba(255,255,255,0.3); font-size: 10px;
  font-family: 'Share Tech Mono', monospace; outline: none; cursor: pointer;
  transition: border-color 0.14s;
}
.smv2-req-select:hover { border-color: rgba(255,255,255,0.24); color: rgba(255,255,255,0.55); }

/* Footer */
.smv2-footer {
flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 20px 15px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.18);
}
.smv2-footer-left, .smv2-footer-right { display: flex; gap: 6px; }
.smv2-btn {
  padding: 5px 14px; border-radius: 2px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; cursor: pointer;
  border: 1px solid transparent; transition: all 0.14s;
  font-family: 'Share Tech Mono', monospace;
}
.smv2-btn.primary   { background: rgba(232,200,74,0.1);  color: #e8c84a; border-color: rgba(232,200,74,0.3); }
.smv2-btn.primary:hover { background: rgba(232,200,74,0.18); }
.smv2-btn.secondary { background: transparent; color: rgba(255,255,255,0.38); border-color: rgba(255,255,255,0.1); }
.smv2-btn.secondary:hover { border-color: rgba(255,255,255,0.28); color: rgba(255,255,255,0.7); }
.smv2-btn.danger    { background: rgba(224,82,82,0.06); color: #e05252; border-color: rgba(224,82,82,0.18); }
.smv2-btn.danger:hover { background: rgba(224,82,82,0.14); }
.smv2-btn.ghost     { background: transparent; color: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.07); font-size: 8px; }
.smv2-btn.ghost:hover { color: rgba(255,255,255,0.48); border-color: rgba(255,255,255,0.18); }
.smv2-cat-list { display:flex; flex-direction:column; gap:4px; }
.smv2-cat-item {
  display:flex; align-items:center; gap:9px; padding:7px 10px; border-radius:3px;
  border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); transition:background 0.12s;
}
.smv2-cat-item:hover { background:rgba(255,255,255,0.04); }
.smv2-cat-item.builtin { border-left:2px solid rgba(255,255,255,0.1); }
.smv2-cat-swatch {
  width:24px; height:24px; border-radius:50%;
  border:2px solid rgba(255,255,255,0.2); flex-shrink:0;
  position:relative; overflow:hidden; cursor:pointer; transition:transform 0.14s;
}
.smv2-cat-swatch:hover { transform:scale(1.15); }
.smv2-cat-swatch input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100% + 8px); height:calc(100% + 8px); }
.smv2-cat-name-edit {
  flex:1; background:transparent; border:none;
  border-bottom:1px solid rgba(255,255,255,0.07);
  color:rgba(255,255,255,0.8); font-size:12px; font-weight:700;
  font-family:'Share Tech Mono',monospace; padding:3px 4px; outline:none;
  transition:border-color 0.14s; min-width:0; letter-spacing:0.08em;
}
.smv2-cat-name-edit:focus { border-bottom-color:rgba(255,255,255,0.3); }
.smv2-cat-inuse-tag {
  font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
  font-family:'Share Tech Mono',monospace; color:rgba(255,200,80,0.55);
  white-space:nowrap; flex-shrink:0; padding:2px 6px;
  border:1px solid rgba(255,200,80,0.18); border-radius:2px; background:rgba(255,200,80,0.04);
}
.smv2-cat-del {
  width:22px; height:22px; border-radius:2px; flex-shrink:0;
  border:1px solid rgba(224,82,82,0.2); background:transparent;
  color:rgba(224,82,82,0.45); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; transition:all 0.12s; padding:0; line-height:1;
}
.smv2-cat-del:hover { background:rgba(224,82,82,0.14); color:#e05252; border-color:rgba(224,82,82,0.5); }
.smv2-cat-del:disabled { opacity:0.18; cursor:not-allowed; }
.smv2-cat-add-row {
  display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:3px;
  border:1px dashed rgba(255,255,255,0.09); background:transparent; margin-top:4px;
}
.smv2-cat-add-swatch {
  width:24px; height:24px; border-radius:50%;
  border:2px solid rgba(255,255,255,0.2); flex-shrink:0;
  position:relative; overflow:hidden; cursor:pointer; transition:transform 0.14s;
}
.smv2-cat-add-swatch:hover { transform:scale(1.12); }
.smv2-cat-add-swatch input[type=color] { position:absolute; inset:-4px; opacity:0; cursor:pointer; width:calc(100% + 8px); height:calc(100% + 8px); }
.smv2-cat-add-input {
  flex:1; background:transparent; border:none;
  border-bottom:1px solid rgba(255,255,255,0.1);
  color:rgba(255,255,255,0.6); font-size:11px; font-weight:700;
  font-family:'Share Tech Mono',monospace; padding:3px 4px; outline:none; transition:border-color 0.14s;
}
.smv2-cat-add-input:focus { border-bottom-color:rgba(255,255,255,0.28); }
.smv2-cat-add-input::placeholder { color:rgba(255,255,255,0.18); }
.smv2-cat-add-btn {
  padding:4px 12px; border-radius:2px;
  border:1px solid rgba(232,200,74,0.28); background:rgba(232,200,74,0.06);
  color:#e8c84a; cursor:pointer; font-size:9px; font-weight:700;
  letter-spacing:0.12em; text-transform:uppercase;
  font-family:'Share Tech Mono',monospace; white-space:nowrap; transition:background 0.14s;
}
.smv2-cat-add-btn:hover { background:rgba(232,200,74,0.14); }

/* ══ POMODORO MODAL V2 ══ */
.smv2-pomo-time-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.smv2-pomo-time-box {
  display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:12px 8px; border-radius:3px;
  border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02);
}
.smv2-pomo-time-lbl {
  font-size:7px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase;
  font-family:'Share Tech Mono',monospace; color:rgba(255,255,255,0.2);
}
.smv2-pomo-time-val {
  font-size:32px; font-weight:700; letter-spacing:0.04em;
  font-family:'Share Tech Mono',monospace; color:#e8c84a; line-height:1;
}
.smv2-pomo-time-val.break { color:#4dd9e8; }
.smv2-pomo-stepper { display:flex; align-items:center; gap:5px; margin-top:3px; }
.smv2-pomo-step {
  width:22px; height:22px; border-radius:2px;
  border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03);
  color:rgba(255,255,255,0.45); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:15px; line-height:1; padding:0; transition:all 0.12s;
}
.smv2-pomo-step:hover { border-color:rgba(255,255,255,0.3); color:#fff; background:rgba(255,255,255,0.07); }
.smv2-pomo-free {
  display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:3px;
  border:1px dashed rgba(255,255,255,0.1); cursor:pointer; transition:all 0.13s; margin-bottom:5px;
}
.smv2-pomo-free:hover { border-color:rgba(255,255,255,0.25); }
.smv2-pomo-free.selected { border-style:solid; border-color:#b48aff; background:rgba(180,138,255,0.06); }
.smv2-pomo-free-icon { font-size:15px; line-height:1; }
.smv2-pomo-free-lbl {
  font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
  font-family:'Share Tech Mono',monospace; color:rgba(255,255,255,0.3); flex:1;
}
.smv2-pomo-free.selected .smv2-pomo-free-lbl { color:#b48aff; }
.smv2-pomo-grid {
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:5px; max-height:160px; overflow-y:auto; padding:2px;
}
.smv2-pomo-grid::-webkit-scrollbar { width:3px; }
.smv2-pomo-grid::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); }
.smv2-pomo-node {
  display:flex; align-items:center; gap:6px; padding:6px 7px; border-radius:3px;
  border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);
  cursor:pointer; transition:all 0.12s; min-width:0;
}
.smv2-pomo-node:hover { border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.04); }
.smv2-pomo-node.selected { border-color:#e05252; background:rgba(224,82,82,0.07); }
.smv2-pomo-node-ic {
  width:20px; height:20px; border-radius:50%; flex-shrink:0;
  border:1.5px solid rgba(255,255,255,0.14); background:rgba(6,15,26,0.9);
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,0.28); transition:all 0.12s;
}
.smv2-pomo-node-ic svg { width:10px; height:10px; pointer-events:none; }
.smv2-pomo-node.selected .smv2-pomo-node-ic { border-color:#e05252; color:#e05252; }
.smv2-pomo-node-nm {
  font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
  font-family:'Share Tech Mono',monospace; color:rgba(255,255,255,0.32);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; transition:color 0.12s;
}
.smv2-pomo-node.selected .smv2-pomo-node-nm { color:#e05252; }

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
    this.pomo = {
      active: false, running: false,
      workMin: 25, breakMin: 5,
      remaining: 25 * 60, phase: 'work',
      targetNodeId: null, sessionsInCycle: 0, totalDone: 0,
      intervalId: null,
    };
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
    const id = 'skill-tree-plugin-styles-v81';
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
    if (this.tree.flipped === undefined) this.tree.flipped = true;
    // Migrate old icon field to iconId
    this.tree.nodes.forEach(n => {
      if (!n.size) n.size = 'small';
      if (!n.iconId) n.iconId = n.id; // use node id as iconId fallback
    });
    this.tree.nodes = computeStates(this.tree.nodes);

    if (this.plugin.settings.allCategories?.length) {
      this.allCategories = JSON.parse(JSON.stringify(this.plugin.settings.allCategories));
    } else {
      this.allCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
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

  getAllCategories() { return this.allCategories; }

  catColor(cat) {
    const found = this.allCategories.find(c => c.id === cat);
    if (found?.color) {
      const color = found.color.startsWith('#') ? found.color : '#e8c84a';
      return { stroke: color, glow: hexToRgba(color, 0.55), glow2: hexToRgba(color, 0.2), text: color };
    }
    return { stroke: '#555', glow: 'rgba(85,85,85,0.4)', glow2: 'rgba(85,85,85,0.15)', text: '#555' };
  }

  getNodeCategoryId(node) {
    if (this.allCategories.find(c => c.id === node.category)) return node.category;
    return this.allCategories[0]?.id || 'physical';
  }

  // Helper: render inline SVG icon
  svgIcon(id, size = 18, color = 'currentColor') {
    const svg = getIcon(id);
    const wrapper = document.createElement('div');
    wrapper.className = 'node-svg-icon';
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size}px`;
    wrapper.style.color = color;
    wrapper.innerHTML = svg;
    return wrapper;
  }

  // ─── Achievements ──────────────────────────────────────────────────────────
  checkAchievements() {
    const earned = this.plugin.settings.achievements || {};
    const stats = this.plugin.settings.pomo || {};
    const dailyStats = { dailyUsed: this.plugin.settings.dailyUsed || false };
    ACHIEVEMENTS_DEF.forEach(ach => {
      if (earned[ach.id]) return;
      try {
        if (ach.check(this.tree, { ...stats, ...dailyStats })) {
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
    const iconDiv = document.createElement('div');
    iconDiv.className = 'skill-ach-toast-icon';
    iconDiv.innerHTML = getIcon(ach.iconId);
    toast.appendChild(iconDiv);
    const body = document.createElement('div');
    body.className = 'skill-ach-toast-body';
    body.innerHTML = `<div class="skill-ach-toast-title">CONQUISTA</div><div class="skill-ach-toast-name">${ach.name}</div><div class="skill-ach-toast-desc">${ach.desc}</div>`;
    toast.appendChild(body);
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 400); }, 3500);
  }

  // ─── Daily Skill ──────────────────────────────────────────────────────────
  pickDailySkill() {
    const key = todayKey();
    const saved = this.plugin.settings.dailySkill;
    if (saved?.key === key) { this.dailyNodeId = saved.nodeId; return; }
    const candidates = this.tree.nodes.filter(n => n.state !== 'mastered' && !['conditioning', 'mobility', 'survival'].includes(n.id));
    if (!candidates.length) { this.dailyNodeId = null; return; }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.dailyNodeId = pick.id;
    this.plugin.settings.dailySkill = { key, nodeId: pick.id };
    this.plugin.saveSettings();
  }

  // ─── Color helpers ─────────────────────────────────────────────────────────
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
    if (val?.startsWith('#')) return val;
    const m = val?.match(/[\d.]+/g);
    if (!m || m.length < 3) return '#e8c84a';
    return '#' + [0, 1, 2].map(i => Math.round(parseFloat(m[i])).toString(16).padStart(2, '0')).join('');
  }

  flipTree() {
    const ys = this.tree.nodes.map(n => n.y);
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    this.tree.nodes.forEach(n => { n.y = Math.round(midY * 2 - n.y); });
    this.tree.flipped = !this.tree.flipped;
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  render() {
    const container = this.contentEl;
    container.style.padding = '0'; container.style.margin = '0';
    container.style.position = 'absolute'; container.style.inset = '0';
    container.parentElement.style.padding = '0'; container.parentElement.style.overflow = 'hidden';
    container.empty(); container.addClass('skill-tree-container');
    this.updateCSSVars();

    this.stageEl = container.createDiv({ cls: 'skill-tree-stage' });
    this.svgEl = document.createElementNS(SVG_NS, 'svg');
    this.svgEl.setAttribute('class', 'skill-tree-canvas');
    this.svgEl.setAttribute('width', '6000'); this.svgEl.setAttribute('height', '6000');
    const defs = svgEl('defs');
    const filter = svgEl('filter', { id: 'edge-glow', x: '-100%', y: '-100%', width: '300%', height: '300%' });
    const feBlur = svgEl('feGaussianBlur', { stdDeviation: '4', result: 'coloredBlur' });
    const feMerge = svgEl('feMerge');
    feMerge.appendChild(svgEl('feMergeNode', { in: 'coloredBlur' }));
    feMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
    filter.appendChild(feBlur); filter.appendChild(feMerge);
    defs.appendChild(filter); this.svgEl.appendChild(defs);
    this.stageEl.appendChild(this.svgEl);
    this.worldEl = this.stageEl.createDiv({ cls: 'skill-tree-world' });

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'skill-tooltip';
    document.body.appendChild(this.tooltip);

    this.hudEl = container.createDiv({ cls: 'skill-hud' });
    this.renderHUD();
    this.dailyBannerEl = container.createDiv({ cls: 'skill-daily-banner' });
    this.renderDailyBanner();
    this.statsPanelEl = container.createDiv({ cls: 'skill-stats-panel' });
    this.renderStatsPanel();
    this.colorPanelEl = container.createDiv({ cls: 'skill-color-panel' });
    this.renderColorPanel();
    this.achPanelEl = container.createDiv({ cls: 'skill-ach-panel' });
    this.renderAchPanel();
    this.panelEl = container.createDiv({ cls: 'skill-panel' });
    this.renderPanel();
    this.toolbarEl = container.createDiv({ cls: 'skill-toolbar' });
    this.renderToolbar();
    const controls = container.createDiv({ cls: 'skill-controls' });
    this.renderControls(controls);
    this.pomodoroEl = container.createDiv({ cls: 'skill-pomodoro hidden' });
    this.renderPomodoro();
    this.flipIndicatorEl = container.createDiv({ cls: 'skill-flip-indicator' });
    this.updateFlipIndicator();
    container.createDiv({ cls: 'skill-hint', text: 'SCROLL — ZOOM  ·  DRAG — PAN  ·  CLICK — UNLOCK' });

    this.renderEdges(); this.renderNodes();
    this.setupPan(container);
    requestAnimationFrame(() => this.centerView());
  }

  updateFlipIndicator() {
    if (!this.flipIndicatorEl) return;
    this.flipIndicatorEl.textContent = this.tree.flipped ? '↑ ROOTS AT BOTTOM' : '↓ ROOTS AT TOP';
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────
  renderHUD() {
    const nodes = this.tree.nodes;
    const unlocked = nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
    const mastered = nodes.filter(n => n.state === 'mastered').length;
    this.hudEl.empty();
    const mk = (label, value, cls, iconId) => {
      const s = this.hudEl.createDiv({ cls: 'skill-hud-stat' });
      s.createDiv({ cls: 'skill-hud-label', text: label });
      const valRow = s.createDiv({ style: 'display:flex;align-items:center;gap:4px;' });
      if (iconId) {
        const ic = valRow.createDiv({ cls: 'skill-hud-icon' });
        ic.innerHTML = getIcon(iconId);
      }
      valRow.createDiv({ cls: `skill-hud-value ${cls}`, text: String(value) });
    };
    mk('Points', this.tree.points, 'gold', 'coins');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('Unlocked', `${unlocked}/${nodes.length}`, 'cyan', 'unlock');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('Mastered', mastered, 'red', 'athlete');
    this.hudEl.createDiv({ cls: 'skill-hud-sep' });
    mk('Foco', this.pomo.totalDone, '', 'tomato');
  }

  renderDailyBanner() {
    if (!this.dailyBannerEl) return;
    this.dailyBannerEl.empty();
    const node = this.tree.nodes.find(n => n.id === this.dailyNodeId);
    if (!node) { this.dailyBannerEl.addClass('hidden'); return; }
    this.dailyBannerEl.removeClass('hidden');
    this.dailyBannerEl.createDiv({ cls: 'skill-daily-banner-label', text: 'SKILL DO DIA' });
    const nameEl = this.dailyBannerEl.createDiv({ cls: 'skill-daily-banner-name' });
    nameEl.innerHTML = getIcon(node.iconId || node.id);
    nameEl.querySelector('svg').style.cssText = 'width:14px;height:14px;color:#b48aff;';
    nameEl.appendChild(document.createTextNode(node.name));
  }

  closeAllRightPanels() {
    this.panelOpen = false; this.panelEl.removeClass('open');
    this.colorPanelOpen = false; this.colorPanelEl.removeClass('open');
    this.achPanelOpen = false; this.achPanelEl.removeClass('open');
    this.statsPanelOpen = false; this.statsPanelEl.removeClass('open');
  }

  // ─── Toolbar ──────────────────────────────────────────────────────────────
  renderToolbar() {
    this.toolbarEl.empty();
    const mk = (iconId, text, extraCls, onClick) => {
      const btn = this.toolbarEl.createEl('button', { cls: `skill-toolbar-btn${extraCls ? ' ' + extraCls : ''}` });
      const ic = btn.createDiv();
      ic.innerHTML = getIcon(iconId);
      ic.querySelector('svg').style.cssText = `width:12px;height:12px;`;
      btn.createSpan({ text });
      btn.addEventListener('click', onClick);
      return btn;
    };
    mk('plus', 'SKILL', '', () => this.openAddNodeModal());
    mk('folder', 'CATEG', '', () => this.openCategoryModal());
    mk('edit', 'EDIT', this.editMode ? 'active' : '', () => { this.editMode = !this.editMode; this.connectMode = false; this.connectFrom = null; this.renderToolbar(); this.renderNodes(); });
    mk('link', 'LINK', this.connectMode ? 'active' : '', () => { this.connectMode = !this.connectMode; this.connectFrom = null; this.editMode = false; this.renderToolbar(); this.renderNodes(); });
    mk('coins', '+5 PTS', '', () => { this.tree.points += 5; this.saveTree(); this.renderHUD(); this.checkAchievements(); new Notice('+5 pontos'); });
    mk('flip', this.tree.flipped ? 'DESINV' : 'INVERT', this.tree.flipped ? 'flip-active' : '', () => { this.flipTree(); this.saveTree(); this.renderToolbar(); this.renderEdges(); this.renderNodes(); this.updateFlipIndicator(); this.centerView(); });
    mk('dice', 'DIÁRIO', this.dailyNodeId ? 'daily-active' : '', () => { if (!this.dailyNodeId) { new Notice('Nenhuma skill do dia.'); return; } const node = this.tree.nodes.find(n => n.id === this.dailyNodeId); if (node) { this.centerOnNode(node); this.plugin.settings.dailyUsed = true; this.plugin.saveSettings(); this.checkAchievements(); new Notice(node.name); } });
    mk('chart', 'STATS', this.statsPanelOpen ? 'active' : '', () => { const o = !this.statsPanelOpen; this.closeAllRightPanels(); if (o) { this.statsPanelOpen = true; this.statsPanelEl.addClass('open'); this.renderStatsPanel(); } this.renderToolbar(); });
    mk('trophy', 'ACHIEV', this.achPanelOpen ? 'active' : '', () => { const o = !this.achPanelOpen; this.closeAllRightPanels(); if (o) { this.achPanelOpen = true; this.achPanelEl.addClass('open'); this.renderAchPanel(); } this.renderToolbar(); });
    mk('tomato', 'FOCO', this.pomo.active ? 'active' : '', () => this.openPomodoroModal());
    mk('palette', 'CORES', this.colorPanelOpen ? 'active' : '', () => { const o = !this.colorPanelOpen; this.closeAllRightPanels(); if (o) { this.colorPanelOpen = true; this.colorPanelEl.addClass('open'); this.renderColorPanel(); } this.renderToolbar(); });
    mk('list', 'LIST', this.panelOpen ? 'active' : '', () => { const o = !this.panelOpen; this.closeAllRightPanels(); if (o) { this.panelOpen = true; this.panelEl.addClass('open'); this.renderPanel(); } this.renderToolbar(); });
    mk('center', 'CENTER', '', () => this.centerView());
  }

  renderControls(el) {
    const mk = (text, cb) => { const b = el.createEl('button', { cls: 'skill-btn', text }); b.addEventListener('click', cb); };
    mk('+', () => this.zoom(0.15));
    mk('−', () => this.zoom(-0.15));
    mk('⊙', () => { this.scale = 1; this.centerView(); });
  }

  // ─── Category Modal ────────────────────────────────────────────────────────
  openCategoryModal() {
    new CategoryModal(this.app, this.allCategories, this.tree.nodes, updatedCats => {
      const firstId = updatedCats[0]?.id;
      this.tree.nodes.forEach(n => { if (!updatedCats.find(c => c.id === n.category)) n.category = firstId || 'physical'; });
      this.allCategories = updatedCats;
      this.saveTree();
      if (this.colorPanelOpen) this.renderColorPanel();
      this.renderToolbar(); this.renderEdges(); this.renderNodes(); this.renderPanel();
      if (this.statsPanelOpen) this.renderStatsPanel();
    }).open();
  }

  // ─── Achievements Panel ────────────────────────────────────────────────────
  renderAchPanel() {
    if (!this.achPanelEl) return;
    this.achPanelEl.empty();
    this.achPanelEl.createDiv({ cls: 'skill-ach-panel-title', text: 'CONQUISTAS' });
    const earned = this.plugin.settings.achievements || {};
    let count = 0;
    ACHIEVEMENTS_DEF.forEach(ach => {
      const ok = !!earned[ach.id]; if (ok) count++;
      const item = this.achPanelEl.createDiv({ cls: `skill-ach-item ${ok ? 'earned' : 'locked-ach'}` });
      const iconWrap = item.createDiv({ cls: `skill-ach-icon${ok ? ' earned' : ''}` });
      iconWrap.innerHTML = ok ? getIcon(ach.iconId) : getIcon('lock');
      const info = item.createDiv({ cls: 'skill-ach-info' });
      info.createDiv({ cls: 'skill-ach-name', text: ok ? ach.name : '???' });
      info.createDiv({ cls: 'skill-ach-desc', text: ok ? ach.desc : 'Continue progredindo...' });
      item.createDiv({ cls: `skill-ach-badge ${ok ? 'earned' : 'locked-ach'}`, text: ok ? 'EARNED' : 'LOCKED' });
    });
    this.achPanelEl.createDiv({ cls: 'skill-ach-progress', text: `${count} / ${ACHIEVEMENTS_DEF.length} desbloqueadas` });
  }

  // ─── Stats Panel ──────────────────────────────────────────────────────────
  renderStatsPanel() {
    if (!this.statsPanelEl) return;
    this.statsPanelEl.empty();
    this.statsPanelEl.createDiv({ cls: 'skill-stats-title', text: 'ESTATÍSTICAS' });
    const nodes = this.tree.nodes;
    const total = nodes.length;
    const unlocked = nodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
    const mastered = nodes.filter(n => n.state === 'mastered').length;
    const locked = nodes.filter(n => n.state === 'locked').length;
    const avail = nodes.filter(n => n.state === 'available').length;
    const pct = v => total > 0 ? Math.round(v / total * 100) : 0;
    const earned = Object.keys(this.plugin.settings.achievements || {}).length;
    const grid = this.statsPanelEl.createDiv({ cls: 'skill-stats-grid' });
    const mkCard = (val, label) => { const c = grid.createDiv({ cls: 'skill-stats-card' }); c.createDiv({ cls: 'skill-stats-card-val', text: String(val) }); c.createDiv({ cls: 'skill-stats-card-label', text: label }); };
    mkCard(unlocked, 'Desbloqueadas'); mkCard(mastered, 'Dominadas'); mkCard(`${pct(unlocked)}%`, 'Progresso'); mkCard(earned, 'Conquistas');
    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Por Categoria' });
    this.getAllCategories().forEach(cat => {
      const catNodes = nodes.filter(n => n.category === cat.id);
      if (!catNodes.length) return;
      const done = catNodes.filter(n => n.state === 'unlocked' || n.state === 'mastered').length;
      const p = done / catNodes.length;
      const cc = this.catColor(cat.id);
      const row = this.statsPanelEl.createDiv({ cls: 'skill-stats-bar-row' });
      row.createDiv({ cls: 'skill-stats-bar-label', text: cat.label });
      const track = row.createDiv({ cls: 'skill-stats-bar-track' });
      const fill = track.createDiv({ cls: 'skill-stats-bar-fill' });
      fill.style.width = `${Math.round(p * 100)}%`; fill.style.background = cc.stroke;
      row.createDiv({ cls: 'skill-stats-bar-pct', text: `${Math.round(p * 100)}%` });
    });
    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Pomodoro' });
    const mkRow = (k, v) => { const r = this.statsPanelEl.createDiv({ cls: 'skill-stats-pomodoro-row' }); r.createDiv({ cls: 'skill-stats-pomodoro-key', text: k }); r.createDiv({ cls: 'skill-stats-pomodoro-val', text: String(v) }); };
    mkRow('Sessões', this.pomo.totalDone); mkRow('Ciclo atual', `${this.pomo.sessionsInCycle}/4`); mkRow('Total (min)', this.pomo.totalDone * this.pomo.workMin);
    this.statsPanelEl.createDiv({ cls: 'skill-stats-section', text: 'Skills' });
    mkRow('Total', total); mkRow('Disponíveis', avail); mkRow('Bloqueadas', locked); mkRow('Pontos', this.tree.points);
  }

  // ─── Pomodoro ─────────────────────────────────────────────────────────────
  openPomodoroModal() {
    new PomodoroSetupModal(this.app, this.tree.nodes, this.pomo, (nodeId, workMin, breakMin) => {
      this.pomo.targetNodeId = nodeId; this.pomo.workMin = workMin; this.pomo.breakMin = breakMin;
      this.pomo.remaining = workMin * 60; this.pomo.phase = 'work';
      this.pomo.active = true; this.pomo.running = false;
      this.pomodoroEl.removeClass('hidden'); this.renderPomodoro(); this.renderToolbar();
    }).open();
  }

  startPomodoro() {
    if (this.pomo.intervalId) return;
    this.pomo.running = true;
    this.pomo.intervalId = setInterval(() => {
      this.pomo.remaining--;
      if (this.pomo.remaining <= 0) {
        if (this.pomo.phase === 'work') {
          this.pomo.totalDone++; this.pomo.sessionsInCycle++;
          this.plugin.settings.pomo = { totalDone: this.pomo.totalDone };
          this.plugin.saveSettings(); this.checkAchievements(); this.renderHUD(); this.renderStatsPanel();
          if (this.pomo.sessionsInCycle >= 4) { this.pomo.sessionsInCycle = 0; this.pomo.phase = 'longbreak'; this.pomo.remaining = 15 * 60; new Notice('4 sessões! Pausa longa.'); }
          else { this.pomo.phase = 'break'; this.pomo.remaining = this.pomo.breakMin * 60; new Notice('Foco concluído!'); }
          if (this.pomo.totalDone % 2 === 0) { this.tree.points += 1; this.saveTree(); this.renderHUD(); new Notice('+1 ponto bônus!'); }
        } else { this.pomo.phase = 'work'; this.pomo.remaining = this.pomo.workMin * 60; new Notice('Hora de focar!'); }
      }
      this.updatePomodoroDisplay();
    }, 1000);
  }

  stopPomodoro(silent = false) { if (this.pomo.intervalId) { clearInterval(this.pomo.intervalId); this.pomo.intervalId = null; } this.pomo.running = false; if (!silent) this.renderPomodoro(); }
  resetPomodoro() { this.stopPomodoro(true); this.pomo.active = false; this.pomo.phase = 'work'; this.pomo.remaining = this.pomo.workMin * 60; this.pomodoroEl.addClass('hidden'); this.renderToolbar(); }

  updatePomodoroDisplay() {
    if (!this.pomTimerEl) return;
    const m = Math.floor(this.pomo.remaining / 60), s = this.pomo.remaining % 60;
    this.pomTimerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const phaseLabels = { work: 'FOCO', break: 'PAUSA', longbreak: 'PAUSA LONGA' };
    if (this.pomPhaseEl) this.pomPhaseEl.textContent = phaseLabels[this.pomo.phase] || 'FOCO';
    if (this.pomDotsEl) this.pomDotsEl.querySelectorAll('.skill-pomodoro-dot').forEach((d, i) => d.classList.toggle('done', i < this.pomo.sessionsInCycle));
    const phaseColor = { work: '#e8c84a', break: '#4dd9e8', longbreak: '#b48aff' };
    if (this.pomTimerEl) this.pomTimerEl.style.color = phaseColor[this.pomo.phase] || '#e8c84a';
  }

  renderPomodoro() {
    const el = this.pomodoroEl; el.empty();
    const node = this.tree.nodes.find(n => n.id === this.pomo.targetNodeId);
    const skillLabel = el.createDiv({ cls: 'skill-pomodoro-skill' });
    if (node) {
      skillLabel.innerHTML = getIcon(node.iconId || node.id);
      skillLabel.querySelector('svg').style.cssText = 'width:11px;height:11px;';
      skillLabel.appendChild(document.createTextNode(node.name));
    } else {
      skillLabel.innerHTML = getIcon('tomato');
      skillLabel.querySelector('svg').style.cssText = 'width:11px;height:11px;';
      skillLabel.appendChild(document.createTextNode('FOCO LIVRE'));
    }
    this.pomTimerEl = el.createDiv({ cls: 'skill-pomodoro-timer', text: '25:00' });
    this.pomPhaseEl = el.createDiv({ cls: 'skill-pomodoro-phase', text: 'FOCO' });
    this.pomDotsEl = el.createDiv({ cls: 'skill-pomodoro-dots' });
    for (let i = 0; i < 4; i++) this.pomDotsEl.createDiv({ cls: 'skill-pomodoro-dot' });
    const btns = el.createDiv({ cls: 'skill-pomodoro-btns' });
    const startBtn = btns.createEl('button', { cls: `skill-pomodoro-btn${this.pomo.running ? ' running' : ''}`, text: this.pomo.running ? 'PAUSAR' : 'INICIAR' });
    startBtn.addEventListener('click', () => { if (this.pomo.running) this.stopPomodoro(); else this.startPomodoro(); this.renderPomodoro(); });
    const resetBtn = btns.createEl('button', { cls: 'skill-pomodoro-btn', text: 'ENCERRAR' });
    resetBtn.addEventListener('click', () => { this.resetPomodoro(); new Notice('Pomodoro encerrado.'); });
    this.updatePomodoroDisplay();
  }

  // ─── Color Panel ──────────────────────────────────────────────────────────
  renderColorPanel() {
    const el = this.colorPanelEl; el.empty();
    el.createDiv({ cls: 'skill-color-panel-title', text: 'CORES' });
    const mkSwatch = (parent, label, hex, onChange) => {
      const row = parent.createDiv({ cls: 'skill-color-row' });
      row.createDiv({ cls: 'skill-color-row-label', text: label });
      const swatch = row.createDiv({ cls: 'skill-color-swatch' });
      swatch.style.background = hex;
      const input = swatch.createEl('input'); input.type = 'color';
      input.value = hex.startsWith('#') ? hex : '#e8c84a';
      input.addEventListener('input', e => { const h = e.target.value; swatch.style.background = h; onChange(h); });
    };
    const catSec = el.createDiv({ cls: 'skill-color-section' });
    catSec.createDiv({ cls: 'skill-color-section-label', text: 'Categorias' });
    this.allCategories.forEach(cat => {
      const safe = (cat.color?.startsWith('#')) ? cat.color : '#e8c84a';
      mkSwatch(catSec, cat.label, safe, hex => { cat.color = hex; this.renderEdges(); this.renderNodes(); this.saveTree(); });
    });
    el.createDiv({ cls: 'skill-color-divider' });
    const uiSec = el.createDiv({ cls: 'skill-color-section' });
    uiSec.createDiv({ cls: 'skill-color-section-label', text: 'Interface' });
    [
      { key: 'background', label: 'Background' },
      { key: 'nodeCircleBg', label: 'Nó (fundo)' },
      { key: 'hudBg', label: 'HUD' },
      { key: 'toolbarBg', label: 'Toolbar' },
      { key: 'pointsColor', label: 'Pontos' },
      { key: 'unlockedColor', label: 'Desbloqueado' },
      { key: 'masteredColor', label: 'Dominado' },
    ].forEach(({ key, label }) => mkSwatch(uiSec, label, this.rgbaToHex(this.uiColors[key]), hex => { this.uiColors[key] = hex; this.updateCSSVars(); this.saveTree(); }));
    el.createDiv({ cls: 'skill-color-divider' });
    const resetBtn = el.createEl('button', { cls: 'skill-color-reset-btn', text: 'RESETAR CORES' });
    resetBtn.addEventListener('click', () => {
      DEFAULT_CATEGORIES.forEach(dc => { const cat = this.allCategories.find(c => c.id === dc.id); if (cat) cat.color = dc.color; });
      this.uiColors = JSON.parse(JSON.stringify(DEFAULT_UI_COLORS));
      this.updateCSSVars(); this.renderColorPanel(); this.renderEdges(); this.renderNodes(); this.renderHUD(); this.saveTree();
      new Notice('Cores resetadas.');
    });
  }

  // ─── Panel ────────────────────────────────────────────────────────────────
  renderPanel() {
    this.panelEl.empty();
    const catMap = {};
    this.allCategories.forEach(c => { catMap[c.id] = { label: c.label, nodes: [] }; });
    catMap['__outros__'] = { label: 'Outros', nodes: [] };
    this.tree.nodes.forEach(n => {
      if (catMap[n.category]) catMap[n.category].nodes.push(n);
      else catMap['__outros__'].nodes.push(n);
    });
    Object.entries(catMap).forEach(([, { label, nodes }]) => {
      if (!nodes.length) return;
      this.panelEl.createEl('h3', { text: label });
      nodes.forEach(node => {
        const item = this.panelEl.createDiv({ cls: 'skill-panel-skill-item' });
        const iconWrap = item.createDiv({ cls: 'skill-panel-skill-icon' });
        iconWrap.innerHTML = getIcon(node.iconId || node.id);
        const svgEl2 = iconWrap.querySelector('svg');
        if (svgEl2) {
          svgEl2.style.cssText = `width:14px;height:14px;color:${node.state === 'mastered' ? '#4dd9e8' : node.state === 'unlocked' ? '#e8c84a' : 'rgba(255,255,255,0.35)'};`;
        }
        item.createSpan({ cls: 'skill-panel-skill-name', text: node.name });
        item.createSpan({ cls: `skill-panel-skill-badge ${node.state}`, text: node.state });
        item.addEventListener('click', () => this.centerOnNode(node));
      });
    });
  }

  // ─── Edges ────────────────────────────────────────────────────────────────
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
        const cc = this.catColor(this.getNodeCategoryId(node));
        const isActive = stateClass === 'unlocked' || stateClass === 'mastered';
        const isMastered = stateClass === 'mastered';

        const fromR = getNodeSize(from).px / 2;
        const toR = getNodeSize(node).px / 2;
        const dx = node.x - from.x, dy = node.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const x1 = from.x + (dx / dist) * fromR, y1 = from.y + (dy / dist) * fromR;
        const x2 = node.x - (dx / dist) * toR, y2 = node.y - (dy / dist) * toR;

        const cy1 = y1 + (y2 - y1) * 0.45;
        const cy2 = y2 - (y2 - y1) * 0.45;
        const d = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;

        if (isActive) {
          this.svgEl.appendChild(svgEl('path', { class: 'skill-connection-glow2', d, stroke: cc.stroke }));
          this.svgEl.appendChild(svgEl('path', { class: 'skill-connection-glow', d, stroke: cc.stroke, filter: 'url(#edge-glow)' }));
        }

        const strokeW = isMastered ? 7 : isActive ? 5 : stateClass === 'available' ? 2.5 : 1.5;
        const strokeCol = isActive ? cc.stroke : stateClass === 'available' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)';
        this.svgEl.appendChild(svgEl('path', {
          class: `skill-connection ${stateClass}`, d,
          stroke: strokeCol, 'stroke-width': strokeW,
          'data-from': from.id, 'data-to': node.id,
        }));
      });
    });
  }

  // ─── Nodes ────────────────────────────────────────────────────────────────
  renderNodes() {
    this.worldEl.empty();
    this.tree.nodes.forEach(node => this.renderNode(node));
  }

  renderNode(node) {
    const effectiveCatId = this.getNodeCategoryId(node);
    const cc = this.catColor(effectiveCatId);
    const isDaily = node.id === this.dailyNodeId;
    const sz = getNodeSize(node);

    const el = this.worldEl.createDiv({
      cls: `skill-node ${node.state}${this.editMode ? ' edit-mode' : ''}${isDaily ? ' daily-highlight' : ''}`
    });
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.style.setProperty('--node-color', cc.stroke);
    el.style.setProperty('--node-glow', cc.glow);
    el.style.setProperty('--node-glow2', cc.glow2);
    el.dataset.id = node.id;
    el.dataset.size = node.size || 'small';

    const circle = el.createDiv({ cls: 'skill-node-circle' });
    circle.style.width = `${sz.px}px`;
    circle.style.height = `${sz.px}px`;

    // SVG icon
    const iconWrapper = circle.createDiv({ cls: 'node-svg-icon' });
    iconWrapper.style.width = `${sz.iconSize}px`;
    iconWrapper.style.height = `${sz.iconSize}px`;
    iconWrapper.innerHTML = getIcon(node.iconId || node.id);
    const svgIcon = iconWrapper.querySelector('svg');
    if (svgIcon) {
      svgIcon.style.width = '100%';
      svgIcon.style.height = '100%';
      svgIcon.setAttribute('stroke-width', node.size === 'large' || node.size === 'xl' ? '1.2' : '1.5');
    }

    if (node.state === 'locked') {
      const lock = circle.createDiv({ cls: 'skill-node-lock' });
      lock.innerHTML = getIcon('lock');
    }

    if ((node.state === 'unlocked' || node.state === 'mastered') && node.maxLevel > 1 && node.level > 0) {
      const badge = circle.createDiv({ cls: 'skill-node-level-badge' });
      badge.style.background = cc.stroke;
      badge.style.width = `${sz.badgeSize + 7}px`;
      badge.style.height = `${sz.badgeSize + 7}px`;
      badge.style.fontSize = `${sz.badgeSize}px`;
      badge.textContent = String(node.level);
    }

    if (this.editMode) {
      const sizeBadge = circle.createDiv({ cls: 'skill-node-size-badge' });
      sizeBadge.textContent = (node.size || 'S')[0].toUpperCase();
    }

    if (node.cost > 0 && (node.state === 'available' || node.state === 'locked')) {
      const costEl = el.createDiv({ cls: 'skill-node-cost' });
      costEl.style.color = cc.stroke;
      costEl.textContent = `${node.cost}✦`;
      costEl.style.right = `-${sz.costOffset}px`;
    }

    const nameEl = el.createDiv({ cls: 'skill-node-name', text: node.name });
    nameEl.style.fontSize = `${sz.labelSize}px`;

    el.addEventListener('mouseenter', e => this.showTooltip(e, node));
    el.addEventListener('mouseleave', () => this.hideTooltip());
    el.addEventListener('mousemove', e => this.moveTooltip(e));
    el.addEventListener('click', e => { e.stopPropagation(); this.handleNodeClick(node); });
    if (this.editMode) this.makeDraggable(el, node);
  }

  // ─── Draggable ────────────────────────────────────────────────────────────
  makeDraggable(el, node) {
    el.addEventListener('mousedown', e => {
      if (!this.editMode || e.button !== 0) return;
      e.stopPropagation(); e.preventDefault();
      this.isDraggingNode = true;
      let moved = false;
      const sx = e.clientX, sy = e.clientY, snx = node.x, sny = node.y;
      const onMove = e2 => { moved = true; node.x = Math.round(snx + (e2.clientX - sx) / this.scale); node.y = Math.round(sny + (e2.clientY - sy) / this.scale); el.style.left = `${node.x}px`; el.style.top = `${node.y}px`; this.renderEdges(); };
      const onUp = () => { this.isDraggingNode = false; if (moved) this.saveTree(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ─── Node Click ───────────────────────────────────────────────────────────
  handleNodeClick(node) {
    this.hideTooltip();
    if (this.connectMode) {
      if (!this.connectFrom) { this.connectFrom = node.id; new Notice(`De "${node.name}" — clique no destino`); return; }
      if (this.connectFrom === node.id) { this.connectFrom = null; new Notice('Cancelado.'); return; }
      const src = this.tree.nodes.find(n => n.id === this.connectFrom); if (!src) { this.connectFrom = null; return; }
      if (wouldCreateCycle(this.tree.nodes, src.id, node.id)) { new Notice('Criaria um ciclo!'); this.connectFrom = null; return; }
      if (!node.requires.includes(src.id)) { node.requires.push(src.id); this.tree.nodes = computeStates(this.tree.nodes); this.renderEdges(); this.renderNodes(); this.saveTree(); new Notice('Conexão criada.'); }
      else new Notice('Conexão já existe.');
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
      new Notice(`${node.name} desbloqueada`);
    } else if (node.state === 'unlocked') {
      if (node.level >= node.maxLevel) { new Notice(`${node.name} já está no nível máximo`); return; }
      if (this.tree.points < node.cost) { new Notice(`Precisa de ${node.cost} pts para evoluir`); return; }
      this.tree.points -= node.cost; node.level++;
      if (node.level >= node.maxLevel) { node.state = 'mastered'; this.spawnParticles(node, '#4dd9e8'); new Notice(`${node.name} — DOMINADA!`); }
      else { this.spawnParticles(node, this.catColor(this.getNodeCategoryId(node)).stroke); new Notice(`${node.name} → nível ${node.level}`); }
      this.tree.nodes = computeStates(this.tree.nodes);
    } else if (node.state === 'mastered') { new Notice(`${node.name} já está dominada`); return; }
    this.saveTree(); this.checkAchievements();
    this.renderHUD(); this.renderEdges(); this.renderNodes(); this.renderPanel();
    if (this.statsPanelOpen) this.renderStatsPanel();
    if (this.dailyNodeId === node.id) this.renderDailyBanner();
  }

  // ─── Particles ────────────────────────────────────────────────────────────
  spawnParticles(node, color) {
    const el = this.worldEl.querySelector(`[data-id="${node.id}"]`); if (!el) return;
    const rect = (el.querySelector('.skill-node-circle') || el).getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      const sz = 2 + Math.random() * 5, angle = (i / 22) * Math.PI * 2, dist = 18 + Math.random() * 55;
      p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;background:${color};box-shadow:0 0 7px ${color};left:${cx + Math.cos(angle) * dist}px;top:${cy + Math.sin(angle) * dist}px;pointer-events:none;z-index:9999;animation:skillParticleFade ${0.4 + Math.random() * 0.7}s ease-out forwards;animation-delay:${Math.random() * 0.12}s;`;
      document.body.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 1200);
    }
  }

  // ─── Tooltip ──────────────────────────────────────────────────────────────
  showTooltip(e, node) {
    if (!this.tooltip) return;
    const stateLabels = { locked: 'BLOQUEADA', available: 'DISPONÍVEL', unlocked: 'DESBLOQUEADA', mastered: 'DOMINADA' };
    const effectiveCatId = this.getNodeCategoryId(node);
    const cc = this.catColor(effectiveCatId);
    const catDef = this.allCategories.find(c => c.id === effectiveCatId);
    const catLabel = catDef ? catDef.label : node.category;
    const reqNames = node.requires.map(id => { const n = this.tree.nodes.find(x => x.id === id); return n ? n.name : id; }).join(', ');
    const isDaily = node.id === this.dailyNodeId;
    const sizeLabels = { xs: 'XS', small: 'SM', medium: 'MD', large: 'LG', xl: 'XL' };
    let action = '';
    if (node.state === 'available') action = this.tree.points >= node.cost ? '<div class="skill-tooltip-action can-afford">CLIQUE PARA DESBLOQUEAR</div>' : '<div class="skill-tooltip-action cant-afford">PONTOS INSUFICIENTES</div>';
    else if (node.state === 'unlocked' && node.level < node.maxLevel) action = this.tree.points >= node.cost ? '<div class="skill-tooltip-action can-afford">CLIQUE PARA EVOLUIR</div>' : '<div class="skill-tooltip-action cant-afford">PONTOS INSUFICIENTES</div>';

    const iconSvg = getIcon(node.iconId || node.id);

    this.tooltip.innerHTML = `
      <div class="skill-tooltip-header">
        <div class="skill-tooltip-icon" style="color:${cc.stroke}">${iconSvg}</div>
        <div>
          <div class="skill-tooltip-title" style="color:${cc.stroke}">${node.name}${isDaily ? ' ·' : ''}</div>
          <div class="skill-tooltip-state">${stateLabels[node.state] || node.state} · ${catLabel} · ${sizeLabels[node.size] || 'SM'}</div>
        </div>
      </div>
      <div class="skill-tooltip-desc">${node.description}</div>
      <div class="skill-tooltip-stats">
        <div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Custo</div><div class="skill-tooltip-stat-val" style="color:${cc.stroke}">${node.cost}</div></div>
        <div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Pts</div><div class="skill-tooltip-stat-val">${this.tree.points}</div></div>
        ${node.maxLevel > 1 ? `<div class="skill-tooltip-stat"><div class="skill-tooltip-stat-label">Nível</div><div class="skill-tooltip-stat-val">${node.level}/${node.maxLevel}</div></div>` : ''}
      </div>
      ${reqNames ? `<div class="skill-tooltip-req">REQ: ${reqNames}</div>` : ''}
      ${action}
    `;
    this.moveTooltip(e); this.tooltip.classList.add('visible');
  }

  moveTooltip(e) { if (!this.tooltip) return; const tw = 230, th = 190; let x = e.clientX + 18, y = e.clientY + 18; if (x + tw > window.innerWidth) x = e.clientX - tw - 8; if (y + th > window.innerHeight) y = e.clientY - th - 8; this.tooltip.style.left = `${x}px`; this.tooltip.style.top = `${y}px`; }
  hideTooltip() { if (this.tooltip) this.tooltip.classList.remove('visible'); }

  // ─── Pan / Zoom ───────────────────────────────────────────────────────────
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
    const newScale = Math.min(Math.max(this.scale + delta, 0.15), 3);
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
    this.panX = rect.width / 2 - cx * this.scale;
    this.panY = rect.height / 2 - cy * this.scale;
    this.applyTransform();
  }

  centerOnNode(node) {
    const rect = this.contentEl.getBoundingClientRect();
    this.panX = rect.width / 2 - node.x * this.scale;
    this.panY = rect.height / 2 - node.y * this.scale;
    this.applyTransform(); this.closeAllRightPanels(); this.renderToolbar();
  }

  // ─── Modals ───────────────────────────────────────────────────────────────
  openAddNodeModal() {
    new AddNodeModal(this.app, this.getAllCategories(), data => {
      const node = {
        id: `skill_${Date.now()}`, name: data.name, iconId: data.iconId || 'star', description: data.description || '',
        x: Math.round((-this.panX + this.contentEl.clientWidth / 2) / this.scale),
        y: Math.round((-this.panY + this.contentEl.clientHeight / 2) / this.scale),
        state: 'locked', level: 0, maxLevel: parseInt(data.maxLevel) || 3,
        cost: parseInt(data.cost) || 2, requires: [],
        category: data.category || this.allCategories[0]?.id || 'physical',
        size: data.size || 'small',
      };
      this.tree.nodes.push(node);
      this.tree.nodes = computeStates(this.tree.nodes);
      this.renderEdges(); this.renderNodes(); this.renderPanel(); this.saveTree();
    }).open();
  }

  openEditNodeModal(node) {
    new EditNodeModal(this.app, node, this.tree.nodes, this.getAllCategories(), (action, data) => {
      if (action === 'delete') { this.tree.nodes = this.tree.nodes.filter(n => n.id !== node.id); this.tree.nodes.forEach(n => { n.requires = n.requires.filter(r => r !== node.id); }); }
      else if (action === 'save') { Object.assign(node, data); node.cost = parseInt(data.cost) || node.cost; node.maxLevel = parseInt(data.maxLevel) || node.maxLevel; node.size = data.size || node.size || 'small'; if (node.level > node.maxLevel) node.level = node.maxLevel; }
      else if (action === 'reset') { this.tree.points += node.cost * node.level; node.level = 0; node.state = 'available'; }
      this.tree.nodes = computeStates(this.tree.nodes);
      this.renderHUD(); this.renderEdges(); this.renderNodes(); this.renderPanel(); this.saveTree(); this.checkAchievements();
    }).open();
  }
}

// ─── Size Picker ──────────────────────────────────────────────────────────────
function renderSizePicker(container, currentSize, onChange) {
  const sizes = [
    { id: 'xs', label: 'XS' },
    { id: 'small', label: 'SM' },
    { id: 'medium', label: 'MD' },
    { id: 'large', label: 'LG' },
    { id: 'xl', label: 'XL' },
  ];
  container.empty();
  container.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;';
  sizes.forEach(s => {
    const sz = NODE_SIZES[s.id];
    const opt = container.createDiv({ cls: `skill-size-option${currentSize === s.id ? ' selected' : ''}` });
    const circ = opt.createDiv({ cls: 'skill-size-option-circle' });
    const cSz = Math.min(sz.px, 44);
    circ.style.width = `${cSz}px`;
    circ.style.height = `${cSz}px`;
    circ.innerHTML = getIcon('power');
    const sv = circ.querySelector('svg');
    if (sv) { sv.style.width = `${Math.min(sz.iconSize, 20)}px`; sv.style.height = `${Math.min(sz.iconSize, 20)}px`; }
    opt.createDiv({ cls: 'skill-size-option-label', text: s.label });
    opt.addEventListener('click', () => {
      container.querySelectorAll('.skill-size-option').forEach(el => el.removeClass('selected'));
      opt.addClass('selected'); onChange(s.id);
    });
  });
}

// ─── Category Modal ───────────────────────────────────────────────────────────

class CategoryModal extends Modal {
  constructor(app, allCategories, allNodes, onSave) {
    super(app);
    this.categories = JSON.parse(JSON.stringify(allCategories));
    this.allNodes = allNodes;
    this.onSave = onSave;
  }

  getUsedCategoryIds() {
    const used = new Set();
    this.allNodes.forEach(n => used.add(n.category));
    return used;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('skill-modal-v2');
    injectModalV2CSS();

    // ── Header ──
    const hdr = contentEl.createDiv({ cls: 'smv2-header' });
    hdr.createDiv({ cls: 'smv2-title', text: 'CATEGORIAS' });
    const countEl = hdr.createDiv({ cls: 'smv2-id' });

    // ── Body ──
    const body = contentEl.createDiv({ cls: 'smv2-body' });
    body.style.maxHeight = 'calc(100vh - 190px)';
    const listWrap = body.createDiv();

    const renderList = () => {
      listWrap.empty();
      countEl.textContent = `${this.categories.length} categorias`;
      const used = this.getUsedCategoryIds();
      const builtins = this.categories.filter(c => c.builtIn);
      const customs = this.categories.filter(c => !c.builtIn);

      const renderSection = (items, sectionLabel) => {
        if (!items.length) return;
        const lbl = listWrap.createDiv({ cls: 'smv2-label', text: sectionLabel });
        lbl.style.marginBottom = '6px';
        const list = listWrap.createDiv({ cls: 'smv2-cat-list' });
        list.style.marginBottom = '10px';
        items.forEach(cat => this._renderItem(list, cat, used, renderList));
      };

      renderSection(builtins, 'Padrão');
      renderSection(customs, 'Customizadas');

      if (!this.categories.length) {
        const empty = listWrap.createDiv({ cls: 'smv2-req-empty', text: 'Adicione pelo menos uma categoria.' });
        empty.style.padding = '8px 0';
      }

      // Add row
      const addLbl = listWrap.createDiv({ cls: 'smv2-label', text: '+ Nova Categoria' });
      addLbl.style.marginTop = '4px';
      const addRow = listWrap.createDiv({ cls: 'smv2-cat-add-row' });
      let newColor = '#7b61ff';

      const swatchWrap = addRow.createDiv({ cls: 'smv2-cat-add-swatch' });
      swatchWrap.style.background = newColor;
      const colorIn = swatchWrap.createEl('input');
      colorIn.type = 'color'; colorIn.value = newColor;
      colorIn.addEventListener('input', e => { newColor = e.target.value; swatchWrap.style.background = newColor; });

      const nameIn = addRow.createEl('input', { cls: 'smv2-cat-add-input' });
      nameIn.placeholder = 'Nome da categoria...';

      const addBtn = addRow.createEl('button', { cls: 'smv2-cat-add-btn', text: '+ ADD' });
      const doAdd = () => {
        const name = nameIn.value.trim();
        if (!name) { new Notice('Nome obrigatório.'); return; }
        const id = 'cat_' + name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        this.categories.push({ id, label: name, icon: '', color: newColor, builtIn: false });
        nameIn.value = '';
        renderList();
      };
      addBtn.addEventListener('click', doAdd);
      nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
    };

    renderList();

    // ── Footer ──
    const footer = contentEl.createDiv({ cls: 'smv2-footer' });
    footer.createDiv({ cls: 'smv2-footer-left' });
    const right = footer.createDiv({ cls: 'smv2-footer-right' });
    right.createEl('button', { cls: 'smv2-btn secondary', text: 'Cancelar' })
      .addEventListener('click', () => this.close());
    right.createEl('button', { cls: 'smv2-btn primary', text: 'Salvar' })
      .addEventListener('click', () => {
        if (!this.categories.length) { new Notice('Precisa de pelo menos uma categoria.'); return; }
        this.onSave(this.categories);
        this.close();
        new Notice('Categorias salvas!');
      });
  }

  _renderItem(container, cat, usedIds, onUpdate) {
    const isInUse = usedIds.has(cat.id);
    const isOnly = this.categories.length <= 1;
    const canDel = !isOnly && !isInUse;

    const item = container.createDiv({ cls: `smv2-cat-item${cat.builtIn ? ' builtin' : ''}` });

    const swatch = item.createDiv({ cls: 'smv2-cat-swatch' });
    swatch.style.background = cat.color || '#e8c84a';
    const colorIn = swatch.createEl('input');
    colorIn.type = 'color';
    colorIn.value = cat.color?.startsWith('#') ? cat.color : '#e8c84a';
    colorIn.addEventListener('input', e => { cat.color = e.target.value; swatch.style.background = cat.color; });

    const nameIn = item.createEl('input', { cls: 'smv2-cat-name-edit' });
    nameIn.value = cat.label;
    nameIn.addEventListener('input', e => { cat.label = e.target.value || cat.label; });

    if (isInUse) item.createDiv({ cls: 'smv2-cat-inuse-tag', text: 'em uso' });

    const delBtn = item.createEl('button', { cls: 'smv2-cat-del', text: '×' });
    delBtn.disabled = !canDel;
    delBtn.title = isOnly
      ? 'Precisa de pelo menos uma categoria'
      : isInUse ? 'Reatribua as skills antes de deletar' : 'Deletar';
    delBtn.addEventListener('click', () => {
      if (!canDel) { new Notice(isInUse ? 'Em uso — reatribua primeiro.' : 'Precisa de pelo menos uma.'); return; }
      const idx = this.categories.indexOf(cat);
      if (idx >= 0) { this.categories.splice(idx, 1); onUpdate(); }
    });
  }

  onClose() { this.contentEl.empty(); }
}

function injectModalV2CSS() {
  if (document.getElementById('skill-modal-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'skill-modal-v2-styles';
  style.textContent = MODAL_CSS_V2;
  document.head.appendChild(style);
}

function buildNodeFormUI(contentEl, data, allCategories, allNodes, nodeToEdit) {
  // Icon keys to expose in picker (skip pure-UI icons)
  const PICKER_ICONS = Object.keys(ICONS).filter(k => ![
    'lock', 'unlock', 'chart', 'palette', 'list', 'center', 'edit', 'link',
    'plus', 'folder', 'flip', 'coins', 'wallet', 'hourglass'
  ].includes(k));

  const NODE_SIZES_LIST = [
    { id: 'xs', label: 'XS', px: 28, icon: 12 },
    { id: 'small', label: 'SM', px: 38, icon: 16 },
    { id: 'medium', label: 'MD', px: 52, icon: 22 },
    { id: 'large', label: 'LG', px: 68, icon: 28 },
    { id: 'xl', label: 'XL', px: 90, icon: 36 },
  ];

  // ── Live preview strip ──
  const preview = contentEl.createDiv({ cls: 'smv2-preview' });
  const previewCircle = preview.createDiv({ cls: 'smv2-preview-circle' });
  const previewInfo = preview.createDiv({ cls: 'smv2-preview-info' });
  const previewName = previewInfo.createDiv({ cls: 'smv2-preview-name' });
  const previewMeta = previewInfo.createDiv({ cls: 'smv2-preview-meta' });
  const previewCat = previewMeta.createDiv({ cls: 'smv2-preview-cat' });
  const previewCost = previewMeta.createDiv({ cls: 'smv2-preview-cost' });
  const previewSz = previewMeta.createDiv({ cls: 'smv2-preview-sz' });

  function refreshPreview() {
    const cat = allCategories.find(c => c.id === data.category);
    const color = cat?.color || '#e8c84a';
    const glow = hexToRgba(color, 0.38);
    const glow2 = hexToRgba(color, 0.12);
    const bg = hexToRgba(color, 0.06);
    preview.style.setProperty('--preview-color', color);
    preview.style.setProperty('--preview-glow', glow);
    preview.style.setProperty('--preview-glow2', glow2);
    preview.style.setProperty('--preview-bg', bg);
    previewCircle.innerHTML = getIcon(data.iconId || 'star');
    const sv = previewCircle.querySelector('svg');
    if (sv) { sv.style.width = '24px'; sv.style.height = '24px'; }
    previewName.textContent = data.name || 'NOVA SKILL';
    previewName.style.color = data.name ? '#fff' : 'rgba(255,255,255,0.2)';
    previewCat.textContent = cat?.label || '—';
    previewCat.style.setProperty('--preview-color', color);
    previewCost.textContent = data.cost ? `${data.cost} ✦` : '';
    previewSz.textContent = (data.size || 'SM').toUpperCase();
  }
  refreshPreview();

  // ── Scrollable body ──
  const body = contentEl.createDiv({ cls: 'smv2-body' });

  // Name
  const nameField = body.createDiv({ cls: 'smv2-field' });
  nameField.createDiv({ cls: 'smv2-label', text: 'Nome' });
  const nameInput = nameField.createEl('input', { cls: 'smv2-input' });
  nameInput.value = data.name || '';
  nameInput.placeholder = 'Nome da skill...';
  nameInput.addEventListener('input', e => { data.name = e.target.value; refreshPreview(); });
  setTimeout(() => nameInput.focus(), 80);

  // Description
  const descField = body.createDiv({ cls: 'smv2-field' });
  descField.createDiv({ cls: 'smv2-label', text: 'Descrição' });
  const descInput = descField.createEl('textarea', { cls: 'smv2-textarea' });
  descInput.value = data.description || '';
  descInput.placeholder = 'Descreva essa skill...';
  descInput.addEventListener('input', e => { data.description = e.target.value; });

  // Cost + MaxLevel (two-column)
  const metaRow = body.createDiv({ cls: 'smv2-row' });
  const costF = metaRow.createDiv({ cls: 'smv2-field' });
  costF.createDiv({ cls: 'smv2-label', text: 'Custo' });
  const costInput = costF.createEl('input', { cls: 'smv2-num-input' });
  costInput.type = 'number'; costInput.min = '0';
  costInput.value = String(data.cost || 2);
  costInput.addEventListener('input', e => { data.cost = e.target.value; refreshPreview(); });

  const maxF = metaRow.createDiv({ cls: 'smv2-field' });
  maxF.createDiv({ cls: 'smv2-label', text: 'Nível Máx' });
  const maxInput = maxF.createEl('input', { cls: 'smv2-num-input' });
  maxInput.type = 'number'; maxInput.min = '1';
  maxInput.value = String(data.maxLevel || 3);
  maxInput.style.color = '#4dd9e8';
  maxInput.addEventListener('input', e => { data.maxLevel = e.target.value; });

  // Icon grid
  const iconField = body.createDiv({ cls: 'smv2-field' });
  iconField.createDiv({ cls: 'smv2-label', text: 'Ícone' });
  const iconGrid = iconField.createDiv({ cls: 'smv2-icon-grid' });
  PICKER_ICONS.forEach(key => {
    const item = iconGrid.createDiv({
      cls: `smv2-icon-item${data.iconId === key ? ' selected' : ''}`
    });
    item.innerHTML = getIcon(key);
    const sv = item.querySelector('svg');
    if (sv) {
      sv.style.width = '14px';
      sv.style.height = '14px';
      sv.removeAttribute('width');
      sv.removeAttribute('height');
    }
    item.title = key;
    item.addEventListener('click', () => {
      iconGrid.querySelectorAll('.smv2-icon-item').forEach(el => el.removeClass('selected'));
      item.addClass('selected');
      data.iconId = key;
      refreshPreview();
    });
  });

  // Category chips
  const catField = body.createDiv({ cls: 'smv2-field' });
  catField.createDiv({ cls: 'smv2-label', text: 'Categoria' });
  const catChips = catField.createDiv({ cls: 'smv2-cat-chips' });
  function renderCatChips() {
    catChips.empty();
    allCategories.forEach(cat => {
      const color = cat.color || '#e8c84a';
      const isSel = data.category === cat.id;
      const chip = catChips.createDiv({ cls: `smv2-cat-chip${isSel ? ' selected' : ''}` });
      chip.style.setProperty('--chip-color', color);
      chip.style.setProperty('--chip-bg', hexToRgba(color, 0.08));
      const dot = chip.createDiv({ cls: 'smv2-cat-dot' });
      dot.style.background = color;
      chip.createSpan({ text: cat.label });
      chip.addEventListener('click', () => {
        data.category = cat.id;
        renderCatChips();
        refreshPreview();
      });
    });
  }
  renderCatChips();

  // Size picker
  const sizeField = body.createDiv({ cls: 'smv2-field' });
  sizeField.createDiv({ cls: 'smv2-label', text: 'Tamanho' });
  const sizeRow = sizeField.createDiv({ cls: 'smv2-size-row' });
  NODE_SIZES_LIST.forEach(s => {
    const opt = sizeRow.createDiv({ cls: `smv2-size-opt${data.size === s.id ? ' selected' : ''}` });
    const circSz = Math.min(s.px, 40);
    const circle = opt.createDiv({ cls: 'smv2-size-circle' });
    circle.style.width = `${circSz}px`;
    circle.style.height = `${circSz}px`;
    circle.innerHTML = getIcon('power');
    const sv = circle.querySelector('svg');
    if (sv) {
      const iSz = Math.min(s.icon, 18);
      sv.style.width = `${iSz}px`;
      sv.style.height = `${iSz}px`;
    }
    opt.createDiv({ cls: 'smv2-size-lbl', text: s.label });
    opt.addEventListener('click', () => {
      sizeRow.querySelectorAll('.smv2-size-opt').forEach(el => el.removeClass('selected'));
      opt.addClass('selected');
      data.size = s.id;
      refreshPreview();
    });
  });

  // Prerequisites (edit mode only — skip when nodeToEdit is null)
  if (allNodes && nodeToEdit) {
    const reqField = body.createDiv({ cls: 'smv2-field' });
    reqField.createDiv({ cls: 'smv2-label', text: 'Pré-requisitos' });
    const reqTags = reqField.createDiv({ cls: 'smv2-req-tags' });

    function renderReqTags() {
      reqTags.empty();
      if (!nodeToEdit.requires.length) {
        reqTags.createDiv({ cls: 'smv2-req-empty', text: 'Sem pré-requisitos' });
      }
      nodeToEdit.requires.forEach(reqId => {
        const req = allNodes.find(x => x.id === reqId);
        const tag = reqTags.createDiv({ cls: 'smv2-req-tag' });
        tag.createSpan({ text: req ? req.name : reqId });
        const rm = tag.createEl('button', { cls: 'smv2-req-rm', text: '×' });
        rm.addEventListener('click', () => {
          nodeToEdit.requires = nodeToEdit.requires.filter(r => r !== reqId);
          renderReqTags();
        });
      });
    }
    renderReqTags();

    const others = allNodes.filter(x =>
      x.id !== nodeToEdit.id && !nodeToEdit.requires.includes(x.id)
    );
    if (others.length) {
      const sel = reqField.createEl('select', { cls: 'smv2-req-select' });
      sel.createEl('option', { value: '', text: '+ Adicionar pré-requisito...' });
      others.forEach(x => sel.createEl('option', { value: x.id, text: x.name }));
      sel.addEventListener('change', () => {
        if (sel.value) {
          nodeToEdit.requires.push(sel.value);
          renderReqTags();
          // Remove the just-added option so it can't be added twice
          Array.from(sel.options).forEach(opt => {
            if (opt.value && nodeToEdit.requires.includes(opt.value)) opt.remove();
          });
          sel.value = '';
        }
      });
    }
  }
}


// ─── Add Node Modal ───────────────────────────────────────────────────────────
class AddNodeModal extends Modal {
  constructor(app, allCategories, onSubmit) {
    super(app);
    this.allCategories = allCategories;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('skill-modal-v2');
    injectModalV2CSS();

    const data = {
      name: '', iconId: 'star', description: '',
      cost: '2', maxLevel: '3',
      category: this.allCategories[0]?.id || 'physical',
      size: 'small',
    };

    // Header
    const hdr = contentEl.createDiv({ cls: 'smv2-header' });
    hdr.createDiv({ cls: 'smv2-title', text: 'NOVA SKILL' });

    // Form (no nodeToEdit — no prerequisites section)
    buildNodeFormUI(contentEl, data, this.allCategories, null, null);

    // Footer
    const footer = contentEl.createDiv({ cls: 'smv2-footer' });
    footer.createDiv({ cls: 'smv2-footer-left' }); // empty left side
    const right = footer.createDiv({ cls: 'smv2-footer-right' });
    right.createEl('button', { cls: 'smv2-btn secondary', text: 'Cancelar' })
      .addEventListener('click', () => this.close());
    right.createEl('button', { cls: 'smv2-btn primary', text: 'Criar Skill' })
      .addEventListener('click', () => {
        if (!data.name.trim()) { new Notice('Nome obrigatório'); return; }
        this.onSubmit(data);
        this.close();
      });
  }
  onClose() { this.contentEl.empty(); }
}

// ─── Edit Node Modal ──────────────────────────────────────────────────────────
class EditNodeModal extends Modal {
  constructor(app, node, allNodes, allCategories, onAction) {
    super(app);
    this.node = node;
    this.allNodes = allNodes;
    this.allCategories = allCategories;
    this.onAction = onAction;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('skill-modal-v2');
    injectModalV2CSS();

    const n = this.node;
    const data = {
      name: n.name,
      iconId: n.iconId || n.id,
      description: n.description || '',
      cost: String(n.cost),
      maxLevel: String(n.maxLevel),
      category: n.category,
      size: n.size || 'small',
    };

    // Header
    const hdr = contentEl.createDiv({ cls: 'smv2-header' });
    hdr.createDiv({ cls: 'smv2-title', text: 'EDITAR SKILL' });
    hdr.createDiv({ cls: 'smv2-id', text: `id: ${n.id}` });

    // Form (pass nodeToEdit so prerequisites section renders)
    buildNodeFormUI(contentEl, data, this.allCategories, this.allNodes, n);

    // Footer
    const footer = contentEl.createDiv({ cls: 'smv2-footer' });
    const left = footer.createDiv({ cls: 'smv2-footer-left' });
    left.createEl('button', { cls: 'smv2-btn ghost', text: 'Resetar' })
      .addEventListener('click', () => { this.onAction('reset', data); this.close(); });
    left.createEl('button', { cls: 'smv2-btn danger', text: 'Deletar' })
      .addEventListener('click', () => {
        if (confirm(`Deletar "${n.name}"?`)) { this.onAction('delete', null); this.close(); }
      });
    const right = footer.createDiv({ cls: 'smv2-footer-right' });
    right.createEl('button', { cls: 'smv2-btn secondary', text: 'Cancelar' })
      .addEventListener('click', () => this.close());
    right.createEl('button', { cls: 'smv2-btn primary', text: 'Salvar' })
      .addEventListener('click', () => { this.onAction('save', data); this.close(); });
  }
  onClose() { this.contentEl.empty(); }
}

// ─── Pomodoro Modal ───────────────────────────────────────────────────────────

class PomodoroSetupModal extends Modal {
  constructor(app, nodes, pomo, onStart) {
    super(app);
    this.nodes = nodes;
    this.pomo = pomo;
    this.onStart = onStart;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('skill-modal-v2');
    injectModalV2CSS();

    let selectedId = this.pomo.targetNodeId || null;
    let workMin = this.pomo.workMin || 25;
    let breakMin = this.pomo.breakMin || 5;

    const ROOTS = ['conditioning', 'mobility', 'survival'];
    const pickable = this.nodes.filter(n => !ROOTS.includes(n.id));

    // ── Header ──
    const hdr = contentEl.createDiv({ cls: 'smv2-header' });
    hdr.createDiv({ cls: 'smv2-title', text: 'MODO FOCO' });

    // ── Body ──
    const body = contentEl.createDiv({ cls: 'smv2-body' });
    body.style.maxHeight = 'calc(100vh - 190px)';

    // — Duration —
    const timeField = body.createDiv({ cls: 'smv2-field' });
    timeField.createDiv({ cls: 'smv2-label', text: 'Duração' });
    const timeRow = timeField.createDiv({ cls: 'smv2-pomo-time-row' });

    const mkStep = (parent, label, delta, valEl, getV, setV, min, max) => {
      const btn = parent.createEl('button', { cls: 'smv2-pomo-step', text: label });
      btn.addEventListener('click', () => {
        const next = Math.min(Math.max(getV() + delta, min), max);
        setV(next); valEl.textContent = String(next);
      });
    };

    // Work
    const workBox = timeRow.createDiv({ cls: 'smv2-pomo-time-box' });
    workBox.createDiv({ cls: 'smv2-pomo-time-lbl', text: 'Foco (min)' });
    const workVal = workBox.createDiv({ cls: 'smv2-pomo-time-val', text: String(workMin) });
    const ws = workBox.createDiv({ cls: 'smv2-pomo-stepper' });
    mkStep(ws, '−', -5, workVal, () => workMin, v => { workMin = v; }, 5, 90);
    mkStep(ws, '+', +5, workVal, () => workMin, v => { workMin = v; }, 5, 90);

    // Break
    const breakBox = timeRow.createDiv({ cls: 'smv2-pomo-time-box' });
    breakBox.createDiv({ cls: 'smv2-pomo-time-lbl', text: 'Pausa (min)' });
    const breakVal = breakBox.createDiv({ cls: 'smv2-pomo-time-val break', text: String(breakMin) });
    const bs = breakBox.createDiv({ cls: 'smv2-pomo-stepper' });
    mkStep(bs, '−', -1, breakVal, () => breakMin, v => { breakMin = v; }, 1, 30);
    mkStep(bs, '+', +1, breakVal, () => breakMin, v => { breakMin = v; }, 1, 30);

    // — Skill selector —
    const skillField = body.createDiv({ cls: 'smv2-field' });
    skillField.createDiv({ cls: 'smv2-label', text: 'Skill de Foco' });

    const freeOpt = skillField.createDiv({
      cls: `smv2-pomo-free${selectedId === null ? ' selected' : ''}`
    });
    freeOpt.createDiv({ cls: 'smv2-pomo-free-icon', text: '🍅' });
    freeOpt.createDiv({ cls: 'smv2-pomo-free-lbl', text: 'Foco Livre' });
    freeOpt.addEventListener('click', () => { selectedId = null; refresh(); });

    const grid = skillField.createDiv({ cls: 'smv2-pomo-grid' });

    const refresh = () => {
      freeOpt.classList.toggle('selected', selectedId === null);
      grid.querySelectorAll('.smv2-pomo-node').forEach(el => {
        el.classList.toggle('selected', el.dataset.nid === selectedId);
      });
    };

    pickable.forEach(node => {
      const item = grid.createDiv({
        cls: `smv2-pomo-node${selectedId === node.id ? ' selected' : ''}`
      });
      item.dataset.nid = node.id;
      const ic = item.createDiv({ cls: 'smv2-pomo-node-ic' });
      ic.innerHTML = getIcon(node.iconId || node.id);
      const sv = ic.querySelector('svg');
      if (sv) { sv.style.width = '10px'; sv.style.height = '10px'; }
      item.createDiv({ cls: 'smv2-pomo-node-nm', text: node.name });
      item.addEventListener('click', () => { selectedId = node.id; refresh(); });
    });

    // ── Footer ──
    const footer = contentEl.createDiv({ cls: 'smv2-footer' });
    footer.createDiv({ cls: 'smv2-footer-left' });
    const right = footer.createDiv({ cls: 'smv2-footer-right' });
    right.createEl('button', { cls: 'smv2-btn secondary', text: 'Cancelar' })
      .addEventListener('click', () => this.close());
    right.createEl('button', { cls: 'smv2-btn primary', text: 'Iniciar' })
      .addEventListener('click', () => {
        this.onStart(selectedId, workMin, breakMin);
        this.close();
      });
  }

  onClose() { this.contentEl.empty(); }
}


// ─── Settings Tab ─────────────────────────────────────────────────────────────
class SkillTreeSettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this; containerEl.empty();
    containerEl.createEl('h2', { text: 'Skill Tree — Settings' });
    new Setting(containerEl).setName('Nome da Árvore').addText(t => { t.setValue(this.plugin.settings.trees?.default?.name || 'Skill Tree'); t.onChange(async v => { if (this.plugin.settings.trees?.default) { this.plugin.settings.trees.default.name = v; await this.plugin.saveSettings(); } }); });
    new Setting(containerEl).setName('Resetar Árvore').setDesc('Apaga todo progresso.').addButton(btn => { btn.setButtonText('Resetar').setWarning(); btn.onClick(async () => { delete this.plugin.settings.trees['default']; await this.plugin.saveSettings(); new Notice('Árvore resetada — reabra a view.'); }); });
    new Setting(containerEl).setName('Resetar Cores').addButton(btn => { btn.setButtonText('Resetar Cores').setWarning(); btn.onClick(async () => { delete this.plugin.settings.uiColors; await this.plugin.saveSettings(); new Notice('Cores resetadas.'); }); });
    new Setting(containerEl).setName('Resetar Conquistas').addButton(btn => { btn.setButtonText('Resetar').setWarning(); btn.onClick(async () => { this.plugin.settings.achievements = {}; await this.plugin.saveSettings(); new Notice('Conquistas resetadas.'); }); });
    new Setting(containerEl).setName('Resetar Categorias').addButton(btn => { btn.setButtonText('Resetar').setWarning(); btn.onClick(async () => { this.plugin.settings.allCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)); await this.plugin.saveSettings(); new Notice('Categorias restauradas.'); }); });
  }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────
class SkillTreePlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE_SKILL_TREE, leaf => new SkillTreeView(leaf, this));
    this.addRibbonIcon('star', 'Skill Tree', () => this.activateView());
    this.addCommand({ id: 'open-skill-tree', name: 'Abrir Skill Tree', callback: () => this.activateView() });
    this.addSettingTab(new SkillTreeSettingTab(this.app, this));
  }
  onunload() {
    ['skill-tree-plugin-styles', 'skill-tree-plugin-styles-v8', 'skill-tree-plugin-styles-v81', 'skill-modal-v2-styles'].forEach(id => {
      const el = document.getElementById(id); if (el) el.remove();
    });
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
      allCategories: null, uiColors: null,
      achievements: {}, pomo: { totalDone: 0 },
      dailySkill: null, dailyUsed: false,
    }, await this.loadData());
  }
  async saveSettings() { await this.saveData(this.settings); }
}

module.exports = SkillTreePlugin;


#  Skill Tree — Obsidian Plugin

> Turn your learning and personal development into a visual RPG inside Obsidian.
>
> 
## Preview

An interactive skill tree with connected nodes, glow effects, unlock particles and an RPG-style HUD — all running inside Obsidian.

---

## ✨ Features

###  Interactive Skill Tree
- Fully navigable skill tree with **pan** and **zoom**
- Nodes with 5 sizes (`XS`, `SM`, `MD`, `LG`, `XL`)
- States: `Locked → Available → Unlocked → Mastered`
- Bézier curve connections with **glow effects** per category
- Animated particles when unlocking a skill
- Flippable layout (roots at top or bottom)

###  Customizable Categories
- 4 default categories: **Physical**, **Core**, **Mental**, **Creative**
- Create, rename and delete custom categories
- Independent color per category (affects nodes and connections)

###  Achievements
- 12+ automatically unlockable achievements
- Animated toast notifications when earning an achievement
- Dedicated panel with overall progress

###  Built-in Pomodoro Timer
- Pomodoro timer linked to a specific skill
- Phases: **Focus → Break → Long Break** (after 4 sessions)
- Bonus points every 2 completed sessions
- Session history tracked in the stats panel

###  Statistics
- Overview panel: unlocked, mastered, progress %
- Progress bars per category
- Pomodoro session counters and total time

###  Skill of the Day
- A random skill is drawn daily
- Highlighted with a special purple border on the tree
- Quick navigation button to jump to the daily skill

###  Color Customization
- Change any category color in real time
- Customize background, HUD, toolbar, nodes and indicators
- Reset button to restore the default theme

###  Edit Mode
- Freely drag nodes across the canvas
- Edit name, icon, description, cost, max level and category
- Create or remove connections between nodes (with cycle detection)
- Delete or reset progress of individual skills
- Add new skills with a chosen SVG icon

---

## 📁 Project Structure

```
skill-tree/
├── main.js          # Core plugin (logic, view, modals)
├── manifest.json    # Plugin metadata for Obsidian
├── styles.css       # Global styles (optional, already embedded)
└── data.json        # Data saved automatically by Obsidian
```

---

##  Manual Installation

1. Download the `main.js` and `manifest.json` files
2. Create the folder `.obsidian/plugins/skill-tree/` in your vault
3. Place the files inside that folder
4. In Obsidian: **Settings → Community Plugins → Enable** `Skill Tree`
5. Click the ⭐ icon in the sidebar or use the command `Open Skill Tree`

---

##  How to Use

### Navigation
| Action | How |
|--------|-----|
| Move around the tree | Click and drag the background |
| Zoom in/out | Mouse scroll |
| Center view | `CENTER` button or `⊙` |

### Unlocking Skills
1. Skills with a pulsing white border are **available**
2. Click an available skill to spend points and unlock it
3. Click again to level up (if `maxLevel > 1`)
4. Reaching max level marks the skill as **Mastered** 🔥

### Earning Points
- Click `+5 PTS` in the toolbar
- Complete Pomodoro sessions (+1 bonus point every 2 sessions)

### Edit Mode
- Toggle with the `EDIT` button in the toolbar
- Drag nodes, click to edit properties
- Use `LINK` to manually create connections between nodes

---

##  Tech Stack

- **Vanilla JS** — no external dependencies
- **SVG** — icons and connections drawn with pure SVG
- **Obsidian API** — `Plugin`, `ItemView`, `Modal`, `Setting`
- **CSS Custom Properties** — dynamic theming via CSS variables
- Fonts: [Rajdhani](https://fonts.google.com/specimen/Rajdhani) + [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)

---

## 🗺️ Default Tree

```
                        🌟 LEGEND
             /      /      |      \      \       \
         Athlete Warrior  Flow Precision Longevity Peak Mind
            ...          ...              ...
   Strength Cardio Speed  Flex. Balance Agility Health Recov. Resilience
        \      |     /       \     |    /          \      |      /
        CONDITIONING          MOBILITY              SURVIVAL
```

---

## 📝 License

MIT — feel free to use, modify and distribute.

---

<p align="center">Built with 🎮 for those who take personal development seriously.</p>

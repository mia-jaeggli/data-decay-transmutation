# Data Decay and Transmutation — Project Brief

## What This Is
A static generative art project site hosted on GitHub Pages.
Four projects, each with a dedicated page showing a live generative 
effect running on a source image. No user inputs beyond a Reset or 
Pause button.

## Tech Stack
- Plain HTML, CSS, JavaScript — no frameworks, no build tools
- Opens directly in the browser
- Hosted via GitHub Pages from the `main` branch

## Repository
https://github.com/mia-jaeggli/data-decay-transmutation

## File Structure
```
/
├── index.html              ← homepage (project gallery)
├── css/styles.css          ← shared styles for the whole site
├── js/
│   ├── main.js             ← shared utilities (carousel behaviour)
│   └── rd-engine.js        ← Gray-Scott simulation engine (shared
│                              by S05 Wave and S03 Pulsatilla)
├── s05-wave/
│   ├── index.html
│   └── sketch.js           ← wires RD engine to S05 parameters
├── s01b-acid-leaf/
│   ├── index.html
│   └── sketch.js           ← bit-flip glitch effect
├── s02b-moonshot/
│   ├── index.html
│   └── sketch.js           ← block-displace glitch effect
├── s03-pulsatilla/
│   ├── index.html
│   └── sketch.js           ← wires RD engine to S03 parameters
└── assets/
    ├── images/             ← bg + crop images per project
    └── thumbs/             ← 116×116px carousel thumbnails
```

## Design System

### Fonts (Google Fonts)
- Headings (h1, h2): Ubuntu Mono, 400
- Body: PT Sans, 400
- Labels: Ubuntu Sans Mono, 600

### Colour Tokens
```css
--near-black: #0D1820;
--dark-teal: #508991;
--light-teal: #75DDDD;
--near-white: #EBF2FA;
--gray-10: #CED7E1;
--acid-green: #A5BE00;
```

### Layout
- 4px grid system
- Main containers centre-aligned
- Optimised for iPad Pro 12.9" — responsive down to mobile

### Carousel Thumbnails
- 116×116px, border-radius 28px
- Acid green drop shadow: `3px 3px 0px var(--acid-green)`
- Active state: `filter: saturate(25%)`

## Project Pages — How They Work
1. Page loads with static background image filling outer container
2. Inner canvas sits centred on top — runs the live generative effect
3. 500ms delay before the effect starts (lets the user absorb the static)
4. Reset button restarts the effect from scratch
5. Pause button stops and resumes the animation loop
6. Carousel at the bottom navigates between projects

## The Four Projects

### S05 Wave (Reaction-Diffusion — Chaos)
- Background: `assets/images/S05-wave-bg.jpg`
- Crop for processing: `assets/images/S05-wave-crop.jpg`
- Engine: `js/rd-engine.js`
- Regime: Gray-Scott, feed 0.026, kill 0.051
- Seeding: edge, displacement: b-as-index, strength 18
- simScale 2, stepsPerFrame 6, accumulate: true

### S01b Acid Leaf (Glitch — Bit Flip)
- Background: `assets/images/S01b-acid-leaf-bg.JPEG`
- Crop: `assets/images/S01b-acid-leaf-crop.jpg`
- Operation: Signal noise, scanline pattern, bit-flip count 2900
- Accumulate: yes, speed: 300fps

### S02b Moonshot (Glitch — Block Displace)
- Background: `assets/images/S02b-moonshot-bg.jpg`
- Crop: `assets/images/S02b-moonshot-crop.JPEG`
- Operation: JPEG corrupt, block 89px, max shift 60px, horizontal only
- Accumulate: no, speed: 10fps

### S03 Pulsatilla (Reaction-Diffusion — Spots/Coral)
- Background: `assets/images/S03-pulsatilla-bg.jpg`
- Crop: `assets/images/S03-pulsatilla-crop.jpg`
- Engine: `js/rd-engine.js`
- Regime: Gray-Scott, feed 0.037, kill 0.065
- Seeding: brightness, displacement: b-gradient-inverse, strength 21
- simScale 2, stepsPerFrame 12, accumulate: true

## Reference Code
The Gray-Scott simulation engine is adapted from the existing
RD Simulator project (~/projects/RD-simulator/rd-studio.js).
The core engine lives at js/rd-engine.js in this project —
UI controls and parameter sliders have been removed; parameters
are baked in per-project inside each sketch.js.

The glitch effects (S01b, S02b) are implemented directly from
the parameter specs above — no shared engine file.

## Working Conventions
- Minimal, targeted changes — surgical edits over broad rewrites
- Explain the reasoning behind every decision, not just the decision
- One checkpoint at a time — confirm each step works before the next
- All CSS values use custom properties from the design system above
- No inline styles
- File and folder names: lowercase, hyphenated (kebab-case)
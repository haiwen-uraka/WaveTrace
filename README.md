<div align="center">

# 🌊 WaveTrace

**WebGL1 + MediaPipe Hands · Real-time Interactive Water Ripple Effect**

Turn your webcam feed into a deep blue ocean surface. Touch the water with your fingertips and create realistic water ripples.

[English](README.md) · [中文](README_zh.md)

</div>

---

## ✨ Features

- 🖐️ **Gesture-Driven** — Real-time five-finger tracking via MediaPipe Hands, each fingertip generates an independent water ripple
- 🌊 **Ocean Blue Tones** — Natural seawater blue-green rendering, with highlights at ripple points and smooth transitions when calm
- ⏱️ **Realistic Physics** — 9-tap Laplacian water wave simulation based on the wave equation, with ~1 second natural decay
- 🖱️ **Graceful Fallback** — Automatically falls back to mouse/touch interaction when no camera is available
- 📱 **Responsive Fullscreen** — Adapts to any screen size, supports Retina high-DPI rendering
- 🚀 **Zero Dependencies, Single File** — Runs from a single HTML file with no build step required

---

## 🎬 Preview

<div align="center">
  <img src="docs/preview.gif" alt="WaveTrace Preview" width="600"/>
</div>

---

## 🚀 Quick Start

### Try It Online

Simply open `water-ripple.html` in your browser.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/<your-username>/WaveTrace.git
cd WaveTrace

# Serve with any static server (HTTPS required for camera access)
npx serve .
# or
python -m http.server 8080
```

> **Note**: Browsers require `https://` or `localhost` to access the webcam.

### Project Structure

```
WaveTrace/
├── water-ripple.html      # Single-file app containing all code
└── server.js              # Optional static file server
```

---

## 🎮 Usage

| Action | Effect |
|--------|--------|
| Raise hand with fingers spread | Each fingertip creates a water ripple |
| Move fingers | Ripples follow fingertip positions smoothly |
| Fold fingers | Ripples naturally dissipate in ~1 second |
| Click **LIQUID / CRYSTAL** | Switch visual mode |
| Click **CAMERA** | Switch between front and rear cameras |
| Move mouse (no camera) | Ripples at mouse position (fallback mode) |

---

## 🔧 Technical Details

### Core Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (WebGL1)                 │
│                                                   │
│  ┌──────────┐    ┌──────────────────────────┐   │
│  │   Video   │───▶│   Camera Texture (FBO)   │   │
│  │  (Webcam) │    └───────────┬──────────────┘   │
│  └──────────┘                │                   │
│                               ▼                   │
│  ┌──────────────────────────────────────────┐    │
│  │          Simulation Pass (SIM_FRAG)      │    │
│  │  ┌─────────┐    ┌─────────┐              │    │
│  │  │ FBO A   │◀──▶│ FBO B   │  (ping-pong) │    │
│  │  │ (write) │    │ (read)  │              │    │
│  │  └────┬────┘    └─────────┘              │    │
│  └───────┼──────────────────────────────────┘    │
│          │  height map                           │
│          ▼                                       │
│  ┌──────────────────────────────────────────┐    │
│  │          Render Pass (RENDER_FRAG)        │    │
│  │  • Calculate refraction offset from normal map │
│  │  • Sample camera texture, apply refraction    │
│  │  • Overlay ocean blue tones + ripple highlight │
│  │  • Fingertip blue glow                        │
│  └──────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│              ┌──────────────────┐                │
│              │   Canvas Output  │                │
│              └──────────────────┘                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           MediaPipe Hands (Web Worker)            │
│                                                   │
│  Video Frame ──▶ Hand Detection ──▶ 21 Landmarks │
│                                   └─▶ 5 Fingertips│
│  onResults ──────────────────────▶ fingerPos[]    │
└─────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Rendering | WebGL1 | GPU-accelerated pixel-level rendering |
| Wave Simulation | GLSL Fragment Shader | 9-tap Laplacian wave equation |
| Gesture Recognition | MediaPipe Hands | Real-time five-finger tracking (21 keypoints) |
| Texture Swap | FBO Ping-Pong | Alternating read/write of height maps between frames |
| Fallback Input | Pointer Events | Mouse/touch backup input |

### Wave Simulation Algorithm

Uses a classic 2D wave equation discretization:

$$
h_{t+1} = 2h_t - h_{t-1} + c^2 \Delta h
$$

Where $\Delta h$ is the 9-tap Laplacian (four cardinal + four diagonal neighbors):

```glsl
lap9 = (hR+hL+hU+hD)*0.5 + (hUR+hUL+hDR+hDL)*0.25 - 3.0*h
```

With velocity damping `vn *= (1 - 0.075)` and micro-decay `hn *= 0.996` to achieve ~1 second natural dissipation.

### Ocean Shading Model

- **Base ocean color**: Deep sea blue-green `rgb(8, 25, 51)`, constant 18% blend
- **Ripple highlight**: Bright blue-green `rgb(15, 77, 128)`, dynamically blended 0~35% based on ripple intensity
- **Edge glow**: `exp(-|h| * 60)` sharp attenuation, visible only at active ripples
- **Refraction offset**: UV offset calculated from normal map, simulating light refraction through water surface

---

## ⚙️ Tunable Parameters

Open `water-ripple.html` and adjust the constants at the top:

```javascript
// Simulation resolution scale (lower = faster but blurrier)
const SIM_SCALE  = 0.4;

// Perturbation strength
const PERT_STR   = 0.12;
```

Sim Shader internal parameters (`SIM_FRAG` string):

| Parameter | Default | Description |
|-----------|---------|-------------|
| `damp` | `0.075` | Damping coefficient, higher = faster decay |
| `hn *= 0.996` | `0.996` | Micro-decay, forces zero to eliminate ghosting |
| `lap9` coefficients | `0.45` | Wave speed, higher = faster ripple spread |
| `rad` | `0.006` | Perturbation radius |
| `smoothstep` | `0.012` | Perturbation edge smoothing width |
| `bump` | `10.0` | Normal strength, higher = more obvious refraction |

---

## 🌐 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 56+ | ✅ Recommended |
| Firefox | 51+ | ✅ Recommended |
| Safari | 15+ | ✅ Supported |
| Edge | 79+ | ✅ Supported |
| iOS Safari | 15+ | ✅ Supported |

> Requires WebGL1 support and `getUserMedia` API. MediaPipe Hands model files are loaded from CDN.

---

## 📝 License

MIT License

---

## 🙏 Credits

- [MediaPipe Hands](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) — Gesture recognition
- [WebGL](https://www.khronos.org/webgl/) — GPU rendering

import base64
import re
import os

with open('assets/realistic_moon_banner.jpg', 'rb') as f:
    b64_moon = base64.b64encode(f.read()).decode('ascii')

with open('assets/readme-header.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

old_moon_pattern = r'<!-- RIGHT GRAPHIC: Moon Sphere & Lava Tube Radar Tomography -->.*?<!-- CHANDRAYAAN-2 ORBITAL SATELLITE'

new_moon_content = f'''<!-- RIGHT GRAPHIC: Moon Sphere with Authentic NASA Texture & Lava Tube Radar Tomography -->
  <g transform="translate(1010, 185)">
    <!-- Orbit Ellipse -->
    <ellipse cx="0" cy="0" rx="145" ry="110" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="6 8" opacity="0.4" transform="rotate(-18)"/>
    <ellipse cx="0" cy="0" rx="145" ry="110" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="30 220" opacity="0.7" transform="rotate(-18)" class="scanning-line"/>

    <!-- Real NASA 3D Moon Texture Disk -->
    <defs>
      <clipPath id="realMoonClip">
        <circle cx="0" cy="0" r="88" />
      </clipPath>
      <radialGradient id="lunarLimbGlow" cx="35%" cy="35%" r="65%">
        <stop offset="68%" stop-color="#38bdf8" stop-opacity="0"/>
        <stop offset="88%" stop-color="#38bdf8" stop-opacity="0.2"/>
        <stop offset="97%" stop-color="#38bdf8" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.85"/>
      </radialGradient>
      <radialGradient id="lunarBackGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.45"/>
        <stop offset="70%" stop-color="#0369a1" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Outer Ambient Lunar Glow Halo -->
    <circle cx="0" cy="0" r="115" fill="url(#lunarBackGlow)" filter="url(#softGlow)"/>

    <!-- Authentic NASA Lunar Reconnaissance Orbiter (LROC/LOLA) Photorealistic Texture -->
    <g clip-path="url(#realMoonClip)">
      <image href="data:image/jpeg;base64,{b64_moon}" x="-88" y="-88" width="176" height="176" preserveAspectRatio="none"/>
      <!-- Soft Atmospheric / Solar Limb Highlight -->
      <circle cx="0" cy="0" r="88" fill="url(#lunarLimbGlow)"/>
    </g>

    <!-- Outer Moon Rim Border -->
    <circle cx="0" cy="0" r="88" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.8" filter="url(#softGlow)"/>

    <!-- Marius Hills Lava Tube Skylight Target (Calculated 14.08°N, 303.20°E in Oceanus Procellarum) -->
    <g transform="translate(-22, -4)">
      <!-- Skylight Entrance Cutout -->
      <ellipse cx="0" cy="0" rx="11" ry="7" fill="#020617" stroke="#38bdf8" stroke-width="1.8" filter="url(#softGlow)"/>
      <ellipse cx="0" cy="0" rx="5" ry="3" fill="#000000"/>

      <!-- Radar Waves emitted into Tube Chamber -->
      <circle cx="0" cy="0" r="5" fill="none" stroke="#22c55e" stroke-width="1.5" class="radar-pulse-1"/>
      <circle cx="0" cy="0" r="5" fill="none" stroke="#38bdf8" stroke-width="1.5" class="radar-pulse-2"/>

      <!-- Target Crosshairs -->
      <circle cx="0" cy="0" r="22" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6"/>
      <line x1="-28" y1="0" x2="28" y2="0" stroke="#38bdf8" stroke-width="0.6" opacity="0.5"/>
      <line x1="0" y1="-28" x2="0" y2="28" stroke="#38bdf8" stroke-width="0.6" opacity="0.5"/>
    </g>

    <!-- Subsurface Lava Conduit Dotted Pathway -->
    <path d="M -22 -4 Q 10 15 35 45 Q 50 65 65 78" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4 4" filter="url(#softGlow)"/>
    <circle cx="65" cy="78" r="3.5" fill="#10b981" filter="url(#softGlow)"/>

    <!-- Surface Tag pointing to Marius Hills -->
    <g transform="translate(15, -28)">
      <line x1="-12" y1="18" x2="0" y2="10" stroke="#38bdf8" stroke-width="0.8"/>
      <rect x="0" y="0" width="108" height="19" rx="4" fill="#090d21" stroke="#38bdf8" stroke-width="0.8" opacity="0.95"/>
      <text x="54" y="13" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" text-anchor="middle">MARIUS HOLE // 95.6</text>
    </g>
  </g>

  <!-- CHANDRAYAAN-2 ORBITAL SATELLITE'''

updated_svg = re.sub(old_moon_pattern, new_moon_content, svg, flags=re.DOTALL)

with open('assets/readme-header.svg', 'w', encoding='utf-8') as f:
    f.write(updated_svg)

with open('public/assets/readme-header.svg', 'w', encoding='utf-8') as f:
    f.write(updated_svg)

print('Successfully embedded realistic NASA Moon texture into readme-header.svg!')
print('Total SVG size:', len(updated_svg), 'bytes')

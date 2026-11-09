"""Original SVG collage. Python stdlib only; no downloaded artwork."""
from pathlib import Path
import random
r=random.Random(1998)
a=['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520"><defs><pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#c3b4bd" opacity=".22"/></pattern><pattern id="lines" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0h3" stroke="#080809" stroke-width="1"/></pattern><clipPath id="frame"><path d="M0 0h900v520H0z"/></clipPath></defs><g clip-path="url(#frame)"><path fill="#111015" d="M0 0h900v520H0z"/><path fill="#251e2b" d="M260 0h640v340H260z"/>
<g fill="#645566" font-family="monospace" font-size="9" opacity=".6"><text x="286" y="24">ARCHIVE 09 / MEMORY IMAGE / 17.11.1998</text><text x="775" y="44">受信中</text></g>''']
# Broken city from thin ink strokes.
for i in range(45):
 x=r.randrange(0,900); y=r.randrange(110,310); w=r.randrange(18,74)
 a.append(f'<path d="M{x} 420V{y}h{w}v{420-y}" fill="#{r.choice(["17151c","1c1922","24202a","121217"])}" stroke="#4d3e50" stroke-width=".7"/>')
 for row in range(y+10,365,13):
  for col in range(x+5,x+w-4,9):
   if r.random()<.24:a.append(f'<path d="M{col} {row}h3v4h-3z" fill="{r.choice(["#797374","#9a6b87","#48414b"])}"/>')
# Dense telephone infrastructure, not neon skyscrapers.
for x,y in [(85,46),(730,12),(590,89)]:
 a.append(f'<path d="M{x} {y}l-8 490h15l-2-490z" fill="#09090b"/><g stroke="#746674" stroke-width="2"><path d="M{x-52} {y+35}h105m-95 23h87m-75 15h67"/></g>')
 for t in [-44,-21,0,24,45]:
  a.append(f'<path d="M{x+t-2} {y+24}v16m4-16v16" stroke="#a19b95" stroke-width="2"/>')
for i in range(24):
 y=r.randrange(-60,210); bend=r.randrange(50,160)
 a.append(f'<path d="M-40 {y} Q400 {y+bend} 940 {y+r.randrange(-70,100)}" fill="none" stroke="{r.choice(["#09090b","#0b0a0e","#756274"])}" stroke-width="{r.choice([1,1,2,3])}"/>')
a.append('''<path d="M0 360L900 323v197H0z" fill="#0b0a0d"/><path d="M0 390l900-40M0 446l900-60" stroke="#49404d" stroke-width="1"/>
<!-- Anonymous hand-drawn profile, deliberately unrelated to an existing character. -->
<path d="M255 520l19-100 46-38 39-31 11-55-26-31-5-62 22-60 46-22 57 7 35 37 10 44-13 21 12 24 21 12-17 14-6 31-24 19-3 44 55 40 37 106z" fill="#b0a1aa" stroke="#09080d" stroke-width="4"/>
<path d="M344 263q-37-48-16-106 9-63 76-73 72-9 97 52 17 36 2 77l-18-43-43-27-7 64-29-37-8 90-28-28-6 66z" fill="#17131c" stroke="#08080b" stroke-width="4"/>
<path d="M348 240l16-70 12 28 9-73m-13 124 22-45m9-59 29-38m-11 62 17-47m-1 65 27-39 22 29" stroke="#615064" stroke-width="1.5" fill="none"/>
<path d="M474 216l-21 7 16 4m14 48-14 4m-97 17 22 34 42 17 24-5-42 16-10 35-49-20z" fill="#584653"/>
<path d="M455 224l15 2" stroke="#19121b" stroke-width="3"/>
<path d="M255 520l18-100 46-38 42-19 41 59 43-63 55 37 30 124z" fill="#24202a" stroke="#09090b" stroke-width="4"/>
<path d="M320 384l29 71 54-32-20 97m64-153-4 72-40-16 33 97m-158-97 39 24-12 73m197-117-39 60 20 57" fill="none" stroke="#746374" stroke-width="2"/>
<path d="M0 0h900v520H0z" fill="url(#dots)"/>
<g fill="#bab0b4" font-family="monospace"><text x="28" y="274" font-size="13" letter-spacing="8" writing-mode="tb">身体はここにない</text><text x="848" y="170" font-size="11" writing-mode="tb" letter-spacing="7">記憶・信号・不在</text></g>
<path d="M610 276h245v178H610z" fill="#131015" stroke="#736072"/><path d="M617 283h231v144H617z" fill="#08090a" stroke="#473d47"/>
<g font-family="monospace" font-size="11"><text x="630" y="307" fill="#69ed59">memory dump : 000009</text><text x="630" y="334" fill="#a19b9f">is anybody receiving?</text><text x="630" y="355" fill="#a19b9f">........ ........ ....</text><text x="630" y="391" fill="#d46ca8">you are still here_</text></g>
<path d="M600 454h263l-14 14H613z" fill="#65505d"/>
<g stroke="#ba8da8" fill="none" opacity=".6"><circle cx="158" cy="379" r="51"/><circle cx="158" cy="379" r="32"/><path d="M158 315v128M94 379h128M113 334l90 90m0-90-90 90"/></g>
''')
# Paper scratches, fine hatching, compression tears.
for i in range(360):
 x=r.randrange(900);y=r.randrange(520)
 a.append(f'<path d="M{x} {y}h{r.randrange(1,36)}" stroke="{r.choice(["#c7a6b6","#08080a"])}" opacity="{r.uniform(.07,.26):.2f}" stroke-width=".7"/>')
a.append('''<path d="M0 0h900v520H0z" fill="url(#lines)" opacity=".22"/><path d="M0 469h231v3H0zm452-286h220v2H452z" fill="#a16d8b" opacity=".4"/><g font-family="monospace" fill="#a3899e" font-size="9"><text x="20" y="495">FIG. 09 — EL OTRO EXTREMO</text><text x="666" y="497">ORIGINAL MEMORY / E09</text></g></g></svg>''')
Path(__file__).resolve().parents[1].joinpath('assets/wired-memory.svg').write_text(''.join(a))

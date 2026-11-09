"""Two original still diagrams, stdlib only; no external assets or animation."""
from pathlib import Path
import math, random
out=Path(__file__).resolve().parents[1]/'assets'
for kind in ['echo','trace']:
 r=random.Random(98 if kind=='echo' else 9)
 a=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380"><g fill="none">']
 for ring in range(33):
  points=[]
  for i in range(361):
   t=2*math.pi*i/360
   if kind=='echo':
    x=400+(90+ring*3)*math.sin(t)+45*math.sin(3*t+ring*.08)
    y=190+(65+ring*1.7)*math.cos(2*t)+16*math.cos(t*5+ring*.05)
   else:
    radius=50+ring*3+17*math.sin(3*t+ring*.055)
    x=400+radius*1.65*math.cos(t)+14*math.sin(t*7)
    y=190+radius*.82*math.sin(t)+8*math.cos(t*9)
   points.append(f'{x:.1f},{y:.1f}')
  opacity=r.uniform(.18,.6)
  a.append(f'<polyline points="{" ".join(points)}" stroke="#aaa99b" stroke-width=".6" opacity="{opacity:.2f}"/>')
 for _ in range(55):
  x=r.randrange(140,660);y=r.randrange(60,320)
  a.append(f'<path d="M{x} {y}h{r.randrange(1,27)}" stroke="#d2d2c3" stroke-width=".6" opacity=".13"/>')
 a.append('</g></svg>')
 (out/f'{kind}-form.svg').write_text(''.join(a))

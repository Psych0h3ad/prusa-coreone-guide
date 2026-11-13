"""Apply reviewed static datums without replacing unverified sensor internals."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
file=root/'dist/assets/upgrade-placements.json'
p=json.loads(file.read_text(encoding='utf8'))
# Centre/left bolt axes and underside bearing face. The R1-A runtime switch
# also requires the verified M3x12 hardware and the corresponding nut positions.
p['ventBlock']=[[-1,0,0,8.5007654789464],[0,1,0,-122.357890775307],[0,0,-1,485.7875248124],[0,0,0,1]]
file.write_text(json.dumps(p),encoding='utf8')
print('Applied reviewed vent datum; retained existing sensor placements for complete mechanical review.')

"""Editable conjugate-profile construction. Code: MIT; native-derived data: OCL v1.

Usage: python build-profile.py recipe.json profiles.json
Requires NumPy and Shapely. No network operation or printer connection.
"""
import json,sys
import numpy as np
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
from shapely.affinity import rotate,translate

def profiles(recipe):
    ns,np_,nr=recipe['nativePinionTeeth'],recipe['planetTeeth'],recipe['ringTeeth']
    d=recipe['centerDistanceMM'];allowance=recipe['normalBacklashReferenceMM']
    sun=Polygon(recipe['nativePinionContour'])
    blank=Point(0,0).buffer(recipe['planetBlankRadiusMM'],quad_segs=512)
    cutters=[]
    for angle in np.linspace(-np.pi/ns,np.pi/ns,257):
        cutter=rotate(sun,angle,origin=(0,0),use_radians=True)
        cutter=rotate(translate(cutter,xoff=-d),(ns/np_)*angle,origin=(0,0),use_radians=True).intersection(blank)
        if not cutter.is_empty:cutters.append(cutter)
    one=unary_union(cutters).buffer(allowance,quad_segs=16)
    allcuts=unary_union([rotate(one,k*2*np.pi/np_,origin=(0,0),use_radians=True)for k in range(np_)])
    planet=blank.difference(allcuts).simplify(.001,preserve_topology=True)
    period=2*np.pi/nr;radius=30
    wedge=Polygon([[0,0],[radius*np.cos(-period/2),radius*np.sin(-period/2)],[radius*np.cos(period/2),radius*np.sin(period/2)]])
    base=Point(0,0).buffer(18.6,quad_segs=2048);trim=Point(0,0).buffer(18.59,quad_segs=2048);cutters=[]
    for angle in np.linspace(-period/2,period/2,257):
        cutter=rotate(planet,(nr/np_-1)*angle,origin=(0,0),use_radians=True)
        cutter=translate(cutter,xoff=d*np.cos(angle),yoff=-d*np.sin(angle))
        cutter=cutter.buffer(allowance,quad_segs=8).intersection(wedge).difference(trim)
        if not cutter.is_empty:cutters.append(cutter)
    one=unary_union(cutters);cut=unary_union([rotate(one,k*period,origin=(0,0),use_radians=True)for k in range(nr)])
    nominal=base.union(cut).simplify(.001,preserve_topology=True)
    passage=recipe['ringGuideNominalRadiusMM']+recipe['ringGuideFreeFitReferenceMM']
    ring=nominal.union(Point(0,0).buffer(passage,quad_segs=2048)).simplify(.001,preserve_topology=True)
    assert planet.is_valid and ring.is_valid
    return {'planetProfile':list(planet.exterior.coords)[:-1],'ringCavityProfile':list(ring.exterior.coords)[:-1]}

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('Usage: build-profile.py recipe.json profiles.json')
    with open(sys.argv[1],encoding='utf8')as f:recipe=json.load(f)
    with open(sys.argv[2],'w',encoding='utf8')as f:json.dump(profiles(recipe),f,indent=2);f.write('\n')

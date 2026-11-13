"""Recover shared cover datums from the official mesh and source assembly."""
import json, itertools
from pathlib import Path
import numpy as np
import trimesh
from scipy.spatial import cKDTree

root=Path(__file__).resolve().parents[1]
np.random.seed(17)
scene=trimesh.load(root/'research/core-one-original.glb',force='scene')

def original(term,largest=False):
    names=[n for n in scene.graph.nodes_geometry if term in n]
    if largest:
        names.sort(key=lambda n:np.prod(scene.geometry[scene.graph[n][1]].extents),reverse=True)
    n=names[0]
    t,g=scene.graph[n]
    mesh=scene.geometry[g].copy()
    mesh.vertices*=1000
    t=t.copy();t[:3,3]*=1000
    return mesh,t

def register_partial(old,new):
    # Register an existing datum to its replacement, allowing a new lever arm
    # outside the shared panel. The fit is old-to-new to avoid penalizing it.
    a=old.sample(3500)
    b=new.sample(26000)
    tree=cKDTree(b)
    best=None
    for angle in [0,np.pi/2,np.pi,3*np.pi/2]:
      for flip in [False,True]:
        rot=trimesh.transformations.rotation_matrix(angle,[0,0,1])
        if flip:rot=rot@trimesh.transformations.rotation_matrix(np.pi,[1,0,0])
        for shift in [-35,0,35]:
          initial=rot.copy()
          initial[:3,3]=new.bounds.mean(axis=0)-(rot[:3,:3]@old.bounds.mean(axis=0))+[shift,0,0]
          pts=trimesh.transform_points(a,initial)
          total=initial
          for _ in range(32):
            dist,idx=tree.query(pts)
            keep=dist<np.quantile(dist,.9)
            fit,_,_=trimesh.registration.procrustes(pts[keep],b[idx[keep]],reflection=False,translation=True,scale=False)
            pts=trimesh.transform_points(pts,fit)
            total=fit@total
          dist=tree.query(pts)[0]
          cost=float(np.mean(np.minimum(dist,8)**2))
          if best is None or cost<best[0]:best=(cost,np.linalg.inv(total))
    return best

old,world=original('Printhead cover right')
new=trimesh.load(root/'research/upgrade/C1+_PRINTHEAD_COVER_RIGHT_LEVER_R1.stl')
cost,fit=register_partial(old,new)
print('Cover shared-datum sampled RMS mm',cost**.5,flush=True)
cover_world=world@fit

oldbody,body_world=original('Filament_sensor_A4',largest=True)
body=trimesh.load(root/'research/upgrade/FILAMENT SENSOR BODY R2.stl')
cost2,body_fit=register_partial(oldbody,body)
print('Sensor shared-envelope sampled RMS mm',cost2**.5,flush=True)
body_transform=body_world@body_fit

def translated(t,xyz):
    d=np.eye(4);d[:3,3]=xyz
    return t@d

_,spool_world=original('Spoolholder E1')
transforms={
 'ventLever':cover_world.tolist(),
 'sensorBody':body_transform.tolist(),
 'sensorCover':translated(body_transform,[42.2,19.2,12]).tolist(),
 'sensorLever':translated(body_transform,[12,12,3]).tolist(),
 'sensorSwitch':translated(body_transform,[57,15,3]).tolist(),
 'puck':spool_world.tolist(),
 'spoolNew':translated(spool_world,[0,0,40]).tolist(),
}
# The block is attached to the sliding grille. Its mounting position is encoded
# separately from the fit above, keeping source meshes in their original units.
transforms['ventBlock']=[[-1,0,0,8.5007654789464],[0,1,0,-122.357890775307],[0,0,-1,485.7875248124],[0,0,0,1]]
(root/'dist/assets/upgrade-placements.json').write_text(json.dumps(transforms),encoding='utf8')
(root/'research/placement-audit.json').write_text(json.dumps({'cover_rms_mm':cost**.5,'sensor_envelope_rms_mm':cost2**.5,'note':'Sampled envelope fits are observations, not certified placement tolerances. Internal sensor and vent block placements require mechanical review.'}),encoding='utf8')

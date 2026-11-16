"""Zero-design-gap contact constraint, in mm. Original reference, not force data."""
import math
from pathlib import Path
import json
Q=json.loads((Path(__file__).resolve().parent/'contact-parameters.json').read_text())['unloadedHeaderContour']
def tangent(point,center,r):
 dy,dz=point[0]-center[0],point[1]-center[1];a=math.atan2(dz,dy);off=math.acos(r/math.hypot(dy,dz));return max([(center[0]+r*math.cos(a+t*off),center[1]+r*math.sin(a+t*off))for t in [-1,1]],key=lambda p:p[1])
C=Q['lowerNoseCenter'];R=Q['lowerNoseRadius'];T0=tangent(Q['lowerStart'],C,R);T1=tangent(Q['lowerShoulder'],C,R)
STATIONS=[Q['lowerStart'],T0,T1,Q['lowerShoulder'],*Q['lowerBackStations']]
def header_top(y):
 for i,(a,b)in enumerate(zip(STATIONS,STATIONS[1:])):
  if a[0]<=y<=b[0]:
   if i==1:return C[1]+math.sqrt(max(0,R*R-(y-C[0])**2))
   return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0])
 raise ValueError('Outside declared contact contour')
def leaf_lower(y,angle,withdrawal):
 root=3.35-withdrawal
 if angle==0:return .8
 radius=.30/angle;outer=radius+.075;arcEnd=root+outer*math.sin(angle)
 if y<=arcEnd:return .875+radius-math.sqrt(max(0,outer*outer-(y-root)**2))
 z=.875+radius-outer*math.cos(angle);return z+(y-arcEnd)*math.tan(angle)
def gap(angle,withdrawal):
 root=3.35-withdrawal
 if angle==0:tip=6.95-withdrawal;arcEnd=root
 else:r=.30/angle;tip=root+(r+.075)*math.sin(angle)+3.30*math.cos(angle);arcEnd=root+(r+.075)*math.sin(angle)
 low=max(root,STATIONS[0][0]);high=min(tip,STATIONS[-1][0])
 if high<low:return {'gapMM':None,'contactYMM':None}
 points=[low,high]+[p[0]for p in STATIONS if low<=p[0]<=high]
 if low<=arcEnd<=high:points.append(arcEnd)
 # For the straight leaf vs the circular nose the stationary point is exact.
 slope=math.tan(angle);critical=C[0]-slope*R/math.sqrt(1+slope*slope)
 if max(low,T0[0],arcEnd)<=critical<=min(high,T1[0]):points.append(critical)
 values=[(leaf_lower(y,angle,withdrawal)-header_top(y),y)for y in points];value,y=min(values);return {'gapMM':value,'contactYMM':y}
def pose(withdrawal):
 if not 0<=withdrawal<=7:raise ValueError('Outside declared axial mating reference')
 g=gap(0,withdrawal)
 if g['gapMM'] is None or g['gapMM']>=0:return {'angleRadians':0,**g}
 lo,hi=0,.14
 if gap(hi,withdrawal)['gapMM']<0:raise ValueError('The declared full-stock contact cannot clear this pose')
 for i in range(60):
  mid=(lo+hi)/2
  if gap(mid,withdrawal)['gapMM']<0:lo=mid
  else:hi=mid
 return {'angleRadians':hi,**gap(hi,withdrawal)}

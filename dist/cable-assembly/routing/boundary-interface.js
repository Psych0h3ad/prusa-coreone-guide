import {entryPacketPose} from './packet-pose.js';

export const BOUNDARY_EVENT = 'FE48_COMPLETE_LCD_HELD_BEFORE_GATHER';
const vectors = ['centre', 'axis', 'normal', 'tangent'];
const profileKeys = ['u', 'w', 't', 'du', 'dw', 'dt'];
const finite = a => Array.from(a).every(Number.isFinite);

// This interface has no viewer, legacy time mapping or implicit old family.
// The initial held model and the seated UNJOINED packet reference are distinct
// inputs. In particular, the held frame0 must never become the packet datum.
export function bindSharedBoundary({materialSource, initialModel,
  seatedProxyReference, blueState, earthState, feEndpointSurfaces, pins}) {
  const rows = materialSource?.metadata?.rows;
  if (rows?.length !== 545 || materialSource.stations?.length !== 545)
    throw Error('Supply the actual full545 captured material source');
  for (const row of rows) for (const key of profileKeys)
    if (row.profile[key]?.length !== 68 || !finite(row.profile[key]))
      throw Error('Missing literal full68 profile ' + key);
  const validate = model => {
    if (model?.frames?.length !== 545) throw Error('Expected full545 upstream frames');
    model.frames.forEach((f, i) => {
      if (f.distance !== materialSource.stations[i])
        throw Error('Changed material station at ring ' + i);
      for (const key of vectors) if (!f[key]?.isVector3 || !finite(f[key].toArray()))
        throw Error('Missing finite frame ' + key + ' at ring ' + i);
    });
    return model;
  };
  validate(initialModel);
  validate(seatedProxyReference);
  if (seatedProxyReference === initialModel || seatedProxyReference.frames === initialModel.frames)
    throw Error('Supply the separate unjoined seated packet proxy reference');
  const surface = (s, label) => {
    if (!s?.trianglesMM?.length || s.trianglesMM.length % 9 || !finite(s.trianglesMM))
      throw Error('Missing actual root-mm triangles for ' + label);
    if (!s.pin?.sha256 || !s.pin?.qualification)
      throw Error('Missing explicit surface pin/qualification for ' + label);
    return s;
  };
  surface(blueState, 'blue'); surface(earthState, 'earth');
  if (!feEndpointSurfaces?.length) throw Error('Missing actual FE endpoint surfaces');
  feEndpointSurfaces.forEach((s, i) => surface(s, 'FE endpoint ' + i));
  if (!pins?.initialFrames || !pins?.seatedProxy || !pins?.materialProfiles)
    throw Error('Missing distinct frame/reference/profile pins');

  return {
    event: BOUNDARY_EVENT, initialModel, seatedProxyReference, materialSource,
    blueState, earthState, feEndpointSurfaces, pins,
    validateModel: validate,
    packetPose(unjoinedModel) {
      return entryPacketPose(seatedProxyReference, validate(unjoinedModel));
    },
    state(unjoinedModel, {blue = blueState, earth = earthState} = {}) {
      validate(unjoinedModel); surface(blue, 'current blue'); surface(earth, 'current earth');
      return {event: BOUNDARY_EVENT, unjoinedModel,
        packetPose: this.packetPose(unjoinedModel), blue, earth,
        feEndpointSurfaces, materialSource, pins};
    },
    // Newton's consumer owns actual full native meshes. It receives the real
    // upstream model, then applies its local join. No joined-cap delta enters
    // the plug transform, and no packet observer is reported as mesh proof.
    applyNative(unjoinedModel, nativeJoinConsumer, joinOptions) {
      const expected = this.packetPose(unjoinedModel);
      const result = nativeJoinConsumer.apply(unjoinedModel, joinOptions);
      for (const side of ['freeSource', 'remote']) {
        const a = expected[side].rootDeltaFromSeatedMM;
        const b = result.pose?.[side]?.rootDeltaFromSeatedMM;
        if (!b || a.some((x, i) => x !== b[i]))
          throw Error('Native consumer used a different unjoined packet reference');
      }
      validate(result.model);
      return result;
    }
  };
}

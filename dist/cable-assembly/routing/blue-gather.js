import {createBlueRestRoute} from './blue-route.js';

// This candidate consumes the actual incoming tube and explicit route data.
// progress is solely the gather operation parameter, never old LCD time.
// Raw-box4 crossings remain historical comparisons. Parent prepared-open tie
// clears the exact four checked surfaces; coherent composition stays external.
export function createBlueGather({entity, initialRoute, incomingTube}) {
  if (entity.samples !== 128 || entity.radius !== 2.5 ||
      initialRoute.stockMM !== 221.248465580051)
    throw Error('Incoming blue material differs from the pinned candidate');
  if (!incomingTube?.curve || incomingTube.positions?.length !== 3483 || incomingTube.normals?.length !== 3483)
    throw Error('Supply the pinned incoming blue buffers/curve separately from the current scene');
  const route = createBlueRestRoute(entity, initialRoute,
    {x4: -125, y4: 185, q3MinY: 184, liftMM: 8, p6X: -130, incoming: incomingTube});
  return {
    materialStockMM: initialRoute.stockMM, radiusMM: 2.5,
    candidateStatus: 'FINITE_CANDIDATE_PARENT_PREPARED_TIE_COMPOSITION_REQUIRED',
    apply(progress) {
      if (!Number.isFinite(progress) || progress < 0 || progress > 1)
        throw Error('Expected normalized gather progress0..1');
      return route.apply(progress);
    },
    restoreIncoming() { return route.restoreComparison(); }
  };
}

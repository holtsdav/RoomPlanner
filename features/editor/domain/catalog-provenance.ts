import sources from './catalog-sources.json';
import { objectCatalog, type CatalogPreset } from './catalog';
import type { PlanObject } from './plan-document';

export function catalogProvenance(object: CatalogPreset | PlanObject) {
  const preset =
    'locked' in object
      ? objectCatalog.find(
          (candidate) =>
            candidate.id === object.blueprintProfile?.presetId ||
            candidate.name === object.name.replace(/(?: copy)+$/, ''),
        )
      : object;
  const accessibilityGuides: Record<string, string> = {
    'wheelchair-ramp':
      'https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/',
    'ramp-landing':
      'https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/',
    'wheelchair-turning-space':
      'https://www.access-board.gov/ada/guides/chapter-3-clear-floor-or-ground-space-and-turning-space/',
    'clear-floor-space':
      'https://www.access-board.gov/ada/guides/chapter-3-clear-floor-or-ground-space-and-turning-space/',
    'kitchen-aisle-clearance': 'https://www.access-board.gov/ada/chapter/ch08/',
    'knee-space-worktop': 'https://www.access-board.gov/ada/chapter/ch08/',
    'knee-space-sink': 'https://www.access-board.gov/ada/chapter/ch08/',
    'wall-handrail':
      'https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/',
    'grab-bar':
      'https://www.access-board.gov/ada/guides/chapter-6-toilet-rooms/',
  };
  const kind = preset?.blueprint;
  if (
    kind &&
    (kind in accessibilityGuides ||
      kind === 'pull-out-shelf' ||
      kind === 'handrail')
  ) {
    const rise = object.blueprintProfile?.rampRiseMm;
    const slope = rise ? object.depthMm / rise : 0;
    const angle = rise
      ? ((Math.atan(rise / object.depthMm) * 180) / Math.PI).toFixed(1)
      : '';
    const note =
      kind === 'wheelchair-ramp'
        ? `The footprint is the horizontal run only. At ${rise} mm rise, this run is 1:${Number(slope.toFixed(1))} (about ${angle}°). Resizing the run changes that grade. Landings are not included.`
        : kind === 'knee-space-worktop' || kind === 'knee-space-sink'
          ? 'This is a representative counter or sink footprint. Counter height and knee and toe clearances are not modeled in 2D.'
          : kind === 'wall-handrail' || kind === 'grab-bar'
            ? 'Representative plan-view rail length and projection. Check mounting height, support, and gripping clearance separately.'
            : kind === 'handrail'
              ? 'A freely placed plan-view handrail footprint. Check its actual support, mounting height, and gripping clearance separately.'
              : kind === 'pull-out-shelf'
                ? 'Representative cabinet footprint. Check the shelf extension, reach, and adjoining clear floor space separately.'
                : 'A planning overlay for space to keep clear. It can overlap other clear-space overlays.';
    return {
      label: accessibilityGuides[kind]
        ? 'Accessibility planning reference'
        : 'Generic planning size',
      model: accessibilityGuides[kind]
        ? 'U.S. Access Board guidance'
        : undefined,
      url: accessibilityGuides[kind],
      checked: undefined,
      note,
      clearance:
        'Dimensions are editable. This 2D plan does not check accessibility compliance; verify the full layout against applicable local requirements.',
    };
  }
  const references = preset
    ? sources.filter(
        (source) =>
          source.size[0] === preset.widthMm &&
          source.size[1] === preset.depthMm,
      )
    : [];
  // Different models can share a footprint. Resolve those by model name.
  const modelName = preset?.name.split(' · ').at(-1)?.toLowerCase();
  const reference =
    references.length === 1
      ? references[0]
      : references.find(
          (source) =>
            modelName && source.model.toLowerCase().endsWith(modelName),
        );
  return {
    label: reference
      ? 'Manufacturer reference'
      : preset
        ? 'Generic planning size'
        : 'Custom dimensions',
    model: reference?.model,
    url: reference?.url,
    checked: reference?.checked,
    note: reference
      ? 'Reference outer dimensions, rounded to millimetres. Blueprint details are schematic. Your dimensions remain editable.'
      : 'A representative planning footprint. Measure your actual object before relying on the fit.',
    clearance:
      preset?.blueprint === '3d-printer'
        ? 'Allow extra space for moving beds, doors, lids, AMS, spools, waste, cables and ventilation. Operating clearance is not included.'
        : 'Operating, door-opening, cable and access clearances are not included.',
  };
}

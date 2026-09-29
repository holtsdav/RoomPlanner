import type { CatalogPreset } from './catalog';
import { roomPreset } from './room-catalog';

const p = roomPreset;

// Planning examples, not a code-compliance check. Ramp depth is the sloped run
// only; landings are separate. The rise is retained so an edited run can still
// be described by its actual slope. See docs/product/accessibility-objects.md.
const ramp = (
  riseMm: number,
  slopeRatio: number,
  widthMm = 1000,
): CatalogPreset =>
  p(
    'wheelchair-ramp',
    `Wheelchair ramp · ${riseMm} mm rise / 1:${slopeRatio} / ${((Math.atan(1 / slopeRatio) * 180) / Math.PI).toFixed(1)}°`,
    widthMm,
    riseMm * slopeRatio,
    { rampRiseMm: riseMm },
  );

export const accessibilityCatalog: CatalogPreset[] = [
  ramp(75, 12),
  ramp(150, 12),
  ramp(150, 16),
  ramp(150, 20),
  ramp(250, 12, 1200),
  p('ramp-landing', 'Ramp landing', 1525, 1525),
  p(
    'wheelchair-turning-space',
    'Wheelchair turning space · Circle',
    1525,
    1525,
    {
      form: 'circle',
    },
  ),
  p(
    'wheelchair-turning-space',
    'Wheelchair turning space · T-turn',
    1525,
    1525,
    {
      form: 't',
    },
  ),
  p('clear-floor-space', 'Clear floor space · Forward approach', 760, 1220, {
    form: 'forward',
  }),
  p('clear-floor-space', 'Clear floor space · Side approach', 1220, 760, {
    form: 'side',
  }),
  p(
    'kitchen-aisle-clearance',
    'Kitchen aisle clearance · Pass-through',
    1015,
    2000,
    {
      form: 'pass-through',
    },
  ),
  p(
    'kitchen-aisle-clearance',
    'Kitchen aisle clearance · U-shaped',
    1525,
    2000,
    {
      form: 'u-shaped',
    },
  ),
  p('knee-space-worktop', 'Knee-space worktop · 90 cm', 900, 600),
  p('knee-space-worktop', 'Knee-space worktop · 120 cm', 1200, 600),
  p('knee-space-sink', 'Knee-space kitchen sink', 800, 600),
  p('pull-out-shelf', 'Pull-out kitchen shelf', 600, 500),
  p('wall-handrail', 'Wall handrail · 90 cm', 900, 70, {
    mounting: 'wall',
  }),
  p('wall-handrail', 'Wall handrail · 150 cm', 1500, 70, {
    mounting: 'wall',
  }),
  p('wall-handrail', 'Wall handrail · 200 cm', 2000, 70, {
    mounting: 'wall',
  }),
  p('grab-bar', 'Wall grab bar · 60 cm', 600, 60, { mounting: 'wall' }),
  p('grab-bar', 'Wall grab bar · 90 cm', 900, 60, { mounting: 'wall' }),
  p('grab-bar', 'Wall grab bar · 120 cm', 1200, 60, { mounting: 'wall' }),
];

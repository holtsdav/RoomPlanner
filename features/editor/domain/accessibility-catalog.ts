import type { CatalogPreset } from './catalog';
import { roomPreset } from './room-catalog';

const p = roomPreset;

// Planning examples, not a code-compliance check. Ramp depth is the horizontal
// run only; landings are not included. The rise is retained so an edited run can still
// be described by its actual slope. See docs/product/accessibility-objects.md.
const ramp = (
  label: string,
  riseMm: number,
  slopeRatio: number,
  widthMm = 1000,
): CatalogPreset => ({
  ...p(
    'wheelchair-ramp',
    `Wheelchair ramp · ${riseMm} mm rise / 1:${slopeRatio} / ${((Math.atan(1 / slopeRatio) * 180) / Math.PI).toFixed(1)}°`,
    widthMm,
    riseMm * slopeRatio,
    { rampRiseMm: riseMm },
  ),
  name: `Wheelchair ramp · ${label}`,
});

export const accessibilityCatalog: CatalogPreset[] = [
  ramp('Standard', 150, 12),
  ramp('Short', 75, 12),
  ramp('Long', 150, 16),
  ramp('Extra long', 150, 20),
  ramp('Wide', 250, 12, 1200),
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
  p('wall-handrail', 'Wall handrail · 90 cm', 900, 70, {
    mounting: 'wall',
  }),
  p('wall-handrail', 'Wall handrail · 150 cm', 1500, 70, {
    mounting: 'wall',
  }),
  p('wall-handrail', 'Wall handrail · 200 cm', 2000, 70, {
    mounting: 'wall',
  }),
  p('handrail', 'Freestanding handrail · 90 cm', 900, 70),
  p('handrail', 'Freestanding handrail · 150 cm', 1500, 70),
  p('handrail', 'Freestanding handrail · 200 cm', 2000, 70),
];

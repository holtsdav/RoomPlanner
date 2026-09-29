import type { BlueprintProfile } from './blueprint-profile';
import type { BlueprintPath } from './office-blueprints';

export const accessibilityKinds = [
  'wheelchair-ramp',
  'handrail',
  'wheelchair-turning-space',
  'clear-floor-space',
  'wall-handrail',
  // Retain retired symbols so objects in older saved plans still render.
  'ramp-landing',
  'kitchen-aisle-clearance',
  'knee-space-worktop',
  'knee-space-sink',
  'pull-out-shelf',
  'grab-bar',
] as const;

/** Shared plan-view symbols for the library, canvas, and PNG export. */
export function accessibilityBlueprint(
  kind: string,
  width: number,
  depth: number,
  profile?: BlueprintProfile,
): BlueprintPath[] {
  const paths: BlueprintPath[] = [];
  const p = (x: number, y: number) =>
    `${(x - 0.5) * width} ${(y - 0.5) * depth}`;
  const path = (d: string, detail = false) => paths.push({ d, detail });
  const line = (points: number[][], detail = true) =>
    path(`M ${points.map(([x, y]) => p(x, y)).join(' L ')}`, detail);
  const polygon = (points: number[][], detail = false) =>
    path(`M ${points.map(([x, y]) => p(x, y)).join(' L ')} Z`, detail);
  const rect = (x = 0, y = 0, w = 1, h = 1, detail = false) =>
    polygon(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      detail,
    );
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    detail = false,
  ) =>
    path(
      `M ${p(x - rx, y)} A ${rx * width} ${ry * depth} 0 1 0 ${p(x + rx, y)} A ${rx * width} ${ry * depth} 0 1 0 ${p(x - rx, y)} Z`,
      detail,
    );

  // One proportion-preserving wheelchair pictogram for every rendering surface.
  const wheelchair = (size: number, cx: number, cy: number) => {
    const unit = size / 24;
    const point = (x: number, y: number) =>
      `${(cx - 0.5) * width + (x - 12) * unit} ${(cy - 0.5) * depth + (y - 12) * unit}`;
    const radius = (r: number) => r * unit;
    const symbol = (d: string) =>
      paths.push({ d, detail: false, strokeOnly: true, part: 'wheelchair' });
    symbol(
      `M ${point(11, 3)} A ${radius(2.2)} ${radius(2.2)} 0 1 0 ${point(15.4, 3)} A ${radius(2.2)} ${radius(2.2)} 0 1 0 ${point(11, 3)} Z`,
    );
    symbol(
      `M ${point(2, 17)} A ${radius(6)} ${radius(6)} 0 1 0 ${point(14, 17)} A ${radius(6)} ${radius(6)} 0 1 0 ${point(2, 17)} Z`,
    );
    symbol(
      `M ${point(13, 7)} L ${point(13, 14)} L ${point(19, 14)} L ${point(22, 21)} L ${point(24, 20)} M ${point(13, 9)} L ${point(19, 9)}`,
    );
  };

  switch (kind) {
    case 'wheelchair-ramp':
      // Shading encodes the uphill end without changing the measured footprint.
      rect();
      paths[paths.length - 1].slope = true;
      line(
        [
          [0, 0.025],
          [1, 0.025],
        ],
        false,
      );
      line(
        [
          [0.5, 0.53],
          [0.5, 0.25],
        ],
        false,
      );
      line(
        [
          [0.4, 0.33],
          [0.5, 0.25],
          [0.6, 0.33],
        ],
        false,
      );
      for (const part of paths.slice(1)) part.strokeOnly = true;
      wheelchair(Math.min(width * 0.42, depth * 0.26), 0.5, 0.75);
      break;
    case 'ramp-landing':
      rect();
      line([
        [0.18, 0.5],
        [0.82, 0.5],
      ]);
      break;
    case 'wheelchair-turning-space':
      if (profile?.form === 't') {
        // 1525 mm envelope with a 915 mm-wide stem and crossbar.
        polygon([
          [0, 0],
          [1, 0],
          [1, 0.6],
          [0.8, 0.6],
          [0.8, 1],
          [0.2, 1],
          [0.2, 0.6],
          [0, 0.6],
        ]);
        line([
          [0.35, 0.28],
          [0.65, 0.28],
        ]);
        line([
          [0.5, 0.15],
          [0.5, 0.75],
        ]);
        wheelchair(Math.min(width, depth) * 0.23, 0.8, 0.3);
      } else {
        ellipse(0.5, 0.5, 0.5, 0.5);
        line([
          [0.5, 0.22],
          [0.5, 0.78],
        ]);
        line([
          [0.22, 0.5],
          [0.78, 0.5],
        ]);
        wheelchair(Math.min(width, depth) * 0.26, 0.73, 0.28);
      }
      break;
    case 'clear-floor-space':
      rect();
      if (profile?.form === 'side') {
        line([
          [0.12, 0.5],
          [0.88, 0.5],
        ]);
        line([
          [0.76, 0.38],
          [0.88, 0.5],
          [0.76, 0.62],
        ]);
      } else {
        line([
          [0.5, 0.82],
          [0.5, 0.18],
        ]);
        line([
          [0.38, 0.3],
          [0.5, 0.18],
          [0.62, 0.3],
        ]);
      }
      break;
    case 'kitchen-aisle-clearance':
      rect();
      line([
        [0.5, 0.85],
        [0.5, 0.15],
      ]);
      line([
        [0.42, 0.24],
        [0.5, 0.15],
        [0.58, 0.24],
      ]);
      if (profile?.form === 'pass-through')
        line([
          [0.42, 0.76],
          [0.5, 0.85],
          [0.58, 0.76],
        ]);
      break;
    case 'knee-space-worktop':
      rect();
      rect(0.08, 0.18, 0.84, 0.72, true);
      line([
        [0.2, 0.92],
        [0.2, 1],
      ]);
      line([
        [0.8, 0.92],
        [0.8, 1],
      ]);
      break;
    case 'knee-space-sink':
      rect();
      ellipse(0.5, 0.42, 0.34, 0.27, true);
      ellipse(0.5, 0.42, 0.025, 0.025, true);
      line([
        [0.2, 0.9],
        [0.2, 1],
      ]);
      line([
        [0.8, 0.9],
        [0.8, 1],
      ]);
      break;
    case 'pull-out-shelf':
      rect();
      rect(0.08, 0.08, 0.84, 0.78, true);
      line([
        [0.35, 0.92],
        [0.65, 0.92],
      ]);
      break;
    case 'wall-handrail':
    case 'grab-bar':
      rect(0, 0.28, 1, 0.44);
      line([
        [0.08, 0.14],
        [0.08, 0.86],
      ]);
      line([
        [0.92, 0.14],
        [0.92, 0.86],
      ]);
      break;
    case 'handrail':
      rect(0, 0.38, 1, 0.24);
      rect(0.08, 0, 0.08, 1, true);
      rect(0.84, 0, 0.08, 1, true);
      break;
  }
  return paths;
}

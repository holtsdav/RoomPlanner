import { describe, expect, it } from 'vitest';
import { Path } from 'konva/lib/shapes/Path';
import { accessibilityCatalog } from './accessibility-catalog';
import {
  catalogFamilyKey,
  catalogSearchText,
  libraryCategories,
  objectFromPreset,
} from './catalog';
import { catalogProvenance } from './catalog-provenance';
import { officeBlueprint } from './office-blueprints';
import { createStarterPlan, planObjectSchema } from './plan-document';
import { findWallAttachment, isWallAttached } from './wall-attachment';

describe('Accessibility objects', () => {
  it('exposes distinct ramp grades and keeps their rise when saved and resized', () => {
    const category = libraryCategories.find(
      (entry) => entry.id === 'accessibility',
    );
    expect(category?.presets).toBe(accessibilityCatalog);
    expect(new Set(accessibilityCatalog.map((preset) => preset.id)).size).toBe(
      accessibilityCatalog.length,
    );
    const ramps = accessibilityCatalog.filter(
      (preset) => preset.blueprint === 'wheelchair-ramp',
    );
    expect(ramps).toHaveLength(5);
    expect(new Set(ramps.map(catalogFamilyKey)).size).toBe(1);
    for (const preset of ramps) {
      const rise = preset.blueprintProfile?.rampRiseMm;
      expect(rise).toBeGreaterThan(0);
      expect(preset.depthMm / rise!).toBeGreaterThanOrEqual(12);
      expect(preset.name).toContain(
        `${((Math.atan(rise! / preset.depthMm) * 180) / Math.PI).toFixed(1)}°`,
      );
      const object = objectFromPreset(preset, preset.id, { x: 1000, y: 1000 });
      expect(
        planObjectSchema.parse(JSON.parse(JSON.stringify(object))),
      ).toEqual(object);
      expect(
        catalogProvenance({ ...object, depthMm: object.depthMm * 2 }).note,
      ).toContain(`1:${(preset.depthMm / rise!) * 2}`);
    }
    expect(catalogSearchText(ramps[0])).toContain('gradient');
  });

  it('provides both turning options, kitchen clearances, and wall-mounted supports', () => {
    const turns = accessibilityCatalog.filter(
      (preset) => preset.blueprint === 'wheelchair-turning-space',
    );
    expect(turns.map((preset) => preset.blueprintProfile?.form)).toEqual([
      'circle',
      't',
    ]);
    expect(new Set(turns.map(catalogFamilyKey)).size).toBe(1);
    expect(
      accessibilityCatalog.some(
        (preset) => preset.blueprint === 'knee-space-worktop',
      ),
    ).toBe(true);
    expect(
      accessibilityCatalog.some(
        (preset) => preset.blueprint === 'knee-space-sink',
      ),
    ).toBe(true);
    const room = createStarterPlan().room;
    for (const preset of accessibilityCatalog.filter((entry) =>
      ['wall-handrail', 'grab-bar'].includes(entry.blueprint!),
    )) {
      expect(isWallAttached(preset)).toBe(true);
      const mounted = findWallAttachment(
        objectFromPreset(preset, preset.id, { x: 2000, y: 2000 }),
        room,
      );
      expect(mounted).not.toBeNull();
      expect(mounted?.widthMm).toBe(preset.widthMm);
      expect(mounted?.depthMm).toBe(preset.depthMm);
    }
  });

  it('keeps every top-view symbol inside its editable footprint', () => {
    for (const preset of accessibilityCatalog) {
      for (const [width, depth] of [
        [preset.widthMm, preset.depthMm],
        [1, 10000],
        [10000, 1],
      ]) {
        const parts = officeBlueprint(
          preset.blueprint!,
          width,
          depth,
          preset.blueprintProfile,
        );
        expect(parts.length, preset.name).toBeGreaterThan(0);
        for (const part of parts) {
          const path = new Path({ data: part.d });
          const bounds = path.getSelfRect();
          path.destroy();
          expect(bounds.x, preset.name).toBeGreaterThanOrEqual(
            -width / 2 - 0.01,
          );
          expect(bounds.y, preset.name).toBeGreaterThanOrEqual(
            -depth / 2 - 0.01,
          );
          expect(bounds.x + bounds.width, preset.name).toBeLessThanOrEqual(
            width / 2 + 0.01,
          );
          expect(bounds.y + bounds.height, preset.name).toBeLessThanOrEqual(
            depth / 2 + 0.01,
          );
        }
      }
    }
  });
});

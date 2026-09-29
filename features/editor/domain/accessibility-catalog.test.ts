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
import { officeBlueprint, type BlueprintKind } from './office-blueprints';
import { createStarterPlan, planObjectSchema } from './plan-document';
import { findWallAttachment, isWallAttached } from './wall-attachment';

describe('Accessibility objects', () => {
  it('shades only the ramp deck and keeps wheelchair symbols proportional and below its arrow', () => {
    const ramps = accessibilityCatalog.filter(
      (preset) => preset.blueprint === 'wheelchair-ramp',
    );
    for (const preset of ramps) {
      const parts = officeBlueprint(
        preset.blueprint!,
        preset.widthMm,
        preset.depthMm,
        preset.blueprintProfile,
      );
      expect(parts.filter((part) => part.slope)).toHaveLength(1);
      expect(parts[0].slope).toBe(true);
      for (const part of parts.filter((part) => part.part === 'wheelchair')) {
        expect(part.strokeOnly).toBe(true);
        const path = new Path({ data: part.d });
        expect(path.getSelfRect().y).toBeGreaterThan(preset.depthMm * 0.03);
        path.destroy();
      }
    }
    const presets = accessibilityCatalog.filter(
      (preset) =>
        preset.blueprint === 'wheelchair-ramp' ||
        preset.blueprint === 'wheelchair-turning-space',
    );
    for (const preset of presets) {
      const parts = officeBlueprint(
        preset.blueprint!,
        preset.widthMm,
        preset.depthMm,
        preset.blueprintProfile,
      );
      const symbol = parts.filter((part) => part.part === 'wheelchair');
      expect(symbol).toHaveLength(3);
      // The wheelchair's wheel stays circular rather than stretching to match the footprint.
      const wheel = new Path({ data: symbol[1].d });
      const bounds = wheel.getSelfRect();
      expect(bounds.width).toBeCloseTo(bounds.height, 2);
      wheel.destroy();
    }
  });

  it('offers plan-size ramp variants and preserves reference rise in saved data', () => {
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
      expect(preset.name).not.toMatch(/rise|°/);
      const object = objectFromPreset(preset, preset.id, { x: 1000, y: 1000 });
      expect(
        planObjectSchema.parse(JSON.parse(JSON.stringify(object))),
      ).toEqual(object);
      expect(
        catalogProvenance({ ...object, depthMm: object.depthMm * 2 }).note,
      ).not.toContain('rise');
    }
    expect(catalogSearchText(ramps[0])).toContain('gradient');
  });

  it('provides turning options and wall-mounted or freely placed handrails', () => {
    const turns = accessibilityCatalog.filter(
      (preset) => preset.blueprint === 'wheelchair-turning-space',
    );
    expect(turns.map((preset) => preset.blueprintProfile?.form)).toEqual([
      'circle',
      't',
    ]);
    expect(new Set(turns.map(catalogFamilyKey)).size).toBe(1);
    const wallRails = accessibilityCatalog.filter(
      (entry) => entry.blueprint === 'wall-handrail',
    );
    const freeRails = accessibilityCatalog.filter(
      (entry) => entry.blueprint === 'handrail',
    );
    expect(wallRails).toHaveLength(3);
    expect(freeRails).toHaveLength(3);
    const room = createStarterPlan().room;
    for (const preset of wallRails) {
      expect(isWallAttached(preset)).toBe(true);
      const mounted = findWallAttachment(
        objectFromPreset(preset, preset.id, { x: 2000, y: 2000 }),
        room,
      );
      expect(mounted).not.toBeNull();
      expect(mounted?.widthMm).toBe(preset.widthMm);
      expect(mounted?.depthMm).toBe(preset.depthMm);
    }
    for (const preset of freeRails) {
      expect(isWallAttached(preset)).toBe(false);
      const placed = objectFromPreset(preset, preset.id, { x: 2000, y: 2000 });
      expect(findWallAttachment(placed, room)).toBe(placed);
      expect(planObjectSchema.parse(placed)).toEqual(placed);
    }
  });

  it('removes retired presets while keeping older saved objects readable', () => {
    const retired = [
      'ramp-landing',
      'kitchen-aisle-clearance',
      'knee-space-worktop',
      'knee-space-sink',
      'pull-out-shelf',
      'grab-bar',
    ] as const;
    const remaining = new Set(
      accessibilityCatalog.map((preset) => preset.blueprint),
    );
    const existing = objectFromPreset(accessibilityCatalog[0], 'old', {
      x: 1000,
      y: 1000,
    });
    for (const kind of retired) {
      expect(remaining.has(kind)).toBe(false);
      expect(
        planObjectSchema.safeParse({ ...existing, blueprint: kind }).success,
      ).toBe(true);
      expect(
        officeBlueprint(kind as BlueprintKind, 900, 600).length,
      ).toBeGreaterThan(0);
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

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatMeasurement,
  type PlanObject,
  type PlanDocument,
} from '../domain/plan-document';
import { getObjectColors } from './object-colors';

/** Measured side elevation complements the dimension-faithful plan view. */
export function RampProfile({
  object,
  units,
  onReverse,
}: {
  object: PlanObject;
  units: PlanDocument['units'];
  onReverse: () => void;
}) {
  const rise = object.blueprintProfile?.rampRiseMm;
  const colors = getObjectColors(object);
  const scale = rise ? Math.min(280 / object.depthMm, 64 / rise) : 0;
  const run = object.depthMm * scale;
  const height = (rise ?? 0) * scale;
  const left = (320 - run) / 2;
  const right = left + run;

  return (
    <section
      aria-label="Ramp slope"
      className="mt-2 border-t border-slate-100 px-1 pt-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800">
          Ramp · side view
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={object.locked}
          onClick={onReverse}
        >
          <RotateCw aria-hidden="true" /> Reverse uphill
        </Button>
      </div>
      {rise ? (
        <>
          <svg
            viewBox="0 0 320 100"
            aria-label={`Ramp side view: ${formatMeasurement(rise, units)} rise over ${formatMeasurement(object.depthMm, units)} horizontal run`}
            className="h-24 w-full"
          >
            <path
              d={`M ${left} 76 L ${right} ${76 - height} L ${right} 76 Z`}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d={`M ${left} 76 L ${right} ${76 - height}`}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="2.5"
            />
            <text
              x={left}
              y="94"
              textAnchor="start"
              fontSize="12"
              fill={colors.stroke}
            >
              Low
            </text>
            <text
              x={right}
              y={Math.max(12, 66 - height)}
              textAnchor="end"
              fontSize="12"
              fill={colors.stroke}
            >
              High · {formatMeasurement(rise, units)}
            </text>
            <text
              x={right}
              y="94"
              textAnchor="end"
              fontSize="12"
              fill={colors.stroke}
            >
              Run {formatMeasurement(object.depthMm, units)}
            </text>
          </svg>
          <p className="text-xs font-medium tabular-nums text-slate-800">
            1:{Number((object.depthMm / rise).toFixed(1))} slope ·{' '}
            {Number(((rise / object.depthMm) * 100).toFixed(1))}% ·{' '}
            {((Math.atan(rise / object.depthMm) * 180) / Math.PI).toFixed(1)}°
          </p>
        </>
      ) : (
        <p className="py-2 text-xs text-slate-600">
          Choose a ramp variant to set its reference rise.
        </p>
      )}
      <p className="mt-1 text-xs text-slate-600">
        UP points to the high end on the plan. Depth sets the horizontal run;
        rise comes from the selected variant. Landings are separate.
      </p>
    </section>
  );
}

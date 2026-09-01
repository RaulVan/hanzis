"use client";

import { CharacterGrid } from "@/components/grid";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { gridOptions, type GridType } from "@/types";

export function GridSelector() {
  const { config, setGridType, setColumnsPerRow } = useWorksheetStore();
  return (
    <FieldSet className="gap-3">
      <FieldLegend className="mb-0">字格与排版</FieldLegend>
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel id="worksheet-grid-label" className="sr-only">字格类型</FieldLabel>
          <ToggleGroup type="single" variant="outline" spacing={2} value={config.gridType}
            onValueChange={(value) => { if (value) setGridType(value as GridType); }}
            aria-labelledby="worksheet-grid-label" className="grid w-full grid-cols-4 gap-2">
            {gridOptions.map((option) => (
              <ToggleGroupItem key={option.type} value={option.type} aria-label={option.label} title={option.description}
                className="h-auto min-w-0 flex-col gap-2 px-1 py-2">
                <span aria-hidden="true"><CharacterGrid type={option.type} size={36} lineColor="currentColor" borderColor="currentColor" borderWidth={1} /></span>
                <span>{option.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field orientation="horizontal" className="gap-3">
          <FieldLabel id="worksheet-columns-label" className="shrink-0">每行格数</FieldLabel>
          <Slider aria-labelledby="worksheet-columns-label" value={[config.columnsPerRow]}
            onValueChange={([value]) => setColumnsPerRow(value)} min={8} max={20} step={1} className="min-w-0 flex-1" />
          <output className="min-w-8 text-center text-sm tabular-nums" aria-label="每行格数">{config.columnsPerRow}</output>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

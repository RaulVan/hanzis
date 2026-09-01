"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorksheetStore } from "@/stores/worksheetStore";

const presets = [
  { value: "#292C26", label: "墨色" },
  { value: "#C87D75", label: "朱红" },
  { value: "#C6C2BC", label: "浅灰" },
];

export function ColorSettings() {
  const { config, setConfig } = useWorksheetStore();
  const fields = [
    { key: "characterColor", label: "首字颜色" },
    { key: "traceColor", label: "描红颜色" },
    { key: "gridColor", label: "字格线条" },
    { key: "pinyinColor", label: "拼音颜色" },
    { key: "strokeOrderColor", label: "笔顺颜色" },
  ] as const;
  return (
    <FieldSet>
      <FieldLegend>打印颜色</FieldLegend>
      <FieldGroup className="gap-4">
        {fields.map(({ key, label }) => (
          <Field key={key} className="gap-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor={`worksheet-${key}`}>{label}</FieldLabel>
              <Input id={`worksheet-${key}`} type="color" value={config[key]} className="size-11 cursor-pointer p-1"
                onChange={(event) => setConfig({ [key]: event.target.value })} />
            </div>
            <ToggleGroup type="single" variant="outline" size="sm" value={config[key].toUpperCase()}
              onValueChange={(value) => { if (value) setConfig({ [key]: value }); }} aria-label={`${label}预设`} className="w-full">
              {presets.map((preset) => (
                <ToggleGroupItem key={preset.value} value={preset.value} className="flex-1">
                  <span className="size-3 rounded-sm" style={{ backgroundColor: preset.value }} aria-hidden="true" />{preset.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

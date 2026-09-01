"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function SettingSwitch({ id, label, checked, onCheckedChange, disabled = false }: {
  id: string; label: string; checked: boolean; onCheckedChange: (value: boolean) => void; disabled?: boolean;
}) {
  return (
    <Field orientation="horizontal" data-disabled={disabled || undefined} className="min-h-11 justify-between gap-3">
      <FieldLabel htmlFor={id} className="flex-1">{label}</FieldLabel>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </Field>
  );
}

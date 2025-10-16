import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EquipmentItem {
  value: string;
  label: string;
}

interface EquipmentChecklistProps {
  selectedEquipment: string[];
  onChange: (equipment: string[]) => void;
}

const equipmentItems: EquipmentItem[] = [
  { value: "Clipboards", label: "Clipboards, pens, name tags, uniforms" },
  { value: "Demo Kit", label: "Demo Kit" },
  { value: "Dental Kit", label: "Dental model, display table, cloths" },
  { value: "Flyers", label: "Flyers, banners, QR stands" },
  { value: "Tech", label: "Tablet, phone, SIM, power bank" },
];

export const EquipmentChecklist: React.FC<EquipmentChecklistProps> = ({
  selectedEquipment,
  onChange
}) => {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedEquipment, value]);
    } else {
      onChange(selectedEquipment.filter(item => item !== value));
    }
  };

  return (
    <div className="space-y-4">
      {equipmentItems.map((item) => (
        <div key={item.value} className="flex items-center space-x-3">
          <Checkbox
            id={item.value}
            checked={selectedEquipment.includes(item.value)}
            onCheckedChange={(checked) => handleCheckboxChange(item.value, !!checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label
            htmlFor={item.value}
            className="text-base font-medium leading-relaxed cursor-pointer"
          >
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  );
};
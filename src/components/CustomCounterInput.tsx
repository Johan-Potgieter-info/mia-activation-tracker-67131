import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface CustomCounterInputProps {
  label: string;
  metricName: string;
  value: number;
  onNameChange: (name: string) => void;
  onValueChange: (value: number) => void;
  min?: number;
}

export const CustomCounterInput: React.FC<CustomCounterInputProps> = ({
  label,
  metricName,
  value,
  onNameChange,
  onValueChange,
  min = 0,
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onValueChange(newValue);
  };

  const handleIncrement = () => {
    onValueChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-5">
      <Input
        type="text"
        placeholder={label}
        value={metricName}
        onChange={(e) => onNameChange(e.target.value)}
        className="flex-1 text-base"
      />
      <div className="flex items-center gap-3 ml-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-10 w-10 border-primary/20 hover:bg-primary hover:text-primary-foreground"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          className="w-20 text-center text-lg font-medium"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          className="h-10 w-10 border-primary/20 hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

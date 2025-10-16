import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface CounterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  name?: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  name
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <span className="flex-1 text-lg font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-3">
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
          name={name}
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
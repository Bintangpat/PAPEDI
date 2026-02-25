"use client";

import { SurveyStepConfig } from "@/types/survey";
import { cn } from "@/lib/utils";

interface SurveyStepProps {
  config: SurveyStepConfig;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export function SurveyStep({
  config,
  selectedValue,
  onSelect,
}: SurveyStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <p className="text-muted-foreground text-sm">{config.question}</p>
      </div>

      <div className="space-y-2">
        {config.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full rounded-lg border p-3 text-left text-sm transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              "focus:ring-primary/30 focus:ring-2 focus:outline-none",
              selectedValue === option.value
                ? "border-primary bg-primary/10 text-primary ring-primary/30 font-medium ring-1"
                : "border-border bg-background text-foreground",
            )}
          >
            <span className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selectedValue === option.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {selectedValue === option.value && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span>{option.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

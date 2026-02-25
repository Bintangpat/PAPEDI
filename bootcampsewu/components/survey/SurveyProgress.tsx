"use client";

import { Progress } from "@/components/ui/progress";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function SurveyProgress({
  currentStep,
  totalSteps,
}: SurveyProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Langkah {currentStep} dari {totalSteps}
        </span>
        <span className="text-primary font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

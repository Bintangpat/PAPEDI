"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SurveyProgress } from "./SurveyProgress";
import { SurveyStep } from "./SurveyStep";
import { SurveyResult } from "./SurveyResult";
import { surveyService } from "@/services/survey.service";
import {
  SurveyFormData,
  SurveyResult as SurveyResultType,
  SURVEY_STEPS,
} from "@/types/survey";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const STORAGE_KEY = "survey_form_data";
const STORAGE_STEP_KEY = "survey_current_step";

type SurveyPhase = "survey" | "result" | "loading";

export function SurveyModal() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SurveyFormData>>({});
  const [phase, setPhase] = useState<SurveyPhase>("survey");
  const [result, setResult] = useState<SurveyResultType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if student user has already completed survey
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "student") return;

    const checkSurvey = async () => {
      try {
        const response = await surveyService.getResult();
        if (!response.hasSurvey) {
          // Restore from sessionStorage if available
          const savedData = sessionStorage.getItem(STORAGE_KEY);
          const savedStep = sessionStorage.getItem(STORAGE_STEP_KEY);
          if (savedData) {
            try {
              setFormData(JSON.parse(savedData));
            } catch {
              // ignore parse errors
            }
          }
          if (savedStep) {
            setCurrentStep(Math.min(parseInt(savedStep, 10) || 1, 5));
          }
          setOpen(true);
        }
      } catch {
        // If API fails, don't show survey — fail gracefully
      }
    };

    checkSurvey();
  }, [isAuthenticated, user]);

  // Save to sessionStorage on change
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_STEP_KEY, String(currentStep));
  }, [currentStep]);

  const clearStorage = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP_KEY);
  }, []);

  const currentConfig = SURVEY_STEPS[currentStep - 1];
  const currentValue = currentConfig
    ? formData[currentConfig.fieldName]
    : undefined;

  const handleSelect = (value: string) => {
    if (!currentConfig) return;
    setFormData((prev) => ({
      ...prev,
      [currentConfig.fieldName]: value,
    }));
    setError(null);
  };

  const handleNext = () => {
    if (!currentValue) {
      setError("Silakan pilih salah satu jawaban.");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, SURVEY_STEPS.length));
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!currentValue) {
      setError("Silakan pilih salah satu jawaban.");
      return;
    }

    // Validate all fields filled
    const complete = formData as SurveyFormData;
    if (
      !complete.q1Goal ||
      !complete.q2Interest ||
      !complete.q3Experience ||
      !complete.q4Result ||
      !complete.q5Style
    ) {
      setError("Ada pertanyaan yang belum dijawab.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await surveyService.submit(complete);
      setResult(response.data);
      setPhase("result");
      clearStorage();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Gagal mengirim survei. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    clearStorage();
  };

  const handleSkip = () => {
    handleClose();
  };

  const isLastStep = currentStep === SURVEY_STEPS.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent
        showCloseButton={phase !== "loading"}
        className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]"
      >
        {phase === "survey" && (
          <>
            <DialogHeader>
              <DialogTitle>Survei Peminatan Pelatihan</DialogTitle>
              <DialogDescription>
                Bantu kami merekomendasikan pelatihan terbaik untukmu.
              </DialogDescription>
            </DialogHeader>

            {/* Progress */}
            <SurveyProgress
              currentStep={currentStep}
              totalSteps={SURVEY_STEPS.length}
            />

            {/* Step Content */}
            {currentConfig && (
              <SurveyStep
                config={currentConfig}
                selectedValue={currentValue}
                onSelect={handleSelect}
              />
            )}

            {/* Error */}
            {error && (
              <p className="text-destructive text-center text-sm">{error}</p>
            )}

            {/* Footer */}
            <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Lewati
                </Button>
                {isLastStep ? (
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Lihat Rekomendasi"
                    )}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleNext} className="gap-1">
                    Lanjut
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}

        {phase === "result" && result && (
          <SurveyResult result={result} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

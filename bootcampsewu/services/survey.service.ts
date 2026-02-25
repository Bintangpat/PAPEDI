import api from "@/lib/axios";
import {
  SurveyFormData,
  SurveySubmitResponse,
  SurveyResultResponse,
} from "@/types/survey";

export const surveyService = {
  /** POST /survey/submit — Submit survey dan dapatkan rekomendasi */
  submit: async (formData: SurveyFormData): Promise<SurveySubmitResponse> => {
    const { data } = await api.post<SurveySubmitResponse>(
      "/survey/submit",
      formData,
    );
    return data;
  },

  /** GET /survey/result — Ambil hasil survey yang sudah pernah disubmit */
  getResult: async (): Promise<SurveyResultResponse> => {
    const { data } = await api.get<SurveyResultResponse>("/survey/result");
    return data;
  },
};

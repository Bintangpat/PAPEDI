import { useQuery } from "@tanstack/react-query";
import { surveyService } from "@/services/survey.service";

/** Hook untuk mengambil hasil survey user (rekomendasi kategori & level) */
export const useSurvey = () => {
  return useQuery({
    queryKey: ["survey-result"],
    queryFn: () => surveyService.getResult(),
    staleTime: 1000 * 60 * 60, // 1 jam (data survey jarang berubah)
  });
};

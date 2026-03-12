import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { SpecialistTemplate } from "./SpecialistTemplate";
import { CleanTemplate } from "./CleanTemplate";
import { PrimeATSTemplate } from "./PrimeATSTemplate";
import { ResumeTemplate } from "../candidate/InputResumeDetails";

export const templates: Record<string, ResumeTemplate> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  primeats: PrimeATSTemplate,
  specialist: SpecialistTemplate,
  clean: CleanTemplate,
};

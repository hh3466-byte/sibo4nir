export type TrafficLightStatus = 'GREEN' | 'YELLOW' | 'RED';

export type SiboPhase = 'phase1_strict' | 'phase2_moderate';

export interface IngredientItem {
  name: string;
  status: TrafficLightStatus;
  notes?: string;
}

export interface FoodAnalysisResult {
  status: TrafficLightStatus;
  foodName: string;
  englishName?: string;
  shortVerdict: string;
  detailedExplanation: string;
  fodmapTriggers: string[]; // e.g. ["Fructans (פרוקטנים)", "Lactose (לקטוז)"]
  phase1Compatibility: boolean;
  phase2Compatibility: boolean;
  maxSafePortion: string;
  safeSubstitutions: string[];
  cookingTips: string[];
  medicalReferences: string[];
  ingredientsBreakdown?: IngredientItem[];
  imageUrl?: string;
  isPackagedProduct?: boolean;
  barcode?: string;
  riskScore?: number;
  timestamp: number;
}

export interface SiboFoodItem {
  id: string;
  nameHe: string;
  nameEn: string;
  category: FoodCategory;
  statusPhase1: TrafficLightStatus;
  statusPhase2: TrafficLightStatus;
  safePortionHe: string;
  fodmapGroup: string;
  notesHe: string;
  alternativesHe?: string[];
  popular?: boolean;
}

export type FoodCategory =
  | 'vegetables'
  | 'fruits'
  | 'proteins'
  | 'grains_starches'
  | 'dairy_alternatives'
  | 'nuts_seeds'
  | 'condiments_spices'
  | 'sweets_sweeteners'
  | 'drinks';

export interface MealLogEntry {
  id: string;
  foodName: string;
  status: TrafficLightStatus;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: number;
  notes?: string;
  symptoms?: {
    bloating: number; // 0-5
    pain: number; // 0-5
    energy: number; // 0-5
  };
  imageUrl?: string;
}

export interface MedicalArticle {
  id: string;
  titleHe: string;
  titleEn: string;
  source: string;
  authors: string;
  year: number;
  summaryHe: string;
  keyTakeawaysHe: string[];
  clinicalImpactHe: string;
  category: 'protocol' | 'research' | 'guidelines' | 'microbiome';
}

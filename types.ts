
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY', // 앉아서 주로 생활
  LIGHT = 'LIGHT',       // 가벼운 활동
  ACTIVE = 'ACTIVE',       // 활동적
}

export enum GoalPurpose {
  MUSCLE = 'MUSCLE', // 근육 성장
  MAINTAIN = 'MAINTAIN', // 건강 유지
}

export interface UserProfile {
  gender: Gender | null;
  age: number;
  weight: number;
  activityLevel: ActivityLevel | null;
  purpose: GoalPurpose | null;
}

export interface UserData extends UserProfile {
  proteinGoal: number;
}

export interface FoodItem {
  name: string;
  protein: number;
  amount: number;
  unit: string;
}

export interface IntakeRecord {
  id: string;
  food: FoodItem;
  timestamp: Date;
}

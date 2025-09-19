
import type { UserData, IntakeRecord } from '../types';

interface AIFeedback {
  title: string;
  message: string;
  icon: string;
}

// This is a mock service that simulates Gemini API calls.
export const getAIFeedback = async (userData: UserData, intakeHistory: IntakeRecord[]): Promise<AIFeedback> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));

  const totalProteinToday = intakeHistory
    .filter(record => new Date(record.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, record) => sum + record.food.protein, 0);

  const percentage = totalProteinToday / userData.proteinGoal;

  if (intakeHistory.length === 0) {
    return {
      title: "시작이 반이에요!",
      message: "안녕하세요! 🤖 이제 막 프로틴 메이트와 여정을 시작하셨군요. 첫 단백질 기록을 추가하고 건강한 습관을 만들어봐요!",
      icon: "🥚"
    };
  }
  
  if (percentage < 0.5) {
     return {
      title: "힘을 내요, 슈퍼파워!",
      message: `[사용자]님! 🤖 분석 결과, 오늘 단백질 섭취량이 아직 목표의 절반에 미치지 못했어요. 저녁 식사에 닭가슴살 100g을 추가해보는 건 어떠세요?`,
      icon: "🍗"
    };
  }

  if (percentage >= 1) {
    return {
      title: "목표 달성! 완벽해요!",
      message: "축하드려요, [사용자]님! 🤖 오늘의 단백질 목표를 훌륭하게 달성하셨네요. 꾸준함이 건강한 몸을 만든답니다. 내일도 화이팅!",
      icon: "✨"
    };
  }

  // A default real-time suggestion
  const remaining = userData.proteinGoal - totalProteinToday;
  if (remaining > 0 && remaining <= 20) {
     return {
        title: "거의 다 왔어요!",
        message: `조금만 더 힘내요! 💡 단백질 쉐이크 한 잔이면 오늘의 목표를 달성할 수 있어요!`,
        icon: "🥤"
     };
  }

  return {
    title: "꾸준함이 중요해요!",
    message: "안녕하세요, [사용자]님! 🤖 단백질 섭취 패턴을 분석하고 있어요. 꾸준히 기록해서 더 정확한 피드백을 받아보세요!",
    icon: "📊"
  };
};

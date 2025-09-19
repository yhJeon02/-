
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronsRight, Plus, Search, Weight, User, Activity, Bot, Home, BarChart2, CheckCircle, Flame, Droplets, Settings } from 'lucide-react';
import type { UserData, UserProfile, FoodItem, IntakeRecord, Gender, ActivityLevel, GoalPurpose } from './types';
import { Gender as GenderEnum, ActivityLevel as ActivityLevelEnum, GoalPurpose as GoalPurposeEnum } from './types';
import { QUICK_ADD_FOODS, FoodIcon } from './constants';
import { getAIFeedback } from './services/geminiService';

// --- HELPER & UI COMPONENTS ---

const AuroraBackground: React.FC = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-violet-400 to-pink-400 rounded-full animate-spin-slow filter blur-3xl opacity-30" />
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-sky-400 to-green-300 rounded-full animate-pulse filter blur-3xl opacity-20" />
    <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-pink-300 to-yellow-300 rounded-full animate-spin-slower filter blur-3xl opacity-20" />
  </div>
);

const IphoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-800 min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-[430px] h-[932px] bg-gray-50 text-gray-800 rounded-[60px] border-[14px] border-black shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-2xl z-20 flex justify-center items-center gap-4">
        <div className="w-12 h-2 bg-gray-700 rounded-full"></div>
      </div>
      <div className="w-full h-full overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

interface OnboardingCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({ children, onClick, className }) => (
    <div 
        onClick={onClick}
        className={`bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${className}`}
    >
        {children}
    </div>
);

// --- ONBOARDING SCREEN ---

const OnboardingScreen: React.FC<{ onComplete: (data: UserData) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
        gender: null,
        age: 25,
        weight: 60,
        activityLevel: null,
        purpose: null,
    });
    const [proteinGoal, setProteinGoal] = useState(0);

    const handleNext = () => setStep(s => s + 1);

    const updateProfile = <K extends keyof UserProfile,>(key: K, value: UserProfile[K]) => {
        setProfile(p => ({ ...p, [key]: value }));
    };
    
    useEffect(() => {
        if (step === 4) {
            const { weight, activityLevel, purpose } = profile;
            let multiplier = 1.2; // Maintain
            if (purpose === GoalPurposeEnum.MUSCLE) multiplier = 1.6;
            
            if (activityLevel === ActivityLevelEnum.LIGHT) multiplier += 0.2;
            else if (activityLevel === ActivityLevelEnum.ACTIVE) multiplier += 0.4;
            
            const goal = Math.round(weight * multiplier);
            setProteinGoal(goal);
        }
    }, [step, profile]);
    
    const handleComplete = () => {
        onComplete({ ...profile, proteinGoal });
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <WelcomeStep onNext={handleNext} />;
            case 2: return <GenderStep onSelect={(g) => { updateProfile('gender', g); handleNext(); }} />;
            case 3: return <InfoStep profile={profile} updateProfile={updateProfile} onNext={handleNext} />;
            case 4: return <GoalStep goal={proteinGoal} setGoal={setProteinGoal} onNext={handleComplete} />;
            default: return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-6 relative font-jua">
            <AuroraBackground />
            <div className="w-full transition-all duration-500">
                {renderStep()}
            </div>
        </div>
    );
};

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div className="text-center flex flex-col items-center gap-8">
        <div className="w-32 h-32 bg-gradient-to-br from-pink-300 to-sky-300 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Droplets size={64} className="text-white"/>
        </div>
        <h1 className="text-3xl font-bold text-gray-700">프로틴 메이트</h1>
        <p className="text-lg text-gray-500" style={{ wordBreak: 'keep-all' }}>건강한 단백질 라이프, <br /> 지금 시작해 볼까요?</p>
        <button onClick={onNext} className="mt-8 bg-white/80 backdrop-blur-md text-gray-700 font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2">
            시작하기 <ChevronsRight />
        </button>
    </div>
);

const GenderStep: React.FC<{ onSelect: (gender: GenderEnum) => void }> = ({ onSelect }) => (
    <div className="text-center">
        <h2 className="text-2xl font-bold mb-8 text-gray-700">성별을 알려주세요.</h2>
        <div className="flex justify-center gap-6">
            <OnboardingCard onClick={() => onSelect(GenderEnum.MALE)} className="w-32 h-32 flex flex-col justify-center items-center gap-2">
                <span className="text-5xl">♂️</span>
                <span className="font-semibold">남성</span>
            </OnboardingCard>
            <OnboardingCard onClick={() => onSelect(GenderEnum.FEMALE)} className="w-32 h-32 flex flex-col justify-center items-center gap-2">
                <span className="text-5xl">♀️</span>
                <span className="font-semibold">여성</span>
            </OnboardingCard>
        </div>
    </div>
);

const InfoStep: React.FC<{ profile: UserProfile, updateProfile: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void, onNext: () => void }> = ({ profile, updateProfile, onNext }) => (
    <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">기본 정보를 입력해주세요.</h2>
        <OnboardingCard className="text-left">
            <label className="font-semibold text-gray-600 flex items-center gap-2"><User size={18}/> 나이</label>
            <div className="flex items-center gap-4">
                <input type="range" min="10" max="100" value={profile.age} onChange={e => updateProfile('age', parseInt(e.target.value))} className="w-full"/>
                <span className="font-bold text-lg w-12 text-right">{profile.age}세</span>
            </div>
        </OnboardingCard>
        <OnboardingCard className="text-left">
            <label className="font-semibold text-gray-600 flex items-center gap-2"><Weight size={18}/> 체중</label>
            <div className="flex items-center gap-4">
                <input type="range" min="30" max="150" value={profile.weight} onChange={e => updateProfile('weight', parseInt(e.target.value))} className="w-full"/>
                <span className="font-bold text-lg w-12 text-right">{profile.weight}kg</span>
            </div>
        </OnboardingCard>
         <OnboardingCard className="text-left p-4">
             <label className="font-semibold text-gray-600 flex items-center gap-2 mb-2"><Activity size={18}/> 활동량</label>
             <div className="flex justify-around">
                 {Object.values(ActivityLevelEnum).map(level => (
                    <button key={level} onClick={() => updateProfile('activityLevel', level)} className={`p-2 rounded-full transition-all ${profile.activityLevel === level ? 'bg-violet-300 text-white shadow-md' : 'bg-white/50'}`}>
                        {level === ActivityLevelEnum.SEDENTARY ? '📚' : level === ActivityLevelEnum.LIGHT ? '🧘‍♀️' : '🏃‍♀️'}
                    </button>
                 ))}
             </div>
         </OnboardingCard>
         <OnboardingCard className="text-left p-4">
             <label className="font-semibold text-gray-600 flex items-center gap-2 mb-2"><Flame size={18}/> 사용 목적</label>
             <div className="flex justify-around">
                  <button onClick={() => updateProfile('purpose', GoalPurposeEnum.MAINTAIN)} className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${profile.purpose === GoalPurposeEnum.MAINTAIN ? 'bg-pink-300 text-white shadow-md' : 'bg-white/50'}`}>🍎 유지</button>
                  <button onClick={() => updateProfile('purpose', GoalPurposeEnum.MUSCLE)} className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${profile.purpose === GoalPurposeEnum.MUSCLE ? 'bg-sky-300 text-white shadow-md' : 'bg-white/50'}`}>💪 근육</button>
             </div>
         </OnboardingCard>
        <button onClick={onNext} disabled={!profile.activityLevel || !profile.purpose} className="mt-8 bg-white/80 backdrop-blur-md text-gray-700 font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            다음
        </button>
    </div>
);

const GoalStep: React.FC<{ goal: number, setGoal: (g: number) => void, onNext: () => void }> = ({ goal, setGoal, onNext }) => (
    <div className="text-center flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-gray-700">하루 권장 단백질량이에요.</h2>
        <div className="w-full p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-lg">
            <p className="text-lg text-gray-500">하루 목표</p>
            <p className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500 my-2">{goal}g</p>
            <div className="flex items-center justify-center gap-4 mt-4">
                <button onClick={() => setGoal(goal - 1)} className="w-10 h-10 rounded-full bg-white/80 text-gray-600 text-2xl shadow-sm">-</button>
                <input type="range" min="30" max="200" value={goal} onChange={e => setGoal(parseInt(e.target.value))} className="w-full" />
                <button onClick={() => setGoal(goal + 1)} className="w-10 h-10 rounded-full bg-white/80 text-gray-600 text-2xl shadow-sm">+</button>
            </div>
        </div>
        <p className="text-sm text-gray-500">목표는 언제든지 수정할 수 있어요.</p>
        <button onClick={onNext} className="mt-4 bg-white/80 backdrop-blur-md text-gray-700 font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2">
            완료! <CheckCircle />
        </button>
    </div>
);

// --- PROTEIN SHAKER COMPONENT ---
interface ProteinShakerProps {
  intake: number;
  goal: number;
  cupSize: number;
  isLast: boolean;
  cupIndex: number;
}
const ProteinShaker: React.FC<ProteinShakerProps> = ({ intake, goal, cupSize, isLast, cupIndex }) => {
    const fillPercentage = Math.min(100, (intake / cupSize) * 100);
    const isFull = fillPercentage >= 100;

    return (
        <div className="relative flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-400 mb-1">{cupIndex + 1}st Cup</span>
            <div className="relative w-24 h-32 bg-white/30 backdrop-blur-sm rounded-t-2xl rounded-b-lg border-2 border-white/50 shadow-inner">
                {/* Cap */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/50 rounded-t-lg border-2 border-b-0 border-white/50"></div>
                
                {/* Liquid */}
                <div 
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-violet-400 via-pink-400 to-sky-300 rounded-b-md transition-all duration-1000 ease-out"
                    style={{ height: `${fillPercentage}%` }}
                />

                {/* Markings */}
                <div className="absolute right-1 top-0 h-full text-right text-[8px] text-white/70 flex flex-col-reverse justify-between py-1">
                    {[...Array(Math.floor(cupSize/10))].map((_, i) => (
                      <span key={i}>- {(i+1)*10}</span>
                    ))}
                </div>
                
                {isFull && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-yellow-500 text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                        ✨미션 클리어!✨
                    </div>
                )}
            </div>
        </div>
    );
};

// --- HOME SCREEN ---
const HomeScreen: React.FC<{ userData: UserData; intakeHistory: IntakeRecord[]; logProtein: (item: FoodItem) => void; openDrawer: () => void }> = ({ userData, intakeHistory, logProtein, openDrawer }) => {
    const today = new Date();
    const totalIntake = useMemo(() => intakeHistory
        .filter(record => new Date(record.timestamp).toDateString() === today.toDateString())
        .reduce((sum, record) => sum + record.food.protein, 0), [intakeHistory, today]);

    const percentage = Math.min(100, (totalIntake / userData.proteinGoal) * 100);
    const remaining = userData.proteinGoal - totalIntake;
    const eggEquiv = Math.ceil(Math.max(0, remaining) / 6);
    
    const cups = useMemo(() => {
        let goal = userData.proteinGoal;
        const cupConfig = [];
        while (goal > 0) {
            const size = goal >= 50 ? 50 : goal;
            cupConfig.push({ size });
            goal -= size;
        }
        return cupConfig;
    }, [userData.proteinGoal]);
    
    let intakeRemaining = totalIntake;

    return (
        <div className="p-6 pb-24 text-center font-jua">
            <div className="mb-6">
                <p className="text-lg text-gray-500" style={{ wordBreak: 'keep-all' }}>내게 필요한 오늘의 단백질은</p>
                <p className="text-3xl font-bold text-gray-700" style={{ wordBreak: 'keep-all' }}>{userData.proteinGoal}g 입니다.</p>
            </div>
            
            <div className="flex justify-center items-end gap-4 my-8 min-h-[160px]">
                {cups.map((cup, index) => {
                    const intakeForCup = Math.max(0, Math.min(intakeRemaining, cup.size));
                    intakeRemaining -= intakeForCup;
                    return (
                        <ProteinShaker 
                            key={index}
                            intake={intakeForCup}
                            goal={userData.proteinGoal}
                            cupSize={cup.size}
                            isLast={index === cups.length - 1}
                            cupIndex={index}
                        />
                    );
                })}
            </div>

            <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-md space-y-2">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-600">현재 섭취량</span>
                    <span>{totalIntake}g / <span className="text-gray-500">{userData.proteinGoal}g</span></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-violet-400 to-pink-400 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                </div>
                <p className="text-right text-sm font-semibold">{percentage.toFixed(0)}%</p>
                 {remaining > 0 &&
                    <div className="mt-2 text-md text-violet-600 font-semibold p-2 bg-violet-100/50 rounded-lg shadow-inner">
                        🥚 달걀 {eggEquiv}개 분량 부족!
                    </div>
                }
            </div>
            
            <div className="mt-8">
                <h3 className="text-left text-lg font-bold text-gray-600 mb-2">빠른 입력</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                    {QUICK_ADD_FOODS.map(food => (
                        <button key={food.name} onClick={() => logProtein(food)} className="flex-shrink-0 w-24 h-24 flex flex-col justify-center items-center gap-1 bg-white/60 backdrop-blur-md rounded-2xl shadow-md hover:scale-105 transition-transform">
                            <FoodIcon name={food.name} className="w-8 h-8 text-pink-400" />
                            <p className="font-semibold text-sm">{food.name}</p>
                            <p className="text-xs text-gray-500">{food.protein}g</p>
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={openDrawer} className="fixed bottom-24 right-8 w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-full shadow-lg flex justify-center items-center transform hover:scale-110 transition-transform">
                <Plus size={32} />
            </button>
        </div>
    );
};

// --- REPORT SCREEN ---
const ReportScreen: React.FC<{ userData: UserData; intakeHistory: IntakeRecord[] }> = ({ userData, intakeHistory }) => {
    const [feedback, setFeedback] = useState({ title: '분석 중...', message: 'AI가 데이터를 분석하고 있어요.', icon: '🤖' });

    useEffect(() => {
        const fetchFeedback = async () => {
            const result = await getAIFeedback(userData, intakeHistory);
            setFeedback(result);
        };
        fetchFeedback();
    }, [userData, intakeHistory]);

    const chartData = useMemo(() => {
        const last7Days: { name: string; protein: number, goal: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('ko-KR', { weekday: 'short' });
            
            const dailyIntake = intakeHistory
                .filter(record => new Date(record.timestamp).toDateString() === d.toDateString())
                .reduce((sum, record) => sum + record.food.protein, 0);

            last7Days.push({ name: dayStr, protein: dailyIntake, goal: userData.proteinGoal });
        }
        return last7Days;
    }, [intakeHistory, userData.proteinGoal]);

    return (
        <div className="p-6 pb-24 font-jua">
            <h2 className="text-3xl font-bold text-gray-700 mb-6">주간 리포트</h2>
            
            <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-md mb-6">
                <h3 className="font-bold text-lg text-gray-600 mb-2">섭취량 추이 (7일)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 2, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <YAxis tickLine={false} axisLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.5)'}} contentStyle={{backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '1rem'}}/>
                            <Bar dataKey="protein" radius={[10, 10, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.protein >= entry.goal ? '#60a5fa' : '#f472b6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-md">
                <h3 className="font-bold text-lg text-gray-600 mb-2 flex items-center gap-2">
                    <Bot size={20} className="text-violet-500" /> AI 피드백
                </h3>
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl">
                    <span className="text-4xl">{feedback.icon}</span>
                    <div>
                        <p className="font-bold text-gray-700">{feedback.title}</p>
                        <p className="text-sm text-gray-500">{feedback.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- LOG DRAWER ---
const LogDrawer: React.FC<{ isOpen: boolean; onClose: () => void; onLog: (item: FoodItem) => void; }> = ({ isOpen, onClose, onLog }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customFood, setCustomFood] = useState({ name: '', protein: '' });
    
    // Mock search results
    const searchResults = useMemo(() => 
        QUICK_ADD_FOODS.filter(food => food.name.includes(searchTerm)), 
    [searchTerm]);
    
    const handleLogCustom = () => {
        if (customFood.name && customFood.protein) {
            onLog({ name: customFood.name, protein: parseInt(customFood.protein), amount: 1, unit: '커스텀'});
            setCustomFood({ name: '', protein: '' });
            onClose();
        }
    };
    
    return (
        <div className={`fixed inset-0 z-30 transition-all duration-500 ${isOpen ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`} onClick={onClose}>
            <div 
                className={`absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-gray-100/80 backdrop-blur-xl p-6 rounded-t-3xl shadow-2xl transition-transform duration-500 ease-in-out font-jua ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700 mb-4">기록하기</h2>
                
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        type="text" 
                        placeholder="음식을 검색하세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map(food => (
                        <div key={food.name} onClick={() => { onLog(food); onClose(); }} className="flex justify-between items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-pink-50">
                            <span className="font-semibold">{food.name}</span>
                            <span className="text-gray-500">{food.protein}g</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-600 mb-2">나만의 음식 추가</h3>
                    <div className="flex gap-2 mb-2">
                        <input type="text" placeholder="음식 이름" value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})} className="w-2/3 p-2 border rounded-lg" />
                        <input type="number" placeholder="단백질(g)" value={customFood.protein} onChange={e => setCustomFood({...customFood, protein: e.target.value})} className="w-1/3 p-2 border rounded-lg" />
                    </div>
                    <button onClick={handleLogCustom} className="w-full py-3 bg-violet-400 text-white font-bold rounded-lg shadow-md hover:bg-violet-500 transition-colors">
                        직접 추가하기
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SETTINGS SCREEN ---
const SettingsScreen: React.FC<{
  userData: UserData;
  onUpdate: (data: UserData) => void;
}> = ({ userData, onUpdate }) => {
  const [tempData, setTempData] = useState<UserData>(userData);
  const [showConfirmation, setShowConfirmation] = useState(false);


  const handleUpdate = <K extends keyof UserData>(key: K, value: UserData[K]) => {
    setTempData(d => ({ ...d, [key]: value }));
  };
  
  const handleSave = () => {
    onUpdate(tempData);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  return (
    <div className="p-6 pb-24 font-jua relative">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 text-left">설정</h2>
      <div className="space-y-4">
        <OnboardingCard className="text-left !cursor-default">
            <label className="font-semibold text-gray-600 flex items-center gap-2"><User size={18}/> 나이</label>
            <div className="flex items-center gap-4">
                <input type="range" min="10" max="100" value={tempData.age} onChange={e => handleUpdate('age', parseInt(e.target.value))} className="w-full"/>
                <span className="font-bold text-lg w-12 text-right">{tempData.age}세</span>
            </div>
        </OnboardingCard>
        <OnboardingCard className="text-left !cursor-default">
            <label className="font-semibold text-gray-600 flex items-center gap-2"><Weight size={18}/> 체중</label>
            <div className="flex items-center gap-4">
                <input type="range" min="30" max="150" value={tempData.weight} onChange={e => handleUpdate('weight', parseInt(e.target.value))} className="w-full"/>
                <span className="font-bold text-lg w-12 text-right">{tempData.weight}kg</span>
            </div>
        </OnboardingCard>
         <OnboardingCard className="text-left p-4 !cursor-default">
             <label className="font-semibold text-gray-600 flex items-center gap-2 mb-2"><Activity size={18}/> 활동량</label>
             <div className="flex justify-around">
                 {Object.values(ActivityLevelEnum).map(level => (
                    <button key={level} onClick={() => handleUpdate('activityLevel', level)} className={`p-2 rounded-full transition-all ${tempData.activityLevel === level ? 'bg-violet-300 text-white shadow-md' : 'bg-white/50'}`}>
                        {level === ActivityLevelEnum.SEDENTARY ? '📚' : level === ActivityLevelEnum.LIGHT ? '🧘‍♀️' : '🏃‍♀️'}
                    </button>
                 ))}
             </div>
         </OnboardingCard>
         <OnboardingCard className="text-left p-4 !cursor-default">
             <label className="font-semibold text-gray-600 flex items-center gap-2 mb-2"><Flame size={18}/> 사용 목적</label>
             <div className="flex justify-around">
                  <button onClick={() => handleUpdate('purpose', GoalPurposeEnum.MAINTAIN)} className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${tempData.purpose === GoalPurposeEnum.MAINTAIN ? 'bg-pink-300 text-white shadow-md' : 'bg-white/50'}`}>🍎 유지</button>
                  <button onClick={() => handleUpdate('purpose', GoalPurposeEnum.MUSCLE)} className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${tempData.purpose === GoalPurposeEnum.MUSCLE ? 'bg-sky-300 text-white shadow-md' : 'bg-white/50'}`}>💪 근육</button>
             </div>
         </OnboardingCard>
        <OnboardingCard className="text-left !cursor-default">
            <label className="font-semibold text-gray-600 flex items-center gap-2">🎯 하루 목표 단백질</label>
            <div className="flex items-center gap-4">
                <input type="range" min="30" max="200" value={tempData.proteinGoal} onChange={e => handleUpdate('proteinGoal', parseInt(e.target.value))} className="w-full"/>
                <span className="font-bold text-lg w-14 text-right">{tempData.proteinGoal}g</span>
            </div>
        </OnboardingCard>
        <button onClick={handleSave} className="w-full mt-6 bg-white/80 backdrop-blur-md text-gray-700 font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
            정보 저장하기
        </button>
        {showConfirmation && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg transition-opacity duration-300">
                저장되었습니다!
            </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN SCREEN (with Tabs) ---

const MainScreen: React.FC<{ userData: UserData; onUpdate: (data: UserData) => void }> = ({ userData, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'report' | 'settings'>('home');
    const [intakeHistory, setIntakeHistory] = useState<IntakeRecord[]>([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const logProtein = useCallback((food: FoodItem) => {
        const newRecord: IntakeRecord = {
            id: new Date().toISOString(),
            food,
            timestamp: new Date()
        };
        setIntakeHistory(prev => [...prev, newRecord]);
    }, []);

    const TabButton: React.FC<{ tab: 'home' | 'report' | 'settings'; label: string; icon: React.ReactNode; }> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 transition-colors w-20 ${activeTab === tab ? 'text-violet-500' : 'text-gray-400'}`}>
            {icon}
            <span className="text-xs font-bold">{label}</span>
        </button>
    );

    return (
        <div className="w-full h-full flex flex-col relative">
             <AuroraBackground />
            <main className="flex-grow overflow-y-auto no-scrollbar">
                {activeTab === 'home' && <HomeScreen userData={userData} intakeHistory={intakeHistory} logProtein={logProtein} openDrawer={() => setDrawerOpen(true)} />}
                {activeTab === 'report' && <ReportScreen userData={userData} intakeHistory={intakeHistory} />}
                {activeTab === 'settings' && <SettingsScreen userData={userData} onUpdate={onUpdate} />}
            </main>
            
            <footer className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto h-20 bg-white/70 backdrop-blur-lg rounded-t-3xl shadow-top flex justify-around items-center z-10">
                <TabButton tab="home" label="홈" icon={<Home size={24} strokeWidth={activeTab === 'home' ? 3 : 2}/>} />
                <TabButton tab="report" label="리포트" icon={<BarChart2 size={24} strokeWidth={activeTab === 'report' ? 3 : 2}/>} />
                <TabButton tab="settings" label="설정" icon={<Settings size={24} strokeWidth={activeTab === 'settings' ? 3 : 2}/>} />
            </footer>
            
            <LogDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} onLog={logProtein} />
        </div>
    );
};


// --- APP ---

const App: React.FC = () => {
    const [view, setView] = useState<'onboarding' | 'main'>('onboarding');
    const [userData, setUserData] = useState<UserData | null>(null);

    const handleOnboardingComplete = (data: UserData) => {
        setUserData(data);
        setView('main');
    };
    
    const handleUpdateUserData = (data: UserData) => {
        setUserData(data);
    };

    return (
        <IphoneFrame>
            {view === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
            {view === 'main' && userData && <MainScreen userData={userData} onUpdate={handleUpdateUserData} />}
        </IphoneFrame>
    );
};

export default App;

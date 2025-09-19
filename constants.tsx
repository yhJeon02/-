
import React from 'react';
import type { FoodItem } from './types';
import { Egg, Flame, Fish, Wheat, Milk, Beef } from 'lucide-react';

export const QUICK_ADD_FOODS: FoodItem[] = [
  { name: '달걀', protein: 6, amount: 1, unit: '개' },
  { name: '닭가슴살', protein: 23, amount: 100, unit: 'g' },
  { name: '두부', protein: 8, amount: 100, unit: 'g' },
  { name: '쉐이크', protein: 20, amount: 1, unit: '잔' },
  { name: '연어', protein: 22, amount: 100, unit: 'g' },
  { name: '소고기', protein: 26, amount: 100, unit: 'g' },
];

export const FoodIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case '달걀': return <Egg className={className} />;
    case '닭가슴살': return <Flame className={className} />;
    case '두부': return <Wheat className={className} />;
    case '쉐이크': return <Milk className={className} />;
    case '연어': return <Fish className={className} />;
    case '소고기': return <Beef className={className} />;
    default: return <Flame className={className} />;
  }
};

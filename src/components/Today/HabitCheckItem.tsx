import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Habit } from '../../types/habit';

interface HabitCheckItemProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}

const Particle: React.FC<{ color: string; index: number }> = ({ color, index }) => {
  const angle = (index / 8) * 360;
  const distance = 24 + Math.random() * 10;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const size = 3 + Math.floor(Math.random() * 3);

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        transform: `translate(${x}px, ${y}px)`,
        animation: `particle-pop 0.5s ease-out forwards`,
        animationDelay: `${index * 20}ms`,
        opacity: 0.9,
      }}
    />
  );
};

const HabitCheckItem: React.FC<HabitCheckItemProps> = ({ habit, completed, onToggle }) => {
  const [justCompleted, setJustCompleted] = useState(false);
  const handleToggle = () => {
    if (!completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 700);
    }
    onToggle();
  };

  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none group ${
        completed
          ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/60'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-black/20 active:scale-[0.99]'
      }`}
      onClick={handleToggle}
    >
      {/* Checkbox with animation */}
      <div className="relative flex-shrink-0">
        <button
          className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            justCompleted ? 'scale-125' : completed ? 'scale-100' : 'scale-100 group-hover:scale-110'
          }`}
          style={
            completed
              ? { backgroundColor: habit.color, borderColor: habit.color }
              : { borderColor: '#d1d5db' }
          }
          onClick={e => { e.stopPropagation(); handleToggle(); }}
        >
          {completed ? (
            <Check
              className={`w-3.5 h-3.5 text-white transition-all duration-200 ${justCompleted ? 'scale-125' : 'scale-100'}`}
              strokeWidth={3}
            />
          ) : (
            <Check
              className="w-3 h-3 opacity-0 group-hover:opacity-20 transition-opacity"
              strokeWidth={3}
              style={{ color: habit.color }}
            />
          )}
        </button>

        {/* Ping ring on complete */}
        {justCompleted && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: habit.color, opacity: 0.3 }}
          />
        )}
        {/* Particles - always rendered when justCompleted */}
        {justCompleted && Array.from({ length: 8 }, (_, i) => (
          <Particle key={i} color={habit.color} index={i} />
        ))}
      </div>

      {/* Emoji icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 ${
          completed ? 'opacity-50 grayscale-[60%]' : 'group-hover:scale-105'
        }`}
        style={{
          backgroundColor: completed ? '#f3f4f6' : habit.color + '18',
          border: `2px solid ${completed ? 'transparent' : habit.color + '30'}`,
        }}
      >
        {habit.emoji}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold transition-all duration-300 truncate ${
            completed
              ? 'text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {habit.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {habit.frequency === 'daily' && 'Every day'}
          {habit.frequency === 'specific_days' &&
            (habit.specificDays ?? [])
              .sort((a, b) => a - b)
              .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
              .join(', ')}
          {habit.frequency === 'times_per_week' && `${habit.timesPerWeek}× per week`}
        </p>
      </div>

      {/* Done badge */}
      {completed && (
        <div
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: habit.color + '15',
            color: habit.color,
          }}
        >
          <Check className="w-3 h-3" strokeWidth={3} />
          Done
        </div>
      )}

      {/* Uncompleted tap hint */}
      {!completed && (
        <div className="flex-shrink-0 text-gray-200 dark:text-gray-700 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCheckItem;

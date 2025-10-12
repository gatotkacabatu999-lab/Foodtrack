import { useState } from "react";
import { format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarDays } from "@/lib/date-utils";

interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | ''>('');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setIsTransitioning(true);
    setSlideDirection(direction === 'prev' ? 'right' : 'left');
    
    setTimeout(() => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
        return newDate;
      });
      
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('');
      }, 150);
    }, 150);
  };

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className="glass rounded-lg p-3 transform transition-all duration-300 hover:scale-105" data-testid="mini-calendar">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium" data-testid="current-month">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-1">
          <button 
            className="p-1 hover:bg-white/10 rounded text-xs transition-colors"
            onClick={() => navigateMonth('prev')}
            data-testid="prev-month"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded text-xs transition-colors"
            onClick={() => navigateMonth('next')}
            data-testid="next-month"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className={`calendar-grid text-xs transform transition-transform duration-300 ease-in-out ${
        isTransitioning 
          ? slideDirection === 'left' 
            ? '-translate-x-full opacity-0' 
            : 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      }`}>
        {weekdays.map((day, index) => (
          <div key={`weekday-${index}`} className="text-center text-muted-foreground py-1">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const isSelected = selectedDate && 
            day.date.toDateString() === selectedDate.toDateString();
          const isTodayDate = isToday(day.date);
          
          return (
            <button
              key={index}
              className={`text-center py-1 hover:bg-white/10 rounded cursor-pointer transition-colors ${
                !day.isCurrentMonth ? 'text-muted-foreground/50' : ''
              } ${isSelected ? 'bg-primary/20 text-primary' : ''} ${
                isTodayDate && !isSelected ? 'bg-primary/10 text-primary font-semibold border border-primary/30' : ''
              }`}
              onClick={() => onDateSelect?.(day.date)}
              data-testid={`calendar-day-${day.day}`}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

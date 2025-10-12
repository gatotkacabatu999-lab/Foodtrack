import { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { FoodItem } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from "date-fns";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItems: FoodItem[];
}

const TRANSITION_DURATION = 600;

export default function CalendarModal({ isOpen, onClose, foodItems }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | ''>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const secondTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (secondTimeoutRef.current) clearTimeout(secondTimeoutRef.current);
      setIsTransitioning(false);
      setIsEntering(false);
      setIsClosing(false);
      setSlideDirection('');
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (secondTimeoutRef.current) clearTimeout(secondTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    if (isTransitioning || isEntering) return;
    
    setIsTransitioning(true);
    setSlideDirection('right'); // Exit right for previous month
    
    timeoutRef.current = setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      setSlideDirection('left'); // Enter from left for previous month
      setIsEntering(true);
      setIsTransitioning(false); // Start enter phase
      
      secondTimeoutRef.current = setTimeout(() => {
        setIsEntering(false);
        setSlideDirection('');
      }, TRANSITION_DURATION / 2);
    }, TRANSITION_DURATION / 2);
  };

  const goToNextMonth = () => {
    if (isTransitioning || isEntering) return;
    
    setIsTransitioning(true);
    setSlideDirection('left'); // Exit left for next month
    
    timeoutRef.current = setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      setSlideDirection('right'); // Enter from right for next month
      setIsEntering(true);
      setIsTransitioning(false); // Start enter phase
      
      secondTimeoutRef.current = setTimeout(() => {
        setIsEntering(false);
        setSlideDirection('');
      }, TRANSITION_DURATION / 2);
    }, TRANSITION_DURATION / 2);
  };

  const getItemsForDate = (date: Date) => {
    return foodItems.filter(item => {
      const expiryDate = typeof item.expiryDate === 'string' ? parseISO(item.expiryDate) : item.expiryDate;
      return isSameDay(expiryDate, date);
    });
  };


  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Shorter delay for closing animation
  };

  return (
    <div className={`fixed inset-0 modal-backdrop flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`} data-testid="calendar-modal">
      <div className={`glass-dark rounded-lg p-6 m-4 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all duration-300 ${isClosing ? 'animate-slide-down opacity-0 scale-95' : 'animate-slide-up'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h5 className="text-sm font-semibold">Expired Calendar</h5>
          </div>
          <button 
            onClick={handleClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-calendar-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPreviousMonth}
            disabled={isTransitioning || isEntering}
            className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="previous-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h4 className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h4>
          <button 
            onClick={goToNextMonth}
            disabled={isTransitioning || isEntering}
            className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={`grid grid-cols-7 gap-1 mb-6 transform transition-all ease-out ${
          isTransitioning 
            ? slideDirection === 'left' 
              ? '-translate-x-full opacity-0' 
              : 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
        }`} style={{ transitionDuration: `${TRANSITION_DURATION / 2}ms` }}>
          {daysInMonth.map(date => {
            const itemsForDate = getItemsForDate(date);
            const hasItems = itemsForDate.length > 0;
            const isCurrentDay = isToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <div
                key={date.toISOString()}
                className={`relative h-12 p-1 rounded text-xs flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/30 text-primary border-2 border-primary/80 font-bold'
                    : isCurrentDay 
                      ? 'bg-primary/20 text-primary border-2 border-primary/60 font-bold' 
                      : hasItems 
                        ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
                        : 'hover:bg-white/5'
                }`}
                data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className={`font-medium ${isCurrentDay ? 'font-bold' : ''}`}>
                  {format(date, 'd')}
                </span>
                {hasItems && (
                  <div className="flex space-x-0.5 mt-0.5">
                    {itemsForDate.slice(0, 3).map((item, index) => (
                      <div 
                        key={`${item.id}-${index}`}
                        className="w-1 h-1 bg-current rounded-full"
                      />
                    ))}
                    {itemsForDate.length > 3 && (
                      <span className="text-[0.6rem] font-bold">+</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <button 
              onClick={() => {
                const today = new Date();
                setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDate(today);
              }}
              className="flex items-center space-x-2 hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
              data-testid="jump-to-today"
            >
              <div className="w-3 h-3 bg-primary/20 border border-primary/40 rounded"></div>
              <span className="text-muted-foreground hover:text-foreground">Today</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive/20 rounded"></div>
              <span className="text-muted-foreground">Items Expired</span>
            </div>
          </div>

          {/* Items expiring this month */}
          {(() => {
            const monthItems = foodItems.filter(item => {
              const expiryDate = typeof item.expiryDate === 'string' ? parseISO(item.expiryDate) : item.expiryDate;
              return expiryDate >= monthStart && expiryDate <= monthEnd;
            });

            if (monthItems.length === 0) {
              return (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No items expiring this month
                </div>
              );
            }

            return (
              <div>
                <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                  Items expiring in {format(currentDate, 'MMMM')} ({monthItems.length})
                </h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {monthItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs p-2 glass rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{item.category}</span>
                        <span className="truncate max-w-28">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {format(typeof item.expiryDate === 'string' ? parseISO(item.expiryDate) : item.expiryDate, 'MMM d')}
                      </span>
                    </div>
                  ))}
                  {monthItems.length > 5 && (
                    <div className="text-center text-muted-foreground text-xs py-1">
                      +{monthItems.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="mt-6">
          <button 
            onClick={handleClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="close-calendar-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
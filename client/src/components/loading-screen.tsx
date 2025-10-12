import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onLoadingComplete, 600); // Wait for exit animation
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random increment between 5-20
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 transition-all duration-700 ease-out ${
      isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
    }`} data-testid="loading-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse"></div>
      
      {/* Main Logo/Icon */}
      <div className={`relative mb-8 transition-all duration-1000 ease-out ${
        isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <div className="glass rounded-full p-8 shadow-2xl">
          <div className="relative">
            <div className="text-4xl text-primary animate-pulse">🍽️</div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      {/* App Title */}
      <div className={`text-center mb-8 transition-all duration-1000 ease-out delay-300 ${
        isExiting ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <h1 className="text-2xl font-bold text-foreground mb-2">FoodTracker</h1>
        <p className="text-sm text-muted-foreground">Expiration Manager</p>
      </div>

      {/* Progress Bar */}
      <div className={`w-64 transition-all duration-1000 ease-out delay-500 ${
        isExiting ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <div className="glass rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-muted-foreground">Loading...</span>
          <span className="text-xs text-muted-foreground">{Math.round(Math.min(progress, 100))}%</span>
        </div>
      </div>

      {/* Loading Dots */}
      <div className={`flex space-x-2 mt-6 transition-all duration-1000 ease-out delay-700 ${
        isExiting ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
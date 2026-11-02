import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState(14400);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-[#FF4500] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-mono text-sm shadow-md animate-pulse">
      <Timer size={16} /> DEAL ENDS SOON: {formatTime(timeLeft)}
    </div>
  );
}

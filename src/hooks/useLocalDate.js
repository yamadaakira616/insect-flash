import { useEffect, useState } from 'react';
import { localDateKey } from '../data/room.js';

export default function useLocalDate() {
  const [today, setToday] = useState(localDateKey);
  useEffect(() => {
    const check = () => { if (!document.hidden) setToday(localDateKey()); };
    // 日付またぎと、バックグラウンドから戻った場合の両方を扱う。
    const timer = setInterval(check, 30000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return today;
}

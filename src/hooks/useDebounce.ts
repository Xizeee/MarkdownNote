import { useEffect, useState } from 'react';

// 对值进行防抖：延迟 delay 毫秒后才更新返回值
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

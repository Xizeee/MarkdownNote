/*
 * @Author: Cqs 18897653566@163.com
 * @Date: 2026-08-17 22:32:42
 * @LastEditors: Cqs 18897653566@163.com
 * @LastEditTime: 2026-08-17 22:39:14
 * @Description: 
 * Copyright (c) 2026 by 18897653566@163.com All Rights Reserved. 
 */
import { useCallback, useEffect, useState } from 'react';

// 通用 LocalStorage Hook：封装读写并支持多标签页同步
// 满足 AGENTS.md「使用 useLocalStorage Hook 封装对 LocalStorage 的读写」
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // 容量超限或被禁用时静默失败，避免阻塞 UI
        }
        return resolved;
      });
    },
    [key]
  );

  // 监听多标签页同步：其它标签页写入时刷新本地状态
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue != null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          // 忽略无效数据
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [value, set];
}

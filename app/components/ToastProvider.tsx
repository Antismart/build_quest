"use client";
import React, { createContext, useContext, useCallback, useRef, useState, useEffect, ReactNode } from 'react';

export type ToastTone = 'success' | 'info' | 'danger';
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  expiryAt: number; // epoch ms
  remaining: number; // ms remaining when paused
  paused: boolean;
}

interface ToastContextShape {
  pushToast: (message: string, tone?: ToastTone, ttlMs?: number) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextShape | undefined>(undefined);

let globalId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, any>>(new Map());

  const scheduleRemoval = useCallback((toast: ToastItem) => {
    const now = Date.now();
    const remaining = toast.expiryAt - now;
    if (remaining <= 0) {
      setToasts(t => t.filter(x => x.id !== toast.id));
      return;
    }
    const handle = setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== toast.id));
      timers.current.delete(toast.id);
    }, remaining);
    timers.current.set(toast.id, handle);
  }, []);

  const pushToast = useCallback((message: string, tone: ToastTone = 'info', ttlMs = 4000) => {
    const id = ++globalId;
    const expiryAt = Date.now() + ttlMs;
    const toast: ToastItem = { id, message, tone, expiryAt, remaining: ttlMs, paused: false };
    setToasts(t => [...t, toast]);
    scheduleRemoval(toast);
  }, [scheduleRemoval]);

  const dismissToast = useCallback((id: number) => {
    const handle = timers.current.get(id);
    if (handle) clearTimeout(handle);
    timers.current.delete(id);
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const pause = useCallback((id: number) => {
    setToasts(t => t.map(to => {
      if (to.id === id && !to.paused) {
        const h = timers.current.get(id);
        if (h) {
          clearTimeout(h);
          timers.current.delete(id);
          const remaining = to.expiryAt - Date.now();
          return { ...to, paused: true, remaining };
        }
      }
      return to;
    }));
  }, []);

  const resume = useCallback((id: number) => {
    setToasts(t => t.map(to => {
      if (to.id === id && to.paused) {
        const expiryAt = Date.now() + to.remaining;
        const updated = { ...to, paused: false, expiryAt };
        scheduleRemoval(updated);
        return updated;
      }
      return to;
    }));
  }, [scheduleRemoval]);

  // Cleanup on unmount
  useEffect(() => () => { timers.current.forEach(h => clearTimeout(h)); timers.current.clear(); }, []);

  return (
    <ToastContext.Provider value={{ pushToast, dismissToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" role="status" aria-live="polite">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`toast ${t.tone === 'success' ? 'toast-success' : t.tone === 'danger' ? 'toast-danger' : 'toast-info'}`}
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t.id)}
            >
              <span className="flex-1">{t.message}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => dismissToast(t.id)}
                className="text-[10px] px-1 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextShape {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

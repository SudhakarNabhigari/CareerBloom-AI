import { useEffect, useState } from 'react';
import { loadState, type AppState } from '@/data/model';

export function useCareerBloom() {
  const [state, setState] = useState<AppState>(loadState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    try {
      const serialized = localStorage.getItem('careerbloom-demo-v1');
      if (serialized) setState(loadState());
    } catch {
      setState(loadState());
    }
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('careerbloom-demo-v1', JSON.stringify(state)); } catch { /* browser storage may be unavailable */ }
  }, [state, ready]);
  return { state, setState, ready };
}

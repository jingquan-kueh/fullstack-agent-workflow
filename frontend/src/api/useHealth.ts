import { useEffect, useState } from 'react';
import { fetchHealth, type Health } from './health';

export type HealthState =
  { status: 'loading' } | { status: 'error' } | { status: 'success'; data: Health };

export const useHealth = (): HealthState => {
  const [state, setState] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    // Ignore a response that arrives after unmount (or after StrictMode's extra effect run).
    let isCurrent = true;
    fetchHealth().then(
      (data) => {
        if (isCurrent) {
          setState({ status: 'success', data });
        }
      },
      () => {
        console.error('Health request failed');
        if (isCurrent) {
          setState({ status: 'error' });
        }
      }
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  return state;
};

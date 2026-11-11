import { useEffect, useState } from 'react';
import { loadEvents, type TheatreEvent } from '../utils/events';

export type EventsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; events: TheatreEvent[] };

export function useEvents(): EventsState {
  const [state, setState] = useState<EventsState>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    loadEvents().then(
      (events) => alive && setState({ status: 'ready', events }),
      () => alive && setState({ status: 'error' }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

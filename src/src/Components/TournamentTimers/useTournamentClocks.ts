import { useState, useEffect, useMemo, useCallback } from 'react';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';

export type LocalClock = {
    clock: TournamentTimerClock;
    loadedTimestamp: number;
}

type TournamentTimersHook = {
    clocks: TournamentTimerClock[];
    addClock: (clock: TournamentTimerClock) => void;
    removeClock: (clockId: string) => void;
    initClocks: (clocks: TournamentTimerClock[]) => void;
}

export function useTournamentClocks(): TournamentTimersHook {
    const [clocks, setClocks] = useState<TournamentTimerClock[]>([]);
    const [localClocks, setLocalClocks] = useState<Map<string, LocalClock>>(new Map());

    const addClock = useCallback((clock: TournamentTimerClock) => {
        setLocalClocks(prevClocks => {
            const newClocks = new Map(prevClocks);
            newClocks.set(clock.clock_id, { clock, loadedTimestamp: Date.now() });
            return newClocks;
        });
    }, [setLocalClocks]);
    
    const removeClock = useCallback((clockId: string) => { 
        setLocalClocks(prevClocks => {
            const newClocks = new Map(prevClocks);
            newClocks.delete(clockId);
            return newClocks;
        });
    }, [setLocalClocks]);

    const initClocks = useCallback((clocks: TournamentTimerClock[]) => {
        setLocalClocks(prevClocks => {
            const newClocks = new Map(prevClocks);
            clocks.forEach(clock => {
                newClocks.set(clock.clock_id, { clock, loadedTimestamp: Date.now() });
            });
            return newClocks;
        });
    }, [setLocalClocks]);

    const initialClocks = useMemo(() => {
        return Array.from(localClocks.values());
    }, [localClocks]);

    useEffect(() => {
        if (!initialClocks || initialClocks.length === 0) {
            setClocks([]);
            return;
        }

        const advanceTimers = () => {
            const currentTime = Date.now();
            setClocks(initialClocks.map(initialClock => {
                if (initialClock.clock.is_running) {
                    const elapsedTime = currentTime - initialClock.loadedTimestamp;
                    return {
                        ...initialClock.clock,
                        ms_remaining: initialClock.clock.ms_remaining - elapsedTime
                    };
                }

                return initialClock.clock;
            }));
        };

        advanceTimers();

        const anyClockRunning = initialClocks.some(localClock => localClock.clock.is_running);
        if (!anyClockRunning) {
            return;
        }

        const intervalId = setInterval(() => {
            advanceTimers();
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [localClocks, initialClocks]);

    return {clocks, addClock, removeClock, initClocks};
}
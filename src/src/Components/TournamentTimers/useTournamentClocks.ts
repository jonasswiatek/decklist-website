import { useState, useEffect } from 'react';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';

export function useTournamentClocks(
    initialClocks: TournamentTimerClock[] | undefined
): TournamentTimerClock[] {
    const [clocks, setClocks] = useState<TournamentTimerClock[]>([]);

    useEffect(() => {
        // Initialize or update the internal clocks state when initialClocks prop changes.
        // We map to new objects to ensure state updates correctly and to avoid mutating the prop.
        if (initialClocks) {
            setClocks(initialClocks.map(clock => ({ ...clock })));
        } else {
            setClocks([]);
        }
    }, [initialClocks]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setClocks(currentClocks =>
                currentClocks.map(clock => {
                    if (clock.is_running) {
                        return {
                            ...clock,
                            ms_remaining: clock.ms_remaining - 1000,
                        };
                    }
                    return clock;
                })
            );
        }, 1000);

        // Cleanup interval on component unmount or if the effect re-runs.
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

    return clocks;
}
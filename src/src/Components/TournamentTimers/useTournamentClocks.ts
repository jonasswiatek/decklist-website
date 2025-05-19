import { useState, useEffect, useRef } from 'react';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';

export function useTournamentClocks(
    initialClocks: TournamentTimerClock[] | undefined
): TournamentTimerClock[] {
    const [clocks, setClocks] = useState<TournamentTimerClock[]>([]);
    const lastUpdateTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // If initialClocks is not provided or is empty, reset state and don't start an interval.
        if (!initialClocks || initialClocks.length === 0) {
            setClocks([]);
            lastUpdateTimeRef.current = null;
            return; // No interval to set up, existing one (if any) will be cleaned up by effect return
        }

        // Set the initial state for the clocks based on the new initialClocks.
        // This ensures the UI immediately reflects the new set of clocks.
        setClocks(initialClocks.map(clock => ({ ...clock })));

        // If no clocks are running, don't start an interval.
        const anyClockRunning = initialClocks.some(clock => clock.is_running);
        if (!anyClockRunning) {
            lastUpdateTimeRef.current = null; // No updates needed if nothing is running
            return; // No interval to set up
        }

        // initialClocks is valid, non-empty, and at least one clock is running here.
        // Set the reference time for calculations.
        lastUpdateTimeRef.current = Date.now();

        const intervalId = setInterval(() => {
            // Safeguard: lastUpdateTimeRef.current should be non-null if an interval is running.
            if (lastUpdateTimeRef.current === null) {
                // This state should ideally not be reached if the effect logic is correct,
                // as the interval is cleared when initialClocks becomes invalid.
                return;
            }

            const currentTime = Date.now();
            const elapsedTime = currentTime - lastUpdateTimeRef.current;

            // Map over the initialClocks from this effect's closure.
            // This initialClocks corresponds to the one used when lastUpdateTimeRef.current was set.
            setClocks(
                initialClocks.map(initialClock => {
                    if (initialClock.is_running) {
                        const originalMs = initialClock.ms_remaining;
                        const newMsRemaining = originalMs - elapsedTime;
                        return {
                            ...initialClock, // Spread all properties from the original clock
                            ms_remaining: newMsRemaining, // Update ms_remaining
                        };
                    }
                    // If the clock was not running as per initialClocks, return it as is.
                    return initialClock;
                })
            );
        }, 1000); // Interval frequency for UI updates.

        // Cleanup interval when initialClocks changes or component unmounts.
        return () => {
            clearInterval(intervalId);
        };
    }, [initialClocks]);

    return clocks;
}
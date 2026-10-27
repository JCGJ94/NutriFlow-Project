/**
 * Position of `now` inside a plan week: 0 (Monday) to 6 (Sunday), or null when
 * the date falls outside the week that starts on `weekStart` (YYYY-MM-DD).
 */
export function dayIndexInPlan(weekStart: string, now: Date): number | null {
    const [y, m, d] = weekStart.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((today.getTime() - start.getTime()) / 86_400_000);
    return diff >= 0 && diff <= 6 ? diff : null;
}

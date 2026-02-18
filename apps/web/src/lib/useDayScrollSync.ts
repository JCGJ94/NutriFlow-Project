'use client';

import { useRef, useCallback, useEffect } from 'react';

// Default offset for sticky headers (navbar + sub-header)
const DEFAULT_OFFSET = 180;

/**
 * Hook for smooth scrolling to day sections with sticky header offset AND
 * synchronizing the active day state based on scroll position.
 *
 * @param stickyOffset - Pixels to offset for sticky headers.
 * @param days - Array of day numbers (0-6) to track.
 * @param onActiveDayChange - Callback when active day changes due to scroll.
 */
export function useDayScrollSync(
    stickyOffset = DEFAULT_OFFSET,
    days: number[] = [],
    onActiveDayChange?: (day: number) => void
) {
    const dayRefs = useRef<Record<number, HTMLElement | null>>({});
    const isScrollingRef = useRef(false); // Flag to prevent observer updates during smooth scroll
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Register a ref for a specific dayOfWeek
    const registerDayRef = useCallback(
        (dayOfWeek: number) => (el: HTMLElement | null) => {
            dayRefs.current[dayOfWeek] = el;
        },
        []
    );

    // Scroll smoothly to the day section
    const scrollToDay = useCallback(
        (dayOfWeek: number) => {
            const el = dayRefs.current[dayOfWeek];
            if (!el) return;

            isScrollingRef.current = true;

            const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset;

            window.scrollTo({
                top: Math.max(0, top),
                behavior: 'smooth',
            });

            // Re-enable observer after scroll finishes (approximate timeout)
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 1000);
        },
        [stickyOffset]
    );

    // Set up IntersectionObserver to track active section
    useEffect(() => {
        if (days.length === 0 || !onActiveDayChange) return;

        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const handleIntersect: IntersectionObserverCallback = (entries) => {
            if (isScrollingRef.current) return;

            // Find the most visible element
            const visibleEntry = entries.find(entry => entry.isIntersecting);

            if (visibleEntry) {
                // Determine which day this element corresponds to
                const dayId = Number(visibleEntry.target.getAttribute('data-day-index'));
                if (!isNaN(dayId)) {
                    onActiveDayChange(dayId);
                }
            }
        };

        // Use a large rootMargin to trigger earlier/later as needed
        // -stickyOffset ensures we detect elements passing under the header
        const rootMargin = `-${stickyOffset}px 0px -40% 0px`;

        observerRef.current = new IntersectionObserver(handleIntersect, {
            root: null, // viewport
            rootMargin,
            threshold: 0 // trigger as soon as one pixel is visible within the rootMargin area
        });

        // Observe all registered elements
        days.forEach(day => {
            const el = dayRefs.current[day];
            if (el) {
                el.setAttribute('data-day-index', day.toString());
                observerRef.current?.observe(el);
            }
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [days, stickyOffset, onActiveDayChange, /* Re-run if refs change? No, refs object is stable, but content might remount */]);

    return { registerDayRef, scrollToDay } as const;
}

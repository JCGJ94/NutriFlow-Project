# Condition-Based Waiting

Avoid arbitrary timeouts (e.g., `setTimeout(..., 2000)`). They are brittle and cause race conditions or unnecessary delays.

## Best Practices

1.  **Poll for State**: Use a loop or a library helper that checks for a condition every 50-100ms.
2.  **Event Listeners**: Wait for a specific event or Promise resolution.
3.  **Maximum Timeout**: Always include a "circuit breaker" timeout, but set it much higher than the expected duration to avoid false negatives.
4.  **UI Feedback**: In frontend tests, wait for the element to be visible/stable rather than waiting for "time".

**Rule**: If you are about to write `await sleep(1000)`, stop and ask: "What exact condition am I waiting for?" and wait for *that*.

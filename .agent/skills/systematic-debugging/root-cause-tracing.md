# Root Cause Tracing: Backward Tracing Technique

The goal of backward tracing is to find the original source of a corrupted value or incorrect state by moving up the call stack.

## Process

1.  **Identify the Symptom**: Start at the line where the error occurs or the bad data is detected.
2.  **Where does the bad value originate?**
    *   Is it a function argument?
    *   Is it a return value from an async call?
    *   Is it read from a database or config?
3.  **Trace Upward**:
    *   Find the caller of the current function.
    *   Check what it passed as arguments.
    *   Repeat until you find the moment where "Good Data" became "Bad Data".
4.  **Fix at Source**: Don't add a check at the symptom. Fix the logic at the origin point.

## Example
If `user.email` is null at the UI layer:
1.  Check component props.
2.  Check state management (Redux/Context) dispatch.
3.  Check API response transformation.
4.  Check API response from server.
5.  Check Database record.

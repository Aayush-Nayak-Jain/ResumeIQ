"""Sliding Window Rate Limiter for Brute-Force & Abuse Defense."""

import time
from collections import defaultdict


class SlidingWindowRateLimiter:
    """In-memory sliding window rate limiter for endpoint throttling."""

    def __init__(self) -> None:
        self._requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Checks whether an action identified by `key` is allowed within the time window."""
        now = time.time()
        window_start = now - window_seconds

        # Prune timestamps outside the active sliding window
        self._requests[key] = [t for t in self._requests[key] if t > window_start]

        if len(self._requests[key]) >= max_requests:
            return False

        self._requests[key].append(now)
        return True

    def get_retry_after(self, key: str, window_seconds: int) -> int:
        """Returns number of seconds before next attempt is allowed."""
        now = time.time()
        window_start = now - window_seconds
        valid_requests = [t for t in self._requests.get(key, []) if t > window_start]
        if not valid_requests:
            return 0
        oldest = min(valid_requests)
        return max(1, int(oldest + window_seconds - now))

    def reset(self, key: str) -> None:
        """Resets rate limit tracking for a given key (e.g. after successful login)."""
        if key in self._requests:
            del self._requests[key]


auth_rate_limiter = SlidingWindowRateLimiter()

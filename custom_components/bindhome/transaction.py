"""Transaction primitives for BindHome Registry mutations."""

from __future__ import annotations

import asyncio
from types import TracebackType
from typing import Any


class BindHomeTransactionError(RuntimeError):
    """Raised when the public Registry transaction contract is violated."""


class BindHomeMutationLock:
    """Serialize mutations and fail fast on same-task re-entry.

    ``asyncio.Lock`` is intentionally not re-entrant. A normal nested acquire by
    the same task would therefore deadlock silently. BindHome turns that failure
    mode into an explicit error while preserving ordinary waiting semantics for
    concurrent tasks.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._owner: asyncio.Task[Any] | None = None

    async def __aenter__(self) -> BindHomeMutationLock:
        task = asyncio.current_task()
        if task is not None and task is self._owner:
            raise BindHomeTransactionError(
                "Cannot start a BindHome mutation inside an active Registry "
                "transaction; mutate the staged Registry directly instead"
            )

        await self._lock.acquire()
        self._owner = task
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self._owner = None
        self._lock.release()

    def locked(self) -> bool:
        """Return whether a mutation currently owns the underlying lock."""
        return self._lock.locked()

function candidateMessages(error) {
  return [error?.message, error?.body?.message, error?.data?.message, error?.error]
    .filter((value) => typeof value === "string");
}

export function normalizeWsError(error, fallbackMessage = null) {
  const message =
    candidateMessages(error).find(
      (value) => value.trim(),
    ) ?? fallbackMessage;

  return {
    code:
      error?.code ??
      error?.body?.code ??
      error?.data?.code ??
      null,
    message,
  };
}

export function normalizeBulkError(error, fallbackMessage = null) {
  for (const value of candidateMessages(error)) {
    try {
      const parsed = JSON.parse(value);
      if (
        Number.isInteger(parsed?.index) &&
        parsed.index >= 0 &&
        typeof parsed?.field === "string" &&
        typeof parsed?.message === "string"
      ) {
        return {
          structured: true,
          index: parsed.index,
          field: parsed.field,
          message: parsed.message,
        };
      }
    } catch {
      // Home Assistant may return an ordinary human-readable message.
    }
  }

  const message = candidateMessages(error).find((value) => value.trim()) ?? fallbackMessage;
  return { structured: false, index: null, field: null, message };
}

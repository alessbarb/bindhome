const FALLBACK_MESSAGE = "The room inventory could not be saved. Nothing was saved.";

function candidateMessages(error) {
  return [error?.message, error?.body?.message, error?.data?.message, error?.error]
    .filter((value) => typeof value === "string");
}

export function normalizeBulkError(error) {
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

  const message = candidateMessages(error).find((value) => value.trim()) ?? FALLBACK_MESSAGE;
  return { structured: false, index: null, field: null, message };
}

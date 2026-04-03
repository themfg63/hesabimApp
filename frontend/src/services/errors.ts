export function extractErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return maybeError.response?.data?.message || maybeError.message || fallback;
  }

  return fallback;
}
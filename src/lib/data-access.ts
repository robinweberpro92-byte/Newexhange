export async function withFallback<T>(task: () => Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[data-access] fallback used for ${context}`, error);
    }
    return fallback;
  }
}

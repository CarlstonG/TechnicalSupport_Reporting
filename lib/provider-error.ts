export function providerError(provider: string, status: number, code?: string): string {
  if (status === 429 && (code === 'insufficient_quota' || code === 'billing_hard_limit_reached')) return `${provider}: API quota is exhausted. Check your provider project's billing, credits, and usage limits, then try again.`;
  if (status === 429) return `${provider}: Request rate limit reached. Wait briefly and try again. If it continues, check your provider quota and usage limits.`;
  if (status === 401) return `${provider}: API key was rejected. Check or replace the saved key.`;
  if (status === 403) return `${provider}: Access denied. Check project permissions and model access.`;
  if (status === 404) return `${provider}: Model not found or unavailable to this account. Check the model ID.`;
  return `${provider} request failed (${status}). Check your API key, model access, and quota.`;
}

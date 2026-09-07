export class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userState = this.requests.get(userId);

    if (!userState || now > userState.resetAt) {
      this.requests.set(userId, { count: 1, resetAt: now + this.windowMs });
      return false;
    }

    if (userState.count >= this.maxRequests) {
      return true;
    }

    userState.count += 1;
    this.requests.set(userId, userState);
    return false;
  }
}

export const verificationLimiter = new RateLimiter(3, 60000);
export const gameLimiter = new RateLimiter(5, 10000);
export const ticketLimiter = new RateLimiter(2, 60000);
export const adminLimiter = new RateLimiter(10, 30000);

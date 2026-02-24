import { NextResponse } from 'next/server'

interface RateLimitTracker {
    count: number;
    resetAt: number;
}

const limiters = new Map<string, RateLimitTracker>()
const DEFAULT_LIMIT = 5
const DEFAULT_WINDOW_MS = 60 * 1000 // 1 minute

export function checkRateLimit(ip: string, email: string, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
    const now = Date.now()
    const key = `${ip}:${email}`

    // Cleanup old entries occasionally (rough approach)
    if (Math.random() < 0.05) {
        for (const [k, v] of limiters.entries()) {
            if (now > v.resetAt) limiters.delete(k)
        }
    }

    let tracker = limiters.get(key)

    if (!tracker || now > tracker.resetAt) {
        tracker = { count: 1, resetAt: now + windowMs }
        limiters.set(key, tracker)
        return { allowed: true }
    }

    if (tracker.count >= limit) {
        return {
            allowed: false,
            response: NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': Math.ceil((tracker.resetAt - now) / 1000).toString() } }
            )
        }
    }

    tracker.count++
    return { allowed: true }
}

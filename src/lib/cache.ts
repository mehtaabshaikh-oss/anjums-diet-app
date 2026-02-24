type CacheItem<T> = {
    value: T;
    expiry: number;
};

class SimpleCache {
    private cache = new Map<string, CacheItem<any>>();

    set<T>(key: string, value: T, ttlMs: number) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttlMs,
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    invalidate(keyPrefix: string) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(keyPrefix)) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
    }
}

export const appCache = new SimpleCache();

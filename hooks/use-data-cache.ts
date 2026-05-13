import { useEffect, useRef, useState, useCallback } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // in milliseconds
}

const dataCache = new Map<string, CacheEntry<any>>()

/**
 * Custom hook for cached data fetching with automatic invalidation
 * Prevents redundant API calls and improves performance
 */
export function useDataCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number // Time to live in milliseconds (default: 5 minutes)
    revalidateOnFocus?: boolean
    revalidateOnInterval?: number
  } = {}
) {
  const { ttl = 5 * 60 * 1000, revalidateOnFocus = true, revalidateOnInterval = 0 } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  const isStale = useCallback(() => {
    const entry = dataCache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > entry.ttl
  }, [key])

  const fetch = useCallback(async (force = false) => {
    // Return cached data if not stale and not forced
    if (!force && !isStale()) {
      const cached = dataCache.get(key)
      if (cached && isMountedRef.current) {
        setData(cached.data)
        setLoading(false)
        setError(null)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()

      if (isMountedRef.current) {
        // Cache the result
        dataCache.set(key, {
          data: result,
          timestamp: Date.now(),
          ttl,
        })

        setData(result)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)

        // Try to use stale cache on error
        const staleEntry = dataCache.get(key)
        if (staleEntry) {
          setData(staleEntry.data)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [key, fetchFn, isStale, ttl])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true
    fetch()

    return () => {
      isMountedRef.current = false
    }
  }, [fetch])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (isStale()) {
        fetch(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && isStale()) {
        fetch(true)
      }
    })

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [revalidateOnFocus, isStale, fetch])

  // Revalidate on interval
  useEffect(() => {
    if (!revalidateOnInterval) return

    const interval = setInterval(() => {
      fetch(true)
    }, revalidateOnInterval)

    return () => clearInterval(interval)
  }, [revalidateOnInterval, fetch])

  return { data, loading, error, refetch: () => fetch(true) }
}

/**
 * Invalidate a specific cache entry
 */
export function invalidateCache(key: string) {
  dataCache.delete(key)
}

/**
 * Invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string | RegExp) {
  const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern
  for (const key of dataCache.keys()) {
    if (regex.test(key)) {
      dataCache.delete(key)
    }
  }
}

/**
 * Clear entire cache
 */
export function clearAllCache() {
  dataCache.clear()
}

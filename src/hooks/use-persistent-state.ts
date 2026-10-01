import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react'
import { browserStateDatabase, isNewerSnapshot, StateRepository, StorageUnavailableError, type Snapshot } from '@/lib/state-repository'

export function usePersistentState<T>(key: string, initial: T, validate: (value: unknown) => T) {
  const repository = useMemo(() => new StateRepository(browserStateDatabase(), key, initial, validate), [key, initial, validate])
  const [value, setValue] = useState(initial)
  const [ready, setReady] = useState(false)
  const [storageFailed, setStorageFailed] = useState(false)
  const current = useRef(initial)
  const revision = useRef(-1)
  const sessionOnly = useRef(false)
  const mounted = useRef(false)
  const initialized = useRef<Promise<Snapshot<T>> | undefined>(undefined)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const channel = useRef<BroadcastChannel | undefined>(undefined)

  const apply = useCallback((snapshot: Snapshot<T>) => {
    if (!isNewerSnapshot(snapshot, revision.current)) return
    revision.current = snapshot.revision
    current.current = snapshot.value
    if (mounted.current) setValue(snapshot.value)
  }, [])

  const initialize = useCallback(() => {
    initialized.current ??= repository.read().catch(() => {
      sessionOnly.current = true
      if (mounted.current) setStorageFailed(true)
      return { revision: 0, value: initial }
    })
    return initialized.current
  }, [repository, initial])

  const update = useCallback((action: SetStateAction<T>) => {
    const operation = queue.current.then(async () => {
      apply(await initialize())
      let snapshot: Snapshot<T>
      try {
        if (sessionOnly.current) {
          const next = typeof action === 'function' ? (action as (old: T) => T)(current.current) : action
          snapshot = { revision: revision.current + 1, value: next }
        } else snapshot = await repository.update(action)
      } catch (cause) {
        if (!(cause instanceof StorageUnavailableError)) throw cause
        // If storage becomes unavailable, keep this tab usable without claiming
        // it can still share writes safely with other tabs.
        sessionOnly.current = true
        if (mounted.current) setStorageFailed(true)
        const next = typeof action === 'function' ? (action as (old: T) => T)(current.current) : action
        snapshot = { revision: revision.current + 1, value: next }
      }
      apply(snapshot)
      if (!sessionOnly.current) {
        try { channel.current?.postMessage({ key }) }
        catch { /* Polling and focus refresh also pick up committed changes. */ }
      }
      return snapshot.value
    })
    queue.current = operation.catch(() => {})
    return operation
  }, [apply, initialize, repository, key])

  useEffect(() => {
    mounted.current = true
    const refresh = () => {
      if (sessionOnly.current) return
      void repository.read().then((snapshot) => {
        if (!sessionOnly.current) apply(snapshot)
      }).catch(() => {
        if (mounted.current) setStorageFailed(true)
      })
    }
    try {
      channel.current = new BroadcastChannel(`roast-state:${key}`)
      channel.current.onmessage = refresh
    } catch { /* Browsers without BroadcastChannel use polling. */ }
    void initialize().then((snapshot) => {
      apply(snapshot)
      if (mounted.current) setReady(true)
    })
    // Reading the database, rather than applying event payloads, prevents an
    // old notification from rolling state back. Revisions also guard reads
    // that finish after a newer local commit.
    const interval = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      mounted.current = false
      channel.current?.close()
      channel.current = undefined
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [apply, initialize, repository, key])

  return [value, update, storageFailed, ready] as const
}

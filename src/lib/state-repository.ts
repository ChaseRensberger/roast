export type Snapshot<T> = { revision: number; value: T }
export type StateUpdate<T> = T | ((previous: T) => T)

export class StorageUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Browser storage is unavailable.', { cause })
  }
}

let database: Promise<IDBDatabase> | undefined

export function openStateDatabase(factory: IDBFactory = indexedDB, name = 'roast-demo') {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('state')
    request.onerror = () => reject(new StorageUnavailableError(request.error))
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
  })
}

export function browserStateDatabase() {
  if (!database) {
    try { database = openStateDatabase() }
    catch (cause) { database = Promise.reject(new StorageUnavailableError(cause)) }
    // The hook attaches its initialization handler after the first render.
    void database.catch(() => {})
  }
  return database
}

// Read-modify-write happens inside one transaction. IndexedDB serializes these
// transactions across connections (and tabs), not just within this instance.
export class StateRepository<T> {
  private database: Promise<IDBDatabase>
  private key: string
  private initial: T
  private validate: (value: unknown) => T

  constructor(
    database: Promise<IDBDatabase>,
    key: string,
    initial: T,
    validate: (value: unknown) => T,
  ) {
    this.database = database
    this.key = key
    this.initial = initial
    this.validate = validate
  }

  read() { return this.transact() }
  update(action: StateUpdate<T>) { return this.transact(action) }

  private async transact(action?: StateUpdate<T>): Promise<Snapshot<T>> {
    const db = await this.database
    return new Promise((resolve, reject) => {
      let transaction: IDBTransaction
      try { transaction = db.transaction('state', 'readwrite') }
      catch (cause) { reject(new StorageUnavailableError(cause)); return }
      const store = transaction.objectStore('state')
      const request = store.get(this.key)
      let snapshot: Snapshot<T>
      let actionError: unknown
      let actionFailed = false
      transaction.oncomplete = () => resolve(snapshot)
      transaction.onabort = () => reject(actionFailed ? actionError : new StorageUnavailableError(transaction.error))
      request.onsuccess = () => {
        try {
          const saved = request.result as Snapshot<unknown> | undefined
          const previous = saved ? this.validate(saved.value) : this.initial
          const revision = saved && Number.isSafeInteger(saved.revision) ? saved.revision : 0
          let next = previous
          if (action !== undefined) {
            try { next = typeof action === 'function' ? (action as (old: T) => T)(previous) : action }
            catch (cause) { actionError = cause; actionFailed = true; transaction.abort(); return }
          }
          snapshot = { revision: revision + (Object.is(next, previous) ? 0 : 1), value: next }
          if (!saved || !Object.is(next, previous)) store.put(snapshot, this.key)
        } catch (cause) {
          // Validation or persistence failed, not a domain-level conflict.
          actionError = new StorageUnavailableError(cause)
          actionFailed = true
          transaction.abort()
        }
      }
    })
  }
}

export function isNewerSnapshot<T>(snapshot: Snapshot<T>, revision: number) {
  return snapshot.revision > revision
}

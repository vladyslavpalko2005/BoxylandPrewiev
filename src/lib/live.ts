import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createLockerApi,
  lockerApiBaseUrl,
  LockerApiError,
  type ApiErrorCode,
} from './api'
import type { BoxLock, Connection, Notice } from './locks'

type PendingCommand = {
  accepted: boolean
  timer?: ReturnType<typeof setTimeout>
}
export type LiveError = { code: ApiErrorCode; status?: number }

export function useLiveController() {
  const api = useMemo(() => createLockerApi(lockerApiBaseUrl()), [])
  const [locks, setLocks] = useState<BoxLock[]>([])
  const [connection, setConnection] = useState<Connection>(
    navigator.onLine === false ? 'disconnected' : 'searching',
  )
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [error, setError] = useState<LiveError | null>(null)
  const snapshot = useRef<BoxLock[]>([])
  const pending = useRef(new Map<number, PendingCommand>())
  const commandErrors = useRef(
    new Map<number, 'openFailed' | 'openUnconfirmed'>(),
  )
  const abort = useRef(new AbortController())
  const fetching = useRef(false)
  const connected = useRef(false)

  const renderSnapshot = useCallback(() => {
    setLocks(
      snapshot.current.map((lock) => ({
        ...lock,
        status: pending.current.has(lock.id) ? 'pending' : lock.status,
        target: pending.current.has(lock.id) ? 'unlocked' : undefined,
        commandError: commandErrors.current.get(lock.id),
      })),
    )
  }, [])

  const fetchSnapshot = useCallback(
    async (manual = false) => {
      if (fetching.current || abort.current.signal.aborted) return
      if (navigator.onLine === false) {
        connected.current = false
        setConnection('disconnected')
        setError({ code: 'apiUnavailable' })
        return
      }
      const signal = abort.current.signal
      fetching.current = true
      if (manual) setRefreshing(true)
      try {
        const states = await api.getStates(signal)
        if (signal.aborted || !navigator.onLine) return
        const previous = new Map(
          snapshot.current.map((lock) => [lock.id, lock]),
        )
        const time = new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
        snapshot.current = states.map((state) => {
          if (state.active && state.locked === false)
            commandErrors.current.delete(state.address)
          const old = previous.get(state.address)
          const status = !state.active
            ? 'offline'
            : state.locked
              ? 'locked'
              : 'unlocked'
          const changed =
            old?.hardware?.active &&
            state.active &&
            old.hardware.locked !== state.locked
          const history = changed
            ? [
                {
                  status: state.locked
                    ? ('locked' as const)
                    : ('unlocked' as const),
                  time,
                  day: 'today' as const,
                },
                ...old.history,
              ].slice(0, 30)
            : (old?.history ?? [])
          return {
            id: state.address,
            status,
            history,
            hardware: {
              active: state.active,
              locked: state.locked,
              opened: state.opened,
            },
          }
        })
        for (const [id, command] of pending.current) {
          const state = states.find((item) => item.address === id)
          if (!state?.active) {
            clearTimeout(command.timer)
            pending.current.delete(id)
            commandErrors.current.set(id, 'openUnconfirmed')
            setNotice({ kind: 'openTimeoutNotice', id })
          } else if (command.accepted && state.locked === false) {
            clearTimeout(command.timer)
            pending.current.delete(id)
            commandErrors.current.delete(id)
            setNotice({ kind: 'openConfirmedNotice', id })
          }
        }
        renderSnapshot()
        connected.current = true
        setConnection('connected')
        setError(null)
        setLastUpdated(new Date())
        if (manual) setNotice({ kind: 'liveUpdatedNotice' })
      } catch (cause) {
        if (signal.aborted) return
        connected.current = false
        setConnection('disconnected')
        setError(
          cause instanceof LockerApiError
            ? { code: cause.code, status: cause.status }
            : { code: 'apiUnavailable' },
        )
      } finally {
        fetching.current = false
        if (!signal.aborted) setRefreshing(false)
      }
    },
    [api, renderSnapshot],
  )

  useEffect(() => {
    const controller = new AbortController()
    abort.current = controller
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      await fetchSnapshot()
      if (!controller.signal.aborted) timer = setTimeout(poll, 2000)
    }
    void poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
      for (const command of pending.current.values())
        clearTimeout(command.timer)
      pending.current.clear()
      connected.current = false
    }
  }, [fetchSnapshot])

  useEffect(() => {
    const offline = () => {
      connected.current = false
      setConnection('disconnected')
      setError({ code: 'apiUnavailable' })
    }
    const online = () => {
      void fetchSnapshot(true)
    }
    const resume = () => {
      if (!connected.current && document.visibilityState !== 'hidden') {
        void fetchSnapshot(true)
      }
    }
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    return () => {
      window.removeEventListener('focus', resume)
      document.removeEventListener('visibilitychange', resume)
      window.removeEventListener('offline', offline)
      window.removeEventListener('online', online)
    }
  }, [fetchSnapshot])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  async function operate(ids: number[], target: 'locked' | 'unlocked') {
    // Hardware exposes open only. Never translate a close or bulk request into opens.
    if (target !== 'unlocked' || ids.length !== 1 || !connected.current) return
    const id = ids[0]
    const lock = snapshot.current.find((item) => item.id === id)
    if (lock?.status !== 'locked' || pending.current.has(id)) return
    const command: PendingCommand = { accepted: false }
    const signal = abort.current.signal
    pending.current.set(id, command)
    commandErrors.current.delete(id)
    renderSnapshot()
    try {
      await api.openSlot(id, signal)
      if (signal.aborted) return
      if (pending.current.get(id) !== command) return
      command.accepted = true
      setNotice({ kind: 'openSentNotice', id })
      command.timer = setTimeout(() => {
        if (signal.aborted || pending.current.get(id) !== command) return
        pending.current.delete(id)
        commandErrors.current.set(id, 'openUnconfirmed')
        renderSnapshot()
        setNotice({ kind: 'openTimeoutNotice', id })
      }, 10000)
      void fetchSnapshot()
    } catch {
      if (signal.aborted) return
      if (pending.current.get(id) === command) pending.current.delete(id)
      clearTimeout(command.timer)
      commandErrors.current.set(id, 'openFailed')
      renderSnapshot()
      setNotice({ kind: 'openFailedNotice', id })
    }
  }

  return {
    locks,
    connection,
    refreshing,
    lastUpdated,
    notice,
    error,
    operate,
    refresh: () => {
      void fetchSnapshot(true)
    },
  }
}

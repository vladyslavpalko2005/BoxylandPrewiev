export type LockStatus = 'locked' | 'unlocked' | 'pending' | 'offline'
export type Connection = 'connected' | 'searching' | 'disconnected'
export type HistoryEntry = {
  status: 'locked' | 'unlocked'
  time: string
  day: 'today' | 'yesterday'
}
export type BoxLock = {
  id: number
  status: LockStatus
  history: HistoryEntry[]
  target?: 'locked' | 'unlocked'
  hardware?: { active: boolean; locked: boolean | null; opened: boolean | null }
  commandError?: 'openFailed' | 'openUnconfirmed'
}

export const number = (id: number) => String(id).padStart(2, '0')

export type Notice =
  | { kind: 'liveUpdatedNotice' }
  | {
      kind:
        | 'openSentNotice'
        | 'openConfirmedNotice'
        | 'openTimeoutNotice'
        | 'openFailedNotice'
      id: number
    }

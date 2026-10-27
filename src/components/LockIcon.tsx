import { Unplug } from 'lucide-react'
import { LoaderCircle, Lock, LockOpen } from './BrandIcons'
import type { BoxLock, LockStatus } from '../lib/locks'

export function UnlockedOfflineIcon({ size = 20 }: { size?: number }) {
  return (
    <span
      className="unlocked-offline-icon"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <LockOpen size={size * 0.62} className="combined-unlocked" />
      <Unplug size={size * 0.62} strokeWidth={2} className="combined-unplug" />
    </span>
  )
}

export function StateIcon({
  status,
  size = 20,
}: {
  status: LockStatus
  size?: number
}) {
  if (status === 'offline') return <UnlockedOfflineIcon size={size} />
  const Icon =
    status === 'unlocked'
      ? LockOpen
      : status === 'pending'
        ? LoaderCircle
        : Lock
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      aria-hidden="true"
      className={status === 'pending' ? 'spin' : ''}
    />
  )
}

export function LockVisual({
  lock,
  large = false,
  tile = false,
}: {
  lock: BoxLock
  large?: boolean
  tile?: boolean
}) {
  if (tile && lock.status === 'offline') {
    return (
      <span className="combined-tile-art" aria-hidden="true">
        <LockOpen size={26} className="combined-tile-unlocked" />
        <Unplug size={26} strokeWidth={2} className="combined-tile-unplug" />
      </span>
    )
  }
  return (
    <div className={`lock-visual ${large ? 'large' : ''} ${lock.status}`}>
      <StateIcon status={lock.status} size={large ? 38 : 20} />
    </div>
  )
}

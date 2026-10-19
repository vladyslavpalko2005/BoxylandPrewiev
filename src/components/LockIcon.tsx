import { LoaderCircle, Lock, Unplug, LockOpen } from 'lucide-react'
import type { BoxLock, LockStatus } from '../lib/locks'

export function StateIcon({
  status,
  size = 20,
}: {
  status: LockStatus
  size?: number
}) {
  const Icon =
    status === 'unlocked'
      ? LockOpen
      : status === 'pending'
        ? LoaderCircle
        : status === 'offline'
          ? Unplug
          : Lock
  return (
    <Icon
      size={size}
      strokeWidth={1.6}
      aria-hidden="true"
      className={status === 'pending' ? 'spin' : ''}
    />
  )
}

export function LockVisual({
  lock,
  large = false,
}: {
  lock: BoxLock
  large?: boolean
}) {
  return (
    <div className={`lock-visual ${large ? 'large' : ''} ${lock.status}`}>
      <StateIcon status={lock.status} size={large ? 38 : 22} />
    </div>
  )
}

import { useI18n } from '../lib/i18n'
import { Lock, LockOpen, RotateCw, X } from 'lucide-react'
import { number, type BoxLock, type Connection } from '../lib/locks'
import { StateIcon } from './LockIcon'

export function LockDetail({
  lock,
  connection,
  onClose,
  onOperate,
  onRetry,
}: {
  lock: BoxLock
  connection: Connection
  onClose: () => void
  onOperate: (id: number, target: 'locked' | 'unlocked') => void
  onRetry: () => void
}) {
  const { t } = useI18n()
  const unavailable = lock.status === 'offline'
  const pending = lock.status === 'pending'
  const disconnected = connection !== 'connected'
  const target = lock.status === 'unlocked' ? 'locked' : 'unlocked'
  const action = target === 'locked' ? t('lockAction') : t('openAction')
  const alreadyUnlocked = lock.status === 'unlocked'
  const disabled = unavailable || pending || disconnected || alreadyUnlocked
  const CurrentIcon = lock.status === 'unlocked' ? LockOpen : Lock
  const ActionIcon = target === 'locked' ? Lock : LockOpen
  return (
    <div className="lock-detail">
      <div className="sheet-handle" />
      <div className="detail-heading">
        <div className="detail-title">
          <h2 id="detail-heading">{t('lock', { number: number(lock.id) })}</h2>
          <span className={`state-tag ${lock.status}`}>
            <i />
            {t(lock.status)}
          </span>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t('closeDetail')}
        >
          <X size={14} />
        </button>
      </div>
      <div className="detail-hero">
        <button
          className={`big-lock ${lock.status}`}
          title={alreadyUnlocked ? t('openOnly') : undefined}
          disabled={disabled}
          onClick={() => onOperate(lock.id, target)}
          aria-label={
            alreadyUnlocked
              ? t('alreadyUnlocked')
              : t('actionLabel', { action, number: number(lock.id) })
          }
        >
          <span className="big-lock-inner">
            {unavailable || pending ? (
              <StateIcon status={lock.status} size={42} />
            ) : (
              <CurrentIcon size={42} strokeWidth={1.5} aria-hidden="true" />
            )}
          </span>
        </button>
        {unavailable ? (
          <>
            <h3>{t('unavailable')}</h3>
            <p>{t('unavailableHint', { number: number(lock.id) })}</p>
          </>
        ) : (
          <p>
            {disconnected ? (
              t('controlAfterReconnect')
            ) : pending ? (
              t('waitingLock')
            ) : alreadyUnlocked ? (
              t('alreadyUnlocked')
            ) : (
              <>
                <span className="desktop-hint">{t('liveClickOpen')}</span>
                <span className="touch-hint">{t('liveTapOpen')}</span>
              </>
            )}
          </p>
        )}
      </div>
      {!unavailable && !alreadyUnlocked && (
        <button
          className={`button primary full detail-action${alreadyUnlocked ? ' manual-lock-action' : ''}`}
          title={alreadyUnlocked ? t('openOnly') : undefined}
          disabled={disconnected || pending || alreadyUnlocked}
          onClick={() => onOperate(lock.id, target)}
        >
          {pending ? (
            <StateIcon status="pending" size={16} />
          ) : (
            <ActionIcon size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {pending
            ? lock.target === 'locked'
              ? t('locking')
              : t('unlocking')
            : action}
        </button>
      )}
      {alreadyUnlocked && <p className="manual-close-hint">{t('openOnly')}</p>}
      {lock.commandError && (
        <p className="command-error" role="alert">
          {t(lock.commandError)}
        </p>
      )}
      <dl className="metadata">
        {!unavailable && (
          <div>
            <dt>{t('connection')}</dt>
            <dd className={disconnected ? 'orange-text' : 'green-text'}>
              {disconnected ? t('interrupted') : t('connected')}
            </dd>
          </div>
        )}
        <div>
          <dt>{t('controllerPort')}</dt>
          <dd>P{number(lock.id)}</dd>
        </div>
        <div>
          <dt>
            {unavailable
              ? t('lastSeen')
              : lock.status === 'unlocked'
                ? t('unlockedSince')
                : t('lastChange')}
          </dt>
          <dd>
            {unavailable
              ? t('unknownValue')
              : lock.history[0]
                ? `${t(lock.history[0].day)} ${lock.history[0].time}`
                : '—'}
          </dd>
        </div>
      </dl>
      {unavailable && (
        <button
          className="button outline full"
          onClick={onRetry}
          disabled={disconnected}
        >
          <RotateCw size={16} />
          {t('retry')}
        </button>
      )}
    </div>
  )
}

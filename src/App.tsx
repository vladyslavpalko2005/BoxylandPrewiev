import { useEffect, useState } from 'react'
import {
  Wifi,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  RotateCw,
  LayoutGrid,
  Unplug,
} from 'lucide-react'
import { FilterSwitch, filters, type Filter } from './components/FilterSwitch'
import { LockDetail } from './components/LockDetail'
import { LockVisual } from './components/LockIcon'
import { Modal } from './components/Modal'
import { useI18n } from './lib/i18n'
import { number, type BoxLock, type Connection } from './lib/locks'
import { useLiveController } from './lib/live'
import { useNativeBackButton } from './lib/native'

function useMobile() {
  const [mobile, setMobile] = useState(
    () => matchMedia('(max-width: 767px)').matches,
  )
  useEffect(() => {
    const query = matchMedia('(max-width: 767px)')
    const listener = () => setMobile(query.matches)
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener)
      return () => query.removeEventListener('change', listener)
    }
    query.addListener(listener)
    return () => query.removeListener(listener)
  }, [])
  return mobile
}

function ConnectionBadge({
  connection,
  refreshing,
  onRefresh,
}: {
  connection: Connection
  refreshing: boolean
  onRefresh: () => void
}) {
  const { t } = useI18n()
  const Icon =
    connection === 'connected'
      ? Wifi
      : connection === 'searching'
        ? LoaderCircle
        : Unplug
  return (
    <button
      className={`connection-badge ${connection}`}
      onClick={onRefresh}
      disabled={refreshing}
      aria-label={t('refreshStates')}
      title={t('refreshStates')}
    >
      <Icon
        size={14}
        strokeWidth={connection === 'connected' ? 3 : 2}
        className={connection === 'searching' ? 'spin' : ''}
        aria-hidden="true"
      />
      <span>
        {t(
          connection === 'connected'
            ? 'connectedLive'
            : connection === 'searching'
              ? 'searching'
              : 'disconnected',
        )}
      </span>
    </button>
  )
}

function LockTile({
  lock,
  selected,
  disabled,
  onSelect,
}: {
  lock: BoxLock
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const { t } = useI18n()
  return (
    <button
      className={`lock-tile ${lock.status} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      disabled={disabled}
      aria-label={t('tileLabel', {
        number: number(lock.id),
        status: t(lock.status).toLowerCase(),
      })}
      aria-pressed={selected}
    >
      <span className="tile-top">
        <span>{number(lock.id)}</span>
        {lock.status !== 'offline' && (
          <i className={`status-dot ${lock.status}`} />
        )}
      </span>
      <LockVisual lock={lock} />
      <span className="tile-label">
        {lock.status === 'pending'
          ? t(lock.target === 'locked' ? 'locking' : 'unlocking')
          : t(lock.status)}
      </span>
    </button>
  )
}

export default function App() {
  useNativeBackButton()
  const { t, formatTime } = useI18n()
  const {
    locks,
    connection,
    refreshing,
    lastUpdated,
    notice,
    operate,
    refresh,
    error,
  } = useLiveController()
  const mobile = useMobile()
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<number | null>(7)
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeLock = locks.find((lock) => lock.id === selected)
  const counts = {
    all: locks.length,
    locked: locks.filter((lock) => lock.status === 'locked').length,
    unlocked: locks.filter((lock) => lock.status === 'unlocked').length,
    offline: locks.filter((lock) => lock.status === 'offline').length,
  }
  const visible = locks.filter(
    (lock) => filter === 'all' || lock.status === filter,
  )
  const connected = connection === 'connected'
  const heading =
    filter === 'all'
      ? t('locks')
      : t(filters.find((item) => item.id === filter)!.label)
  const closeDetail = () => {
    setSheetOpen(false)
    if (!mobile) setSelected(null)
  }
  const operateOne = (id: number, target: 'locked' | 'unlocked') =>
    operate([id], target)

  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="./" className="brand" aria-label={t('home')}>
          <img
            src={`${import.meta.env.BASE_URL}boxyland-logo.png`}
            width="90"
            height="35"
            alt="Boxyland"
          />
          <span>
            <strong>Boxyland Lock</strong>
            <small>{t('subtitle')}</small>
          </span>
        </a>
        <div className="header-controls">
          <ConnectionBadge
            connection={connection}
            refreshing={refreshing}
            onRefresh={refresh}
          />
          <button
            className="button outline header-refresh"
            onClick={refresh}
            disabled={refreshing}
          >
            <RotateCw
              size={16}
              className={refreshing ? 'spin' : ''}
              aria-hidden="true"
            />
            {t('refresh')}
          </button>
        </div>
      </header>

      <main
        className={`dashboard${locks.length === 0 ? ' dashboard-connecting' : ''}`}
      >
        {locks.length === 0 ? (
          <section
            className="connection-state"
            aria-labelledby="connection-heading"
            aria-busy={connection === 'searching' || refreshing}
          >
            <div className={`connection-state-icon ${error ? 'offline' : ''}`}>
              {error ? (
                <Unplug size={30} strokeWidth={1.6} />
              ) : (
                <LoaderCircle size={30} strokeWidth={1.6} className="spin" />
              )}
            </div>
            <h1 id="connection-heading">
              {t(error ? 'statesUnavailable' : 'loadingStates')}
            </h1>
            <p role={error ? 'alert' : undefined}>
              {error
                ? t(error.code, { status: error.status ?? '—' })
                : t('connectingHint')}
            </p>
            <button
              className="button primary"
              disabled={refreshing || connection === 'searching'}
              onClick={refresh}
            >
              <RotateCw size={18} className={refreshing ? 'spin' : ''} />
              {t(
                refreshing || connection === 'searching'
                  ? 'reconnecting'
                  : 'reconnect',
              )}
            </button>
          </section>
        ) : (
          <>
            {!connected && (
              <div className="connection-alert" role="alert">
                <CircleAlert size={22} aria-hidden="true" />
                <div>
                  <strong>
                    {t(
                      connection === 'searching'
                        ? 'reconnectingController'
                        : 'connectionLost',
                    )}
                  </strong>
                  <p>
                    {error
                      ? t(error.code, { status: error.status ?? '—' })
                      : t('paused')}
                  </p>
                  <button
                    className="button outline reconnect-inline"
                    onClick={refresh}
                    disabled={refreshing}
                  >
                    <RotateCw size={16} className={refreshing ? 'spin' : ''} />
                    {t(refreshing ? 'reconnecting' : 'reconnect')}
                  </button>
                </div>
              </div>
            )}
            <div className="workspace">
              <div className="workspace-sidebar">
                <aside className="filter-panel" aria-label={t('filterLocks')}>
                  <FilterSwitch
                    value={filter}
                    counts={counts}
                    onChange={setFilter}
                  />
                </aside>
                {!mobile && (
                  <aside className="detail-panel" aria-label={t('detail')}>
                    {activeLock ? (
                      <LockDetail
                        lock={activeLock}
                        connection={connection}
                        onClose={closeDetail}
                        onOperate={operateOne}
                        onRetry={refresh}
                      />
                    ) : (
                      <div className="detail-placeholder">
                        <LockKeyhole size={32} />
                        <h2>{t('chooseLock')}</h2>
                        <p>{t('chooseHint')}</p>
                      </div>
                    )}
                  </aside>
                )}
              </div>

              <section className="locks-panel" aria-labelledby="locks-heading">
                <div className="panel-toolbar">
                  <h1 id="locks-heading">{heading}</h1>
                  <div className="grid-tools">
                    <span className="grid-count">
                      {connected
                        ? filter === 'all'
                          ? counts.all
                          : t('filteredCount', {
                              count: visible.length,
                              total: counts.all,
                            })
                        : t('lastSeenAt', {
                            time: lastUpdated ? formatTime(lastUpdated) : '—',
                          })}
                    </span>
                  </div>
                </div>
                {visible.length ? (
                  <div className={`locks-grid ${!connected ? 'inactive' : ''}`}>
                    {visible.map((lock) => (
                      <LockTile
                        key={lock.id}
                        lock={lock}
                        selected={
                          selected === lock.id && (!mobile || sheetOpen)
                        }
                        disabled={!connected}
                        onSelect={() => {
                          setSelected(lock.id)
                          setSheetOpen(true)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <LayoutGrid size={28} aria-hidden="true" />
                    <h2>{t('noResults')}</h2>
                    <p>{t('filterHint')}</p>
                    <button
                      className="button outline"
                      onClick={() => {
                        setFilter('all')
                      }}
                    >
                      {t('showAll')}
                    </button>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <div
        className={`toast ${notice ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {notice
          ? t(notice.kind, 'id' in notice ? { number: number(notice.id) } : {})
          : ''}
      </div>
      {mobile && sheetOpen && activeLock && (
        <Modal
          className="detail-sheet"
          labelId="detail-heading"
          onClose={closeDetail}
        >
          <LockDetail
            lock={activeLock}
            connection={connection}
            onClose={closeDetail}
            onOperate={operateOne}
            onRetry={refresh}
          />
        </Modal>
      )}
    </div>
  )
}

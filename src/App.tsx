import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Wifi, WifiOff, LayoutGrid } from './components/FigmaIcon'
import {
  CircleAlert,
  LoaderCircle,
  Lock,
  RotateCw,
} from './components/BrandIcons'
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
        : WifiOff
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
      title={lock.status === 'offline' ? t('offline') : undefined}
    >
      <span className="tile-top">
        <span>{number(lock.id)}</span>
        {lock.status !== 'offline' && (
          <i className={`status-dot ${lock.status}`} />
        )}
      </span>
      <LockVisual lock={lock} tile />
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
  const shellRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<number | null>(7)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showWifiHelp, setShowWifiHelp] = useState(false)
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
  const needsConnection =
    connection === 'disconnected' &&
    (locks.length === 0 ||
      error?.code === 'apiUnavailable' ||
      error?.code === 'apiHttpError')
  const showConnection = locks.length === 0 || needsConnection
  const wifiHelpVisible = needsConnection && showWifiHelp
  useEffect(() => {
    if (connected) setShowWifiHelp(false)
  }, [connected])
  useLayoutEffect(() => {
    const shell = shellRef.current
    const controls = controlsRef.current
    if (!shell || !controls || !mobile || showConnection) return
    const measure = () => {
      shell.style.setProperty(
        '--mobile-controls-height',
        `${controls.getBoundingClientRect().height}px`,
      )
    }
    measure()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(controls)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      shell.style.removeProperty('--mobile-controls-height')
    }
  }, [mobile, showConnection])
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

  const connectAction = (
    <button
      className="connect-button"
      disabled={refreshing}
      onClick={() => {
        setShowWifiHelp(true)
        refresh()
      }}
    >
      {refreshing ? (
        <LoaderCircle size={18} className="spin" />
      ) : (
        <img src={`${import.meta.env.BASE_URL}brand/ad42d.svg`} alt="" />
      )}
      <span>
        {t(
          refreshing
            ? 'searching'
            : wifiHelpVisible
              ? 'retry'
              : 'connectAction',
        )}
      </span>
    </button>
  )

  return (
    <div
      ref={shellRef}
      className={`app-shell${showConnection ? ' app-shell-connecting' : ''}`}
    >
      <header className="app-header">
        <a href="./" className="brand" aria-label={t('home')}>
          <span className="brand-wordmark" aria-label="BOXYLOCK">
            BOXYL
            <span className="logo-gap">
              O<img src={`${import.meta.env.BASE_URL}brand/d2457.svg`} alt="" />
            </span>
            CK
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
        className={`dashboard${showConnection ? ' dashboard-connecting' : ''}${needsConnection ? ' dashboard-connect-prompt' : ''}`}
      >
        {showConnection ? (
          <section
            className={`connection-state${wifiHelpVisible ? ' wifi-help-state' : ''}`}
            aria-labelledby="connection-heading"
            aria-busy={connection === 'searching' || refreshing}
          >
            {wifiHelpVisible ? (
              <div className="wifi-help" role="status" aria-live="polite">
                <h1 id="connection-heading">{t('wifiHelpTitle')}</h1>
                <ol className="wifi-help-steps">
                  <li>{t('wifiHelpSettings')}</li>
                  <li>{t('wifiHelpNetwork')}</li>
                  <li>{t('wifiHelpReturn')}</li>
                </ol>
                <p>{t('wifiHelpAutomatic')}</p>
              </div>
            ) : (
              <>
                <div
                  className={`connection-state-icon ${needsConnection ? 'offline' : ''}`}
                  aria-hidden="true"
                >
                  {needsConnection ? (
                    <>
                      <img
                        className="connection-pulse pulse-outer"
                        src={`${import.meta.env.BASE_URL}brand/35a67.svg`}
                        alt=""
                      />
                      <img
                        className="connection-pulse pulse-middle"
                        src={`${import.meta.env.BASE_URL}brand/6c361.svg`}
                        alt=""
                      />
                      <img
                        className="connection-pulse pulse-inner"
                        src={`${import.meta.env.BASE_URL}brand/538bb.svg`}
                        alt=""
                      />
                      <span className="connection-wifi">
                        <img
                          src={`${import.meta.env.BASE_URL}brand/2d614.svg`}
                          alt=""
                        />
                      </span>
                    </>
                  ) : (
                    <Wifi size={34} />
                  )}
                </div>
                <h1 id="connection-heading">
                  {t(needsConnection ? 'connectTitle' : 'loadingStates')}
                </h1>
                <p>{t(needsConnection ? 'connectHint' : 'connectingHint')}</p>
              </>
            )}
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
                {!mobile && (
                  <aside className="filter-panel" aria-label={t('filterLocks')}>
                    <FilterSwitch
                      value={filter}
                      counts={counts}
                      onChange={setFilter}
                    />
                  </aside>
                )}
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
                        <Lock size={32} />
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
      {needsConnection && (
        <div className="mobile-controls connection-footer">{connectAction}</div>
      )}
      {mobile && !showConnection && (
        <div
          ref={controlsRef}
          className="mobile-controls mobile-controls-floating"
        >
          <aside className="filter-panel" aria-label={t('filterLocks')}>
            <FilterSwitch value={filter} counts={counts} onChange={setFilter} />
          </aside>
        </div>
      )}
      <div
        className={`toast ${notice ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {notice
          ? t(notice.kind, 'id' in notice ? { number: number(notice.id) } : {})
          : ''}
      </div>
      {mobile && sheetOpen && activeLock && !showConnection && (
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

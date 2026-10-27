import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
const sk = {
  connectTitle: 'Pripojte sa k ovládaču',
  connectHint: 'Ťuknite na Pripojiť a zobrazte postup pripojenia.',
  connectAction: 'Pripojiť',
  wifiHelpTitle: 'Pripojenie cez Wi-Fi',
  wifiHelpSettings: 'Otvorte nastavenia Wi-Fi svojho zariadenia.',
  wifiHelpNetwork: 'Pripojte sa k Wi-Fi sieti ovládača.',
  wifiHelpReturn: 'Vráťte sa na túto stránku.',
  wifiHelpAutomatic: 'Po návrate pripojenie overíme automaticky.',
  connectingHint: 'Zvyčajne to trvá pár sekúnd — nič nemusíte robiť.',
  unknownValue: 'Neznáme',
  liveMode: 'Živé zariadenie',
  liveController: 'Ovládač zámkov',
  liveDeviceInfo: 'BOXYLOCK · {count} portov',
  connectedLive: 'Pripojené · Online',
  openAction: 'Otvoriť zámok',
  alreadyUnlocked: 'Zámok je otvorený',
  liveClickOpen: 'Kliknite pre otvorenie zámku',
  openOnly: 'Zatlačte západku do zámku, kým necvakne.\nStav sa tu zmení sám.',
  loadingStates: 'Pripájam sa…',
  statesUnavailable: 'Stavy zariadenia nie sú dostupné',
  apiUnavailable:
    'Ovládač neodpovedá. Skontrolujte napájanie a sieťové spojenie. Pripojenie skúšame obnoviť automaticky.',
  apiInvalidResponse:
    'Ovládač vrátil neplatné údaje. Posledný známy stav ostáva zobrazený; ovládanie je pozastavené.',
  apiHttpError:
    'Ovládač vrátil chybu HTTP {status}. Pripojenie skúšame obnoviť automaticky.',
  liveUpdatedNotice: 'Stavy zariadenia boli obnovené.',
  openSentNotice:
    'Príkaz pre zámok {number} bol odoslaný. Čakám na potvrdenie stavu.',
  openConfirmedNotice: 'Zámok {number}: zariadenie potvrdilo odomknutie.',
  openTimeoutNotice: 'Zámok {number}: odomknutie nebolo potvrdené.',
  openFailedNotice:
    'Príkaz pre zámok {number} zlyhal. Overte jeho stav pred ďalším pokusom.',
  openFailed:
    'Príkaz zlyhal. Stav mohol byť zmenený; skontrolujte zámok a obnovte údaje pred ďalším pokusom.',
  openUnconfirmed:
    'Zariadenie nepotvrdilo odomknutie. Skontrolujte zámok a obnovte údaje. Príkaz nebol automaticky zopakovaný.',
  observedEvents: 'Zmeny v tejto relácii',
  noHistory: 'V tejto relácii ešte nebola zaznamenaná zmena stavu.',
  yes: 'Áno',
  no: 'Nie',
  pageTitle: 'BOXYLOCK DEMO — ovládanie zámkov',
  pageDescription:
    'BOXYLOCK DEMO zobrazuje stav všetkých 48 zámkov v reálnom čase. Zámok odomknete jedným ťuknutím priamo v telefóne bez inštalácie aplikácie a bez registrácie.',
  home: 'BOXYLOCK DEMO — domov',
  subtitle: 'Ovládanie zámkov',
  searching: 'Pripájam…',
  disconnected: 'Nepripojené',
  refresh: 'Obnoviť',
  refreshStates: 'Obnoviť stavy',
  reconnectingController: 'Obnovujem spojenie s ovládačom…',
  connectionLost: 'Spojenie s ovládačom sa prerušilo',
  paused: 'Ovládanie je pozastavené. Zobrazujeme posledný známy stav.',
  overview: 'Prehľad stavov',
  locked: 'Zamknutý',
  unlocked: 'Odomknutý',
  pending: 'Spracováva sa',
  offline: 'Odomknutý/Nepripojený',
  lockedPlural: 'Zamknuté',
  unlockedPlural: 'Odomknuté',
  offlinePlural: 'Odomknuté/Nepripojené',
  offlineFilterShort: 'Odomk./Neprip.',
  connectedFilter: 'Pripojené',
  all: 'Všetky',
  connectedPorts: '{count} pripojených portov',
  boxes: 'zámky {numbers}',
  allClosed: 'všetky zámky sú zatvorené',
  waiting: 'čakáme na odozvu',
  noPending: 'žiadne čakajúce príkazy',
  emptyPorts: 'porty bez pripojeného zámku',
  locks: 'Zámky',
  filterLocks: 'Filtrovať zámky',
  filteredCount: '{count} z {total}',
  shown: '{count} zobrazených',
  lastSeenAt: 'naposledy {time}',
  noResults: 'Žiadne zámky sa nenašli',
  filterHint: 'Zvoľte iný filter alebo zobrazte všetky porty.',
  showAll: 'Zobraziť všetky zámky',
  shownPorts: 'Zobrazené: {count} z {total} portov',
  detail: 'Detail zámku',
  chooseLock: 'Vyberte zámok',
  chooseHint: 'Kliknite na zámok a zobrazte jeho stav, ovládanie a históriu.',
  reconnecting: 'Obnovujem spojenie…',
  reconnect: 'Obnoviť pripojenie',
  lock: 'Zámok {number}',
  tileLabel: 'Zámok {number}, {status}',
  closeDetail: 'Zavrieť detail',
  lockAction: 'Zamknúť',
  actionLabel: '{action} zámok {number}',
  unavailable: 'Odomknutý/Nepripojený',
  unavailableHint:
    'Stav zámku na porte P{number} nie je potvrdený. Zámok môže byť odomknutý alebo nepripojený.',
  controlAfterReconnect: 'Ovládanie bude dostupné po obnovení spojenia.',
  waitingLock: 'Čakáme na odozvu zámku…',
  liveTapOpen: 'Ťuknite pre otvorenie zámku',
  locking: 'Zamykám…',
  unlocking: 'Odomykám…',
  connection: 'Pripojenie',
  interrupted: 'Prerušené',
  connected: 'Pripojený',
  controllerPort: 'Port na ovládači',
  lastSeen: 'Naposledy videný',
  unlockedSince: 'Odomknutý od',
  lastChange: 'Posledná zmena',
  retry: 'Skúsiť znova',
  history: 'História',
  today: 'dnes',
  yesterday: 'včera',
  language: 'Jazyk',
}
type MessageKey = keyof typeof sk
const en: Record<MessageKey, string> = {
  connectTitle: 'Connect to the controller',
  connectHint: 'Tap Connect for Wi-Fi connection instructions.',
  connectAction: 'Connect',
  wifiHelpTitle: 'Connect over Wi-Fi',
  wifiHelpSettings: 'Open your device’s Wi-Fi settings.',
  wifiHelpNetwork: 'Connect to the controller’s Wi-Fi network.',
  wifiHelpReturn: 'Return to this page.',
  wifiHelpAutomatic:
    'We’ll check the connection automatically when you return.',
  connectingHint:
    'Connecting to the controller. Make sure you are connected to its network.',
  unknownValue: 'Unknown',
  liveMode: 'Live device',
  liveController: 'Lock controller',
  liveDeviceInfo: 'BOXYLOCK · {count} ports',
  connectedLive: 'Connected · Online',
  openAction: 'Open lock',
  alreadyUnlocked: 'The lock is unlocked',
  liveClickOpen: 'Click to open the lock',
  openOnly:
    'Push the latch into the lock until it clicks.\nThe status will update automatically.',
  loadingStates: 'Loading lock states…',
  statesUnavailable: 'Device states are unavailable',
  apiUnavailable:
    'The controller is not responding. Check its power and network connection. Reconnection is automatic.',
  apiInvalidResponse:
    'The controller returned invalid data. The last known state is preserved; controls are paused.',
  apiHttpError:
    'The controller returned HTTP {status}. Reconnection is automatic.',
  liveUpdatedNotice: 'Device states refreshed.',
  openSentNotice:
    'Command sent to lock {number}. Waiting for state confirmation.',
  openConfirmedNotice: 'Lock {number}: the device confirmed it is unlocked.',
  openTimeoutNotice: 'Lock {number}: unlocking was not confirmed.',
  openFailedNotice:
    'Command to lock {number} failed. Check its state before trying again.',
  openFailed:
    'The command failed. Its state may have changed; check the lock and refresh before trying again.',
  openUnconfirmed:
    'The device did not confirm unlocking. Check the lock and refresh. The command was not retried automatically.',
  observedEvents: 'Changes this session',
  noHistory: 'No state changes have been observed in this session yet.',
  yes: 'Yes',
  no: 'No',
  pageTitle: 'BOXYLOCK DEMO — lock control',
  pageDescription:
    'BOXYLOCK DEMO shows the status of all 48 locks in real time. Unlock a lock with one tap on your phone, with no app installation or registration.',
  home: 'BOXYLOCK DEMO — home',
  subtitle: 'Lock control',
  searching: 'Looking for device…',
  disconnected: 'Disconnected',
  refresh: 'Refresh',
  refreshStates: 'Refresh states',
  reconnectingController: 'Reconnecting to the controller…',
  connectionLost: 'Connection to the controller was lost',
  paused: 'Controls are paused. Showing the last known state.',
  overview: 'State overview',
  locked: 'Locked',
  unlocked: 'Unlocked',
  pending: 'Processing',
  offline: 'Unlocked/Not connected',
  lockedPlural: 'Locked',
  unlockedPlural: 'Unlocked',
  offlinePlural: 'Unlocked/Not connected',
  offlineFilterShort: 'Unlocked/Offline',
  connectedFilter: 'Connected',
  all: 'All',
  connectedPorts: '{count} connected ports',
  boxes: 'locks {numbers}',
  allClosed: 'all locks are closed',
  waiting: 'waiting for a response',
  noPending: 'no pending commands',
  emptyPorts: 'ports without a connected lock',
  locks: 'Locks',
  filterLocks: 'Filter locks',
  filteredCount: '{count} of {total}',
  shown: '{count} shown',
  lastSeenAt: 'last updated {time}',
  noResults: 'No locks found',
  filterHint: 'Choose another filter or show all ports.',
  showAll: 'Show all locks',
  shownPorts: 'Showing: {count} of {total} ports',
  detail: 'Lock details',
  chooseLock: 'Select a lock',
  chooseHint: 'Select a lock to view its state, controls and history.',
  reconnecting: 'Reconnecting…',
  reconnect: 'Reconnect',
  lock: 'Lock {number}',
  tileLabel: 'Lock {number}, {status}',
  closeDetail: 'Close details',
  lockAction: 'Lock',
  actionLabel: '{action} lock {number}',
  unavailable: 'Unlocked/Not connected',
  unavailableHint:
    'The lock state on port P{number} is not confirmed. The lock may be unlocked or not connected.',
  controlAfterReconnect:
    'Controls will be available once the connection is restored.',
  waitingLock: 'Waiting for the lock to respond…',
  liveTapOpen: 'Tap to open the lock',
  locking: 'Locking…',
  unlocking: 'Unlocking…',
  connection: 'Connection',
  interrupted: 'Interrupted',
  connected: 'Connected',
  controllerPort: 'Controller port',
  lastSeen: 'Last seen',
  unlockedSince: 'Unlocked since',
  lastChange: 'Last change',
  retry: 'Try again',
  history: 'History',
  today: 'today',
  yesterday: 'yesterday',
  language: 'Language',
}
export type Language = 'sk' | 'en'
type Params = Record<string, string | number>
const locales = { sk: 'sk-SK', en: 'en-GB' } as const
const dictionaries = { sk, en }
const LanguageContext = createContext<{
  language: Language
  setLanguage: (language: Language) => void
} | null>(null)
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('boxyland-language') === 'en' ? 'en' : 'sk'
    } catch {
      return 'sk'
    }
  })
  useEffect(() => {
    document.documentElement.lang = language
    document.title = dictionaries[language].pageTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', dictionaries[language].pageDescription)
    try {
      localStorage.setItem('boxyland-language', language)
    } catch {
      /* Storage may be disabled. */
    }
  }, [language])
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is required')
  const { language } = context
  const t = (key: MessageKey, params: Params = {}): string =>
    dictionaries[language][key].replace(/\{(\w+)\}/g, (_, name: string) =>
      String(params[name] ?? `{${name}}`),
    )
  const formatTime = (date: Date) =>
    date.toLocaleTimeString(locales[language], {
      hour: '2-digit',
      minute: '2-digit',
    })
  return { ...context, t, formatTime }
}

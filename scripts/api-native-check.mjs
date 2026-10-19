// Exercise the native transport contract without contacting a controller.
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import ts from 'typescript'

let reply = {
  status: 200,
  data: '[{"address":7,"active":true,"locked":true,"opened":true}]',
}
const calls = []
globalThis.__nativeApiCheck = {
  Capacitor: { isNativePlatform: () => true },
  CapacitorHttp: {
    request: async (options) => {
      calls.push(options)
      return reply
    },
  },
  env: {},
}
const source = (
  await readFile(new URL('../src/lib/api.ts', import.meta.url), 'utf8')
)
  .replace(
    "import { Capacitor, CapacitorHttp } from '@capacitor/core'",
    'const { Capacitor, CapacitorHttp } = globalThis.__nativeApiCheck',
  )
  .replaceAll('import.meta.env', 'globalThis.__nativeApiCheck.env')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const { createLockerApi, lockerApiBaseUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)
assert.equal(lockerApiBaseUrl(), 'http://10.42.0.1:5000')
globalThis.__nativeApiCheck.env.VITE_LOCKER_API_URL = 'http://10.42.0.2:5000'
globalThis.__nativeApiCheck.env.VITE_LOCKER_WEB_API_URL =
  'http://10.42.0.3:5000'
assert.equal(
  lockerApiBaseUrl(),
  'http://10.42.0.2:5000',
  'Native uses its own API setting',
)
const api = createLockerApi('http://10.42.0.1:5000')
assert.deepEqual(await api.getStates(), [
  { address: 7, active: true, locked: true, opened: true },
])
assert.equal(calls[0].url, 'http://10.42.0.1:5000/api/internal/states')
assert.equal(calls[0].method, 'GET')
assert.equal(calls[0].connectTimeout, 8000)
reply = { status: 204, data: '' }
await api.openSlot(7)
assert.equal(calls[1].method, 'POST')
assert.equal(calls[1].url, 'http://10.42.0.1:5000/api/internal/7/open')
reply = { status: 500, data: '' }
await assert.rejects(
  api.openSlot(7),
  (error) => error.code === 'apiHttpError' && error.status === 500,
)
assert.equal(calls.length, 3, 'Commands must not retry automatically')
reply = { status: 200, data: '{invalid' }
await assert.rejects(
  api.getStates(),
  (error) => error.code === 'apiInvalidResponse',
)
reply = {
  status: 200,
  data: [{ address: 7, active: true, locked: null, opened: true }],
}
await assert.rejects(
  api.getStates(),
  (error) => error.code === 'apiInvalidResponse',
)
const count = calls.length
await assert.rejects(
  api.openSlot(7, AbortSignal.abort()),
  (error) => error.name === 'AbortError',
)
assert.equal(
  calls.length,
  count,
  'An already aborted command must not reach native HTTP',
)
console.log(
  'PASS: native GET/POST transport, timeouts, independent sensors, HTTP/schema errors, abort guard and no retries',
)

// Verify static-hosting routing without contacting hardware or opening locks.
globalThis.__nativeApiCheck.Capacitor.isNativePlatform = () => false
globalThis.window = { location: { origin: 'https://locker.example' } }
for (const origin of [
  'http://192.168.50.1',
  'http://locker.local',
  'http://127.0.0.1:5173',
]) {
  globalThis.window.location.origin = origin
  assert.equal(
    lockerApiBaseUrl(),
    origin,
    'Browser must use the local website origin',
  )
}
globalThis.window.location.origin = 'http://192.168.50.1'
const browserCalls = []
globalThis.fetch = async (url, options) => {
  browserCalls.push({ url: url.href, method: options.method })
  return new Response(
    JSON.stringify([{ address: 7, active: true, locked: true, opened: false }]),
  )
}
const browserApi = createLockerApi(lockerApiBaseUrl())
await browserApi.getStates()
await browserApi.openSlot(7)
assert.deepEqual(browserCalls, [
  { url: 'http://192.168.50.1/api/internal/states', method: 'GET' },
  { url: 'http://192.168.50.1/api/internal/7/open', method: 'POST' },
])
console.log(
  'PASS: same-origin browser GET/POST routing on local HTTP addresses',
)

// Browser adapter must cancel reads and commands without retrying, including
// a timeout while the response body is still downloading.
const fetchBeforeCancellationCheck = globalThis.fetch
let browserAttempts = 0
globalThis.fetch = async (_url, options) => {
  browserAttempts++
  return new Promise((_resolve, reject) => {
    options.signal.addEventListener(
      'abort',
      () => reject(new DOMException('Aborted', 'AbortError')),
      { once: true },
    )
  })
}
const abortCommand = new AbortController()
const pendingCommand = browserApi.openSlot(7, abortCommand.signal)
abortCommand.abort()
await assert.rejects(pendingCommand, (error) => error.name === 'AbortError')
assert.equal(browserAttempts, 1)
await assert.rejects(
  browserApi.openSlot(7, AbortSignal.abort()),
  (error) => error.name === 'AbortError',
)
assert.equal(browserAttempts, 1)
const realSetTimeout = globalThis.setTimeout
const realClearTimeout = globalThis.clearTimeout
let clearedTimeout = false
globalThis.setTimeout = (fn, delay) => {
  assert.equal(delay, 8000)
  return realSetTimeout(fn, 5)
}
globalThis.clearTimeout = (timer) => {
  clearedTimeout = true
  realClearTimeout(timer)
}
globalThis.fetch = async (_url, options) => ({
  ok: true,
  status: 200,
  text: () =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener(
        'abort',
        () => reject(new DOMException('Aborted', 'AbortError')),
        { once: true },
      )
    }),
})
try {
  await assert.rejects(
    browserApi.getStates(),
    (error) => error.name === 'AbortError',
  )
  assert.ok(
    clearedTimeout,
    'Timeout must be disposed after body download fails',
  )
} finally {
  globalThis.setTimeout = realSetTimeout
  globalThis.clearTimeout = realClearTimeout
  globalThis.fetch = fetchBeforeCancellationCheck
}
console.log(
  'PASS: browser cancellation, body-download timeout and no automatic command retries',
)

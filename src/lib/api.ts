import { Capacitor, CapacitorHttp } from '@capacitor/core'

export type HardwareState = { address: number } & (
  | { active: true; locked: boolean; opened: boolean }
  | { active: false; locked: boolean | null; opened: boolean | null }
)
export type ApiErrorCode =
  'apiUnavailable' | 'apiInvalidResponse' | 'apiHttpError'

export class LockerApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status?: number,
  ) {
    super(code)
  }
}

/** Validate the complete snapshot before replacing the last known device state. */
export function parseStates(value: unknown): HardwareState[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new LockerApiError('apiInvalidResponse')
  const seen = new Set<number>()
  const states: HardwareState[] = value.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null)
      throw new LockerApiError('apiInvalidResponse')
    const item = entry as Record<string, unknown>
    if (
      typeof item.address !== 'number' ||
      !Number.isSafeInteger(item.address) ||
      item.address < 1 ||
      seen.has(item.address) ||
      typeof item.active !== 'boolean' ||
      (typeof item.locked !== 'boolean' &&
        !(item.active === false && item.locked === null)) ||
      (typeof item.opened !== 'boolean' &&
        !(item.active === false && item.opened === null))
    ) {
      throw new LockerApiError('apiInvalidResponse')
    }
    seen.add(item.address)
    return item.active
      ? {
          address: item.address,
          active: true,
          locked: item.locked as boolean,
          opened: item.opened as boolean,
        }
      : {
          address: item.address,
          active: false,
          locked: item.locked as boolean | null,
          opened: item.opened as boolean | null,
        }
  })
  return states.sort((a, b) => a.address - b.address)
}

export function createLockerApi(baseUrl: string) {
  const base = new URL(baseUrl)
  if (!['http:', 'https:'].includes(base.protocol))
    throw new Error('API requires HTTP or HTTPS.')
  async function request(
    path: string,
    method: 'GET' | 'POST',
    signal?: AbortSignal,
  ): Promise<Response> {
    if (signal?.aborted)
      throw signal.reason ?? new DOMException('Aborted', 'AbortError')
    if (Capacitor.isNativePlatform()) {
      // Native HTTP reaches the local controller without WebView CORS restrictions.
      // Cancellation cannot recall a command already delivered to the hardware.
      const result = await CapacitorHttp.request({
        url: new URL(path, base).href,
        method,
        connectTimeout: 8000,
        readTimeout: 8000,
        responseType: 'text',
        disableRedirects: true,
      })
      if (signal?.aborted)
        throw signal.reason ?? new DOMException('Aborted', 'AbortError')
      if (result.status < 200 || result.status >= 300)
        throw new LockerApiError('apiHttpError', result.status)
      const body =
        result.status === 204 || result.status === 205
          ? null
          : typeof result.data === 'string'
            ? result.data
            : JSON.stringify(result.data)
      return new Response(body, { status: result.status })
    }
    // Captive Portal WebViews may lack AbortSignal.any/timeout. Keep the
    // timeout active until the response body has also finished downloading.
    const controller = new AbortController()
    const cancel = () => controller.abort()
    signal?.addEventListener('abort', cancel, { once: true })
    const timer = setTimeout(cancel, 8000)
    try {
      const response = await fetch(new URL(path, base), {
        method,
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok)
        throw new LockerApiError('apiHttpError', response.status)
      const body =
        response.status === 204 || response.status === 205
          ? null
          : await response.text()
      return new Response(body, {
        status: response.status,
        headers: response.headers,
      })
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
    }
  }
  return {
    getStates: async (signal?: AbortSignal) => {
      const response = await request('/api/internal/states', 'GET', signal)
      let value: unknown
      try {
        value = await response.json()
      } catch {
        throw new LockerApiError('apiInvalidResponse')
      }
      return parseStates(value)
    },
    // Only /states can confirm the outcome of a successful open request.
    openSlot: (slot: number, signal?: AbortSignal) => {
      if (!Number.isSafeInteger(slot) || slot < 1)
        throw new Error('Invalid slot address.')
      return request(`/api/internal/${slot}/open`, 'POST', signal)
    },
  }
}

export function lockerApiBaseUrl() {
  if (Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_LOCKER_API_URL || 'http://10.42.0.1:5000'
  }
  // The Pi serves the interface and API from one local HTTP origin.
  // Follow the address used to open the portal; never bake in a LAN/cloud URL.
  return window.location.origin
}

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

/** Android Back dismisses the current sheet before leaving the application. */
export function useNativeBackButton() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return
    const listener = App.addListener('backButton', () => {
      const dialog = document.querySelector<HTMLDialogElement>('dialog[open]')
      if (dialog)
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      else void App.exitApp()
    })
    return () => {
      void listener.then((handle) => handle.remove())
    }
  }, [])
}

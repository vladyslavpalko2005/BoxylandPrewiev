import { useLayoutEffect, useRef } from 'react'
import { LayoutGrid, Lock, LockOpen, Unplug } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export type Filter = 'all' | 'locked' | 'unlocked' | 'offline'
export const filters = [
  { id: 'all', label: 'all', icon: LayoutGrid },
  { id: 'locked', label: 'lockedPlural', icon: Lock },
  { id: 'unlocked', label: 'unlockedPlural', icon: LockOpen },
  { id: 'offline', label: 'offlinePlural', icon: Unplug },
] as const

export function FilterSwitch({
  value,
  counts,
  onChange,
}: {
  value: Filter
  counts: Record<Filter, number>
  onChange: (value: Filter) => void
}) {
  const { t } = useI18n()
  const rowRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const row = rowRef.current!
    const selection = selectionRef.current!
    const updateSelection = () => {
      const active = row.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]',
      )
      if (!active) return
      const parent = row.getBoundingClientRect()
      const target = active.getBoundingClientRect()
      selection.style.transform = `translate3d(${target.left - parent.left}px, ${target.top - parent.top}px, 0)`
      selection.style.width = `${target.width}px`
      selection.style.height = `${target.height}px`
      if (!row.hasAttribute('data-indicator-ready')) {
        // Place the initial selection without an entrance animation.
        selection.getBoundingClientRect()
        row.setAttribute('data-indicator-ready', '')
      }
    }
    updateSelection()
    // Keep the shared pill aligned while labels expand, counts update, fonts
    // load, or the dock becomes a desktop sidebar. No animation dependency.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateSelection)
    observer?.observe(row)
    row
      .querySelectorAll('button')
      .forEach((button) => observer?.observe(button))
    window.addEventListener('resize', updateSelection)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateSelection)
    }
  }, [value, counts.all, counts.locked, counts.unlocked, counts.offline])

  return (
    <div
      ref={rowRef}
      className="filter-row"
      role="group"
      aria-label={t('filterLocks')}
    >
      <span
        ref={selectionRef}
        className="filter-selection"
        aria-hidden="true"
      />
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`filter ${id} ${value === id ? 'active' : ''}`}
          aria-pressed={value === id}
          aria-label={`${t(label)} ${counts[id]}`}
          onClick={() => onChange(id)}
        >
          <Icon size={18} aria-hidden="true" />
          <span className="filter-count">{counts[id]}</span>
          <span className="filter-name">{t(label)}</span>
        </button>
      ))}
    </div>
  )
}

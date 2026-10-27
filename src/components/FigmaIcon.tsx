import type { CSSProperties, HTMLAttributes } from 'react'

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number
  strokeWidth?: number
}

// Original Figma SVGs are bundled locally. A mask lets shared icons inherit
// their state color without modifying the exported artwork.
export function FigmaIcon({
  asset,
  size = 20,
  strokeWidth: _strokeWidth,
  style,
  ...props
}: IconProps & { asset: string }) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={`brand-icon ${props.className ?? ''}`}
      style={
        {
          width: size,
          height: size,
          '--icon-url': `url("${new URL(`${import.meta.env.BASE_URL}brand/${asset}.svg`, document.baseURI).href}")`,
          ...style,
        } as CSSProperties
      }
    />
  )
}
export function Wifi(props: IconProps) {
  return <FigmaIcon asset="84c3a" {...props} />
}
export function LayoutGrid(props: IconProps) {
  return <FigmaIcon asset="9a931" {...props} />
}

export function WifiOff(props: IconProps) {
  return <FigmaIcon asset="edb80" {...props} />
}

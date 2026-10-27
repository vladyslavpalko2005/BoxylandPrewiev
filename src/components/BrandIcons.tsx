// Icon paths extracted from the supplied BoxyLock Figma foundations SVG.
import type { SVGProps } from 'react'
import { FigmaIcon } from './FigmaIcon'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const icons = {
  Lock: {
    x: 129,
    path: 'M138.333 3131.83V3127.17C138.333 3125.93 138.825 3124.74 139.7 3123.87C140.575 3122.99 141.762 3122.5 143 3122.5C144.238 3122.5 145.425 3122.99 146.3 3123.87C147.175 3124.74 147.667 3125.93 147.667 3127.17V3131.83M136 3131.83H150C151.289 3131.83 152.333 3132.88 152.333 3134.17V3141.17C152.333 3142.46 151.289 3143.5 150 3143.5H136C134.711 3143.5 133.667 3142.46 133.667 3141.17V3134.17C133.667 3132.88 134.711 3131.83 136 3131.83Z',
  },
  LockOpen: {
    x: 253,
    path: 'M262.333 3131.83V3127.17C262.317 3126.13 262.648 3125.11 263.276 3124.28C263.904 3123.45 264.791 3122.85 265.797 3122.58C266.803 3122.31 267.87 3122.39 268.828 3122.8C269.786 3123.21 270.58 3123.92 271.083 3124.83M260 3131.83H274C275.289 3131.83 276.333 3132.88 276.333 3134.17V3141.17C276.333 3142.46 275.289 3143.5 274 3143.5H260C258.711 3143.5 257.667 3142.46 257.667 3141.17V3134.17C257.667 3132.88 258.711 3131.83 260 3131.83Z',
  },
  LoaderCircle: {
    x: 377,
    path: 'M391 3122.5C388.923 3122.5 386.893 3123.12 385.167 3124.27C383.44 3125.42 382.094 3127.06 381.299 3128.98C380.505 3130.9 380.297 3133.01 380.702 3135.05C381.107 3137.09 382.107 3138.96 383.575 3140.42C385.044 3141.89 386.915 3142.89 388.952 3143.3C390.988 3143.7 393.1 3143.5 395.018 3142.7C396.937 3141.91 398.577 3140.56 399.73 3138.83C400.884 3137.11 401.5 3135.08 401.5 3133',
  },
  PlugOff: {
    x: 501,
    path: 'M511.5 3121.33V3126M518.5 3121.33V3128.33M522 3128.33V3133C522.006 3134.29 521.655 3135.56 520.986 3136.66C520.697 3137.14 520.354 3137.57 519.965 3137.97M519.965 3137.97C519.453 3138.48 518.861 3138.92 518.209 3139.25C517.215 3139.77 516.114 3140.03 515 3140.03M519.965 3137.97L504.5 3122.5M519.965 3137.97L525.5 3143.5M515 3140.03C514.829 3140.03 514.658 3140.02 514.487 3140.01C513.2 3139.92 511.965 3139.47 510.917 3138.72M515 3140.03V3140M515 3140.03V3144.67M508 3128.33V3133C508 3134.17 508.233 3135.22 508.7 3136.15',
  },
  Usb: {
    x: 625,
    path: 'M639 3121.33V3135.33M642.5 3124.83L639 3121.33L635.5 3124.83M639 3135.33V3136.5M639 3135.33L643.667 3131.83V3128.33M639 3136.5V3138.83M639 3136.5L634.333 3133V3129.5M641.917 3141.17C641.917 3142.78 640.611 3144.08 639 3144.08C637.389 3144.08 636.083 3142.78 636.083 3141.17C636.083 3139.56 637.389 3138.25 639 3138.25C640.611 3138.25 641.917 3139.56 641.917 3141.17Z',
  },
  Cpu: {
    x: 749,
    path: 'M759.5 3121.33V3126M766.5 3121.33V3126M759.5 3140V3144.67M766.5 3140V3144.67M751.333 3129.5H756M751.333 3136.5H756M770 3129.5H774.667M770 3136.5H774.667M758.333 3126H767.667C768.955 3126 770 3127.04 770 3128.33V3137.67C770 3138.96 768.955 3140 767.667 3140H758.333C757.045 3140 756 3138.96 756 3137.67V3128.33C756 3127.04 757.045 3126 758.333 3126Z',
  },
  RotateCw: {
    x: 873,
    path: 'M897.5 3133C897.502 3135.4 896.679 3137.74 895.168 3139.61C893.657 3141.48 891.55 3142.77 889.199 3143.28C886.847 3143.78 884.395 3143.46 882.25 3142.37C880.106 3141.29 878.399 3139.5 877.417 3137.3C876.434 3135.11 876.235 3132.64 876.851 3130.32C877.468 3127.99 878.864 3125.95 880.805 3124.53C882.747 3123.11 885.116 3122.4 887.518 3122.52C889.92 3122.64 892.208 3123.58 894 3125.18L897.5 3128.33M891.667 3128.33H897.5V3122.5',
  },
  Search: {
    x: 997,
    path: 'M1021.5 3143.5L1016.48 3138.48M1009.83 3141.17C1012.31 3141.17 1014.68 3140.18 1016.43 3138.43C1018.18 3136.68 1019.17 3134.31 1019.17 3131.83C1019.17 3129.36 1018.18 3126.98 1016.43 3125.23C1014.68 3123.48 1012.31 3122.5 1009.83 3122.5C1007.36 3122.5 1004.98 3123.48 1003.23 3125.23C1001.48 3126.98 1000.5 3129.36 1000.5 3131.83C1000.5 3134.31 1001.48 3136.68 1003.23 3138.43C1004.98 3140.18 1007.36 3141.17 1009.83 3141.17Z',
  },
  X: {
    x: 1121,
    path: 'M1142 3126L1135 3133M1135 3133L1128 3140M1135 3133L1128 3126M1135 3133L1142 3140',
  },
  CircleAlert: {
    x: 1245,
    path: 'M1259 3127.17V3134.17M1259 3138.25V3138.83M1269.5 3133C1269.5 3138.8 1264.8 3143.5 1259 3143.5C1253.2 3143.5 1248.5 3138.8 1248.5 3133C1248.5 3127.2 1253.2 3122.5 1259 3122.5C1264.8 3122.5 1269.5 3127.2 1269.5 3133Z',
  },
} as const

function BrandIcon({
  iconName,
  size = 24,
  strokeWidth = 1.5,
  ...props
}: IconProps & { iconName: keyof typeof icons }) {
  const icon = icons[iconName]
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${icon.x} 3119 28 28`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={icon.path} />
    </svg>
  )
}

export function Lock(props: IconProps) {
  return (
    <FigmaIcon
      asset="27cd2"
      size={props.size}
      className={props.className}
      style={props.style}
    />
  )
}

export function LockOpen(props: IconProps) {
  return (
    <FigmaIcon
      asset={props.size && props.size >= 38 ? 'ec8c0' : '1adde'}
      size={props.size}
      className={props.className}
      style={props.style}
    />
  )
}

export function LoaderCircle(props: IconProps) {
  return (
    <FigmaIcon
      asset="99f55"
      size={props.size}
      className={props.className}
      style={props.style}
    />
  )
}

export function PlugOff(props: IconProps) {
  return (
    <FigmaIcon
      asset="5d41b"
      size={props.size}
      className={props.className}
      style={props.style}
    />
  )
}

export function Usb(props: IconProps) {
  return <BrandIcon iconName="Usb" {...props} />
}

export function Cpu(props: IconProps) {
  return <BrandIcon iconName="Cpu" {...props} />
}

export function RotateCw(props: IconProps) {
  return <BrandIcon iconName="RotateCw" {...props} />
}

export function Search(props: IconProps) {
  return <BrandIcon iconName="Search" {...props} />
}

export function X(props: IconProps) {
  return <BrandIcon iconName="X" {...props} />
}

export function CircleAlert(props: IconProps) {
  return <BrandIcon iconName="CircleAlert" {...props} />
}

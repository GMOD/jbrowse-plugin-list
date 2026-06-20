import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon'
import React from 'react'

// Icons below come from https://material.io/resources/icons/
export function AlignHorizontalLeftIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4,22H2V2h2V22z M22,7H6v3h16V7z M16,14H6v3h10V14z" />
    </SvgIcon>
  )
}

export function MaleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9.5,11c1.93,0,3.5,1.57,3.5,3.5S11.43,18,9.5,18S6,16.43,6,14.5S7.57,11,9.5,11z M9.5,9C6.46,9,4,11.46,4,14.5 S6.46,20,9.5,20s5.5-2.46,5.5-5.5c0-1.16-0.36-2.23-0.97-3.12L18,7.42V10h2V4h-6v2h2.58l-3.97,3.97C11.73,9.36,10.66,9,9.5,9z" />
    </SvgIcon>
  )
}

export function HourglassIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z" />
    </SvgIcon>
  )
}

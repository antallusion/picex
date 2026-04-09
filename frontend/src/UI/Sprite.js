import React from 'react'

import icons from './icons.svg'


function Sprite({icon='', classIcon=null,width='',height=''}) {
  return (
    <svg className={classIcon && classIcon} width={width} height={height} >
        <use xlinkHref={`${icons}#${icon}`}></use>
    </svg>
  )
}

export default Sprite
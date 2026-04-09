import React from 'react'
import Sprite from '../../UI/Sprite'

function Item({icon='', width='', height='',name='',children=[]}) {
  return (
    <li className='about__item'>
        <div className='about__icon'>

        <Sprite  icon={icon} width={width} height={height} />
        </div>
        <div className='about__wrapper'>
            <h5 className='about__name'>{name}</h5>
            <p className='about__text'>{children}</p>
        </div>
    </li>
  )
}

export default Item
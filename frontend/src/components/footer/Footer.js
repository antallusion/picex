import React from 'react'
import Sprite from '../../UI/Sprite'

import './footer.css'

function Footer() {
  return (
    <footer className='footer'>
        <div className="container footer__inner">
            <Sprite icon='logo-white' width={120} height={24} />
            <p className='footer__text'>Сделано с любовью <a className='footer__link' href='https://deemkend.ru/'>deemkend</a></p>
        </div>
    </footer>
  )
}

export default Footer
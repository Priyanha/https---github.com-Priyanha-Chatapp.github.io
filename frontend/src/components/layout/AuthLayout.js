import React from 'react';
import logo from "../asset/logo.png";
import './AuthLayout.css';

const AuthLayouts = ({children}) => {
  return (
    <>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
            <img className='img-logo'
              src={logo}
              alt='logo'
              width={180}
              height={60}
            />
        </header>

        { children }
    </>
  )
}

export default AuthLayouts

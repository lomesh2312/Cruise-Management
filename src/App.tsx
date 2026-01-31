import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import cruise1 from './assets/cruise1.mp4'

function App() {
 

  return (
    <>
      <div id="hero">
        <h1>OUR CRUISE OUR PRIDE</h1>
        <a href=''>Manage Cruise</a>

      <div id="video">
        <video autoPlay muted loop playsInline style={{
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: -1,
  }} >
          <source src={cruise1} type="video/mp4" />
        </video>
        </div>
      </div>
    </>
  )
}

export default App

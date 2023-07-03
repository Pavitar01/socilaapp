import React from 'react'
import Login from './component/Login'
import LoginPage from './component/LoginPage'
import "../src/css/all.css"


const App = () => {
  return (
    <div style={{width:"100%",height:"100vh",justifyContent:"center",alignItems:"center",display:"flex"}}>
      <LoginPage/>
    </div>
  )
}

export default App

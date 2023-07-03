import React, { useState } from 'react'
import Nav from './Nav'
import Main from './Main'
import "../../css/FrontPage.css"
const FrontPage = () => {
    const [isChat,setIsChat]=useState(false);

  return (
    <div className='frontpage'>
      <Nav setIsChat={setIsChat} isChat={isChat}/>
      <Main isChat={isChat}/>
    </div>
  )
}

export default FrontPage

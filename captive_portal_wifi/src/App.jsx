import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)


  function updateit(){
    setCount(count+1)
  }

  return (
    <>
       <section id='center'>
        <div>The count amount is about: {count}</div>
        <button class='button' onClick={updateit}>Reset It</button>
       </section>
    </>
  )
}

export default App

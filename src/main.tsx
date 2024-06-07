import React from 'react'
import ReactDOM from 'react-dom/client'
import { Trellis } from '@syctech/react-trellis'
import { IFosNode, FosContext, defaultContext } from './fosforescent'


const App = () => {



  // const [state, setState] = React.useState(defaultContext)

  const [fosState, setFosState] = React.useState(defaultContext)

  const ctx = new FosContext(fosState)

  const rootNode: IFosNode = ctx.getRootNode()

  return (<div>
    <Trellis 
      rootNode={rootNode}
      />
    </div>
  )
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

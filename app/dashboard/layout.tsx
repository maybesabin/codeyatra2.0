
import React, { ReactNode } from 'react'

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>


    <div>{ children}</div>
    </div>
  )
}

export default layout
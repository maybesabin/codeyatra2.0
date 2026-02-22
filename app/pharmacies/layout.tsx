import React, { ReactNode } from 'react'

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="p-6 flex flex-col items-center justify-center gap-6">
            {children}
        </div>
    )
}

export default layout
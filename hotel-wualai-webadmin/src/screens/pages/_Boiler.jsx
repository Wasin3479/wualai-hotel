import React from 'react'
export default function Boiler({ title, children }) {
    return (
        <div className="container-fluid">
            <div className="row" style={{ marginBottom: 16 }}>
                <div className="col"><h2 style={{ margin: 0 }}>{title}</h2></div>
            </div>
            {children ? children : (
                <div className="card"><div className="card-body">(UI Only) เนื้อหาจำลอง</div></div>
            )}
        </div>
    )
}
import { Badge } from 'react-bootstrap'
import { Wifi, Tv, Coffee, Snowflake } from 'lucide-react'


const ICON = { wifi: Wifi, tv: Tv, breakfast: Coffee, ac: Snowflake }
export default function AmenityChips({ list = [], className = '' }) {
    return (
        <div className={`d-flex flex-wrap gap-1 ${className}`}>
            {list.map(a => {
                const key = a.toLowerCase().includes('wifi') ? 'wifi' : a.toLowerCase().includes('tv') ? 'tv' : a.toLowerCase().includes('break') ? 'breakfast' : a.toLowerCase().includes('air') || a.toLowerCase().includes('ac') ? 'ac' : null
                const Icon = key ? ICON[key] : null
                return <Badge key={a} bg="secondary" className="badge-ghost d-flex align-items-center gap-1">{Icon ? <Icon size={14} /> : null}{a}</Badge>
            })}
        </div>
    )
}
import { Star } from 'lucide-react'
export default function RatingStars({ value = 4.5, count = 0, className = '' }) {
    const full = Math.floor(value)
    const half = value - full >= 0.5
    const stars = Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half)
        return <Star key={i} size={16} className={filled ? 'text-warning me-1' : 'text-secondary me-1'} fill={filled ? 'currentColor' : 'none'} />
    })
    return <div className={`d-flex align-items-center ${className}`}>{stars}<small className="text-secondary ms-1">{value.toFixed(1)} ({count})</small></div>
}
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge, Button, Card } from 'react-bootstrap'
import * as api from '../services/api.js'
import RatingStars from '../components/RatingStars.jsx'
import AmenityChips from '../components/chips/AmenityChips.jsx'


export default function RoomDetail() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    useEffect(() => { api.getRoomType(id).then(setData) }, [id])
    if (!data) return null
    const hasDiscount = data.discountPercent && data.discountPercent > 0
    const discounted = hasDiscount ? Math.round(data.base_price * (100 - data.discountPercent)) / 100 : data.base_price
    return (
        <Card bg="dark" text="light">
            <Card.Img variant="top" src={data.images[0]} />
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <h3>{data.name}</h3>
                    <Badge bg="info">Max {data.capacity}</Badge>
                </div>
                <RatingStars value={data.rating} count={data.reviews} className="mb-2" />
                <p className="text-secondary">{data.description}</p>
                <AmenityChips list={data.amenities || []} className="mb-2" />
                {hasDiscount && <div className="text-decoration-line-through text-secondary small">฿{Number(data.base_price).toLocaleString()}</div>}
                <p className="h5">฿{Number(discounted).toLocaleString()} <small className="text-secondary">/night</small></p>
                <Button as={Link} to={`/booking/${data.id}`} variant="primary">Book now</Button>
            </Card.Body>
        </Card>
    )
}
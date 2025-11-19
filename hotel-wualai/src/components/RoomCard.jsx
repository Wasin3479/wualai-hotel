import { Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import RatingStars from './RatingStars.jsx'
import AmenityChips from './chips/AmenityChips.jsx'


export default function RoomCard({ roomType }) {
    const hasDiscount = roomType.discountPercent && roomType.discountPercent > 0
    const discounted = hasDiscount ? Math.round(roomType.base_price * (100 - roomType.discountPercent)) / 100 : roomType.base_price
    return (
        <Card bg="dark" text="light" className="h-100">
            <Card.Img variant="top" src={roomType.images[0]} alt={roomType.name} style={{ height: 200, objectFit: 'cover' }} />
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="mb-1">{roomType.name}</Card.Title>
                    <Badge bg="info">Max {roomType.capacity}</Badge>
                </div>
                <RatingStars value={roomType.rating} count={roomType.reviews} className="mb-2" />
                <Card.Text className="text-secondary">{roomType.description}</Card.Text>
                <AmenityChips list={roomType.amenities?.slice(0, 4) || []} className="mb-2" />
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        {hasDiscount && <div className="text-decoration-line-through text-secondary small">฿{Number(roomType.base_price).toLocaleString()}</div>}
                        <div className="h5 mb-0">฿{Number(discounted).toLocaleString()} <small className="text-secondary">/night</small></div>
                    </div>
                    {hasDiscount && <Badge bg="danger">Save {roomType.discountPercent}%</Badge>}
                    <Button as={Link} to={`/rooms/${roomType.id}`} variant="primary">View</Button>
                </div>
            </Card.Body>
        </Card>
    )
}
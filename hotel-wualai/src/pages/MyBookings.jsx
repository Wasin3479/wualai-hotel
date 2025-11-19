import { useEffect, useState } from 'react'
import { Card, Table, Badge, Button } from 'react-bootstrap'
import * as api from '../services/api.js'
import { Link } from 'react-router-dom'


export default function MyBookings() {
    const [items, setItems] = useState([])
    useEffect(() => { api.getMyBookings().then(setItems) }, [])
    return (
        <Card bg="dark" text="light">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                    <h3>My Bookings</h3>
                    <Button as={Link} to="/me/profile" size="sm" variant="outline-info">Edit Profile</Button>
                </div>
                <Table responsive variant="dark" className="mt-3 align-middle">
                    <thead>
                        <tr><th>#</th><th>Booking No</th><th>Room</th><th>Dates</th><th>Guests</th><th>Status</th><th>Payment</th><th>Total</th><th>Slip</th></tr>
                    </thead>
                    <tbody>
                        {items.map((b, idx) => (
                            <tr key={b.id}>
                                <td>{idx + 1}</td>
                                <td>{b.booking_no}</td>
                                <td>{b.room_type?.name}</td>
                                <td>{b.check_in_date} → {b.check_out_date}</td>
                                <td>{b.adults} + {b.children}</td>
                                <td><Badge bg={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'secondary'}>{b.status}</Badge></td>
                                <td><Badge bg={b.payment_status === 'verified' ? 'success' : b.payment_status === 'pending' ? 'warning' : 'secondary'}>{b.payment_status}</Badge></td>
                                <td>฿{Number(b.total_amount).toLocaleString()}</td>
                                <td>{b.slip_data_url ? <a href={b.slip_data_url} target="_blank">View</a> : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    )
}
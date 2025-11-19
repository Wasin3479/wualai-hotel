import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import RoomCard from '../components/RoomCard.jsx'
import * as api from '../services/api.js'
import { useSearchParams } from 'react-router-dom'


export default function Rooms() {
    const [list, setList] = useState([])
    const [params] = useSearchParams()
    const [q, setQ] = useState(params.get('q') || '')
    const [check_in, setCheckIn] = useState(params.get('check_in') || '')
    const [check_out, setCheckOut] = useState(params.get('check_out') || '')
    const [adults, setAdults] = useState(Number(params.get('guests') || 2))


    useEffect(() => { api.getRoomTypes().then(setList) }, [])


    const filtered = useMemo(() => {
        let rooms = list
        if (q) rooms = rooms.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || r.description.toLowerCase().includes(q.toLowerCase()))
        if (adults) rooms = rooms.filter(r => r.capacity >= Number(adults))
        return rooms
    }, [list, q, adults])


    return (
        <>
            <div className="d-flex flex-wrap gap-2 mb-3">
                <InputGroup style={{ maxWidth: 280 }}>
                    <Form.Control placeholder="Search room..." value={q} onChange={e => setQ(e.target.value)} />
                    <Button onClick={() => { /* noop, live filter */ }}>Search</Button>
                </InputGroup>
                <Form.Control style={{ maxWidth: 180 }} type="date" value={check_in} onChange={e => setCheckIn(e.target.value)} />
                <Form.Control style={{ maxWidth: 180 }} type="date" value={check_out} onChange={e => setCheckOut(e.target.value)} />
                <Form.Select style={{ maxWidth: 140 }} value={adults} onChange={e => setAdults(Number(e.target.value))}>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>)}
                </Form.Select>
            </div>
            <Row className="g-3">
                {filtered.map(rt => (
                    <Col md={4} key={rt.id}>
                        <RoomCard roomType={rt} />
                    </Col>
                ))}
            </Row>
        </>
    )
}
import { Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, Star, Wifi } from 'lucide-react'
import { useState } from 'react'
import dayjs from 'dayjs'


export default function Home() {
    const nav = useNavigate()
    const [form, setForm] = useState({ q: '', check_in: dayjs().add(1, 'day').format('YYYY-MM-DD'), check_out: dayjs().add(2, 'day').format('YYYY-MM-DD'), guests: 2 })
    function go() { nav(`/rooms?q=${encodeURIComponent(form.q)}&check_in=${form.check_in}&check_out=${form.check_out}&guests=${form.guests}`) }
    return (
        <>
            <div className="hero text-white py-5">
                <div className="container">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-6">
                            <h1 className="display-5 fw-bold">Welcome to Grand Hotel</h1>
                            <p className="lead text-light">Experience luxury and comfort in the heart of the city.</p>
                            <Button as={Link} to="/rooms" size="lg" variant="light">Browse Rooms</Button>
                        </div>
                        <div className="col-lg-6">
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop" alt="hotel" className="img-fluid" />
                        </div>
                    </div>
                </div>
            </div>


            <div className="container py-4">
                <Card bg="dark" text="light" className="p-3 mx-auto" style={{ maxWidth: 900, marginTop: -48 }}>
                    <div className="d-flex flex-wrap gap-2">
                        <InputGroup style={{ maxWidth: 260 }}>
                            <InputGroup.Text><Star size={16} /></InputGroup.Text>
                            <Form.Control placeholder="Search room..." value={form.q} onChange={e => setForm({ ...form, q: e.target.value })} />
                        </InputGroup>
                        <InputGroup style={{ maxWidth: 200 }}>
                            <InputGroup.Text><Calendar size={16} /></InputGroup.Text>
                            <Form.Control type="date" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} />
                        </InputGroup>
                        <InputGroup style={{ maxWidth: 200 }}>
                            <InputGroup.Text><Calendar size={16} /></InputGroup.Text>
                            <Form.Control type="date" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} />
                        </InputGroup>
                        <InputGroup style={{ maxWidth: 160 }}>
                            <InputGroup.Text><Users size={16} /></InputGroup.Text>
                            <Form.Select value={form.guests} onChange={e => setForm({ ...form, guests: Number(e.target.value) })}>
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
                            </Form.Select>
                        </InputGroup>
                        <Button onClick={go}>Search</Button>
                    </div>
                </Card>
            </div>


            <div className="container py-4">
                <Row className="g-3 align-items-stretch">
                    <Col md={4}>
                        <Card bg="dark" text="light" className="h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="mb-3"><Wifi className="text-info" /></div>
                                <h5>Modern Amenities</h5>
                                <p className="text-secondary">Free Wi‑Fi, breakfast options, and premium facilities.</p>
                                <Button as={Link} to="/rooms" variant="outline-info" className="mt-auto">See rooms</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card bg="dark" text="light" className="h-100">
                            <Card.Body>
                                <h5>Best Rate Guarantee</h5>
                                <p className="text-secondary">Book direct with exclusive discounts and perks.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card bg="dark" text="light" className="h-100">
                            <Card.Body>
                                <h5>Prime Location</h5>
                                <p className="text-secondary">Located in the city center with easy access to attractions.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}
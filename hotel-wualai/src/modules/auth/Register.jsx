import { useState } from 'react'
import { Button, Card, Form, Alert, InputGroup } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { Eye, EyeOff } from 'lucide-react'


export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
    const [show, setShow] = useState(false)
    const [error, setError] = useState('')


    function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }


    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        try { await register(form); navigate('/') } catch (err) { setError(err.message || 'Register failed') }
    }


    return (
        <Card bg="dark" text="light" className="mx-auto" style={{ maxWidth: 540 }}>
            <Card.Body>
                <h3 className="mb-3">Create account</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Full name</Form.Label>
                        <Form.Control name="full_name" value={form.full_name} onChange={onChange} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control name="email" value={form.email} onChange={onChange} type="email" required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control name="phone" value={form.phone} onChange={onChange} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                            <Form.Control name="password" value={form.password} onChange={onChange} type={show ? 'text' : 'password'} required />
                            <Button variant="outline-secondary" onClick={() => setShow(s => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                        </InputGroup>
                    </Form.Group>
                    <Button type="submit" className="mt-3" variant="primary">Register</Button>
                    <div className="mt-3 text-secondary">Already have an account? <Link to="/login">Login</Link></div>
                </Form>
            </Card.Body>
        </Card>
    )
}
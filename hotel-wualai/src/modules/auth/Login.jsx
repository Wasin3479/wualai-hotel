import { useState } from 'react'
import { Button, Card, Form, Alert, InputGroup } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { Eye, EyeOff } from 'lucide-react'


export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [error, setError] = useState('')


    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        try { await login({ email, password }); navigate('/') } catch (err) { setError(err.message || 'Login failed') }
    }


    return (
        <Card bg="dark" text="light" className="mx-auto" style={{ maxWidth: 480 }}>
            <Card.Body>
                <h3 className="mb-3">Login</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                            <Form.Control value={password} onChange={e => setPassword(e.target.value)} type={show ? 'text' : 'password'} required />
                            <Button variant="outline-secondary" onClick={() => setShow(s => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                        </InputGroup>
                    </Form.Group>
                    <Button type="submit" className="mt-3" variant="primary">Login</Button>
                    <div className="mt-3 text-secondary">No account? <Link to="/register">Register</Link></div>
                </Form>
            </Card.Body>
        </Card>
    )
}
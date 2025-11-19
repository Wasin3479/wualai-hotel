import { useState } from 'react'
export default function Profile() {
    const { user, updateProfile } = useAuth()
    const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', password: '' })
    const [show, setShow] = useState(false)
    const [ok, setOk] = useState('')


    function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
    function save() { updateProfile(form); setOk('Saved') }


    return (
        <Card bg="dark" text="light" className="mx-auto" style={{ maxWidth: 560 }}>
            <Card.Body>
                <h3 className="mb-3">Profile</h3>
                {ok && <Alert variant="success">{ok}</Alert>}
                <Form>
                    <Form.Group>
                        <Form.Label>Full name</Form.Label>
                        <Form.Control name="full_name" value={form.full_name} onChange={onChange} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control name="phone" value={form.phone} onChange={onChange} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Change password</Form.Label>
                        <InputGroup>
                            <Form.Control name="password" value={form.password} onChange={onChange} type={show ? 'text' : 'password'} placeholder="Leave blank to keep" />
                            <Button variant="outline-secondary" onClick={() => setShow(s => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                        </InputGroup>
                    </Form.Group>
                    <Button className="mt-3" onClick={save}>Save</Button>
                </Form>
            </Card.Body>
        </Card>
    )
}
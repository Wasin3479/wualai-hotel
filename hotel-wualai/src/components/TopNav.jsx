import { Container, Nav, Navbar, Button, NavDropdown } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'


export default function TopNav() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    return (
        <Navbar expand="md" bg="dark" data-bs-theme="dark" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">🏨 Grand Hotel</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/rooms">Rooms</Nav.Link>
                        {user && <Nav.Link as={NavLink} to="/me/bookings">My Bookings</Nav.Link>}
                    </Nav>
                    <Nav>
                        {!user && (
                            <>
                                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                                <Button as={Link} to="/register" variant="primary" className="ms-2">Register</Button>
                            </>
                        )}
                        {user && (
                            <NavDropdown title={<span className="text-secondary">Hello, {user.full_name}</span>} align="end">
                                <NavDropdown.Item as={Link} to="/me/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => { logout(); navigate('/') }}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
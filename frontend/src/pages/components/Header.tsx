import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Cookies from "js-cookie";
import { useLocation } from "react-router";
import { useContext } from "react";
import AuthCon from "@/context/AuthContext";

function Header() {
  const location = useLocation();
  const { user, setShowInvi } = useContext(AuthCon);

  function logout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    Cookies.set("EventEmpireAuth", "");
    window.location.pathname = "/";
  }

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Link className="navbar-brand" to="/">
            EventEmpire
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            >
              {user?.type && user.type == "EventUser" && (
                <>
                  <Link className="nav-link" to={"/events"}>
                    Events
                  </Link>
                  <Link className="nav-link" to={"/eventPayemntHistory"}>
                    Payment History
                  </Link>
                </>
              )}

              {user?.type && user.type == "Vendor" && (
                <>
                  <Link className="nav-link" to={"/myService"}>
                    My Service
                  </Link>
                  <Link className="nav-link" to={"/vendorChat"}>
                    Chat
                  </Link>
                </>
              )}

              {user?.type && user.type == "Guest" && (
                <Link className="nav-link" to={"/notify"}>
                  Notifications
                </Link>
              )}
            </Nav>
            {location.pathname.startsWith("/event/") && (
              <Button
                onClick={() => setShowInvi(true)}
                className="me-3"
                variant="primary"
              >
                Invitation
              </Button>
            )}
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;

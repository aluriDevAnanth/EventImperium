import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Container,
  Table,
  Badge,
  Toast,
  ToastContainer,
  Button,
  Nav,
  Card,
  Modal,
} from "react-bootstrap";
import { BellFill, ClockHistory, GeoAltFill } from "react-bootstrap-icons";
import AuthCon from "../../context/AuthContext";
import type { Eventt } from "@/types";
import ReactMarkdown from "react-markdown";

const GuestInvitations = () => {
  const { user, auth } = useContext(AuthCon);
  const [events, setEvents] = useState<Eventt[]>([]);
  const [activeTab, setActiveTab] = useState("notifications");
  const [showToast, setShowToast] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Eventt | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchMyInvitations();
    }
  }, [user]);

  const fetchMyInvitations = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/event/my_invitations/${user?.email}`,
        { headers: { Authorization: `Bearer ${auth}` } }
      );
      const data = Array.isArray(res.data) ? res.data : res.data.events || [];
      setEvents(data);
    } catch (err) {
      console.error("Error fetching invites", err);
      setEvents([]);
    }
  };

  const handleResponse = async (event: any, newStatus: string) => {
    try {
      const updatedGuests = event.guests.map((g: any) =>
        g.email === user?.email ? { ...g, status: newStatus } : g
      );

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/event`,
        { ...event, guests: updatedGuests },
        { headers: { Authorization: `Bearer ${auth}` } }
      );

      setShowToast(true);
      setShowModal(false); // Close modal if open
      fetchMyInvitations();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const openInvitation = (event: any) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const safeEvents = Array.isArray(events) ? events : [];
  const notifications = safeEvents.filter((e) =>
    e.guests?.some(
      (g: any) => g.email === user?.email && g.status === "Pending"
    )
  );
  const history = safeEvents.filter((e) =>
    e.guests?.some(
      (g: any) => g.email === user?.email && g.status !== "Pending"
    )
  );
  const currentList = activeTab === "notifications" ? notifications : history;

  const renderTemplate = (text: string, guestVars: any) => {
    let rendered = text;

    Object.entries(guestVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\[\\[\\s*${key}\\s*\\]\\]`, "g");
      rendered = rendered.replace(regex, value ?? "");
    });

    return rendered;
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0">
        <Card.Header className="border-bottom-0 pt-4">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="fw-bold m-0">
              <BellFill className="text-primary me-2" /> My Invitations
            </h3>
          </div>
          <Nav
            variant="tabs"
            className="mt-4"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "notifications")}
          >
            <Nav.Item>
              <Nav.Link eventKey="notifications">
                New{" "}
                <Badge bg="danger" className="ms-1">
                  {notifications.length}
                </Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="history">
                <ClockHistory className="me-1" /> History
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th className="ps-4">Event</th>
                <th>Location</th>
                <th>Date</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((event) => {
                const myStatus = event.guests?.find(
                  (g: any) => g.email === user?.email
                )?.status;
                return (
                  <tr
                    key={event._id}
                    className="align-middle"
                    style={{ cursor: "pointer" }}
                    onClick={() => openInvitation(event)} // Row Click
                  >
                    <td className="ps-4 py-3 font-weight-bold">{event.name}</td>
                    <td>
                      <GeoAltFill size={14} /> {event.location}
                    </td>
                    <td>{new Date(event.datetime).toLocaleDateString()}</td>
                    <td
                      className="pe-4 text-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {" "}
                      {/* Stop bubbling on buttons */}
                      {activeTab === "notifications" ? (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleResponse(event, "Appected")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleResponse(event, "Rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          bg={myStatus === "Appected" ? "success" : "secondary"}
                        >
                          {myStatus}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Invitation for {selectedEvent?.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-start p-4">
          {selectedEvent?.invitation ? (
            <ReactMarkdown>
              {renderTemplate(selectedEvent.invitation, {
                guest_name: user?.username,
                guest_email: user?.email,
              })}
            </ReactMarkdown>
          ) : (
            <p className="text-muted">No invitation content available.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          {activeTab === "notifications" && (
            <div className="d-flex gap-2 w-100 justify-content-center mb-2">
              <Button
                variant="success"
                className="px-5"
                onClick={() => handleResponse(selectedEvent, "Appected")}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                className="px-5"
                onClick={() => handleResponse(selectedEvent, "Rejected")}
              >
                Reject
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="dark"
          className="text-white"
        >
          <Toast.Body>Status updated successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default GuestInvitations;

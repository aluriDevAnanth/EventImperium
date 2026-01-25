import type { Eventt, IGuest } from "@/types";
import axios from "axios";
import { useState } from "react";
import { Badge, Button, Form, Modal, Table } from "react-bootstrap";
import { PencilSquare, PlusLg, Trash } from "react-bootstrap-icons";

interface GuestCRUDProps {
  event: Eventt;
  auth: string;
  setEvent: (event: Eventt) => void;
}

export default function GuestTab({ event, auth, setEvent }: GuestCRUDProps) {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<IGuest>({
    email: "",
    status: "Pending",
  });

  const handleShowAdd = () => {
    setEditIndex(null);
    setFormData({ email: "", status: "Pending" });
    setShowModal(true);
  };

  const handleShowEdit = (guest: IGuest, index: number) => {
    setEditIndex(index);
    setFormData({ ...guest });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedGuests = [...event.guests];

    if (editIndex !== null) {
      updatedGuests[editIndex] = formData;
    } else {
      updatedGuests.push(formData);
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/event`,
        { ...event, guests: updatedGuests },
        { headers: { Authorization: `Bearer ${auth}` } }
      );

      setEvent({ ...event, guests: updatedGuests });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save guest", err);
      alert("Error saving guest. Please try again.");
    }
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm("Remove this guest?")) return;

    const updatedGuests = event.guests.filter((_, i) => i !== index);

    console.log(updatedGuests);

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/event`,
        { ...event, guests: updatedGuests },
        { headers: { Authorization: `Bearer ${auth}` } }
      );
      setEvent({ ...event, guests: updatedGuests });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="px-1">
      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th>
              <Button variant="success" size="sm" onClick={handleShowAdd}>
                <PlusLg className="me-1" /> Add Guest
              </Button>
              Email
            </th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {event.guests.length > 0 ? (
            event.guests.map((g, i) => (
              <tr key={i}>
                <td>{g.email}</td>
                <td>
                  <Badge
                    bg={
                      g.status === "Appected"
                        ? "success"
                        : g.status === "Pending"
                        ? "secondary"
                        : "danger"
                    }
                  >
                    {g.status}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button
                    variant="link"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(g, i)}
                  >
                    <PencilSquare size={16} />
                  </Button>
                  <Button
                    variant="link"
                    className="text-danger"
                    size="sm"
                    onClick={() => handleDelete(i)}
                  >
                    <Trash size={16} />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-muted py-4">
                No guests found. Click "Add Guest" to start.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editIndex !== null ? "Edit Guest" : "Add New Guest"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editIndex !== null ? "Update Guest" : "Add Guest"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

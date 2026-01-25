import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AuthCon from "@/context/AuthContext";
import type { Eventt } from "@/types";
import { Button, Modal, Form, Row, Col, Card } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

interface EventCardProps {
  eventt: Eventt;
  refreshEvents: () => void;
}

function EventCard({ eventt, refreshEvents }: EventCardProps) {
  const [show, setShow] = useState(false);
  const { user, auth } = useContext(AuthCon);
  const navi = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Eventt & { file: File }>({
    defaultValues: {
      ...eventt,
      datetime: eventt.datetime
        ? dayjs(eventt.datetime).format("YYYY-MM-DDTHH:mm")
        : "",
    },
  });

  const onEditSubmit = async (data: Eventt) => {
    try {
      const payload = {
        ...data,
        datetime: dayjs(data.datetime).toISOString(),
        userID: user?._id,
      };
      await axios.put(`${import.meta.env.VITE_BASE_URL}/event`, payload, {
        headers: { Authorization: `Bearer ${auth}` },
      });
      refreshEvents();
      handleClose();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/event`, {
          data: { _id: eventt._id },
          headers: { Authorization: `Bearer ${auth}` },
        });
        refreshEvents();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <>
      <Card
        onClick={() => navi(`/event/${eventt._id}`)}
        className="shadow-sm m-2 overflow-hidden"
        style={{ width: "18rem", cursor: "pointer" }}
      >
        <Card.Img variant="top" src={`https://picsum.photos/id/237/200/150`} />
        <Card.Body>
          <Card.Title className="text-truncate">{eventt.name}</Card.Title>

          <div className="text-primary small fw-bold mb-2">
            <i className="bi bi-calendar3 me-1"></i>
            {dayjs(eventt.datetime).format("MMM D, YYYY • h:mm A")}
          </div>

          <Card.Text
            className="text-muted small"
            style={{ height: "3rem", overflow: "hidden" }}
          >
            {eventt.des}
          </Card.Text>

          <div className="d-flex justify-content-between mt-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShow();
              }}
              variant="outline-primary"
              size="sm"
            >
              <i className="bi bi-pencil-square"></i> Edit
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              variant="outline-danger"
              size="sm"
            >
              <i className="bi bi-trash"></i> Delete
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal size="lg" show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onEditSubmit)}>
            <EventFormFields register={register} errors={errors} />
            <div className="d-flex gap-2 mt-3">
              <Button variant="primary" type="submit" className="flex-grow-1">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

function EventFormFields({ register, errors }: any) {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Event Name</Form.Label>
        <Form.Control
          isInvalid={!!errors.name}
          {...register("name", { required: "Required" })}
        />
      </Form.Group>
      <Row className="mb-3">
        <Col md={7}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              isInvalid={!!errors.des}
              {...register("des", { required: "Required" })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.des?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={5} className="d-flex flex-column justify-content-start">
          <Form.Group>
            <Form.Label>Upload File</Form.Label>
            <Form.Control
              type="file"
              isInvalid={!!errors.file}
              {...register("file", { required: "File is required" })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.file?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date & Time</Form.Label>
            <Form.Control
              type="datetime-local"
              isInvalid={!!errors.datetime}
              {...register("datetime", { required: "Required" })}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Budget ($)</Form.Label>
            <Form.Control
              type="number"
              {...register("budget", { required: "Required" })}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control {...register("location", { required: "Required" })} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control {...register("typee", { required: "Required" })} />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}

export default function Events() {
  const [events, setEvents] = useState<Eventt[]>([]);
  const [showPost, setShowPost] = useState(false);
  const { auth, user } = useContext(AuthCon);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Eventt & { file: File }>();

  const getEvents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/events/${user?._id}`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        },
      );
      setEvents(Array.isArray(res.data.events) ? res.data.events : []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const onPostSubmit = async (data: Eventt) => {
    try {
      const payload = {
        ...data,
        datetime: dayjs(data.datetime).toISOString(),
        userID: user?._id,
      };
      console.log(payload);

      await axios.post(`${import.meta.env.VITE_BASE_URL}/event`, payload, {
        headers: { Authorization: `Bearer ${auth}` },
      });
      reset();
      setShowPost(false);
      getEvents();
    } catch (err) {
      console.error("Post failed", err);
    }
  };

  useEffect(() => {
    if (auth && user?._id) getEvents();
  }, [auth, user?._id]);

  return (
    <div className="py-4 mx-3" style={{ minHeight: "100vh" }}>
      <h2 className="text-center mb-4">Upcoming Events</h2>

      {auth && (
        <Button
          onClick={() => setShowPost(true)}
          variant="success"
          className="rounded-circle shadow-lg p-0 d-flex align-items-center justify-content-center"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            fontSize: "24px",
            zIndex: 1050,
          }}
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      )}

      <Modal
        size="lg"
        show={showPost}
        onHide={() => setShowPost(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Post New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onPostSubmit)}>
            <EventFormFields register={register} errors={errors} />
            <Button variant="success" type="submit" className="w-100 mt-3">
              Create Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {events.length > 0 ? (
          events.map((item) => (
            <EventCard key={item._id} eventt={item} refreshEvents={getEvents} />
          ))
        ) : (
          <div className="text-center mt-5">
            <p className="text-muted">
              No events found. Click the + button to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

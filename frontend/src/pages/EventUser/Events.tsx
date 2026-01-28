import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AuthCon from "@/context/AuthContext";
import type { Eventt } from "@/types";
import { Button, Modal, Form, Row, Col, Card } from "react-bootstrap";
import {
  useForm,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import AuthenticatedImage from "@/pages/components/AuthenticatedImage";

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
    setValue,
    formState: { errors },
  } = useForm<Eventt & { file: FileList }>({
    defaultValues: {
      ...eventt,
      datetime: eventt.datetime
        ? dayjs(eventt.datetime).format("YYYY-MM-DDTHH:mm")
        : "",
    },
  });

  const onEditSubmit = async (data: Eventt & { file: FileList }) => {
    try {
      const payload = {
        ...data,
        datetime: dayjs(data.datetime).toISOString(),
        userID: user?._id,
        file: null,
      };
      console.log("onEditSubmit", payload);
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
        <AuthenticatedImage
          width={200}
          height={150}
          variant="top"
          path={eventt.thumbnail}
        />

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
            <EventFormFields
              setValue={setValue}
              handleSubmit={handleSubmit}
              register={register}
              errors={errors}
            />
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

function EventFormFields({
  handleSubmit,
  register,
  errors,
  setValue,
}: {
  register: UseFormRegister<
    Eventt & {
      file: FileList;
    }
  >;
  handleSubmit: UseFormHandleSubmit<
    Eventt & {
      file: FileList;
    },
    Eventt & {
      file: FileList;
    }
  >;
  errors: FieldErrors<
    Eventt & {
      file: FileList;
    }
  >;
  setValue: UseFormSetValue<
    Eventt & {
      file: FileList;
    }
  >;
}) {
  const { auth } = useContext(AuthCon);

  const onFileUpload = async (data: Eventt & { file: FileList }) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);

    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/uploadFile`,
      formData,
      {
        headers: { Authorization: `Bearer ${auth}` },
      },
    );

    console.log(res.data.thumbnail);

    setValue("thumbnail", res.data.thumbnail || "");
  };

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
          <Form.Group controlId="formFile" className="d-flex flex-column gap-3">
            <div className="d-flex gap-3">
              <Form.Label className="m-0">Upload File</Form.Label>
              <Button size="sm" onClick={handleSubmit(onFileUpload)}>
                Upload File
              </Button>
            </div>
            <Form.Control
              type="file"
              isInvalid={!!errors.file}
              {...register("file", {
                required: "File is required",
                validate: (files: FileList) => {
                  if (!files || files.length === 0)
                    return "At least one file is required";
                  return true;
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.file?.message as string}
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
    setValue,
    reset,
    formState: { errors },
  } = useForm<Eventt & { file: FileList }>();

  const getEvents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/events/${user?._id}`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        },
      );
      setEvents(res.data.events || []);
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
    <div className="py-3 mx-3" style={{ minHeight: "100vh" }}>
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
            <EventFormFields
              setValue={setValue}
              handleSubmit={handleSubmit}
              register={register}
              errors={errors}
            />
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

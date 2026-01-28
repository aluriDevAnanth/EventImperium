import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useParams } from "react-router";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Tabs,
  Tab,
  Button,
  Toast,
  ToastContainer,
  Modal,
  Form,
} from "react-bootstrap";
import {
  Calendar3,
  GeoAlt,
  CurrencyDollar,
  CashStack,
  Shop,
  Clock,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import AuthCon from "../../context/AuthContext";
import type { Eventt, Vendor } from "@/types";
import ExpenseList from "@/pages/EventUser/components/ExpenseList";
import ExpenseForm from "@/pages/EventUser/components/ExpenseForm";
import GuestTab from "./components/GuestTab";
import VendorList from "./components/VendorTab";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { auth, showInvi } = useContext(AuthCon);
  const [event, setEvent] = useState<Eventt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExModal, setShowExModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);

  const [vendors, setVendors] = useState<any>([]);

  const [showBudgetToast, setShowBudgetToast] = useState(false);

  const totalExpenses =
    event?.expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const isOverBudget = event ? totalExpenses > event.budget : false;

  const fetchEvent = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/event/${id}`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        },
      );
      setEvent(res.data.event);
      const total =
        res.data.event.expenses?.reduce(
          (acc: number, curr: any) => acc + Number(curr.amount),
          0,
        ) || 0;
      if (total > res.data.event.budget) {
        setShowBudgetToast(true);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [id, auth]);

  const fetchVendors = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/vendors/search`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        },
      );

      setVendors(data.vendors);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth && id) {
      fetchEvent();
      fetchVendors();
    }
  }, []);

  const updateExpenses = async (updatedExpenses: any[]) => {
    await axios.put(
      `${import.meta.env.VITE_BASE_URL}/event`,
      { _id: event?._id, expenses: updatedExpenses },
      { headers: { Authorization: `Bearer ${auth}` } },
    );
    fetchEvent();
  };

  const onExpenseSubmit = (data: any) => {
    const processed = { ...data, amount: Number(data.amount) };
    const list = [...(event?.expenses || [])];
    const idx = list.findIndex((ex) => ex._id === data._id);
    idx > -1 ? (list[idx] = processed) : list.push(processed);
    updateExpenses(list).then(() => setShowExModal(false));
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm("Delete?"))
      updateExpenses(event!.expenses.filter((ex) => ex._id !== expenseId));
  };

  if (loading)
    return <Container className="text-center mt-5">Loading...</Container>;
  if (!event)
    return <Container className="text-center mt-5">Event not found.</Container>;

  async function addVendor(e: React.MouseEvent, v: Vendor) {
    e.preventDefault();

    const newExpense = {
      name: v.name,
      amount: v.pricing || 0,
      typee: "Vendor",
      vendorID: v._id,
    };

    const updatedVendors = [...(event?.vendors || []), v._id];

    const updatedEvent = {
      ...event,
      vendors: updatedVendors,
      expenses: [...(event?.expenses || []), newExpense],
    };

    try {
      console.log("Updating event with:", updatedEvent);

      await axios.put(`${import.meta.env.VITE_BASE_URL}/event`, updatedEvent, {
        headers: { Authorization: `Bearer ${auth}` },
      });

      fetchEvent();
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Error adding vendor to event.");
    }
  }

  return (
    <div className="py-2 px-4 position-relative">
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="danger"
          onClose={() => setShowBudgetToast(false)}
          show={showBudgetToast}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto text-danger">Budget Alert</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Warning: Total expenses (${totalExpenses}) have exceeded your budget
            (${event.budget})!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Row>
        <Col lg={2}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Img
              variant="top"
              src={
                /* event.images?.[0] || */ `https://picsum.photos/id/237/200/150`
              }
            />
            <Card.Body>
              <Badge bg="info" className="mb-2">
                {event.typee}
              </Badge>
              <Card.Title className="fw-bold">{event.name}</Card.Title>
              <p className="text-muted small">{event.des}</p>
              <hr />
              <Row className="small g-2">
                <Col xs={12}>
                  <Calendar3 className="me-1 text-primary" />
                  {new Date(event.datetime).toDateString()}
                </Col>
                <Col xs={12}>
                  <Clock className="me-1 text-primary" />
                  {new Date(event.datetime).toTimeString().split(" ")[0]}
                </Col>
                <Col xs={12}>
                  <GeoAlt className="me-1 text-danger" />
                  {event.location}
                </Col>
                <Col xs={12}>
                  <CurrencyDollar className="me-1 text-success" />$
                  {event.budget.toLocaleString()}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={10}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="guests" className="mb-3 nav-fill">
                <Tab
                  eventKey="guests"
                  title={
                    <span>
                      <CashStack /> Guests
                    </span>
                  }
                >
                  <GuestTab
                    event={event}
                    auth={auth || ""}
                    setEvent={setEvent}
                  />
                </Tab>

                <Tab
                  eventKey="expenses"
                  title={
                    <span>
                      <CashStack /> Expenses
                    </span>
                  }
                >
                  <div className="mb-4 p-3 rounded-3 border shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <h6 className="text-uppercase text-muted small fw-bold mb-1">
                          Budget Overview
                        </h6>
                        <h4
                          className={`mb-0 d-flex align-items-center ${
                            isOverBudget
                              ? "text-danger fw-bold animate-pulse"
                              : "text-dark"
                          }`}
                        >
                          <CurrencyDollar
                            className={
                              isOverBudget ? "text-danger" : "text-success"
                            }
                          />
                          <span className="text-light fs-6 fw-normal">
                            ${totalExpenses.toLocaleString()}
                          </span>
                          <span className="text-light fs-6 fw-normal mx-2">
                            / ${event.budget.toLocaleString()}
                          </span>

                          {isOverBudget && (
                            <Badge
                              bg="danger"
                              className="ms-2 d-flex align-items-center gap-1 shadow-sm "
                            >
                              <ExclamationTriangleFill size={12} /> Over Budget
                            </Badge>
                          )}
                        </h4>
                      </div>
                      <Button
                        variant="success"
                        className="rounded-pill px-4 shadow-sm"
                        onClick={() => {
                          setCurrentExpense(null);
                          setShowExModal(true);
                        }}
                        disabled={
                          event.expenses.reduce(
                            (acc, curr) => acc + (Number(curr.amount) || 0),
                            0,
                          ) >= event.budget
                        }
                      >
                        <CashStack className="me-2" /> Add Expense
                      </Button>
                    </div>

                    {/* Progress Bar for Visual Illumination */}
                    <div
                      className="progress"
                      style={{ height: "8px", overflow: "visible" }}
                    >
                      <div
                        className={`progress-bar rounded-pill ${
                          isOverBudget
                            ? "bg-danger shadow-danger-glow"
                            : "bg-success"
                        }`}
                        role="progressbar"
                        style={{
                          width: `${Math.min(
                            (totalExpenses / event.budget) * 100,
                            100,
                          )}%`,
                          transition: "width 0.6s ease",
                        }}
                      ></div>
                    </div>

                    {isOverBudget && (
                      <small className="text-danger mt-1 d-block fw-medium">
                        You have exceeded the budget by $
                        {(totalExpenses - event.budget).toLocaleString()}
                      </small>
                    )}

                    <style>{`
                      @keyframes pulse-red-glow {
                        0% { text-shadow: 0 0 2px rgba(220, 53, 69, 0.2); }
                        50% { text-shadow: 0 0 12px rgba(220, 53, 69, 0.6); transform: scale(1.02); }
                        100% { text-shadow: 0 0 2px rgba(220, 53, 69, 0.2); }
                      }
                      .animate-pulse {
                        animation: pulse-red-glow 2s infinite ease-in-out;
                        display: inline-block;
                      }
                      .shadow-danger-glow {
                        box-shadow: 0 0 10px rgba(220, 53, 69, 0.8);
                      }
                    `}</style>
                  </div>

                  <ExpenseList
                    event={event}
                    refreshEvents={fetchEvent}
                    budget={event.budget}
                    expenses={event.expenses || []}
                    onEdit={(ex) => {
                      setCurrentExpense(ex);
                      setShowExModal(true);
                    }}
                    onDelete={handleDeleteExpense}
                  />
                  <ExpenseForm
                    show={showExModal}
                    handleClose={() => setShowExModal(false)}
                    onSubmit={onExpenseSubmit}
                    editData={currentExpense}
                  />
                </Tab>

                <Tab
                  eventKey="vendors"
                  title={
                    <span>
                      <Shop className="me-2" /> Vendors
                    </span>
                  }
                >
                  <VendorList vendors={vendors} onAddVendor={addVendor} />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        @keyframes pulse-red {
          0% { text-shadow: 0 0 0px rgba(220, 53, 69, 0); }
          50% { text-shadow: 0 0 10px rgba(220, 53, 69, 0.5); }
          100% { text-shadow: 0 0 0px rgba(220, 53, 69, 0); }
        }
        .animate-pulse {
          animation: pulse-red 2s infinite;
        }
      `}</style>

      {showInvi && (
        <div>
          <InvitationBuilder event={event} setEvent={setEvent} />
        </div>
      )}
    </div>
  );
}

import ReactMarkdown from "react-markdown";

const DEFAULT_TEMPLATE = `# {{event_title}}

Hello [[guest_name]],

You are warmly invited to **{{event_title}}**!

**Host:** {{host_name}}  
**Date & Time:** {{date_time}}  
**Location:** {{location}}

---

_We look forward to seeing you!_`;

function InvitationBuilder({
  event,
  setEvent,
}: {
  event: Eventt;
  setEvent: React.Dispatch<React.SetStateAction<Eventt | null>>;
}) {
  const { user, showInvi, setShowInvi, auth } = useContext(AuthCon);

  const [template, setTemplate] = useState(
    event.invitation || DEFAULT_TEMPLATE,
  );
  const [leftWidth, setLeftWidth] = useState(50);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const leftPaneRef = useRef<HTMLDivElement | null>(null);

  const dragState = useRef({
    dragging: false,
    rafId: 0,
    width: leftWidth,
  });

  const eventVariables: Record<string, string | undefined> = {
    event_title: event.name,
    host_name: user?.username,
    date_time: new Date(event.datetime)
      .toISOString()
      .replace("T", " ")
      .split(".")[0],
    location: event.location,
  };

  const guestVariables = ["guest_name", "guest_email"];

  const renderTemplate = (
    text: string,
    variables: Record<string, string | undefined>,
    preview = true,
  ) => {
    let rendered = text;

    Object.entries(variables).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      rendered = rendered.replace(
        new RegExp(`{{\\s*${escapedKey}\\s*}}`, "g"),
        value ?? "",
      );
    });

    if (preview) {
      rendered = rendered
        .replace(/\[\[\s*guest_name\s*\]\]/gi, "example_guest")
        .replace(/\[\[\s*guest_email\s*\]\]/gi, "example_guest@example.com");
    }
    return rendered;
  };

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    const updated =
      template.substring(0, start) + text + template.substring(end);

    setTemplate(updated);

    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  };

  async function submitInvitation(e: React.FormEvent) {
    e.preventDefault();

    const compiledInvitation = renderTemplate(template, eventVariables, false);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/event`,
        { ...event, invitation: compiledInvitation },
        { headers: { Authorization: `Bearer ${auth}` } },
      );
      setEvent(res.data.event);
      setShowInvi(false);
    } catch (err) {
      console.error("Failed to save invitation", err);
      alert("Failed to save invitation");
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!dragState.current.dragging) return;
    if (dragState.current.rafId) return;

    dragState.current.rafId = requestAnimationFrame(() => {
      const percent = (e.clientX / window.innerWidth) * 100;
      const clamped = Math.min(75, Math.max(25, percent));

      dragState.current.width = clamped;

      if (leftPaneRef.current) {
        leftPaneRef.current.style.width = `${clamped}%`;
      }

      dragState.current.rafId = 0;
    });
  };

  const stopDrag = () => {
    dragState.current.dragging = false;
    setLeftWidth(dragState.current.width);

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDrag);
  };

  const startDrag = () => {
    dragState.current.dragging = true;
    dragState.current.width = leftWidth;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDrag);
  };

  return (
    <Modal show={showInvi} fullscreen onHide={() => setShowInvi(false)}>
      <Modal.Header closeButton className="py-2 px-2">
        <Button onClick={submitInvitation} size="sm">
          Save
        </Button>
      </Modal.Header>

      <Modal.Body className="p-0 overflow-hidden">
        <div className="d-flex" style={{ height: "calc(100vh - 48px)" }}>
          {/* LEFT PANEL */}
          <div
            ref={leftPaneRef}
            style={{ width: `${leftWidth}%` }}
            className="h-100 overflow-hidden p-3 border-end"
          >
            <Form.Control
              ref={textareaRef}
              as="textarea"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="font-monospace"
              style={{ minHeight: "85%" }}
            />

            <div className="text-muted mt-3">
              <strong>Event variables:</strong>{" "}
              {Object.keys(eventVariables).map((k) => (
                <code
                  key={k}
                  role="button"
                  className="me-2 text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => insertAtCursor(`{{${k}}}`)}
                >
                  {`{{${k}}}`}
                </code>
              ))}
              <div className="mt-2">
                <strong>Guest variables:</strong>{" "}
                {guestVariables.map((k) => (
                  <code
                    key={k}
                    role="button"
                    className="me-2 text-success"
                    style={{ cursor: "pointer" }}
                    onClick={() => insertAtCursor(`[[${k}]]`)}
                  >
                    {`[[${k}]]`}
                  </code>
                ))}
              </div>
            </div>
          </div>

          <div
            onMouseDown={startDrag}
            style={{
              width: 6,
              cursor: "col-resize",
              background: "#405064ff",
            }}
          />

          <div
            style={{ width: `${100 - leftWidth}%` }}
            className="h-100 overflow-auto p-3"
          >
            <div className="border rounded p-3">
              <ReactMarkdown>
                {renderTemplate(template, eventVariables)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

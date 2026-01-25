import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Tabs, Tab, Button, Toast, ToastContainer } from 'react-bootstrap'; // Added Toast
import { Calendar3, GeoAlt, CurrencyDollar, CashStack, Shop, Clock, ExclamationTriangleFill } from 'react-bootstrap-icons';
import AuthCon from '../../context/AuthContext';
import type { Eventt } from '@/types';
import ExpenseList from '@/pages/EventUser/components/ExpenseList';
import ExpenseForm from '@/pages/EventUser/components/ExpenseForm';
import GuestTab from './components/GuestTab';

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { auth } = useContext(AuthCon);
  const [event, setEvent] = useState<Eventt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExModal, setShowExModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);

  // State for Bootstrap Toast
  const [showBudgetToast, setShowBudgetToast] = useState(false);

  // Helper to calculate total
  const totalExpenses = event?.expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const isOverBudget = event ? totalExpenses > event.budget : false;

  const fetchEvent = useCallback(async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/event/${id}`, {
        headers: { Authorization: `Bearer ${auth}` }
      });
      const eventData = data.event[0];
      setEvent(eventData);

      // Trigger toast if new data exceeds budget
      const total = eventData.expenses?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
      if (total > eventData.budget) {
        setShowBudgetToast(true);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [id, auth]);

  useEffect(() => { if (auth && id) fetchEvent(); }, [fetchEvent]);

  const updateExpenses = async (updatedExpenses: any[]) => {
    await axios.put(`${import.meta.env.VITE_BASE_URL}/event`,
      { _id: event?._id, expenses: updatedExpenses },
      { headers: { Authorization: `Bearer ${auth}` } }
    );
    fetchEvent();
  };

  const onExpenseSubmit = (data: any) => {
    const processed = { ...data, amount: Number(data.amount) };
    const list = [...(event?.expenses || [])];
    const idx = list.findIndex(ex => ex._id === data._id);
    idx > -1 ? list[idx] = processed : list.push(processed);
    updateExpenses(list).then(() => setShowExModal(false));
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm("Delete?"))
      updateExpenses(event!.expenses.filter(ex => ex._id !== expenseId));
  };

  if (loading) return <Container className="text-center mt-5">Loading...</Container>;
  if (!event) return <Container className="text-center mt-5">Event not found.</Container>;

  return (
    <div className="py-2 px-4 position-relative">
      {/* Bootstrap Toast Notification */}
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
            Warning: Total expenses (${totalExpenses}) have exceeded your budget (${event.budget})!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Row>
        <Col lg={2}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Img variant="top" src={event.images?.[0] || `https://picsum.photos/id/11/200/150`} />
            <Card.Body>
              <Badge bg="info" className="mb-2">{event.typee}</Badge>
              <Card.Title className="fw-bold">{event.name}</Card.Title>
              <p className="text-muted small">{event.des}</p>
              <hr />
              <Row className="small g-2">
                <Col xs={12}><Calendar3 className="me-1 text-primary" />{new Date(event.datetime).toDateString()}</Col>
                <Col xs={12}><Clock className="me-1 text-primary" />{new Date(event.datetime).toTimeString().split(" ")[0]}</Col>
                <Col xs={12}><GeoAlt className="me-1 text-danger" />{event.location}</Col>
                <Col xs={12}><CurrencyDollar className="me-1 text-success" />${event.budget.toLocaleString()}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={10}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="guests" className="mb-3 nav-fill">
                <Tab eventKey="guests" title={<span><CashStack /> Guests</span>}>
                  <GuestTab event={event} auth={auth || ""} setEvent={setEvent} />
                </Tab>

                <Tab eventKey="expenses" title={<span><CashStack /> Expenses</span>}>
                  <div className="mb-4 p-3 rounded-3 border shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <h6 className="text-uppercase text-muted small fw-bold mb-1">Budget Overview</h6>
                        <h4 className={`mb-0 d-flex align-items-center ${isOverBudget ? "text-danger fw-bold animate-pulse" : "text-dark"}`}>
                          <CurrencyDollar className={isOverBudget ? "text-danger" : "text-success"} />
                          <span className="text-muted fs-6 fw-normal">${totalExpenses.toLocaleString()}</span>
                          <span className="text-muted fs-6 fw-normal mx-2">/ ${event.budget.toLocaleString()}</span>

                          {isOverBudget && (
                            <Badge bg="danger" className="ms-2 d-flex align-items-center gap-1 shadow-sm ">
                              <ExclamationTriangleFill size={12} /> Over Budget
                            </Badge>
                          )}
                        </h4>
                      </div>
                      <Button
                        variant="success"
                        className="rounded-pill px-4 shadow-sm"
                        onClick={() => { setCurrentExpense(null); setShowExModal(true); }}
                        disabled={event.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) >= event.budget}
                      >
                        <CashStack className="me-2" /> Add Expense
                      </Button>
                    </div>

                    {/* Progress Bar for Visual Illumination */}
                    <div className="progress" style={{ height: '8px', overflow: 'visible' }}>
                      <div
                        className={`progress-bar rounded-pill ${isOverBudget ? 'bg-danger shadow-danger-glow' : 'bg-success'}`}
                        role="progressbar"
                        style={{
                          width: `${Math.min((totalExpenses / event.budget) * 100, 100)}%`,
                          transition: 'width 0.6s ease'
                        }}
                      ></div>
                    </div>

                    {isOverBudget && (
                      <small className="text-danger mt-1 d-block fw-medium">
                        You have exceeded the budget by ${(totalExpenses - event.budget).toLocaleString()}
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


                  <ExpenseList event={event} budget={event.budget} expenses={event.expenses || []} onEdit={(ex) => { setCurrentExpense(ex); setShowExModal(true); }} onDelete={handleDeleteExpense} />
                  <ExpenseForm show={showExModal} handleClose={() => setShowExModal(false)} onSubmit={onExpenseSubmit} editData={currentExpense} />
                </Tab>

                <Tab eventKey="vendors" title={<span><Shop /> Vendors</span>}>
                  {event.vendors?.length ? event.vendors.map((v, i) => (
                    <Card key={i} className="mb-2 p-2 small">
                      <div className="d-flex justify-content-between fw-bold"><span>{v.name}</span><Badge bg={v.availability ? "success" : "secondary"}>{v.availability ? "Avail" : "Booked"}</Badge></div>
                      <div className="text-muted">{v.services} • ${v.pricing}</div>
                    </Card>
                  )) : <p className="text-center py-3">No vendors.</p>}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add this CSS in your global styles for the 'illumination' effect */}
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
    </div>
  );
}

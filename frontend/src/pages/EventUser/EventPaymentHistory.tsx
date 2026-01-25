import React, { useEffect, useState, useContext } from 'react';
import { Table, Badge, Container, Spinner, Card } from 'react-bootstrap';
import { Wallet2, CheckCircleFill, Calendar3 } from 'react-bootstrap-icons';
import AuthCon from '@/context/AuthContext';
import axios from 'axios';
import type { Eventt } from '@/types';

export default function UserPaymentHistory() {
    const { auth, user } = useContext(AuthCon);
    const [events, setEvents] = useState<Eventt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUserEvents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/events/${user?._id}`, {
                    headers: { 'Authorization': `Bearer ${auth}` }
                });

                setEvents(res.data.events);
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };

        if (auth) fetchAllUserEvents();
    }, [auth, user?._id]);

    const transactionHistory = events.flatMap(event =>
        (event.expenses || [])
            .filter(exp => exp.paymentID && exp.paymentID.trim() !== "")
            .map(exp => ({
                ...exp,
                parentEventName: event.name,
                parentEventDate: event.datetime
            }))
    ).sort((a, b) => new Date(b.parentEventDate).getTime() - new Date(a.parentEventDate).getTime());

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading your financial history...</p>
        </div>
    );

    return (
        <Container className="py-4">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="">
                            <tr>
                                <th className="ps-4">Event & Date</th>
                                <th>Expense Item</th>
                                <th>Transaction ID</th>
                                <th className="text-end">Amount</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionHistory.length > 0 ? (
                                transactionHistory.map((trx, idx) => (
                                    <tr key={trx._id || idx}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{trx.parentEventName}</div>
                                            <small className="text-muted d-flex align-items-center gap-1">
                                                <Calendar3 size={12} />
                                                {new Date(trx.parentEventDate).toLocaleDateString()}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="text-secondary">{trx.name}</span>
                                        </td>
                                        <td>
                                            <code className=" p-1 rounded small">
                                                {trx.paymentID}
                                            </code>
                                        </td>
                                        <td className="text-end fw-bold">
                                            ₹{Number(trx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-center">
                                            <Badge bg="success" className="px-2 py-1">
                                                <CheckCircleFill size={10} className="me-1" /> Success
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-5">
                                        <div className="text-muted">No payments found in your account history.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                {transactionHistory.length > 0 && (
                    <Card.Footer className="bhite text-end py-3">
                        <span className="text-muted me-2">Total Lifetime Expenditure:</span>
                        <span className="h4 mb-0 fw-bold">
                            ₹{transactionHistory.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}
                        </span>
                    </Card.Footer>
                )}
            </Card>
        </Container>
    );
}

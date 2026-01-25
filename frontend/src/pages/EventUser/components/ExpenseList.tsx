import AuthCon from "@/context/AuthContext";
import type { Eventt } from "@/types"; // Assuming types are defined here
import clsx from "clsx";
import { useContext } from "react";
import { Table, Button } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import { useRazorpay, type RazorpayOrderOptions } from "react-razorpay";
import axios from "axios"; // Make sure you have axios installed: npm install axios

interface ExpenseListProps {
  event: Eventt;
  budget: number;
  expenses: any[];
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
  // You likely need a function here to refresh data in the parent component after successful payment
  refreshEvents: () => void;
}

export default function ExpenseList({
  event,
  budget,
  expenses,
  onEdit,
  onDelete,
  refreshEvents,
}: ExpenseListProps) {
  const { Razorpay } = useRazorpay();
  const { user, auth } = useContext(AuthCon);
  const total = expenses.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  const handlePayment = async (expense: any) => {
    const razorpayKeyId =
      import.meta.env.VITE_RAZER_KEY_ID || "rzp_test_XXXXXXXXXXXXXX";

    const options: RazorpayOrderOptions = {
      key: razorpayKeyId,
      amount: Number(expense.amount) * 100,
      currency: "INR",
      name: "Event Empire",
      description: `Payment for ${expense.name}`,
      order_id: "",
      handler: async (response: any) => {
        try {
          const updatedExpenses = event.expenses.map((exp: any) => {
            if (exp._id === expense._id) {
              return { ...exp, paymentID: response.razorpay_payment_id };
            }
            return exp;
          });

          const payload = {
            ...event,
            expenses: updatedExpenses,
          };

          await axios.put(`${import.meta.env.VITE_BASE_URL}/event`, payload, {
            headers: { Authorization: `Bearer ${auth}` },
          });

          alert("Payment successfully!");
          refreshEvents();
        } catch (err) {
          console.error("Failed to update payment status in backend", err);
        }
      },
      prefill: {
        name: user?.username || "Guest",
        email: user?.email || "guest@example.com",
      },
      theme: { color: "#198754" },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div className="expense-list-container">
      <Table hover responsive size="sm" className="align-middle mb-0">
        <thead>
          <tr>
            <th className="ps-3">Name</th>
            <th className="text-end">Amount</th>
            <th className="text-center" style={{ width: "100px" }}>
              Actions
            </th>
            <th className="text-center" style={{ width: "100px" }}>
              Pay
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map((exp, i) => (
              <tr key={exp._id || i}>
                <td className="ps-3 fw-medium">
                  {exp.name || "Unnamed Expense"}
                </td>
                <td className="text-end text-monospace">
                  $
                  {Number(exp.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-1">
                    <Button
                      variant="link"
                      className="p-1 text-primary"
                      onClick={() => onEdit(exp)}
                      title="Edit"
                    >
                      <PencilSquare size={16} />
                    </Button>
                    <Button
                      variant="link"
                      className="p-1 text-danger"
                      onClick={() => onDelete(exp._id)}
                      title="Delete"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    {exp.typee != "Others" ? (
                      exp.paymentID ? (
                        <span className="text-success small fst-italic">
                          Paid
                        </span>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handlePayment(exp)}
                        >
                          Pay
                        </Button>
                      )
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                No expenses recorded yet.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="fw-bold">
            <td className="ps-3">Total Spent</td>
            <td
              className={clsx([
                "text-end",
                total <= budget ? "text-success" : "text-danger",
              ])}
            >
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}

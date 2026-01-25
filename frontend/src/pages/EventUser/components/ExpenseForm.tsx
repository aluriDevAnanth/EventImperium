import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface ExpenseFormProps {
  show: boolean;
  handleClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export default function ExpenseForm({
  show,
  handleClose,
  onSubmit,
  editData,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const isVendorExpense = editData?.typee === "Vendor";

  useEffect(() => {
    if (editData) reset(editData);
    else reset({ name: "", amount: null, typee: "Others" });
  }, [editData, reset, show]);

  return (
    <Modal
      show={show}
      onHide={() => {
        reset({ name: "", amount: null, typee: "Others" });
        handleClose();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isVendorExpense
            ? "Vendor Expense (View Only)"
            : editData
            ? "Edit Expense"
            : "Add New Expense"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {isVendorExpense && (
            <div className="alert alert-info py-2 small">
              Vendor expenses are managed via the Vendors tab and cannot be
              edited here.
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Expense Name</Form.Label>
            <Form.Control
              {...register("name", { required: "Required" })}
              isInvalid={!!errors.name}
              placeholder="e.g. Catering"
              disabled={isVendorExpense} // Disables input
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              {...register("amount", { required: "Required", min: 0 })}
              isInvalid={!!errors.amount}
              disabled={isVendorExpense} // Disables input
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {isVendorExpense ? "Close" : "Cancel"}
          </Button>
          {!isVendorExpense && (
            <Button variant="primary" type="submit">
              Save Expense
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

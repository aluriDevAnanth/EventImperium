import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface ProductFormProps {
    show: boolean;
    handleClose: () => void;
    onSubmit: (data: any) => void;
    deleteFunc: (data: any) => void;
    editData?: any;
}

export default function ProductForm({ show, handleClose, onSubmit, deleteFunc, editData }: ProductFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm();

    useEffect(() => {
        if (editData) reset(editData);
    }, [editData]);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{editData ? 'Edit Service' : 'Add New Service'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Name */}
                    <Form.Group className="mb-3">
                        <Form.Label>Vendor Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter vendor name"
                            {...register("name", { required: "Name is required" })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message?.toString()}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Location */}
                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter location"
                            {...register("location", { required: "Location is required" })}
                            isInvalid={!!errors.location}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.location?.message?.toString()}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Availability */}
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Available"
                            {...register("availability")}
                        />
                    </Form.Group>

                    {/* Pricing */}
                    <Form.Group className="mb-3">
                        <Form.Label>Pricing</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter price"
                            {...register("pricing", {
                                required: "Pricing is required",
                                valueAsNumber: true,
                                min: { value: 0, message: "Price must be positive" }
                            })}
                            isInvalid={!!errors.pricing}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.pricing?.message?.toString()}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Services */}
                    <Form.Group className="mb-3">
                        <Form.Label>Services</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter services offered"
                            {...register("services", { required: "Services are required" })}
                            isInvalid={!!errors.services}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.services?.message?.toString()}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Success message */}
                    {isSubmitSuccessful && (
                        <Alert variant="success">Vendor saved successfully!</Alert>
                    )}

                    <div className='d-flex justify-content-between'>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Vendor"}
                        </Button>

                        {editData ? <Button variant="danger" type="button" onClick={deleteFunc} disabled={isSubmitting}>
                            {isSubmitting ? "Deleting..." : "Delete Vendor"}
                        </Button> : <></>}
                    </div>
                </Form>
            </Modal.Body>

        </Modal>
    );
}

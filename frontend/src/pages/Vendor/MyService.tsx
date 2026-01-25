import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AuthCon from "@/context/AuthContext";
import type { Vendor } from "@/types";
import { Button } from "react-bootstrap";
import ProductForm from "./components/ProductForm";

export default function MyService() {
  const [vendor, setVendor] = useState<Vendor>();
  const [showForm, setShowForm] = useState(false);
  const { auth, user } = useContext(AuthCon);

  const getVendor = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/vendor/${user?._id}`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        }
      );
      console.log(res.data.vendor);
      setVendor(res.data.vendor);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const addOrEditSubmit = async (data: Vendor) => {
    try {
      console.log(data);
      const method = data?._id ? "put" : "post";
      await axios[method](
        `${import.meta.env.VITE_BASE_URL}/vendor`,
        { vendor: { ...data, vendorID: user?._id } },
        {
          headers: { Authorization: `Bearer ${auth}` },
        }
      );
      getVendor();
      setShowForm(false);
    } catch (err) {
      console.error("Post failed", err);
    }
  };

  const deleteSubmit = async (data: Vendor) => {
    try {
      console.log(data);
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/vendor/${user?._id}`,
        { headers: { Authorization: `Bearer ${auth}` } }
      );
      getVendor();
      setShowForm(false);
    } catch (err) {
      console.error("Post failed", err);
    }
  };

  useEffect(() => {
    if (auth) getVendor();
  }, [auth]);

  return (
    <div className="py-4 mx-3" style={{ minHeight: "100vh" }}>
      {auth && (
        <Button
          onClick={() => setShowForm(true)}
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
          {!vendor ? (
            <i className="bi bi-plus-lg"></i>
          ) : (
            <i className="bi bi-pencil" />
          )}
        </Button>
      )}

      <ProductForm
        deleteFunc={deleteSubmit}
        show={showForm}
        handleClose={() => setShowForm(false)}
        onSubmit={addOrEditSubmit}
        editData={vendor}
      />

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {vendor ? (
          <div className="card shadow-sm" style={{ width: "22rem" }}>
            <div className="card-body">
              {/* Name and Availability Badge */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h4 className="card-title text-primary">{vendor.name}</h4>
                <span
                  className={`badge fs-6 ${
                    vendor.availability ? "bg-success" : "bg-danger"
                  }`}
                >
                  {vendor.availability ? "Available" : "Booked"}
                </span>
              </div>

              {/* Service Type */}
              <h6 className="card-subtitle mb-3 text-muted">
                {vendor.services}
              </h6>

              {/* Details List */}
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">
                  <strong>Location:</strong> {vendor.location}
                </li>
                <li className="list-group-item">
                  <strong>Price:</strong> ${vendor.pricing.toLocaleString()}
                </li>
                <li className="list-group-item">
                  <strong>Reviews:</strong> {vendor.reviews.length} total
                  reviews
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Empty state message
          <div className="alert alert-info shadow-sm" role="alert">
            Add the service details to display here.
          </div>
        )}
      </div>
    </div>
  );
}

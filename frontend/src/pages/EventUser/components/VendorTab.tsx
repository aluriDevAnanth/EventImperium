import type { Vendor } from "@/types";
import React, { useState, useContext, useMemo } from "react";
import { Badge, Button, Modal, Row, Col, Form } from "react-bootstrap";
import AuthCon from "@/context/AuthContext";
import axios from "axios";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import { Plus, Star, StarFill } from "react-bootstrap-icons";

interface VendorListProps {
  vendors: Vendor[];
  onAddVendor: (e: React.MouseEvent, v: Vendor) => Promise<void>;
}

export default function VendorList({ vendors, onAddVendor }: VendorListProps) {
  const [locationFilter, setLocationFilter] = useState("");
  const [onlyShowAvailable, setOnlyShowAvailable] = useState(true);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showChatVendor, setShowChatVendor] = useState<Vendor | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredVendors = (vendors || []).filter((v) => {
    const matchesLocation = v.location
      ?.toLowerCase()
      .includes(locationFilter.toLowerCase());
    const matchesAvailability = onlyShowAvailable ? v.availability : true;
    const matchesMinPrice = minPrice === "" || v.pricing >= minPrice;
    const matchesMaxPrice = maxPrice === "" || v.pricing <= maxPrice;

    return (
      matchesLocation &&
      matchesAvailability &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return (
    <div className="pt-3">
      <VendorFilters
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        onlyShowAvailable={onlyShowAvailable}
        setOnlyShowAvailable={setOnlyShowAvailable}
      />

      <VendorTable
        vendors={filteredVendors}
        onAddVendor={onAddVendor}
        onViewProfile={(v) => {
          setSelectedVendor(v);
          setShowDetails(true);
        }}
        onChat={setShowChatVendor}
      />

      <VendorDetailsModal
        vendor={selectedVendor}
        show={showDetails}
        onHide={() => setShowDetails(false)}
      />

      <VendorChatModal
        vendor={showChatVendor}
        onHide={() => setShowChatVendor(null)}
      />
    </div>
  );
}

interface VendorFiltersProps {
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  minPrice: number | "";
  maxPrice: number | "";
  setMinPrice: (v: number | "") => void;
  setMaxPrice: (v: number | "") => void;
  onlyShowAvailable: boolean;
  setOnlyShowAvailable: (v: boolean) => void;
}

function VendorFilters(props: VendorFiltersProps) {
  return (
    <div className="p-3 rounded mb-3 border shadow-sm">
      <Row className="g-2 align-items-center">
        <Col md={4}>
          <Form.Control
            size="sm"
            placeholder="Search location..."
            value={props.locationFilter}
            onChange={(e) => props.setLocationFilter(e.target.value)}
          />
        </Col>

        <Col md={4} className="d-flex gap-2">
          <Form.Control
            size="sm"
            type="number"
            placeholder="Min $"
            value={props.minPrice}
            onChange={(e) =>
              props.setMinPrice(e.target.value ? Number(e.target.value) : "")
            }
          />
          <Form.Control
            size="sm"
            type="number"
            placeholder="Max $"
            value={props.maxPrice}
            onChange={(e) =>
              props.setMaxPrice(e.target.value ? Number(e.target.value) : "")
            }
          />
        </Col>

        <Col md={4} className="d-flex justify-content-end">
          <Form.Check
            type="checkbox"
            label="Available Only"
            checked={props.onlyShowAvailable}
            onChange={(e) => props.setOnlyShowAvailable(e.target.checked)}
          />
        </Col>
      </Row>
    </div>
  );
}

interface VendorTableProps {
  vendors: Vendor[];
  onAddVendor: (e: React.MouseEvent, v: Vendor) => void;
  onViewProfile: (v: Vendor) => void;
  onChat: (v: Vendor) => void;
}

function VendorTable({
  vendors,
  onAddVendor,
  onViewProfile,
  onChat,
}: VendorTableProps) {
  if (!vendors.length) {
    return (
      <div className="text-center py-5 border rounded">
        <p className="text-muted mb-0">No vendors match your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive border rounded bg-white">
      <table className="table table-hover align-middle mb-0 small">
        <thead className="text-muted text-uppercase">
          <tr>
            <th>Add</th>
            <th>Vendor</th>
            <th>Location</th>
            <th>Price</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v._id}>
              <td>
                <button
                  onClick={(e) => onAddVendor(e, v)}
                  className="btn btn-sm btn-success"
                >
                  +
                </button>
              </td>
              <td className="fw-bold">{v.name}</td>
              <td>{v.location}</td>
              <td>${v.pricing?.toLocaleString()}</td>
              <td>
                <Badge bg={v.availability ? "success" : "danger"}>
                  {v.availability ? "Available" : "Busy"}
                </Badge>
              </td>
              <td className="text-end">
                <Button variant="link" onClick={() => onViewProfile(v)}>
                  <i className="bi bi-info-circle"></i>
                </Button>
                <Button variant="link" onClick={() => onChat(v)}>
                  <i className="bi bi-chat"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  show: boolean;
  onHide: () => void;
  vendor: Vendor | null;
}

function VendorDetailsModal({ show, onHide, vendor }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [open, setOpen] = useState(false);

  if (!vendor) return null;

  const avg =
    vendor.reviews?.length > 0
      ? Math.round(
          vendor.reviews.reduce((a, r) => a + r.rating, 0) /
            vendor.reviews.length,
        )
      : 4;

  const Stars = ({
    value,
    interactive = false,
  }: {
    value: number;
    interactive?: boolean;
  }) => (
    <>
      {[1, 2, 3, 4, 5].map((v) => {
        const filled = interactive ? v <= (hover || rating) : v <= value;
        const Icon = filled ? StarFill : Star;

        return (
          <Icon
            key={v}
            size={14}
            className={`me-1 ${
              interactive ? "cursor-pointer text-warning" : "text-warning"
            }`}
            onMouseEnter={() => interactive && setHover(v)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && setRating(v)}
          />
        );
      })}
    </>
  );

  /* async function submitReview(event: FormEvent<HTMLFormElement>): void {
    const res = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/event`,
      updatedEvent,
      {
        headers: { Authorization: `Bearer ${auth}` },
      },
    );
  } */

  return (
    <Modal show={show} onHide={onHide} fullscreen>
      <Modal.Header closeButton className="py-2 px-3">
        <div className="d-flex align-items-center gap-3">
          <h6 className="mb-0">{vendor.name}</h6>
          <div>
            <Stars value={avg} />
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-3 py-2 small d-flex flex-column gap-2">
        <div className="d-flex gap-3">
          <span className="fw-4">Services: </span>
          <span className="text-muted">{vendor.services}</span>
        </div>

        <div className="mb-2">
          <div className="d-flex gap-3 align-items-center">
            <p className="fs-6 fw-4 m-0">Reviews </p>
            <div>
              <Button
                className="py-0 px-1 text-decoration-none"
                onClick={() => setOpen(!open)}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {open && (
            <Form /* onSubmit={submitReview} */ className="mt-2">
              <Stars value={0} interactive />
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                placeholder="Quick review"
                className="mt-1"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <div className="text-end mt-1">
                <Button size="sm">Submit</Button>
              </div>
            </Form>
          )}
        </div>

        <div className="d-flex flex-column gap-2">
          {vendor.reviews?.length ? (
            vendor.reviews.map((r, i) => (
              <div key={i} className="border rounded p-2">
                <Stars value={r.rating} />
                <div className="text-muted fst-italic">“{r.review}”</div>
              </div>
            ))
          ) : (
            <div className="text-muted fst-italic">No reviews</div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function VendorChatModal({
  vendor,
  onHide,
}: {
  vendor: Vendor | null;
  onHide: () => void;
}) {
  return (
    <Modal show={!!vendor} onHide={onHide} fullscreen className="p-0">
      <Modal.Body className="p-0">
        {vendor && <ChatApp vendor={vendor} onClose={onHide} />}
      </Modal.Body>
    </Modal>
  );
}

function ChatApp({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const { user, messages, setMessages } = useContext(AuthCon);
  const selectedUserId = vendor.vendorID;

  const activeChatMessages = useMemo(() => {
    if (!user?._id) return [];
    return messages.filter(
      (m: any) =>
        (m.sender === user._id && m.reciever === selectedUserId) ||
        (m.sender === selectedUserId && m.reciever === user._id),
    );
  }, [messages, selectedUserId, user?._id]);

  const handleSend = async (text: string) => {
    if (!user?._id || !text.trim()) return;

    const newMessage = {
      sender: user._id,
      reciever: selectedUserId,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev: any[]) => [...prev, newMessage]);

    await axios.post(`${import.meta.env.VITE_BASE_URL}/chat_entry`, {
      chat: newMessage,
    });
  };

  return (
    <MainContainer>
      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Content userName={vendor.name} info="Online" />
          <ConversationHeader.Actions>
            <Button
              variant="link"
              size="sm"
              className="rounded-circle br-3"
              onClick={onClose}
            >
              <i className="bi bi-x-lg text-danger" />
            </Button>
          </ConversationHeader.Actions>
        </ConversationHeader>

        <MessageList>
          {activeChatMessages.map((m: any, i: number) => (
            <Message
              key={i}
              model={{
                message: m.text,
                sentTime: m.createdAt,
                direction: m.sender === user?._id ? "outgoing" : "incoming",
                position: "single",
              }}
            />
          ))}
        </MessageList>

        <MessageInput
          placeholder="Type a message..."
          attachButton={false}
          onSend={handleSend}
        />
      </ChatContainer>
    </MainContainer>
  );
}

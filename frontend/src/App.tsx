import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router"; // Added Navigate

import Login from "./pages/Login";
import OutletC from "./pages/components/OutletC";
import EventHome from "./pages/EventUser/Home";
import Events from "./pages/EventUser/Events";
import EventPage from "@/pages/EventUser/EventPage";
import VendorHome from "@/pages/Vendor/VendorHome";
import MyService from "@/pages/Vendor/MyService";
import GuestHome from "@/pages/Guest/GuestHome";
import AuthCon from "./context/AuthContext";
import Notify from "./pages/Guest/Notify";
import VendorChat from "./pages/Vendor/VendorChat";
import EventPaymentHistory from "./pages/EventUser/EventPaymentHistory";

function App() {
  const { user, auth } = useContext(AuthCon);

  return (
    <Routes>
      {!auth ? (
        <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route element={<OutletC />}>
          <Route
            path="/"
            element={
              user?.type === "EventUser" ? (
                <EventHome />
              ) : user?.type === "Guest" ? (
                <GuestHome />
              ) : (
                <VendorHome />
              )
            }
          />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route
            path="/eventPayemntHistory"
            element={<EventPaymentHistory />}
          />
          <Route path="/myService" element={<MyService />} />
          <Route path="/vendorChat" element={<VendorChat />} />
          <Route path="/notify" element={<Notify />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;

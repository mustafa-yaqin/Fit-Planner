// All pages of the website and their addresses (React Router). Add a new page here.
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import Activities from "./pages/Activities/Activities.jsx";
import ActivityDetails from "./pages/ActivityDetails/ActivityDetails.jsx";
import Routine from "./pages/Routine/Routine.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import AuthPage from "./pages/Auth/AuthPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MyActivities from "./pages/MyActivities/MyActivities.jsx";
import Privacy from "./pages/Privacy/Privacy.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";

// The admin panel is only for the admin: it is downloaded only when /admin is opened.
const Admin = lazy(() => import("./pages/Admin/Admin.jsx"));

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:id" element={<ActivityDetails />} />
        <Route
          path="/routine"
          element={
            <ProtectedRoute>
              <Routine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-activities"
          element={
            <ProtectedRoute>
              <MyActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense
                fallback={
                  <p
                    role="status"
                    className="container-site pt-40 pb-24 text-center"
                  >
                    …
                  </p>
                }
              >
                <Admin />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route path="/manage" element={<Navigate to="/admin" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

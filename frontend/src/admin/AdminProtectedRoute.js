import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {

 const user = JSON.parse(localStorage.getItem("user"));

 if (!user || user.role !== "admin") {
   return <Navigate to="/" />;
 }

 return children;
}

export default AdminProtectedRoute;
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import { AuthContext } from "@/context/auth-context/index";

function ProtectRouter({ element }) {
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  const authenticated = auth.authenticate;
  const user = auth.user;

  console.log("useruser", authenticated, user);

  const isInstructorPath = location.pathname.startsWith("/instructor");
  const isAuthPath = location.pathname.startsWith("/auth");

  if (!authenticated && !isAuthPath) {
    return <Navigate to="/auth" />;
  }

  if (
    authenticated &&
    user?.role !== "instructor" &&
    (isInstructorPath || isAuthPath)
  ) {
    return <Navigate to="/home" />;
  }

  if (authenticated && user?.role === "instructor" && !isInstructorPath) {
    return <Navigate to="/instructor" />;
  }

  return <Fragment>{element}</Fragment>;
}

export default ProtectRouter;

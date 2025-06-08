import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import ProtectRouter from "./components/protect-route";
import { useContext } from "react";
import InstructorDashboard from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHome from "./pages/students/home";
import { AuthContext } from "./context/auth-context";
import NotFound from "./pages/not-found";
import AddNewCourse from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/students/courses";
import StudentViewCourseDetailsPage from "./pages/students/course-details";
import PaypalPaymentReturnPage from "./pages/students/payment-return";
import StudentCoursesPage from "./pages/students/student-courses";
import StudentViewCourseProgressPage from "./pages/students/course-progress";

function App() {
  const { auth } = useContext(AuthContext);
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <ProtectRouter
            element={<AuthPage />}
            authenticate={auth.authenticate}
            user={auth.user}
          />
        }
      />

      <Route
        path="instructor"
        element={<ProtectRouter element={<InstructorDashboard />} />}
        authenticate={auth.authenticate}
        user={auth.user}
      />
      <Route
        path="instructor/create-new-course"
        element={<ProtectRouter element={<AddNewCourse />} />}
        authenticate={auth.authenticate}
        user={auth.user}
      />
      <Route
        path="instructor/edit-course/:courseId"
        element={<ProtectRouter element={<AddNewCourse />} />}
        authenticate={auth.authenticate}
        user={auth.user}
      />

      <Route
        path="/"
        element={<ProtectRouter element={<StudentViewCommonLayout />} />}
        authenticate={auth.authenticate}
        user={auth.user}
      >
        <Route path="" element={<StudentHome />} />
        <Route path="/home" element={<StudentHome />} />
        <Route path="/courses" element={<StudentViewCoursesPage />} />
        <Route
          path="/course/details/:id"
          element={<StudentViewCourseDetailsPage />}
        />
        <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
        <Route path="student-courses" element={<StudentCoursesPage />} />
        <Route
          path="course-progress/:id"
          element={<StudentViewCourseProgressPage />}
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

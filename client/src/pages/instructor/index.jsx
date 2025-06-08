import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboardComponent from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/service";
import { BarChart, Book, LogOut } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response.success) setInstructorCoursesList(response.data);
  }

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: (
        <InstructorDashboardComponent listOfCourses={instructorCoursesList} />
      ),
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100 relative">
      {/* Hamburger Button - Right Side */}
      <button
        className="md:hidden p-4 absolute top-0 right-0 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:block`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
          <nav>
            {menuItems.map((menuItem) => {
              const Icon = menuItem.icon;
              return (
                <Button
                  key={menuItem.value}
                  className="w-full justify-start mb-2"
                  variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                  onClick={() => {
                    if (menuItem.value === "logout") handleLogout();
                    else {
                      setActiveTab(menuItem.value);
                      setSidebarOpen(false); // Close sidebar after click
                    }
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {menuItem.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) =>
              menuItem.component ? (
                <TabsContent key={menuItem.value} value={menuItem.value}>
                  {menuItem.component}
                </TabsContent>
              ) : null
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;

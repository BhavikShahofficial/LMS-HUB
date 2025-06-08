import { GraduationCap, TvMinimalPlay, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <header className="flex items-center justify-between p-4 border-b relative">
      {/* Logo always visible */}
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-black">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold md:text-xl text-[14px]">
            LMS LEARN
          </span>
        </Link>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => {
            location.pathname.includes("/courses")
              ? null
              : navigate("/courses");
          }}
          className="text-[14px] md:text-[16px] font-medium"
        >
          Explore Courses
        </Button>

        <div
          onClick={() => navigate("/student-courses")}
          className="flex cursor-pointer items-center gap-3"
        >
          <span className="font-extrabold md:text-xl text-[14px]">
            My Courses
          </span>
          <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
        </div>

        <Button onClick={handleLogout}>Sign Out</Button>
      </div>

      {/* Mobile hamburger menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-8 w-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-black text-white z-50 shadow-md rounded"
          >
            <DropdownMenuItem
              onSelect={() => {
                if (!location.pathname.includes("/courses")) {
                  navigate("/courses");
                }
              }}
            >
              Explore Courses
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/student-courses")}>
              My Courses
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;

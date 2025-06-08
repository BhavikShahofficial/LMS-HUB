import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/service";
import { ArrowUpDownIcon, Sliders } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Helper function to create query string from params object
function createQueryString(params) {
  const queryParams = [];

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value.length) {
        queryParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
      }
    } else if (value !== undefined && value !== null && value !== "") {
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    }
  }

  return queryParams.join("&");
}

export default function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const storedFilters = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("filters")) || {};
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(storedFilters);
  }, [storedFilters]);

  useEffect(() => {
    const queryString = createQueryString(filters);
    setSearchParams(new URLSearchParams(`${queryString}&sortBy=${sort}`));
  }, [filters, sort, setSearchParams]);

  useEffect(() => {
    if (filters && sort) {
      const queryString = createQueryString({ ...filters, sortBy: sort });

      setLoadingState(true);

      fetchStudentViewCourseListService(queryString).then((response) => {
        if (response?.success) {
          setStudentViewCoursesList(response.data);
        }
        setLoadingState(false);
      });
    }
  }, [filters, sort, setStudentViewCoursesList, setLoadingState]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  function handleFilterOnChange(sectionId, option) {
    setFilters((prev) => {
      const updated = { ...prev };
      const current = updated[sectionId] || [];
      if (current.includes(option.id)) {
        updated[sectionId] = current.filter((id) => id !== option.id);
      } else {
        updated[sectionId] = [...current, option.id];
      }

      sessionStorage.setItem("filters", JSON.stringify(updated));
      return updated;
    });
  }

  async function handleCourseNavigate(courseId) {
    const response = await checkCoursePurchaseInfoService(
      courseId,
      auth?.user?._id
    );
    if (response?.success) {
      const path = response.data
        ? `/course-progress/${courseId}`
        : `/course/details/${courseId}`;
      navigate(path);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Courses</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Filter Sidebar - visible on desktop, hidden on mobile */}
        <aside className="hidden md:block w-64 space-y-4">
          {Object.entries(filterOptions).map(([sectionKey, options]) => (
            <div className="p-4 border-b" key={sectionKey}>
              <h3 className="font-bold mb-3">{sectionKey.toUpperCase()}</h3>
              <div className="grid gap-2 mt-2">
                {options.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`${sectionKey}-${option.id}`}
                    className="flex font-medium items-center gap-3"
                  >
                    <Checkbox
                      id={`${sectionKey}-${option.id}`}
                      checked={
                        filters?.[sectionKey]?.includes(option.id) || false
                      }
                      onCheckedChange={() =>
                        handleFilterOnChange(sectionKey, option)
                      }
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Filter sliding panel for mobile */}
        {isFilterOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setIsFilterOpen(false)}
            ></div>

            {/* Sliding panel */}
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close Filters"
                >
                  ✕
                </Button>
              </div>

              {Object.entries(filterOptions).map(([sectionKey, options]) => (
                <div className="border-b pb-4 mb-4" key={sectionKey}>
                  <h3 className="font-bold mb-3">{sectionKey.toUpperCase()}</h3>
                  <div className="grid gap-2 mt-2">
                    {options.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`mobile-${sectionKey}-${option.id}`}
                        className="flex font-medium items-center gap-3"
                      >
                        <Checkbox
                          id={`mobile-${sectionKey}-${option.id}`}
                          checked={
                            filters?.[sectionKey]?.includes(option.id) || false
                          }
                          onCheckedChange={() =>
                            handleFilterOnChange(sectionKey, option)
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 p-5"
                  >
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <span className="text-[16px] font-medium">Sort By</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-white text-black z-[9999] w-[180px]"
                >
                  <DropdownMenuRadioGroup
                    value={sort}
                    onValueChange={(val) => {
                      setSort(val);
                    }}
                  >
                    {sortOptions.map((sortItem) => (
                      <DropdownMenuRadioItem
                        key={sortItem.id}
                        value={sortItem.id}
                      >
                        {sortItem.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter button visible only on mobile */}
              <Button
                onClick={() => setIsFilterOpen(true)}
                variant="outline"
                size="sm"
                className="md:hidden flex items-center p-2"
                aria-label="Open Filters"
              >
                <Sliders className="h-5 w-5" />
              </Button>
            </div>

            <span className="text-sm text-black font-bold">
              {studentViewCoursesList?.length || 0} Results
            </span>
          </div>

          {/* Course List */}
          <div className="space-y-4">
            {loadingState ? (
              <Skeleton />
            ) : studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <Card
                  key={courseItem?._id}
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="cursor-pointer"
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={courseItem?.image}
                        className="w-full h-full object-cover"
                        alt={courseItem?.title}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {courseItem?.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-1">
                        Created By{" "}
                        <span className="font-bold">
                          {courseItem?.instructorName}
                        </span>
                      </p>
                      <p className="text-[16px] text-gray-600 mt-3 mb-2">
                        {`${courseItem?.curriculum?.length} ${
                          courseItem?.curriculum?.length === 1
                            ? "Lecture"
                            : "Lectures"
                        } - ${courseItem?.level.toUpperCase()} Level`}
                      </p>
                      <p className="font-bold text-lg">
                        ${courseItem?.pricing}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <h1 className="font-extrabold text-4xl">No Courses Found</h1>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

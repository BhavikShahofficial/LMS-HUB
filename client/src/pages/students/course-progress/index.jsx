import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/service";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);

  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  // Track which lectures have been updated, to avoid repeat API calls
  const [updatedLectureIds, setUpdatedLectureIds] = useState(new Set());

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  async function fetchCurrentCourseProgress() {
    setLoading(true);
    try {
      const response = await getCurrentCourseProgressService(
        auth?.user?._id,
        id
      );
      if (response?.success) {
        if (!response?.data?.isPurchased) {
          setLockCourse(true);
        } else {
          setLockCourse(false);
          setStudentCurrentCourseProgress({
            courseDetails: response?.data?.courseDetails,
            progress: response?.data?.progress,
          });

          const curriculum = response?.data?.courseDetails?.curriculum || [];

          if (response?.data?.completed) {
            setCurrentLecture(curriculum[0] || null);
            setShowCourseCompleteDialog(true);
            setShowConfetti(true);
            return;
          }

          if (
            !response?.data?.progress ||
            response.data.progress.length === 0
          ) {
            setCurrentLecture(curriculum[0] || null);
          } else {
            const lastIndexOfViewedAsTrue =
              response?.data?.progress.reduceRight(
                (acc, obj, index) => (acc === -1 && obj.viewed ? index : acc),
                -1
              );

            const nextLectureIndex = lastIndexOfViewedAsTrue + 1;
            setCurrentLecture(
              curriculum[nextLectureIndex] ||
                curriculum[curriculum.length - 1] ||
                null
            );
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateCourseProgress() {
    if (
      currentLecture &&
      !updatedLectureIds.has(currentLecture._id) // prevent duplicate calls
    ) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );
      if (response?.success) {
        setUpdatedLectureIds((prev) => new Set(prev).add(currentLecture._id));
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );
    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      setUpdatedLectureIds(new Set());
      fetchCurrentCourseProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) {
      updateCourseProgress();
    }
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-white"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1
            className="text-sm md:text-lg font-bold hidden sm:block truncate max-w-[150px] sm:max-w-none"
            title={studentCurrentCourseProgress?.courseDetails?.title}
          >
            {studentCurrentCourseProgress?.courseDetails?.title || "Loading..."}
          </h1>
        </div>
        <Button
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          className="text-white"
        >
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isSideBarOpen && windowWidth >= 640 ? "mr-[400px]" : ""
          }`}
        >
          <div className="relative w-full h-[87vh] md:h-[80vh] ">
            <div className="absolute top-0 left-0 w-full h-full">
              {loading && (
                <div className="flex items-center justify-center h-full bg-gray-900">
                  Loading video...
                </div>
              )}
              {!loading && currentLecture && (
                <VideoPlayer
                  width="100%"
                  height="100%"
                  url={currentLecture.videoUrl}
                  onProgressUpdate={setCurrentLecture}
                  progressData={currentLecture}
                />
              )}
              {!loading && !currentLecture && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No lecture selected.
                </div>
              )}
            </div>
          </div>
          <div className="p-4 mb-0 bg-[#1c1d1f] z-100 relative sm:mt-0 mt-[-10px]">
            <h2
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate max-w-full overflow-hidden"
              title={currentLecture?.title}
            >
              {currentLecture?.title || "Select a lecture"}
            </h2>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-full sm:w-[400px] z-50 bg-[#1c1d1f] border-l border-gray-700 transition-transform duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className="text-white rounded-none h-full w-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="text-white rounded-none h-full w-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {(
                    studentCurrentCourseProgress?.courseDetails?.curriculum ||
                    []
                  ).map((item) => {
                    const viewed = studentCurrentCourseProgress?.progress?.find(
                      (progressItem) => progressItem.lectureId === item._id
                    )?.viewed;

                    return (
                      <div
                        key={item._id}
                        onClick={() => setCurrentLecture(item)}
                        className={`flex items-center space-x-2 text-sm font-semibold cursor-pointer px-2 py-1 rounded hover:bg-gray-800 ${
                          currentLecture?._id === item._id ? "bg-gray-700" : ""
                        }`}
                        title={item.title}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setCurrentLecture(item);
                          }
                        }}
                      >
                        {viewed ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Play className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate whitespace-nowrap overflow-hidden max-w-[250px]">
                          {item?.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description ||
                      "No description available."}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Locked Dialog */}
      <Dialog open={lockCourse} onOpenChange={setLockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end p-4 pt-0">
            <Button variant="outline" onClick={() => setLockCourse(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog
        open={showCourseCompleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowCourseCompleteDialog(false);
        }}
      >
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;

import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context/index";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/service";
import { Upload } from "lucide-react";
import { useContext, useRef } from "react";

function CourseCurriculam() {
  const {
    courseCurriculamFormData,
    setCourseCurriculamFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);

  function handleNewLecture() {
    setCourseCurriculamFormData([
      ...courseCurriculamFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpyCourseCurriculamFormData = [...courseCurriculamFormData];
    cpyCourseCurriculamFormData[currentIndex] = {
      ...cpyCourseCurriculamFormData[currentIndex],
      title: event.target.value,
    };
    setCourseCurriculamFormData(cpyCourseCurriculamFormData);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculamFormData = [...courseCurriculamFormData];
    cpyCourseCurriculamFormData[currentIndex] = {
      ...cpyCourseCurriculamFormData[currentIndex],
      freePreview: currentValue,
    };
    setCourseCurriculamFormData(cpyCourseCurriculamFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const videoFormData = new FormData();
    videoFormData.append("file", selectedFile);

    try {
      setMediaUploadProgress(true);

      const response = await mediaUploadService(
        videoFormData,
        setMediaUploadProgressPercentage
      );

      if (response.success) {
        const updatedCurriculum = [...courseCurriculamFormData];
        updatedCurriculum[currentIndex] = {
          ...updatedCurriculum[currentIndex],
          videoUrl: response.data.url,
          public_id: response.data.public_id,
        };
        setCourseCurriculamFormData(updatedCurriculum);
      }

      console.log("Upload successful:", response);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setMediaUploadProgress(false);
    }
  }

  function isCourseCurriculamFormDataValid() {
    return courseCurriculamFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      return Object.entries(obj).every(([key, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    const bulkFormData = new FormData();

    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      if (response?.success) {
        let cpyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculamFormData)
            ? []
            : [...courseCurriculamFormData];

        cpyCourseCurriculumFormdata = [
          ...cpyCourseCurriculumFormdata,
          ...response?.data.map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${
              cpyCourseCurriculumFormdata.length + (index + 1)
            }`,
            freePreview: false,
          })),
        ];
        setCourseCurriculamFormData(cpyCourseCurriculumFormdata);
        setMediaUploadProgress(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpyCourseCurriculamFormData = [...courseCurriculamFormData];
    const getCurrentVideoPublicId =
      cpyCourseCurriculamFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    if (deleteCurrentMediaResponse?.success) {
      cpyCourseCurriculamFormData[currentIndex] = {
        ...cpyCourseCurriculamFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculamFormData(cpyCourseCurriculamFormData);
    }
  }

  async function handleDeleteLecture(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculamFormData];
    const getCurrentSelectedVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const response = await mediaDeleteService(getCurrentSelectedVideoPublicId);

    if (response?.success) {
      cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );

      setCourseCurriculamFormData(cpyCourseCurriculumFormData);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <CardTitle>Create Course Curriculum</CardTitle>
        <div>
          <Input
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            type="file"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer"
            onClick={handleOpenBulkUploadDialog}
          >
            <Upload className="w-4 h-5 mr-2" />
            Bulk-Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          disabled={!isCourseCurriculamFormDataValid() || mediaUploadProgress}
          onClick={handleNewLecture}
        >
          Add Lecture
        </Button>
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-4 space-y-6">
          {courseCurriculamFormData.map((curriculamItem, index) => (
            <div key={index} className="border p-5 rounded-md">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Lecture Title"
                  className="w-full md:max-w-96"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculamFormData[index].title}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculamFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                  />
                  <Label htmlFor={`freePreview-${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>

              <div className="mt-6">
                {courseCurriculamFormData[index]?.videoUrl ? (
                  <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                    <div className="w-full aspect-video md:w-[350px] md:h-auto h-[300px]">
                      <VideoPlayer
                        url={courseCurriculamFormData[index]?.videoUrl}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => handleReplaceVideo(index)}>
                        Replace Video
                      </Button>
                      <Button
                        onClick={() => handleDeleteLecture(index)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Lecture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Input
                    className="mb-4"
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      handleSingleLectureUpload(event, index)
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculam;

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  SquaresFourIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  XIcon,
  ArrowCounterClockwiseIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { RootState } from "@/store/store";
import { Assignment } from "@/store/slices/assignment.slice";
import axiosClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Header } from "@/components/custom/header";
import { Textarea } from "@/components/ui/textarea";

export default function AssignmentViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user } = useSelector((state: RootState) => state.admin);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [feedbacks, setFeedbacks] = useState<
    { sectionIndex: number; questionIndex: number; comment: string }[]
  >([]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/assignments/${id}`);
        setAssignment(response.data);
      } catch {
        toast.error("Failed to load assignment details.");
        router.push("/assignments");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackChange = (sectionIndex: number, questionIndex: number, comment: string) => {
    setFeedbacks((prev) => {
      const existing = prev.find(
        (f) => f.sectionIndex === sectionIndex && f.questionIndex === questionIndex
      );
      if (existing) {
        if (!comment) {
          return prev.filter(
            (f) => !(f.sectionIndex === sectionIndex && f.questionIndex === questionIndex)
          );
        }
        return prev.map((f) =>
          f.sectionIndex === sectionIndex && f.questionIndex === questionIndex
            ? { ...f, comment }
            : f
        );
      }
      if (!comment) return prev;
      return [...prev, { sectionIndex, questionIndex, comment }];
    });
  };

  const handleRegenerate = async () => {
    if (feedbacks.length === 0) {
      toast.error("Please add at least one comment to regenerate.");
      return;
    }
    try {
      setIsRegenerating(true);
      setIsEditMode(false);
      const res = await axiosClient.post(`/assignments/${id}/regenerate`, { feedbacks });
      const { jobId } = res.data;

      const interval = setInterval(async () => {
        try {
          const statusRes = await axiosClient.get(`/assignments/status/${jobId}`);
          const state = statusRes.data.status;
          if (state === "completed") {
            clearInterval(interval);
            const updatedRes = await axiosClient.get(`/assignments/${id}`);
            setAssignment(updatedRes.data);
            setFeedbacks([]);
            setIsRegenerating(false);
            toast.success("Assignment regenerated successfully!");
          } else if (state === "failed") {
            clearInterval(interval);
            setIsRegenerating(false);
            toast.error("Failed to regenerate assignment.");
          }
        } catch {
          clearInterval(interval);
          setIsRegenerating(false);
          toast.error("Error checking regeneration status.");
        }
      }, 3000);
    } catch {
      setIsRegenerating(false);
      toast.error("Failed to start regeneration.");
    }
  };

  return (
    <div className="flex h-full w-full flex-col print:bg-white print:m-0 print:p-0">
      <Header
        breadcrumb={
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <SquaresFourIcon size={18} weight="fill" />
            <span className="text-muted-foreground">Assignment</span>
            <span>/</span>
            <span className="text-foreground">View</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center print:p-0 print:overflow-visible">
        {isLoading || isRegenerating ? (
          <div className="w-full max-w-4xl mx-auto space-y-6 print:hidden bg-white rounded-[2rem] p-8 shadow-sm">
            <div className="text-center space-y-3 mb-8">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-5 w-1/2 mx-auto" />
              <Skeleton className="h-5 w-1/3 mx-auto" />
            </div>

            <div className="flex justify-between border-b pb-4 mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>

            <div className="space-y-8">
              {/* Section A Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mx-auto" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              {/* Section B Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mx-auto" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>

            <div className="text-center mt-12 flex flex-col items-center gap-4">
              <SpinnerIcon className="animate-spin" size={18} />
              <p className="text-muted-foreground animate-pulse font-medium">
                {isRegenerating
                  ? "Regenerating your assignment using AI..."
                  : "Loading assignment..."}
              </p>
            </div>
          </div>
        ) : !assignment ? (
          <div className="text-center mt-20 print:hidden">
            <p className="text-muted-foreground">Assignment not found.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl space-y-6 print:space-y-0"
          >
            {/* AI Banner */}
            <div className="bg-[#2A2B2F] text-white p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm print:hidden">
              <p className="text-[15px] font-medium leading-relaxed max-w-2xl">
                Certainly, {user?.name?.split(" ")[0] || "User"}! Here are customized{" "}
                <u className="underline-offset-2">Question Paper</u> for your {assignment.class}{" "}
                {assignment.subject} classes on the requested topics:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  className="rounded-full bg-white text-zinc-900 font-semibold px-6 h-11 hover:bg-gray-100 whitespace-nowrap"
                  onClick={handlePrint}
                >
                  <DownloadSimpleIcon size={18} className="mr-2" /> Download as PDF
                </Button>
              </div>
            </div>

            {/* Exam Paper */}
            <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-sm print:shadow-none print:p-0 print:rounded-none font-serif text-zinc-900">
              {/* Header Info */}
              <div className="text-center space-y-2 mb-10">
                <h1 className="text-2xl md:text-3xl font-bold font-sans">
                  {assignment.school || "Delhi Public School, Sector-4, Bokaro"}
                </h1>
                <p className="text-lg md:text-xl font-semibold">Subject: {assignment.subject}</p>
                <p className="text-lg md:text-xl font-semibold">Class: {assignment.class}</p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between font-semibold mb-6">
                <p>Time Allowed: {assignment.timeAllowed || "45 minutes"}</p>
                <p>Maximum Marks: {assignment.totalMarks}</p>
              </div>

              {/* General Instructions */}
              <div className="mb-6 font-semibold">
                <p>
                  {assignment.generalInstructions ||
                    "All questions are compulsory unless stated otherwise."}
                </p>
              </div>

              {/* Student Info Blanks */}
              <div className="space-y-3 mb-10 font-semibold">
                <p>
                  Name: <span className="inline-block w-64 border-b border-black"></span>
                </p>
                <p>
                  Roll Number: <span className="inline-block w-48 border-b border-black"></span>
                </p>
                <p>
                  Class: {assignment.class} Section:{" "}
                  <span className="inline-block w-32 border-b border-black"></span>
                </p>
              </div>

              {/* Sections & Questions */}
              <div className="space-y-10">
                {assignment.sections!.map((section, sIdx) => {
                  const questionOffset = assignment
                    .sections!.slice(0, sIdx)
                    .reduce((acc, s) => acc + s.questions.length, 0);

                  return (
                    <div key={sIdx} className="space-y-6">
                      <div className="text-center">
                        <p className="text-xl font-bold font-sans">
                          {section.name || section.title || section.type}
                        </p>
                        {section.description && (
                          <p className="italic mt-1 text-sm">{section.description}</p>
                        )}
                      </div>

                      <div className="space-y-5">
                        {section.questions.map((question, qIdx) => (
                          <div key={qIdx} className="flex gap-2">
                            <span className="font-medium shrink-0">
                              {questionOffset + qIdx + 1}.
                            </span>
                            <div className="space-y-2 w-full">
                              <p>
                                [{question.difficulty}] {question.questionText} [{question.marks}{" "}
                                Marks]
                              </p>
                              {question.options && question.options.length > 0 && (
                                <div className="pl-2 space-y-1 mt-2">
                                  {question.options.map((opt, oIdx) => (
                                    <p key={oIdx}>
                                      {String.fromCharCode(97 + oIdx)}) {opt}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {isEditMode && (
                                <div className="mt-4 print:hidden">
                                  <Textarea
                                    placeholder="Add feedback to regenerate this question (e.g. 'Make it harder', 'Change topic to X')"
                                    className="resize-none bg-gray-50 border-gray-200"
                                    value={
                                      feedbacks.find(
                                        (f) => f.sectionIndex === sIdx && f.questionIndex === qIdx
                                      )?.comment || ""
                                    }
                                    onChange={(e) =>
                                      handleFeedbackChange(sIdx, qIdx, e.target.value)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 text-center font-bold font-sans text-sm">
                End of Question Paper
              </div>

              {/* Divider */}
              <div className="my-10 border-b-2 border-black" />

              {/* Answer Key */}
              {assignment.answerKey && assignment.answerKey.length > 0 && (
                <div className="space-y-6 break-before-page">
                  <h2 className="text-xl font-bold font-sans">Answer Key:</h2>
                  <div className="space-y-4">
                    {assignment.answerKey.map((key, kIdx) => (
                      <div key={kIdx} className="flex gap-2">
                        <span className="font-medium shrink-0">{key.questionNumber}.</span>
                        <p>{key.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Edit Button */}
      {!isLoading && !isRegenerating && assignment && (
        <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col gap-4 items-end">
          {isEditMode && (
            <Button
              onClick={handleRegenerate}
              disabled={feedbacks.length === 0}
              className="bg-veda text-white inset-shadow-sm inset-shadow-white hover:bg-veda/90 rounded-full px-6 py-5 text-base font-semibold shadow-2xl flex items-center"
            >
              <ArrowCounterClockwiseIcon size={20} />
              Regenerate
            </Button>
          )}
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            className="rounded-full shadow-2xl text-white hover:bg-veda/90 px-6 py-5 inset-shadow-sm inset-shadow-white text-base font-semibold flex items-center gap-2 relative"
          >
            {!isEditMode && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ">
                New
              </span>
            )}
            {isEditMode ? (
              <>
                <XIcon size={20} /> Cancel Edit
              </>
            ) : (
              <>
                <PencilSimpleIcon size={20} /> Edit Paper
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

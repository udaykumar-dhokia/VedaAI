"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  SquaresFourIcon,
  BellIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { RootState } from "@/store/store";
import { Assignment } from "@/store/slices/assignment.slice";
import axiosClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AssignmentViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user } = useSelector((state: RootState) => state.admin);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="flex h-full w-full flex-col print:bg-white print:m-0 print:p-0">
      <header className="flex items-center justify-between border-b border-border/40 bg-white px-6 py-3 mt-2 rounded-xl mr-2 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-veda-back"
          >
            <ArrowLeftIcon size={20} weight="bold" />
          </button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <SquaresFourIcon size={18} weight="fill" />
            <span className="text-muted-foreground">Assignment</span>
            <span>/</span>
            <span className="text-foreground">View</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-veda-back">
            <BellIcon size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/avatar.png"
              alt="Avatar"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{user?.name || "User"}</span>
            <CaretDownIcon size={14} className="text-foreground/50" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center print:p-0 print:overflow-visible">
        {isLoading ? (
          <div className="w-full max-w-4xl space-y-6 print:hidden">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-200 w-full rounded-2xl" />
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
              <Button
                variant="secondary"
                className="rounded-full bg-white text-zinc-900 font-semibold px-6 h-11 hover:bg-gray-100 whitespace-nowrap"
                onClick={handlePrint}
              >
                <DownloadSimpleIcon size={18} className="mr-2" /> Download as PDF
              </Button>
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
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SquaresFourIcon,
  CloudArrowUpIcon,
  CalendarBlankIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
  PlusCircleIcon,
  MicrophoneIcon,
  CaretRightIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosClient from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/custom/header";
import { Button } from "@/components/ui/button";

export default function CreateAssignmentPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questionConfigs, setQuestionConfigs] = useState([
    { id: "1", type: "Multiple Choice Questions", numberQuestions: 4, marksPerQuestion: 1 },
    { id: "2", type: "Short Questions", numberQuestions: 3, marksPerQuestion: 2 },
    { id: "3", type: "Diagram/Graph-Based Questions", numberQuestions: 5, marksPerQuestion: 5 },
    { id: "4", type: "Numerical Problems", numberQuestions: 5, marksPerQuestion: 5 },
  ]);

  const handleUpdateConfig = (id: string, field: string, value: string | number) => {
    setQuestionConfigs((configs) =>
      configs.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeConfig = (id: string) => {
    setQuestionConfigs((configs) => configs.filter((c) => c.id !== id));
  };

  const addConfig = () => {
    setQuestionConfigs([
      ...questionConfigs,
      {
        id: Date.now().toString(),
        type: "Multiple Choice Questions",
        numberQuestions: 1,
        marksPerQuestion: 1,
      },
    ]);
  };

  const totalQuestions = questionConfigs.reduce((acc, curr) => acc + curr.numberQuestions, 0);
  const totalMarks = questionConfigs.reduce(
    (acc, curr) => acc + curr.numberQuestions * curr.marksPerQuestion,
    0
  );

  const handleNextToStep2 = () => {
    if (!title.trim() || !subject.trim() || !studentClass.trim()) {
      toast.error("Please enter a title, subject, and class for the assignment.");
      return;
    }
    if (questionConfigs.length === 0) {
      toast.error("Please add at least one question type.");
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        title,
        subject,
        class: studentClass,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        additionalInstructions,
        questionConfigs: questionConfigs.map(({ type, numberQuestions, marksPerQuestion }) => ({
          type,
          numberQuestions,
          marksPerQuestion,
        })),
      };

      const response = await axiosClient.post("/assignments/generate", payload);
      const jobId = response.data.jobId;

      setStep(4);

      const interval = setInterval(async () => {
        try {
          const statusRes = await axiosClient.get(`/assignments/status/${jobId}`);
          if (statusRes.data.status === "completed") {
            clearInterval(interval);
            toast.success("Assignment created successfully!");
            router.push(`/assignments/${statusRes.data.assignmentId}`);
          } else if (statusRes.data.status === "failed") {
            clearInterval(interval);
            toast.error(statusRes.data.error || "Failed to create assignment.");
            setIsSubmitting(false);
            setStep(3);
          }
        } catch {
          clearInterval(interval);
          toast.error("Error checking job status.");
          setIsSubmitting(false);
          setStep(3);
        }
      }, 3000);
    } catch (error) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to start assignment generation."
      );
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div>
            <Label className="text-sm font-semibold mb-2 block">Assignment Title</Label>
            <Input
              placeholder="Enter assignment title"
              className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-veda shadow-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Subject</Label>
              <Input
                placeholder="Enter subject (e.g. English)"
                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-veda shadow-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Class</Label>
              <Input
                placeholder="Enter class (e.g. 5th, 8th)"
                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-veda shadow-none"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="hidden md:flex items-center gap-4 mb-3 text-sm font-semibold">
              <div className="flex-1">Question Type</div>
              <div className="flex items-center gap-4">
                <div className="w-28 text-center">No. of Questions</div>
                <div className="w-28 text-center">Marks</div>
                <div className="w-5"></div>
              </div>
            </div>
            <Label className="md:hidden text-sm font-semibold mb-3 block">Question Type</Label>

            {questionConfigs.map((q) => (
              <div
                key={q.id}
                className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4 md:mb-3 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-gray-100 md:border-none shadow-sm md:shadow-none"
              >
                <div className="flex items-center gap-3 md:flex-1">
                  <div className="flex-1">
                    <Select
                      value={q.type}
                      onValueChange={(val) => handleUpdateConfig(q.id, "type", val)}
                    >
                      <SelectTrigger className="rounded-xl h-11 bg-gray-50 md:bg-white border-gray-200 focus:ring-1 focus:ring-veda shadow-none">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Multiple Choice Questions">
                          Multiple Choice Questions
                        </SelectItem>
                        <SelectItem value="Short Questions">Short Questions</SelectItem>
                        <SelectItem value="Diagram/Graph-Based Questions">
                          Diagram/Graph-Based Questions
                        </SelectItem>
                        <SelectItem value="Numerical Problems">Numerical Problems</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={() => removeConfig(q.id)}
                    className="md:hidden text-gray-400 hover:text-black flex items-center justify-center p-2"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                </div>

                <div className="flex items-center gap-3 justify-between md:justify-start">
                  <div className="flex-1 md:w-28 flex flex-col gap-1.5">
                    <span className="md:hidden text-xs font-semibold text-center text-zinc-600">
                      No. of Questions
                    </span>
                    <div className="flex items-center justify-between bg-gray-50 md:bg-white rounded-full px-3 h-11 border border-gray-200 shadow-none">
                      <button
                        onClick={() =>
                          handleUpdateConfig(
                            q.id,
                            "numberQuestions",
                            Math.max(1, q.numberQuestions - 1)
                          )
                        }
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <MinusIcon size={14} weight="bold" />
                      </button>
                      <span className="font-semibold text-sm">{q.numberQuestions}</span>
                      <button
                        onClick={() =>
                          handleUpdateConfig(q.id, "numberQuestions", q.numberQuestions + 1)
                        }
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <PlusIcon size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 md:w-28 flex flex-col gap-1.5">
                    <span className="md:hidden text-xs font-semibold text-center text-zinc-600">
                      Marks
                    </span>
                    <div className="flex items-center justify-between bg-gray-50 md:bg-white rounded-full px-3 h-11 border border-gray-200 shadow-none">
                      <button
                        onClick={() =>
                          handleUpdateConfig(
                            q.id,
                            "marksPerQuestion",
                            Math.max(1, q.marksPerQuestion - 1)
                          )
                        }
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <MinusIcon size={14} weight="bold" />
                      </button>
                      <span className="font-semibold text-sm">{q.marksPerQuestion}</span>
                      <button
                        onClick={() =>
                          handleUpdateConfig(q.id, "marksPerQuestion", q.marksPerQuestion + 1)
                        }
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <PlusIcon size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeConfig(q.id)}
                    className="hidden md:flex text-gray-400 hover:text-black transition-colors w-5 justify-center"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addConfig}
              className="flex items-center gap-2 mt-4 text-sm font-semibold hover:text-black text-gray-800 transition-colors"
            >
              <PlusCircleIcon size={20} weight="fill" className="text-zinc-800" /> Add Question Type
            </button>

            <div className="text-right mt-6 text-sm font-semibold space-y-1">
              <p>Total Questions : {totalQuestions}</p>
              <p>Total Marks : {totalMarks}</p>
            </div>
          </div>

          <div>
            <Label className="font-semibold mb-2 block">
              Additional Information (For better output)
            </Label>
            <div className="relative">
              <Textarea
                className="min-h-25 rounded-xl bg-gray-50 border-gray-200 resize-none pb-10 focus-visible:ring-1 focus-visible:ring-veda shadow-none"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
              />
              <button className="absolute bottom-3 right-3 text-gray-500 hover:text-black transition-colors bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                <MicrophoneIcon size={18} weight="fill" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (step === 2) {
      return (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div>
            <Label className="text-sm font-semibold mb-2 block">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between rounded-xl h-11 border-gray-200 bg-gray-50 font-normal hover:bg-gray-100 shadow-none",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  {dueDate ? format(dueDate, "dd-MM-yyyy") : "DD-MM-YYYY"}
                  <CalendarBlankIcon size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Reference File (Optional)</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
              <CloudArrowUpIcon size={28} className="mb-2 text-foreground" />
              <p className="font-semibold text-sm">Choose a file or drag & drop it here</p>
              <p className="text-xs text-muted-foreground mb-4">JPEG, PNG, upto 10MB</p>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full bg-gray-100 hover:bg-gray-200 text-foreground font-medium px-4"
              >
                Browse Files
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (step === 3) {
      return (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 text-zinc-900 border-b border-gray-200 pb-2">
              Assignment Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Title</span>
                <span className="font-medium text-base">{title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block mb-1">Subject</span>
                  <span className="font-medium text-base">{subject}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Class</span>
                  <span className="font-medium text-base">{studentClass}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">Due Date</span>
                <span className="font-medium text-base">
                  {dueDate ? format(dueDate, "dd MMM yyyy") : "Not set"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block mb-2">Question Types</span>
                <div className="space-y-2 bg-white rounded-xl border border-gray-100 p-3">
                  {questionConfigs.map((q) => (
                    <div key={q.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{q.type}</span>
                      <span className="text-muted-foreground">
                        {q.numberQuestions} Qs × {q.marksPerQuestion} Marks
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center font-semibold text-zinc-900">
                    <span>Total</span>
                    <span>
                      {totalQuestions} Qs, {totalMarks} Marks
                    </span>
                  </div>
                </div>
              </div>

              {additionalInstructions && (
                <div>
                  <span className="text-muted-foreground block mb-1">Additional Instructions</span>
                  <p className="font-medium text-base bg-white rounded-xl border border-gray-100 p-3 italic">
                    &quot;{additionalInstructions}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (step === 4) {
      return (
        <motion.div
          key="step4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 w-full p-4"
        >
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
              Generating your assignment using AI...
            </p>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Header
        breadcrumb={
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <SquaresFourIcon size={18} weight="fill" />
            <span className="text-muted-foreground">Assignment</span>
            <span>/</span>
            <span className="text-foreground">Create</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 max-w-4xl mx-auto w-full"
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-bold">Create Assignment</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up a new assignment for your students
          </p>
        </motion.div>

        <div className="mb-8 w-full max-w-4xl mx-auto bg-zinc-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-zinc-600 h-full rounded-full"
            initial={false}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 shadow-sm mb-6 w-full"
        >
          <h2 className="text-xl font-bold mb-1">
            {step === 1 && "Assignment Details"}
            {step === 2 && "File & Schedule"}
            {step === 3 && "Review & Generate"}
            {step === 4 && "Generating Assignment"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {step === 1 && "Basic information about your assignment"}
            {step === 2 && "Provide reference materials and deadlines"}
            {step === 3 && "Review your assignment configuration before generation"}
            {step === 4 && "Please wait while our AI creates your exam paper."}
          </p>

          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </motion.div>

        <div
          className={cn(
            "flex items-center justify-between bg-transparent pb-6 pt-2 max-w-4xl mx-auto w-full mt-auto",
            step === 4 ? "hidden" : ""
          )}
        >
          <Button
            variant="outline"
            className="rounded-full px-6 bg-white border-gray-200 h-11"
            onClick={() => {
              if (step === 1) router.back();
              else setStep(step - 1);
            }}
          >
            <ArrowLeftIcon size={16} className="mr-2" /> Previous
          </Button>

          {step < 3 ? (
            <Button
              className="rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800 h-11"
              onClick={() => {
                if (step === 1) handleNextToStep2();
                else if (step === 2) handleNextToStep3();
              }}
            >
              Next <ArrowRightIcon size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="rounded-full px-8 bg-veda text-white hover:bg-veda/90 h-11 shadow-sm shadow-veda/20"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Generating..."
              ) : (
                <>
                  Generate <CaretRightIcon size={16} weight="fill" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { SquaresFourIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import axiosClient from "@/lib/api";
import { RootState } from "@/store/store";
import {
  setAssignments,
  removeAssignment,
  setAssignmentLoading,
  setSearchQuery,
} from "@/store/slices/assignment.slice";
import { AssignmentCard } from "@/components/custom/assignment-card";
import { Header } from "@/components/custom/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";

export default function AssignmentsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { assignments, isLoading, searchQuery } = useSelector(
    (state: RootState) => state.assignment
  );
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        dispatch(setAssignmentLoading(true));
        const response = await axiosClient.get("/assignments");
        dispatch(setAssignments(response.data));
      } catch {
        toast.error("Failed to load assignments");
        dispatch(setAssignments([]));
      }
    };

    fetchAssignments();
  }, [dispatch]);

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments;
    return assignments.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [assignments, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/assignments/${id}`);
      dispatch(removeAssignment(id));
      toast.success("Assignment deleted successfully");
    } catch {
      toast.error("Failed to delete assignment");
    }
  };

  const handleView = (id: string) => {
    router.push(`/assignments/${id}`);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Header
        breadcrumb={
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <SquaresFourIcon size={18} weight="fill" />
            <span>Assignment</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-bold">Assignments</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and create assignments for your classes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4 flex items-center justify-between gap-4 bg-white p-2 rounded-xl"
        >
          <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-veda-back">
            <FunnelIcon size={16} />
            Filter By
          </button>
          <div className="relative w-64">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="h-9 bg-white pl-9 rounded-full py-5"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {filteredAssignments.map((assignment, index) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  index={index}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Image
              src="/empty-assignments.png"
              alt="No assignments"
              width={240}
              height={240}
              className="mb-6"
            />
            <h2 className="text-xl font-semibold">No assignments yet</h2>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Create your first assignment to start collecting and grading student submissions. You
              can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <Button
              size="lg"
              className="py-5 inset-shadow-sm  inset-shadow-white mt-6 rounded-full px-6"
              onClick={() => router.push("/assignments/create")}
            >
              <PlusIcon size={18} weight="bold" />
              Create Your First Assignment
            </Button>
          </motion.div>
        )}
      </div>

      {filteredAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="sticky bottom-0 flex justify-center border-t border-border/40 bg-linear-to-t from-veda-back to-veda-back/80 py-4 backdrop-blur-sm"
        >
          <Button
            size="lg"
            className="rounded-full px-6 shadow-lg py-5 inset-shadow-sm inset-shadow-white"
            onClick={() => router.push("/assignments/create")}
          >
            <PlusIcon size={18} weight="bold" />
            Create Assignment
          </Button>
        </motion.div>
      )}
    </div>
  );
}

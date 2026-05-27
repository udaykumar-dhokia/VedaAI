"use client";

import { motion } from "framer-motion";
import { DotsThreeVerticalIcon, EyeIcon, TrashIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Assignment } from "@/store/slices/assignment.slice";

interface AssignmentCardProps {
  assignment: Assignment;
  index: number;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function AssignmentCard({ assignment, index, onView, onDelete }: AssignmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-foreground pr-6">{assignment.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity duration-200 hover:bg-veda-back group-hover:opacity-100 focus:opacity-100">
              <DotsThreeVerticalIcon size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => onView(assignment._id)}
              className="cursor-pointer gap-2 py-2"
            >
              <EyeIcon size={16} />
              View Assignment
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(assignment._id)}
              className="cursor-pointer gap-2 py-2"
            >
              <TrashIcon size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 mb-2 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {assignment.subject && (
          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600">
            {assignment.subject}
          </span>
        )}
        {assignment.class && (
          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600">
            Class {assignment.class}
          </span>
        )}
        {assignment.totalMarks !== undefined && (
          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600">
            {assignment.totalMarks} Marks
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between text-sm text-muted-foreground gap-2">
        <span>
          <span className="font-medium text-foreground/70">Assigned on</span> :{" "}
          {formatDate(assignment.createdAt)}
        </span>
        {assignment.dueDate && (
          <span>
            <span className="font-medium text-foreground/70">Due</span> :{" "}
            {formatDate(assignment.dueDate)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

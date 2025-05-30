// Shared types for applicant view components
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";

export interface ApplicantViewProps {
  application: JobApplicationWithJobDataInterface;
  applicationStatus: JobApplicationStatus;
  onStatusChange: (status: JobApplicationStatus) => void;
  possibleStatuses: JobApplicationStatus[];
  statusLoading: boolean;
}

export interface StatusChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplicationWithJobDataInterface | null;
  newStatus: JobApplicationStatus | null;
  onConfirm: () => void;
  statusLoading: boolean;
  onCancel: () => void;
}

export interface MockInterviewData {
  scheduledDate: Date;
  duration: number;
  meetingLink: string;
  additionalNotes: string;
}

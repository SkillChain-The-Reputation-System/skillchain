import ScheduleMeetingForm from "@/features/meetings/schedule-meeting-form";
import { pageUrlMapping } from "@/constants/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function ScheduleMeetingPage() {

  return (
    <div>
      <Link
        href={pageUrlMapping.recruiter_meetings}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-2")}
      >
        <ArrowLeftIcon /> Back to Meetings
      </Link>

      <ScheduleMeetingForm />
    </div>
  )
}
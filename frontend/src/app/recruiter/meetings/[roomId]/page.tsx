import MeetingRoom from "@/features/meetings/meeting-room";
import { pageUrlMapping } from "@/constants/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default async function MeetingRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <div>
      <Link
        href={pageUrlMapping.recruiter_meetings}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-2")}
      >
        <ArrowLeftIcon /> Back to Meetings
      </Link>

      <MeetingRoom roomId={roomId} />
    </div>
  );
}
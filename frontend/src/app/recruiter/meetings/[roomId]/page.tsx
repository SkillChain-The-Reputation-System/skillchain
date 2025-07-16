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
        className="flex gap-2 items-center mb-2 text-primary hover:underline hover:underline-offset-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Meetings
      </Link>

      <MeetingRoom roomId={roomId} />
    </div>
  );
}
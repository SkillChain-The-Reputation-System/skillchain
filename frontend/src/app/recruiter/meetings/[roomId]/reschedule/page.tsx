import RescheduleMeetingForm from "@/features/meetings/reschedule-meeting-form";

export default async function RescheduleMeetingPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <RescheduleMeetingForm meeting_id={roomId} />
  );
}
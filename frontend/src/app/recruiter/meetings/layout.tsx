export const metadata = {
  title: "Recruiter | Meetings",
  description: "Manage and schedule meetings with candidates.",
};

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>{children}</div>
  );
}

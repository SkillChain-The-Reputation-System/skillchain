export const metadata = {
  title: "Career | My Applications",
  description: "View and manage your job applications.",
};

export default function AvailableJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4">{children}</div>;
}

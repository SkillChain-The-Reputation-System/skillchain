export const metadata = {
  title: "Career | Available Jobs",
  description: "Browse and apply for open job positions.",
};

export default function AvailableJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4">{children}</div>;
}

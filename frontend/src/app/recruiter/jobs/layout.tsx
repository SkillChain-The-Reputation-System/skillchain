export const metadata = {
  title: "Recruiter | Jobs",
  description: "Manage and review job postings.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4">{children}</div>;
}

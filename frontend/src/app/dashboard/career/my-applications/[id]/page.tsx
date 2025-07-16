
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";
import ApplicationDetailContainer from "@/features/jobs-on-user/application-details/application-detail-container";

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  return (
    <div>
      <Link
        href={pageUrlMapping.career_my_applications}
        className="flex gap-2 items-center mb-4 text-primary hover:underline hover:underline-offset-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to My Applications
      </Link>
      <ApplicationDetailContainer />
    </div>
  );
}

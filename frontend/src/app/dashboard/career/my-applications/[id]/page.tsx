import ApplicationDetailContainer from "@/features/jobs-on-user/application-details/application-detail-container";

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  return <ApplicationDetailContainer />;
}

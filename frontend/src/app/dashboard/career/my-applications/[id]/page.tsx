import ApplicationDetailContainer from "@/features/jobs-on-user/application-details/application-detail-container";

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return <ApplicationDetailContainer />;
}

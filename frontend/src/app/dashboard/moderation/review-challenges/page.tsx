import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import JoinedChallengesView from "@/features/moderation/joined-challenges-view";

export default async function Page() {
  return (
    <div>
      <PageHeader
        title="Review Challenge"
        description="Inspect full challenge details, assign difficulty and quality ratings, add comments, and cast moderation vote for approval, rejection, or revision."
      ></PageHeader>

      <Separator className="my-6" />
      <JoinedChallengesView />
    </div>
  );
}

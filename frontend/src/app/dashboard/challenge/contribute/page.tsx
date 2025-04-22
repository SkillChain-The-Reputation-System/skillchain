import { Separator } from "@/components/ui/separator";
import ContributeChallengeForm from "@/features/challenge/contribute-challenge-form";

export default async function Page() {
  return (
    <main>
      <div className="flex flex-col px-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold">Contribute new challenge</h1>
            <p className="text-sm text-muted-foreground">Share your knowledge with the community by creating a new challenge. Well-crafted contributions will help others grow - and grow your own reputation in return.</p>
          </div>
        </div>

        <Separator className="my-6" />

        <ContributeChallengeForm />
      </div>
    </main>
  );
}
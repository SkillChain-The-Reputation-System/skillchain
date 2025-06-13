import { Separator } from "@/components/ui/separator";
import { CreateChallengeForm } from "@/features/contribution/create-challenge-form";

export default function CreateChallengePage() {
  return (
    <div className="flex flex-col px-12">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold">Create new challenge</h1>
          <p className="text-sm text-muted-foreground">
            Share your knowledge with the community by creating a new challenge.
            Well-crafted contributions will help others grow - and grow your own
            reputation in return.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <CreateChallengeForm />
    </div>
  );
}

import { Separator } from "@/components/ui/separator";
import { EditChallengeForm } from "@/features/contribution/edit-challenge-form";

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: `0x${string}` }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col px-12">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold">Edit your challenge</h1>
          <p className="text-sm text-muted-foreground">
            Refine your contribution to ensure clarity and quality. Well-edited
            challenges make a bigger impact, helping others learn while
            enhancing your own reputation.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <EditChallengeForm id={id}/>
    </div>
  );
}

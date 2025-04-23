import { MyContributionsPreview } from "@/features/challenge/my-contributions-preview";
import { Separator } from "@radix-ui/react-separator";

export default async function Page() {
  return (
    <main>
      <div className="flex flex-col px-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold">My Contributions</h1>
          </div>
        </div>

        <Separator className="my-6" />

        <MyContributionsPreview />
      </div>
    </main>
  );
}
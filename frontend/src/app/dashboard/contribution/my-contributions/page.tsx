import { MyContributionsPreview } from "@/features/contribution/my-contributions-preview";
import { Separator } from "@radix-ui/react-separator";

export default async function Page() {
  return (
    <main>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-6">My Contributions</h1>

      <Separator className="my-6" />

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <MyContributionsPreview />
      </div>
    </main>
  );
}
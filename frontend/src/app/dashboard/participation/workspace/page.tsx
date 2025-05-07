import Workspace from "@/features/participation/workspace";

export default async function Page() {
  return (
    <div>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-3">Work on your solution!</h1>

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <Workspace />
      </div>
    </div>
  );
}
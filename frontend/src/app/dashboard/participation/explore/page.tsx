import Explore from "@/features/participation/explore";

export default async function Page() {
  return (
    <div>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-3">Grow your reputation!</h1>

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <Explore />
      </div>
    </div>
  );
}
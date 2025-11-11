import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <Spinner size="lg" />
    </div>
  );
}
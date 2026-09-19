import { Inbox } from "lucide-react";

interface ResumeEmptyStateProps {
  title: string;
  description: string;
}

export default function ResumeEmptyState({ title, description }: ResumeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#1D3B52] bg-[#102A40] px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-[#4F7CFF]" strokeWidth={1.5} />
      <p className="mt-3 text-sm font-semibold text-[#F8FAFC]">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-[#9FB3C8]">{description}</p>
    </div>
  );
}

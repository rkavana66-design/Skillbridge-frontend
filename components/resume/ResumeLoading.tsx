export default function ResumeLoading() {
  return (
    <div className="min-h-screen bg-[#061522] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-48 rounded-xl bg-[#0A2033] lg:col-span-2" />
          <div className="h-48 rounded-xl bg-[#0A2033]" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="h-72 rounded-xl bg-[#0A2033]" />
            <div className="h-56 rounded-xl bg-[#0A2033]" />
            <div className="h-56 rounded-xl bg-[#0A2033]" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-64 rounded-xl bg-[#0A2033]" />
            <div className="h-40 rounded-xl bg-[#0A2033]" />
            <div className="h-40 rounded-xl bg-[#0A2033]" />
          </div>
        </div>
      </div>
    </div>
  );
}

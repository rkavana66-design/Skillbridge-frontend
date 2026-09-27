export default function PageGlow() {
  return (
    <>
      <div
        aria-hidden
        className="glow-orb animate-float-slow -left-32 top-[-80px] h-96 w-96 bg-gradient-to-br from-indigo-500 to-transparent"
      />
      <div
        aria-hidden
        className="glow-orb animate-float-slower right-[-100px] top-1/3 h-[420px] w-[420px] bg-gradient-to-br from-verdant-500 to-transparent"
      />
      <div
        aria-hidden
        className="glow-orb animate-float-slow left-1/4 bottom-[-120px] h-80 w-80 bg-gradient-to-br from-amber-400 to-transparent"
        style={{ animationDelay: "-4s" }}
      />
    </>
  );
}

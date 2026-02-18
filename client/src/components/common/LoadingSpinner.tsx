export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f2f4fc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#c1a0fd] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#5c5c6f] font-medium">Chargement...</p>
      </div>
    </div>
  );
}

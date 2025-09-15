export default function LoadingSpinner() {
  return (
   <div className="w-screen h-screen flex justify-center items-center bg-black/70">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#FF742C]"></div>
        </div>
      </div>
  );
}

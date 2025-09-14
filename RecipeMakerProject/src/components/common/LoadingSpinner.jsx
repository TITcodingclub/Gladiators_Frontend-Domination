export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className="w-12 h-12 border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent rounded-full animate-spin"
        style={{ borderTopColor: "#22c55e", borderRightColor: "#22c55e" }}
      />
    </div>
  );
}

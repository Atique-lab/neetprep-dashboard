export default function Header() {
  return (
    <div className="flex justify-between items-center mb-6">

      <input
        type="text"
        placeholder="Search anything..."
        className="px-4 py-2 border rounded-lg w-72"
      />

      <div className="text-sm text-gray-500">
        Welcome back Sir! 
      </div>

    </div>
  );
}
function DashboardStats({ title, icon, value, description }) {
  // Always use red for icon and value
  const COLORS = ["#df1f47", "#df1f47"];

  const getDescStyle = () => {
    if (description.includes("↗︎")) return "font-bold text-green-700 dark:text-green-300";
    else if (description.includes("↙")) return "font-bold text-rose-500 dark:text-red-400";
    else return "text-gray-500 dark:text-gray-400";
  };

  return (
    <div className="w-full">
      <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 h-full transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fff0f4]">
            <span className="text-2xl" style={{ color: COLORS[0] }}>{icon}</span>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">{title}</div>
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: COLORS[0] }}>{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
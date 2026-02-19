interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: "blue" | "green" | "orange" | "red";
}

const accentClasses = {
  blue:   "text-blue-400",
  green:  "text-green-400",
  orange: "text-orange-400",
  red:    "text-red-400",
};

export function StatCard({ label, value, unit, sub, accent = "blue" }: StatCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`text-3xl font-bold ${accentClasses[accent]}`}>
        {value}
        {unit && <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

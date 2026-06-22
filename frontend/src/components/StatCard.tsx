
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string; // CSS custom-property name like "var(--color-success)"
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-body">
        <span className="stat-value">{value.toLocaleString()}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

import { getStatusLabel } from '../utils/helpers';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {getStatusLabel(status)}
    </span>
  );
}

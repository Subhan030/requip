import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, maskAadhaar, maskPAN } from '../utils/helpers';
import type { User } from '../types';

interface UserDetailPageProps {
  user: User;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export function UserDetailPage({ user, onClose, onEdit }: UserDetailPageProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => userApi.delete(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showToast('User deleted successfully', 'success');
      onClose();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const restoreMutation = useMutation({
    mutationFn: () => userApi.restore(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showToast('User restored successfully', 'success');
      onClose();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const isDeleted = !!user.deletedAt;

  function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value || '—'}</span>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel modal-panel-wide">
        <div className="modal-header">
          <div className="modal-header-user">
            <div className="avatar avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="modal-title">{user.name}</h2>
              <p className="modal-subtitle">{user.email}</p>
            </div>
          </div>
          <button id="btn-close-detail" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3 className="detail-section-title">Personal Information</h3>
            <DetailRow label="Full Name" value={user.name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Date of Birth" value={formatDate(user.dateOfBirth)} />
            <DetailRow label="Place of Birth" value={user.placeOfBirth} />
            <DetailRow label="Status" value={<StatusBadge status={user.status} />} />
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Contact Details</h3>
            <DetailRow label="Primary Mobile" value={user.primaryMobile} />
            <DetailRow label="Secondary Mobile" value={user.secondaryMobile} />
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">KYC Documents</h3>
            <DetailRow label="Aadhaar" value={<span className="mono">{maskAadhaar(user.aadhaar)}</span>} />
            <DetailRow label="PAN" value={<span className="mono">{maskPAN(user.pan)}</span>} />
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Address</h3>
            <DetailRow label="Current Address" value={user.currentAddress} />
            <DetailRow label="Permanent Address" value={user.permanentAddress} />
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">System Info</h3>
            <DetailRow label="User ID" value={<span className="mono text-xs">{user.id}</span>} />
            <DetailRow label="Version" value={`v${user.version}`} />
            <DetailRow label="Created By" value={user.createdBy} />
            <DetailRow label="Updated By" value={user.updatedBy} />
            <DetailRow label="Created At" value={formatDate(user.createdAt)} />
            <DetailRow label="Updated At" value={formatDate(user.updatedAt)} />
            {isDeleted && <DetailRow label="Deleted At" value={<span className="error-text">{formatDate(user.deletedAt)}</span>} />}
          </div>
        </div>

        <div className="modal-footer">
          {!isDeleted && (
            <>
              {confirmDelete ? (
                <div className="confirm-delete">
                  <span>Are you sure you want to delete this user?</span>
                  <button
                    id="btn-confirm-delete"
                    className="btn btn-danger"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button id="btn-delete-user" className="btn btn-danger-outline" onClick={() => setConfirmDelete(true)}>
                    🗑 Delete
                  </button>
                  <button id="btn-edit-user-detail" className="btn btn-primary" onClick={() => onEdit(user)}>
                    ✏️ Edit
                  </button>
                </>
              )}
            </>
          )}
          {isDeleted && (
            <button
              id="btn-restore-user"
              className="btn btn-primary"
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Restoring…' : '↩ Restore User'}
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

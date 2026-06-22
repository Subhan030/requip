import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types';

interface UserFormPageProps {
  user?: User | null; // null = create mode
  onClose: () => void;
}

type FormValues = CreateUserPayload & {
  status?: 'active' | 'inactive' | 'suspended';
};

export function UserFormPage({ user, onClose }: UserFormPageProps) {
  const isEdit = !!user;
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      primaryMobile: '',
      secondaryMobile: '',
      aadhaar: '',
      pan: '',
      dateOfBirth: '',
      placeOfBirth: '',
      currentAddress: '',
      permanentAddress: '',
      status: 'active',
    },
  });

  // Pre-fill when editing
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        primaryMobile: user.primaryMobile,
        secondaryMobile: user.secondaryMobile ?? '',
        aadhaar: user.aadhaar,
        pan: user.pan,
        dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
        placeOfBirth: user.placeOfBirth,
        currentAddress: user.currentAddress,
        permanentAddress: user.permanentAddress,
        status: user.status,
      });
    }
  }, [user, reset]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showToast('User created successfully!', 'success');
      onClose();
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => userApi.update(user!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showToast('User updated successfully!', 'success');
      onClose();
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });

  const onSubmit = (values: FormValues) => {
    // Strip empty-string optional fields so @IsOptional on the backend skips them
    const clean = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ) as FormValues;

    if (isEdit) {
      updateMutation.mutate(clean);
    } else {
      const { status: _s, ...createPayload } = clean;
      createMutation.mutate(createPayload);
    }
  };

  const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button id="btn-close-modal" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="user-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-section-label">Personal Information</div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="f-name">Full Name *</label>
              <input
                id="f-name"
                type="text"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                placeholder="e.g. Rahul Sharma"
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-email">Email Address *</label>
              <input
                id="f-email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
                placeholder="e.g. rahul@example.com"
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-dob">Date of Birth *</label>
              <input
                id="f-dob"
                type="date"
                {...register('dateOfBirth', { required: 'Date of birth is required' })}
              />
              {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-pob">Place of Birth *</label>
              <input
                id="f-pob"
                type="text"
                {...register('placeOfBirth', { required: 'Place of birth is required' })}
                placeholder="e.g. Mumbai"
              />
              {errors.placeOfBirth && <span className="field-error">{errors.placeOfBirth.message}</span>}
            </div>
          </div>

          <div className="form-section-label">Contact Details</div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="f-mobile1">Primary Mobile *</label>
              <input
                id="f-mobile1"
                type="tel"
                {...register('primaryMobile', {
                  required: 'Primary mobile is required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                })}
                placeholder="e.g. 9876543210"
                maxLength={10}
              />
              {errors.primaryMobile && <span className="field-error">{errors.primaryMobile.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-mobile2">Secondary Mobile</label>
              <input
                id="f-mobile2"
                type="tel"
                {...register('secondaryMobile', {
                  pattern: { value: /^([6-9]\d{9})?$/, message: 'Enter a valid 10-digit Indian mobile number' },
                })}
                placeholder="Optional"
                maxLength={10}
              />
              {errors.secondaryMobile && <span className="field-error">{errors.secondaryMobile.message}</span>}
            </div>
          </div>

          <div className="form-section-label">KYC Documents</div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="f-aadhaar">Aadhaar Number *</label>
              <input
                id="f-aadhaar"
                type="text"
                {...register('aadhaar', {
                  required: 'Aadhaar is required',
                  pattern: { value: /^\d{12}$/, message: 'Enter a valid 12-digit Aadhaar number' },
                })}
                placeholder="12-digit Aadhaar"
                maxLength={12}
              />
              {errors.aadhaar && <span className="field-error">{errors.aadhaar.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-pan">PAN Number *</label>
              <input
                id="f-pan"
                type="text"
                {...register('pan', {
                  required: 'PAN is required',
                  pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Enter a valid PAN (e.g. ABCDE1234F)' },
                  onChange: (e) => { e.target.value = e.target.value.toUpperCase(); },
                })}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.pan && <span className="field-error">{errors.pan.message}</span>}
            </div>
          </div>

          <div className="form-section-label">Address</div>

          <div className="form-grid form-grid-1col">
            <div className="form-field">
              <label htmlFor="f-addr-current">Current Address *</label>
              <textarea
                id="f-addr-current"
                rows={3}
                {...register('currentAddress', { required: 'Current address is required' })}
                placeholder="Full current address…"
              />
              {errors.currentAddress && <span className="field-error">{errors.currentAddress.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="f-addr-perm">Permanent Address *</label>
              <textarea
                id="f-addr-perm"
                rows={3}
                {...register('permanentAddress', { required: 'Permanent address is required' })}
                placeholder="Full permanent address…"
              />
              {errors.permanentAddress && <span className="field-error">{errors.permanentAddress.message}</span>}
            </div>
          </div>

          {/* Status — only shown while editing */}
          {isEdit && (
            <>
              <div className="form-section-label">Account Status</div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="f-status">Status</label>
                  <select id="f-status" {...register('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="modal-footer">
            <button id="btn-cancel-form" type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button id="btn-submit-form" type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

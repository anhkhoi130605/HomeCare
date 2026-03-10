import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';

const AddCaregiverModal = ({ isOpen, onClose, onSuccess, caregiverToEdit }) => {
    const isEditMode = !!caregiverToEdit;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialState = {
        email: '',
        password: '',
        phone: '',
        fullName: '',
        specialization: '',
        experienceYears: 0,
        hourlyRate: 0,
        imageUrl: '',
        bio: '',
        isAvailable: true
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (caregiverToEdit) {
            setFormData({
                email: caregiverToEdit.email || '',
                password: '', // Password not editable here
                phone: caregiverToEdit.phone || '',
                fullName: caregiverToEdit.fullName || '',
                specialization: caregiverToEdit.specialization || '',
                experienceYears: caregiverToEdit.experienceYears || 0,
                hourlyRate: caregiverToEdit.hourlyRate || 0,
                imageUrl: caregiverToEdit.imageUrl || '',
                bio: caregiverToEdit.bio || '',
                isAvailable: caregiverToEdit.status === 'Online' || caregiverToEdit.status === 'On-Duty'
            });
        } else {
            setFormData(initialState);
        }
    }, [caregiverToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (isEditMode) {
                result = await adminApi.updateCaregiver(caregiverToEdit.id, formData);
            } else {
                result = await adminApi.createCaregiver(formData);
            }
            onSuccess?.(result);
            onClose();
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} caregiver`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-background flex items-center justify-between p-6 border-b z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            {isEditMode ? <Edit className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{isEditMode ? 'Edit Caregiver Profile' : 'Add New Caregiver'}</h2>
                            <p className="text-sm text-muted-foreground">{isEditMode ? 'Update caregiver information' : 'Create a new caregiver account'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Nguyen Van A"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isEditMode}
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="0901234567"
                            />
                        </div>

                        {!isEditMode && (
                            <div className="col-span-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                                id="specialization"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="e.g. Elderly Care"
                            />
                        </div>

                        <div>
                            <Label htmlFor="experienceYears">Experience (Years)</Label>
                            <Input
                                id="experienceYears"
                                name="experienceYears"
                                type="number"
                                min="0"
                                value={formData.experienceYears}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="hourlyRate">Hourly Rate (VND)</Label>
                            <Input
                                id="hourlyRate"
                                name="hourlyRate"
                                type="number"
                                min="0"
                                step="10000"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                placeholder="150000"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="imageUrl">Profile Image URL</Label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="bio">Bio</Label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Brief description about the caregiver..."
                            />
                        </div>

                        {isEditMode && (
                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="isAvailable" className="cursor-pointer">Available for Work (Online)</Label>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {isEditMode ? 'Update Caregiver' : 'Add Caregiver'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCaregiverModal;

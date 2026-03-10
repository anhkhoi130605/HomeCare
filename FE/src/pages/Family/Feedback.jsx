import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Send, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { feedbackApi, familyApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollAnimation from "@/components/ui/scroll-animation";

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [selectedCaregiver, setSelectedCaregiver] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [myFeedbacks, schedulesData] = await Promise.all([
                feedbackApi.getMyFeedbacks().catch(() => []),
                familyApi.getSchedules().catch(() => [])
            ]);
            setFeedbacks(myFeedbacks || []);

            // Extract unique caregivers from schedules
            const caregiverMap = new Map();
            (schedulesData || []).forEach(s => {
                if (s.caregiverId && !caregiverMap.has(s.caregiverId)) {
                    caregiverMap.set(s.caregiverId, {
                        id: s.caregiverId,
                        name: s.caregiverName || 'Caregiver'
                    });
                }
            });
            setCaregivers(Array.from(caregiverMap.values()));
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCaregiver || rating === 0) {
            alert('Please select a caregiver and rating');
            return;
        }

        try {
            setSubmitting(true);
            await feedbackApi.create({
                caregiverId: parseInt(selectedCaregiver),
                rating: rating,
                comment: comment || null,
                isAnonymous: isAnonymous
            });
            setSuccess(true);
            setShowForm(false);
            resetForm();
            await fetchData();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            alert("Failed to submit feedback: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedCaregiver('');
        setRating(0);
        setComment('');
        setIsAnonymous(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderStars = (count, interactive = false, size = 'w-5 h-5') => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} cursor-${interactive ? 'pointer' : 'default'} transition-colors ${star <= (interactive ? (hoverRating || rating) : count)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-stone-300'
                            }`}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="font-['Public_Sans'] space-y-6 pb-12">
            {/* Header */}
            <ScrollAnimation animation="fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Feedback & Reviews</h1>
                        <p className="text-stone-500">Share your experience with our caregivers</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Leave Feedback
                    </Button>
                </div>
            </ScrollAnimation>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Thank you! Your feedback has been submitted.</span>
                </div>
            )}

            {/* Feedback Form */}
            {showForm && (
                <ScrollAnimation animation="fade-up">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-[#5fa5ba]" />
                                Submit Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Caregiver Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Select Caregiver *
                                    </label>
                                    <select
                                        value={selectedCaregiver}
                                        onChange={(e) => setSelectedCaregiver(e.target.value)}
                                        className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent"
                                        required
                                    >
                                        <option value="">Choose a caregiver...</option>
                                        {caregivers.map((cg) => (
                                            <option key={cg.id} value={cg.id}>
                                                {cg.name}
                                            </option>
                                        ))}
                                    </select>
                                    {caregivers.length === 0 && (
                                        <p className="text-sm text-stone-500 mt-1">
                                            No caregivers found. You need to have scheduled visits first.
                                        </p>
                                    )}
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Rating *
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {renderStars(rating, true, 'w-8 h-8')}
                                        <span className="text-sm text-stone-500">
                                            {rating === 0 ? 'Click to rate' : `${rating} star${rating > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Comment (Optional)
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent resize-none"
                                        rows={4}
                                        placeholder="Share your experience..."
                                    />
                                </div>

                                {/* Anonymous Option */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="w-4 h-4 rounded border-stone-300 text-[#5fa5ba] focus:ring-[#5fa5ba]"
                                    />
                                    <label htmlFor="anonymous" className="text-sm text-stone-600">
                                        Submit anonymously
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting || !selectedCaregiver || rating === 0}
                                        className="bg-[#5fa5ba] hover:bg-[#4d8ca0] gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Submit Feedback
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </ScrollAnimation>
            )}

            {/* My Feedbacks List */}
            <ScrollAnimation animation="fade-up" delay={0.1}>
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#5fa5ba]" />
                            Your Feedback History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12">
                                <Star className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-500">You haven't submitted any feedback yet.</p>
                                <Button
                                    variant="link"
                                    onClick={() => setShowForm(true)}
                                    className="text-[#5fa5ba] mt-2"
                                >
                                    Leave your first review
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedbacks.map((fb) => (
                                    <div
                                        key={fb.id}
                                        className="p-4 bg-stone-50 rounded-2xl border border-stone-100"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-stone-900">
                                                    {fb.caregiverName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {renderStars(fb.rating)}
                                                    {fb.isAnonymous && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Anonymous
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-stone-400">
                                                {formatDate(fb.createdAt)}
                                            </span>
                                        </div>
                                        {fb.comment && (
                                            <p className="text-sm text-stone-600 mt-2">
                                                "{fb.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ScrollAnimation>
        </div>
    );
};

export default Feedback;

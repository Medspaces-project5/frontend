import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const RateYourVisit = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [details, setDetails] = useState(null);

  // Form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Backend base URL (can fallback to localhost:5000 if not specified in env)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/patient/feedback/${token}`);
        if (response.data.success) {
          setDetails(response.data.data);
        } else {
          setErrorMsg(response.data.error || 'Invalid feedback link');
        }
      } catch (err) {
        const msg = err.response?.data?.error || 'This feedback link has already been used or has expired';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await axios.post(`${API_URL}/patient/feedback/${token}/submit`, {
        rating,
        comment
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setSubmitError(response.data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#F0FDF4] to-[#F0FDFA] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#D8E7E5] max-w-md w-full text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#0D4846] animate-spin mx-auto" />
          <p className="text-secondary font-bold text-sm">Verifying your feedback link...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#FFF5F5] to-[#FFF0F0] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-200 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Link Unavailable</h2>
          <p className="text-sm text-slate-500 font-semibold">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#F0FDF4] to-[#F0FDFA] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-200 max-w-md w-full text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-[#082F2D] font-sans">Thank You!</h2>
          <p className="text-sm text-slate-500 font-medium">Your rating and comments have been recorded successfully. We appreciate your feedback to help us improve our care.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#F0FDF4] to-[#F0FDFA] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#D8E7E5] max-w-md w-full text-center space-y-6">
        <div>
          <span className="px-3 py-1 bg-[#E6F4F2] text-[#0D4846] text-xs font-bold rounded-full uppercase tracking-wider">Rate Your Visit</span>
          <h1 className="text-2xl font-extrabold text-secondary mt-3">We Value Your Feedback</h1>
          {details && (
            <p className="text-xs text-text-secondary mt-1.5 font-semibold">
              Visit with <strong className="text-secondary">{details.doctorName}</strong> on {details.appointmentDate}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Star Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#8CA3A1] uppercase tracking-wider">Select Rating</label>
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs font-bold text-amber-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent!'}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8CA3A1] uppercase tracking-wider">Optional Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? How can we make your next visit even better?"
              rows={4}
              maxLength={500}
              className="block w-full px-3 py-2 border border-[#D8E7E5] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans resize-none"
            />
            <p className="text-[10px] text-right text-slate-400">{comment.length}/500 chars</p>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full py-3 bg-[#0D4846] text-white font-bold text-sm rounded-xl hover:bg-[#093533] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateYourVisit;

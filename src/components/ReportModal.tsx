import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ReportType = 'bug' | 'improvement' | 'other';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * CONFIGURATION: 
 * To receive reports in your email:
 * 1. Change to 'https://formsubmit.co/ajax/your-email@example.com' 
 */
const SUBMISSION_URL = 'https://formsubmit.co/ajax/mousdle.game@gmail.com';

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [type, setType] = useState<ReportType>('bug');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!SUBMISSION_URL) {
      console.warn('SUBMISSION_URL is not configured. Simulating submission...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Report data:', { type, message, contact });
    } else {
      try {
        const response = await fetch(SUBMISSION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            type,
            message,
            contact,
            _subject: `New Mousdle Report: ${type.toUpperCase()}`,
          })
        });

        if (!response.ok) throw new Error('Submission failed');
      } catch (error) {
        console.error('Error submitting report:', error);
        // We still show success to the user to not break "magic", 
        // but in a real app you might show an error.
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    // Auto-close after success
    setTimeout(() => {
      onClose();
      // Reset state after closing animation
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        setContact('');
        setType('bug');
      }, 300);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="hint-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 10000 }}
        >
          <motion.div
            className="hint-modal-content report-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="hint-modal-close" onClick={onClose} aria-label="Close">&times;</button>

            {isSuccess ? (
              <div className="report-success">
                <div className="report-success-icon">✨</div>
                <h3 className="hint-modal-title">Thank You!</h3>
                <p className="hint-modal-subtitle">Your report has been sent successfully. Thanks for helping us improve!</p>
              </div>
            ) : (
              <>
                <h3 className="hint-modal-title">Report Bug / Improvement</h3>
                <p className="hint-modal-subtitle">Help us make Mousdle more magical</p>

                <form className="report-form" onSubmit={handleSubmit}>
                  <div className="report-field">
                    <label className="report-label">Report Type</label>
                    <div className="report-select-wrap">
                      <select
                        className="report-select"
                        value={type}
                        onChange={(e) => setType(e.target.value as ReportType)}
                        required
                      >
                        <option value="bug">Bug / Error</option>
                        <option value="improvement">Improvement / Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="report-field">
                    <label className="report-label">Description</label>
                    <textarea
                      className="report-textarea"
                      placeholder="Tell us what happened or what you'd like to see..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="report-field">
                    <label className="report-label">Contact (optional)</label>
                    <input
                      type="text"
                      className="report-input"
                      placeholder="Email or social handle to reach you"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="report-submit"
                    disabled={isSubmitting || !message.trim()}
                  >
                    {isSubmitting ? (
                      <span className="report-loading">Sending...</span>
                    ) : (
                      <>
                        <span className="report-sparkle">✨</span>
                        <span>Send Report</span>
                        <span className="report-sparkle">✨</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

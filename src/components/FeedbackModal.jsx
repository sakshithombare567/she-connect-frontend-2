import React, { useState, useEffect } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = () => {
    const payload = { rating, comment };
    if (onSubmit) onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-lg">
        <h3 className="text-lg font-bold mb-4">Rate your trip</h3>
        <div className="flex items-center gap-2 mb-4">
          {[1,2,3,4,5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className={`text-2xl ${rating >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment (optional)" className="w-full p-3 border rounded-md mb-4" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 bg-pink-600 text-white rounded-md">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

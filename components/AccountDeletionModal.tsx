"use client";

import { useState } from "react";
import { X, AlertTriangle, Trash2, Heart, TrendingUp, MessageCircle } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELETION_REASONS = [
  { 
    id: "not-using", 
    label: "I'm not using Zentra anymore"
  },
  { 
    id: "found-alternative", 
    label: "I found a better alternative"
  },
  { 
    id: "too-difficult", 
    label: "The content is too difficult for me"
  },
  { 
    id: "too-easy", 
    label: "The content is too easy"
  },
  { 
    id: "technical-issues", 
    label: "Too many bugs or technical problems"
  },
  { 
    id: "privacy-concerns", 
    label: "I have privacy or data concerns"
  },
  { 
    id: "no-progress", 
    label: "I'm not seeing results or progress"
  },
  { 
    id: "temporary-break", 
    label: "Just taking a break (coming back later)"
  },
  { 
    id: "other", 
    label: "Other reason"
  },
];

export default function AccountDeletionModal({ isOpen, onClose }: AccountDeletionModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmText.toUpperCase() !== "DELETE") {
      setError("Please type DELETE exactly as shown");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      // Store feedback in a separate collection before deletion
      if (selectedReason || additionalFeedback) {
        const feedbackRef = doc(collection(db, "userFeedback"));
        await setDoc(feedbackRef, {
          userId: user.uid,
          email: user.email,
          reason: selectedReason,
          feedback: additionalFeedback,
          deletedAt: new Date(),
        });
      }

      // 1. Delete user's subcollections
      const subcollections = ['lessonProgress', 'dictionary', 'achievements'];
      
      for (const subcol of subcollections) {
        const colRef = collection(db, "users", user.uid, subcol);
        const snapshot = await getDocs(colRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // 2. Delete main user document
      await deleteDoc(doc(db, "users", user.uid));

      // 3. Delete Firebase Auth account
      await deleteUser(user);

      // 4. Redirect to goodbye page
      router.push("/goodbye");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      
      if (err.code === "auth/requires-recent-login") {
        setError("For security, please sign out and sign back in, then try deleting again.");
      } else {
        setError(`Failed to delete account: ${err.message || "Unknown error"}`);
      }
      
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedReason("");
    setAdditionalFeedback("");
    setConfirmText("");
    setError("");
    setIsDeleting(false);
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        
        {/* STEP 1: Why are you leaving? */}
        {step === 1 && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">We're sad to see you go</h2>
                    <p className="text-sm text-gray-600">Help us improve by sharing why</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    What's your main reason for leaving?
                  </h3>
                  <p className="text-gray-600">
                    Your feedback helps us make Zentra better for everyone
                  </p>
                </div>

                {/* Reason Cards */}
                <div className="space-y-3">
                  {DELETION_REASONS.map((reason) => (
                    <label
                      key={reason.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedReason === reason.id
                          ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1 font-medium text-gray-900">{reason.label}</span>
                    </label>
                  ))}
                </div>

                {/* Additional Feedback */}
                <div>
                  <label className="block font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Anything else you'd like to share? (Optional)
                  </label>
                  <textarea
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Your feedback means a lot to us and helps us improve..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition"
                  />
                </div>

                {/* Encouragement box */}
                {selectedReason === "temporary-break" && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <p className="text-blue-900 font-medium flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Taking a break? Your progress will be here when you return!
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Consider just signing out instead. All your achievements and progress will be saved.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Never Mind, I'll Stay
              </button>
              <button
                onClick={() => selectedReason ? setStep(2) : setError("Please select a reason")}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                disabled={!selectedReason}
              >
                Continue
              </button>
            </div>
            
            {error && (
              <div className="px-8 pb-4">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}
          </>
        )}

        {/* STEP 2: Final Warning */}
        {step === 2 && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">One Last Thing</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                  disabled={isDeleting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
              <div className="space-y-6">
                {/* Warning */}
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    This will permanently delete everything
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Once deleted, there's no way to recover your account, progress, or data.
                  </p>
                </div>

                {/* What will be lost */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    You will permanently lose:
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-3 text-sm text-red-800">
                      <span className="text-red-500 font-bold mt-0.5">×</span>
                      <span><strong>All lesson progress</strong> - Modules you've completed and your current place</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-red-800">
                      <span className="text-red-500 font-bold mt-0.5">×</span>
                      <span><strong>Personal dictionary</strong> - All terms you've saved and mastered</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-red-800">
                      <span className="text-red-500 font-bold mt-0.5">×</span>
                      <span><strong>XP, levels, and streaks</strong> - All your achievements and progress</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-red-800">
                      <span className="text-red-500 font-bold mt-0.5">×</span>
                      <span><strong>Account data</strong> - Profile, settings, and preferences</span>
                    </li>
                  </ul>
                </div>

                {/* Confirmation Input */}
                <div>
                  <label className="block font-bold text-gray-900 mb-3">
                    Type <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-mono">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      setError("");
                    }}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-lg text-center uppercase"
                    autoComplete="off"
                    disabled={isDeleting}
                  />
                  {error && (
                    <p className="text-sm text-red-600 mt-2 text-center font-medium">{error}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Sticky at bottom */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText.toUpperCase() !== "DELETE"}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete My Account Forever
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                For security, you may need to sign in again before deletion
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
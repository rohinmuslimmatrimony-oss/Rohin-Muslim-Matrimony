import React, { useState, useRef } from 'react';
import { FaCamera, FaTrash, FaCrown, FaPlus, FaCheck, FaImages, FaEye } from 'react-icons/fa';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

const PhotoGalleryManager = ({ profile, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [activePreview, setActivePreview] = useState(null);
  const fileInputRef = useRef(null);

  const gallery = profile?.gallery || [];
  const mainPhoto = profile?.profilePhoto || '';
  const maxPhotos = 5;
  const remainingSlots = Math.max(0, maxPhotos - gallery.length);

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length > remainingSlots) {
      toast.error(`You can only upload up to ${remainingSlots} more photo(s). Maximum total is ${maxPhotos}.`);
      return;
    }

    const toastId = toast.loading(`Uploading ${files.length} photo(s)...`);
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await api.post('/profiles/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Photos uploaded successfully!', { id: toastId });
        if (onUpdate) await onUpdate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photos', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetMainPhoto = async (photoUrl) => {
    const toastId = toast.loading('Setting as main profile photo...');
    try {
      const res = await api.put('/profiles/gallery/set-main', { photoUrl });
      if (res.data.success) {
        toast.success('Profile photo updated!', { id: toastId });
        if (onUpdate) await onUpdate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile photo', { id: toastId });
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    if (!window.confirm('Are you sure you want to delete this photo from your gallery?')) return;

    const toastId = toast.loading('Deleting photo...');
    try {
      const res = await api.delete('/profiles/gallery', { data: { photoUrl } });
      if (res.data.success) {
        toast.success('Photo removed from gallery', { id: toastId });
        if (onUpdate) await onUpdate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo', { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100/90 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-lg">
            <FaImages />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 font-serif">Photo Gallery</h3>
            <p className="text-xs text-slate-500 font-medium">Add 4-5 photos for your profile portfolio ({gallery.length}/{maxPhotos})</p>
          </div>
        </div>

        {/* Upload Button */}
        {remainingSlots > 0 && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleUploadPhotos}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-crimson-950 hover:bg-crimson-900 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <FaPlus className="text-xs" /> Add Photos
            </button>
          </div>
        )}
      </div>

      {/* Grid of Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
        {gallery.map((photo, idx) => {
          const fullUrl = photo.startsWith('http') ? photo : `${SOCKET_BASE_URL}${photo}`;
          const isMain = mainPhoto === photo;

          return (
            <div
              key={idx}
              className={`relative group rounded-2xl overflow-hidden aspect-square border-2 ${isMain ? 'border-amber-500 shadow-md ring-2 ring-amber-400/30' : 'border-slate-200'} bg-slate-100 shadow-sm`}
            >
              <img
                src={fullUrl}
                alt={`Gallery photo ${idx + 1}`}
                onError={(e) => {
                  if (fullUrl.includes('rohinmuslimmatrimony.com')) {
                    e.target.src = `http://localhost:5001${photo}`;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {isMain && (
                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                  <FaCrown className="text-[8px]" /> Profile DP
                </div>
              )}

              {/* Hover / Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                <button
                  type="button"
                  onClick={() => setActivePreview(fullUrl)}
                  title="View Full Photo"
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center text-xs shadow-md transition-all cursor-pointer hover:scale-110"
                >
                  <FaEye />
                </button>

                {!isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMainPhoto(photo)}
                    title="Set as Main Profile DP"
                    className="w-8 h-8 rounded-full bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center text-xs shadow-md transition-all cursor-pointer hover:scale-110"
                  >
                    <FaCrown />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  title="Delete Photo"
                  className="w-8 h-8 rounded-full bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center text-xs shadow-md transition-all cursor-pointer hover:scale-110"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty placeholder slots */}
        {Array.from({ length: remainingSlots }).map((_, idx) => (
          <button
            key={`empty-${idx}`}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/40 flex flex-col items-center justify-center gap-1.5 aspect-square text-slate-400 hover:text-amber-700 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <FaCamera className="text-sm" />
            </div>
            <span className="text-[11px] font-semibold">Add Photo</span>
          </button>
        ))}
      </div>

      {/* Lightbox / Preview Modal */}
      {activePreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePreview(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={activePreview} alt="Enlarged gallery photo" className="w-full h-full object-contain" />
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition-all text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryManager;

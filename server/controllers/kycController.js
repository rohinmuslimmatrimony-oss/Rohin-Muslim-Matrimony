const KycRequest = require('../models/KycRequest');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @desc    Submit KYC document for identity verification
// @route   POST /api/kyc/submit
// @access  Private
exports.submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullNameOnId, idType, idNumber } = req.body;

    if (!fullNameOnId || !idType) {
      return res.status(400).json({ success: false, message: 'Full name and ID type are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a document image.' });
    }

    const documentImage = `/uploads/${req.file.filename}`;

    // Check if user already has a KYC request
    const existing = await KycRequest.findOne({ user: userId });

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Your identity is already verified.' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Your KYC is already under review. Please wait for admin approval.' });
      }
      // If rejected, allow resubmission by updating existing record
      existing.fullNameOnId = fullNameOnId;
      existing.idType = idType;
      existing.idNumber = idNumber || '';
      existing.documentImage = documentImage;
      existing.status = 'pending';
      existing.adminNote = '';
      existing.reviewedAt = undefined;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'KYC resubmitted successfully! Our team will review within 24 hours.',
        data: existing,
      });
    }

    const kycRequest = await KycRequest.create({
      user: userId,
      fullNameOnId,
      idType,
      idNumber: idNumber || '',
      documentImage,
    });

    return res.status(201).json({
      success: true,
      message: 'KYC submitted successfully! Our team will review within 24 hours.',
      data: kycRequest,
    });
  } catch (error) {
    console.error('SubmitKyc Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getMyKycStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const kycRequest = await KycRequest.findOne({ user: userId });

    if (!kycRequest) {
      return res.status(200).json({
        success: true,
        status: 'not_submitted',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      status: kycRequest.status,
      data: kycRequest,
    });
  } catch (error) {
    console.error('GetMyKycStatus Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const Report = require('../models/Report');

// @desc    Report a user profile
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, reason } = req.body;
    const reporterId = req.user.id;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ success: false, message: 'Reported user ID and reason are required' });
    }

    if (reportedUserId === reporterId) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason: reason.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
      data: report
    });
  } catch (error) {
    console.error('CreateReport Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

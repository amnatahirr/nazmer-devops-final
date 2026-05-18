const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email } = req.body;
        const userId = req.user.id;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: 'Email is already in use by another account'
                });
            }
        }

        // Update user
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) {
            updateData.email = email;
            updateData.isEmailVerified = false; // Reset verification if email changes
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Server error during profile update'
        });
    }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Server error during password change'
        });
    }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, [
    body('password')
        .notEmpty()
        .withMessage('Password is required to delete account'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { password } = req.body;
        const userId = req.user.id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Password is incorrect'
            });
        }

        // Soft delete - deactivate account instead of hard delete
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        res.json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: 'Server error during account deletion'
        });
    }
});

module.exports = router;

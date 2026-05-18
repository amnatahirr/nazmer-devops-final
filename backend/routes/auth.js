const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
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

        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password
        });

        // Generate email verification token
        const verificationToken = user.createEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken, firstName);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
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

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            await user.incLoginAttempts();
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, [
    body('email')
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

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate password reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, resetToken, user.firstName);

            res.json({
                message: 'Password reset link has been sent to your email.'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

            // Clear the reset token if email fails
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                message: 'Failed to send password reset email. Please try again.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'Server error during password reset request'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
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

        const { token, password } = req.body;

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired password reset token'
            });
        }

        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Reset login attempts
        user.loginAttempts = undefined;
        user.lockUntil = undefined;

        await user.save();

        // Generate new JWT token
        const jwtToken = generateToken(user._id);

        res.json({
            message: 'Password reset successful',
            token: jwtToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: 'Server error during password reset'
        });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required'),
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

        const { token } = req.body;

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid verification token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification token'
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.json({
            message: 'Email verified successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            message: 'Server error during email verification'
        });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.createEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, verificationToken, user.firstName);

            res.json({
                message: 'Verification email sent successfully'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({
                message: 'Failed to send verification email. Please try again.'
            });
        }

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            message: 'Server error during email resend'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
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
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
    res.json({
        message: 'Logged out successfully'
    });
});

module.exports = router;

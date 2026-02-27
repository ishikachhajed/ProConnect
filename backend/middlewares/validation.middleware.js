import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

export const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
];

export const updateProfileValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('about').optional(),
    body('skills').optional(),
    body('projects').optional(),
];

export const changePasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
];

export const postValidation = [
    body('content').notEmpty().withMessage('Post content cannot be empty'),
];

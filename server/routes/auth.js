const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { registerUser, loginUser, logout, checkUserVerification, forgotPassword,
        resetPassword, getUserProfile, updatePassword, updateProfile,
        allUsers, getUserDetails, updateUser, updateUserRole, deleteUser, 
        googleLogin, allUsersApply, updateApplyMember, deniedApplyMember, 
        applyingForMember, deleteImage, registerUserMember, fetchUserMemberMatch,
        approveApplyMember, denyApplyMember, avatarUpdate,
         updateProfileMobile, getUserProfileById,
        getUsersByMonth, getUsersByCurrentMonth, getAllUsersCount, getUsersCountForToday, 
        getUsersCountForPast7Days, getTotalMembers, countUsersApply, updateAddressAndDetails, 
        verifyAdminCode, createAddress, resendVerificationCode, verifyEmailCode, 
        resendEmailVerificationCode, checkEmailVerificationStatus,
        forgotPasswordMobile, verifyPasswordResetCode, resetPasswordMobile, resendPasswordResetCode, updatePasswordMobile } = require('../controller/authController');



router.post('/password/forgot-mobile', forgotPasswordMobile);
router.post('/password/verify-reset-code', verifyPasswordResetCode);
router.post('/password/reset-mobile', resetPasswordMobile);
router.post('/password/resend-reset-code', resendPasswordResetCode);
router.put('/password/update/mobile', isAuthenticatedUser, updatePasswordMobile);

router.get('/fetchusermember', isAuthenticatedUser, fetchUserMemberMatch);
router.post('/check-user-verification', checkUserVerification);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmailCode);
router.post('/resend-email-verification', resendEmailVerificationCode);
router.get('/check-email-verification/:userId', checkEmailVerificationStatus);
router.post('/register-member', registerUserMember);
router.post('/login', loginUser);
router.post('/verify', verifyAdminCode);
//resend admin cod
router.post('/resend-verification', resendVerificationCode);

router.post('/google-login', googleLogin);
router.get('/logout', logout);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/me', isAuthenticatedUser, getUserProfile);
router.get('/get-user/:id', isAuthenticatedUser, getUserProfileById);
router.get('/all-users', allUsers);
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.put('/password/update/mobile', updatePasswordMobile);
router.put('/me/update', isAuthenticatedUser, upload.single("avatar"), updateProfile);
router.put('/me/update/mobile', updateProfileMobile);
router.put('/users/:id', isAuthenticatedUser, isAdmin, updateUserRole);
router.delete('/user/:id', isAuthenticatedUser, isAdmin, deleteUser);
router.get('/users/apply', allUsersApply);
router.put('/users/applying-for-member/:id', applyingForMember);
router.delete('/users/delete-images/:public_id', isAuthenticatedUser, deleteImage);

router.put('/users/approve-apply-member/:id', isAuthenticatedUser, isAdmin, approveApplyMember);
router.put('/users/deny-apply-member/:id', isAuthenticatedUser, isAdmin, denyApplyMember);
router.put('/avatar-update/:id', avatarUpdate);
router.get('/analytics/users/currentmonth', isAuthenticatedUser, isAdmin, getUsersByCurrentMonth);
router.get('/analytics/users/allmonths', getUsersByMonth);
router.get('/analytics/users/quantity', isAuthenticatedUser, isAdmin,getAllUsersCount);
router.get('/analytics/users/daily',getUsersCountForToday);
router.get('/analytics/users/weekly', getUsersCountForPast7Days);
router.get('/analytics/users/totalmembers', isAuthenticatedUser, isAdmin, getTotalMembers);
router.get('/analytics/users/countapplying', isAuthenticatedUser, isAdmin, countUsersApply);
router.put('/me/update/address', updateAddressAndDetails);

//create address
router.post('/me/create-address',  createAddress);
//create address 



module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const { registerUser, loginUser, logout, forgotPassword,
        resetPassword, getUserProfile, updatePassword, updateProfile,
        allUsers, getUserDetails, updateUser, updateUserRole, deleteUser, 
        googleLogin, allUsersApply, updateApplyMember, deniedApplyMember, 
        applyingForMember, deleteImage, registerUserMember, fetchUserMemberMatch,
        approveApplyMember, denyApplyMember, avatarUpdate,
        updatePasswordMobile, updateProfileMobile, getUserProfileById} = require('../controller/authController');

router.post('/register', registerUser);
router.post('/register-member', registerUserMember);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/logout', logout);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/me', isAuthenticatedUser, getUserProfile);
router.get('/get-user/:id', getUserProfileById);
router.get('/all-users', allUsers);
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.put('/password/update/mobile', updatePasswordMobile);
router.put('/me/update', isAuthenticatedUser, upload.single("avatar"), updateProfile);
router.put('/me/update/mobile', updateProfileMobile);
router.put('/users/:id', isAuthenticatedUser, updateUserRole);
router.delete('/user/:id', isAuthenticatedUser, deleteUser);
router.get('/users/apply', allUsersApply);
router.put('/users/applying-for-member/:id', applyingForMember);
router.delete('/users/delete-images/:public_id', isAuthenticatedUser, deleteImage);
router.get('/fetchusermember', fetchUserMemberMatch);
router.put('/users/approve-apply-member/:id', approveApplyMember);
router.put('/users/deny-apply-member/:id', denyApplyMember);
router.put('/avatar-update/:id', avatarUpdate);

module.exports = router;
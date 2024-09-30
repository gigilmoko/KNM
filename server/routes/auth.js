const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const { registerUser, loginUser, logout, forgotPassword,
      resetPassword, getUserProfile, updatePassword, updateProfile,
      allUsers, getUserDetails, updateUser, updateUserRole, deleteUser, 
      googleLogin, allUsersApply, updateApplyMember, deniedApplyMember, 
      applyingForMember, deleteImage } = require('../controller/authController');

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/logout', logout);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/me', isAuthenticatedUser, getUserProfile);
router.get('/all-users', allUsers);
router.put('/password/update', isAuthenticatedUser, updatePassword);
router.put('/me/update', isAuthenticatedUser, upload.single("avatar"), updateProfile);
router.put('/users/:id', updateUserRole);
router.delete('/user/:id', deleteUser);
router.get('/users/apply', allUsersApply);
router.put('/users/apply/:id', updateApplyMember);
router.put('/users/deny-apply-member/:id', deniedApplyMember);
router.put('/users/applying-for-member/:id', applyingForMember);
router.delete('/users/delete-images/:public_id', deleteImage);

// router.post('/register', upload.single('avatar'), registerUser);
// router.put('/password/update', updatePassword);
// router.get('/admin/users', allUsers);
// router.get('/all-users', isAuthenticatedUser, allUsers);
// router.put('/users/:id', isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);
// router.delete('/user/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
module.exports = router;
const express = require('express');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const { createMember, viewMember, editMember, deleteMember, getAllMembers } = require('../controller/memberController');
const router = express.Router();

router.post('/members/new', isAuthenticatedUser, isAdmin, createMember);
router.get('/members', getAllMembers); 
router.get('/members/:id', viewMember);    
router.put('/members/:id', isAuthenticatedUser, isAdmin, editMember);          
router.delete('/members/:id', isAuthenticatedUser, isAdmin, deleteMember);     

module.exports = router;

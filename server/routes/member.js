const express = require('express');

const { isAuthenticatedUser } = require('../middlewares/auth');
const { createMember, viewMember, editMember, deleteMember, getAllMembers } = require('../controller/memberController');
const router = express.Router();

router.post('/members/new', isAuthenticatedUser, createMember);
router.get('/members', getAllMembers); 
router.get('/members/:id', viewMember);    
router.put('/members/:id', isAuthenticatedUser, editMember);          
router.delete('/members/:id', isAuthenticatedUser, deleteMember);     

module.exports = router;

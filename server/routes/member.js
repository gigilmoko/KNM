const express = require('express');
const { createMember, viewMember, editMember, deleteMember, getAllMembers } = require('../controller/memberController');
const router = express.Router();

router.post('/members/new', createMember);            // Create a member
router.get('/members', getAllMembers);            // Get all members
router.get('/members/:id', viewMember);           // View a member by ID
router.put('/members/:id', editMember);           // Edit a member by ID
router.delete('/members/:id', deleteMember);      // Delete a member by ID

module.exports = router;

const express = require('express');
const { createMember, viewMember, editMember, deleteMember, getAllMembers } = require('../controller/memberController');
const router = express.Router();

router.post('/members/new', createMember);
router.get('/members', getAllMembers); 
router.get('/members/:id', viewMember);    
router.put('/members/:id', editMember);          
router.delete('/members/:id', deleteMember);     

module.exports = router;

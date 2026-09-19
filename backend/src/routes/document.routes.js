const express = require('express');
const {
  getWorkspaceDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/workspace/:workspaceId', getWorkspaceDocuments);
router.post('/', createDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;

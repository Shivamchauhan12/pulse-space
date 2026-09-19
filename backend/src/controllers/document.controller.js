const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

const getWorkspaceDocuments = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const docs = await Document.find({ workspace: workspaceId, isArchived: false })
      .populate('author', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const { workspaceId, title, icon, parentDoc, blocks } = req.body;
    if (!workspaceId || !title) {
      return res.status(400).json({ success: false, error: 'WorkspaceId and Title are required' });
    }

    const defaultBlocks = blocks || [
      { id: 'b1', type: 'h1', content: title },
      { id: 'b2', type: 'paragraph', content: 'Start typing your spec or documentation here...' }
    ];

    const doc = await Document.create({
      workspace: workspaceId,
      title,
      icon: icon || '📝',
      parentDoc: parentDoc || null,
      author: req.user._id,
      blocks: defaultBlocks
    });

    await AuditLog.create({
      workspace: workspaceId,
      user: req.user._id,
      action: 'DOC_CREATED',
      entity: 'DOC',
      details: `Document "${title}" created.`
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).populate('author', 'name email avatar');
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const { title, icon, blocks } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

    if (title) doc.title = title;
    if (icon) doc.icon = icon;
    if (blocks) doc.blocks = blocks;

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

    doc.isArchived = true;
    await doc.save();

    res.json({ success: true, message: 'Document archived successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorkspaceDocuments, createDocument, getDocumentById, updateDocument, deleteDocument };

const Document = require('../models/Document');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendNotification } = require('../utils/firebaseNotifications');

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    const { title, description, type, propertyId, sharedWith } = req.body;
    const uploadedBy = req.user._id;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'rento/documents',
      resource_type: 'auto'
    });

    const document = new Document({
      title,
      description,
      type,
      property: propertyId,
      uploadedBy,
      file: {
        url: result.secure_url,
        public_id: result.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      sharedWith: sharedWith || []
    });

    await document.save();

    // Notify shared users
    if (sharedWith && sharedWith.length > 0) {
      for (const share of sharedWith) {
        await sendNotification({
          userId: share.user,
          title: 'New Document Shared',
          body: `${req.user.name} shared a document with you: ${title}`,
          data: {
            type: 'document_shared',
            documentId: document._id
          }
        });
      }
    }

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

// Get all documents for a property
exports.getPropertyDocuments = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const documents = await Document.find({
      property: propertyId,
      $or: [
        { uploadedBy: userId },
        { 'sharedWith.user': userId }
      ]
    })
    .populate('uploadedBy', 'name')
    .populate('sharedWith.user', 'name')
    .sort('-createdAt');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

// Get a single document
exports.getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { uploadedBy: userId },
        { 'sharedWith.user': userId }
      ]
    })
    .populate('uploadedBy', 'name')
    .populate('sharedWith.user', 'name')
    .populate('signatures.user', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { uploadedBy: userId },
        { 'sharedWith.user': userId, 'sharedWith.permission': 'edit' }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or no permission' });
    }

    Object.assign(document, updates);
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { uploadedBy: userId },
        { 'sharedWith.user': userId, 'sharedWith.permission': 'delete' }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or no permission' });
    }

    // Delete from Cloudinary
    if (document.file.public_id) {
      await cloudinary.uploader.destroy(document.file.public_id);
    }

    await document.remove();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

// Add signature to document
exports.addSignature = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { signatureData } = req.body;
    const userId = req.user._id;

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { uploadedBy: userId },
        { 'sharedWith.user': userId }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or no permission' });
    }

    // Check if user has already signed
    const existingSignature = document.signatures.find(
      sig => sig.user.toString() === userId.toString()
    );

    if (existingSignature) {
      return res.status(400).json({ message: 'You have already signed this document' });
    }

    document.signatures.push({
      user: userId,
      signedAt: new Date(),
      signatureData
    });

    // Update status if all required signatures are present
    if (document.signatures.length >= document.sharedWith.length) {
      document.status = 'signed';
    }

    await document.save();

    // Notify document owner
    await sendNotification({
      userId: document.uploadedBy,
      title: 'Document Signed',
      body: `${req.user.name} has signed the document: ${document.title}`,
      data: {
        type: 'document_signed',
        documentId: document._id
      }
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error adding signature', error: error.message });
  }
}; 
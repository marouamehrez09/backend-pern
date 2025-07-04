const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
    uploadDocument,
    downloadDocument,
    updateDocument,
    deleteDocument,
    generateAttestation,
    getDocumentsByEmployee,
    getAllDocuments,
} = require('../controllers/documentController');

const protect = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const upload = require("../middlewares/upload");

//  Configuration de Multer pour l'upload
{/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
},
    filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
},
});
const upload = multer({ storage });*/}


//  Upload d’un document (employé connecté)
router.post('/upload', protect, upload.single('file'), uploadDocument);

// get document by email
router.get('/by-email/:email', protect, getDocumentsByEmployee);

//  Générer automatiquement une attestation (admin)
//router.post('/generate-attestation', protect, isAdmin, generateAttestation);

//  Télécharger un document (authentifié)
router.get('/download/:id', protect, downloadDocument);

//  Récupérer les documents d’un employé
router.get('/:id', protect, getDocumentsByEmployee);

//  Modifier un document (admin )
router.put('/:id', protect,isAdmin, updateDocument);

//  Supprimer un document (admin uniquement)
router.delete('/:id', protect, isAdmin, deleteDocument);

// GET /api/documents (affiche tous les documents)
router.get('/', protect, getAllDocuments);


module.exports = router;

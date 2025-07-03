
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Document = require('../models/Document');
const Employe = require('../models/Employe');
const cloudinary = require("../config/cloudinary");

// Télécharger un document
exports.downloadDocument = async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.id);
      if (!document) return res.status(404).json({ message: 'Document non trouvé' });
  
      if (document.fileUrl) {
        // Cloudinary : rediriger vers le lien direct
        return res.redirect(document.fileUrl);
      }
  
      // Pour les anciens documents en local
      const filePath = path.resolve(__dirname, '..', document.filePath);
      return res.download(filePath);
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors du téléchargement', error: err });
    }
  };
  

//  Ajouter un document 
{/*exports.uploadDocument = async (req, res) => {
    try {
        //console.log('req.file:', req.file);
        //console.log('req.body:', req.body);

        const { employeeId, title, type } = req.body;
        const filePath = req.file?.path;

        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier n'a été téléchargé." });
        }

        const fileUrl = req.file.path; //  URL fournie par Cloudinary

        const doc = await Document.create({ employeeId, title, type, filePath });
        res.status(201).json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'upload', error: err.message });
    }
};*/}
exports.uploadDocument = async (req, res) => {
    try {
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);
  
      const { employeeId, title, type } = req.body;
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
      }
  
      const document = await Document.create({
        employeeId,
        title,
        type,
        fileUrl: file.path,          // Cloudinary path
        cloudinaryId: file.filename, // Cloudinary ID
      });
      console.log("document:", document);

      res.status(201).json(document);
    } catch (error) {
      console.error("Erreur backend :", error);
      res.status(500).json({
        message: "Erreur upload document",
        error: error.message || JSON.stringify(error) || error.toString(),
        stack: error.stack,
      });
      
    }
  };
  


//  Mettre à jour un document
{/*exports.updateDocument = async (req, res) => {
    try {
        const { title, type } = req.body;
        console.log("PUT /api/document/:id", req.params.id, title, type);

        const document = await Document.findByPk(req.params.id);
        if (!document)
            return res.status(404).json({ message: 'Document non trouvé' });

        document.title = title || document.title;
        document.type = type || document.type;

        const result = await document.save();
        console.log("Document mis à jour :", result);

        res.json(result);
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ message: 'Erreur de mise à jour', error: err.message });
    }
};*/}
exports.updateDocument = async (req, res) => {
    try {
      const { title, type } = req.body;
      const { id } = req.params;
  
      const doc = await Document.findByPk(id);
      if (!doc) return res.status(404).json({ message: "Document introuvable" });
  
      // Si nouveau fichier : supprimer l'ancien sur Cloudinary
      if (req.file) {
        if (doc.cloudinaryId) {
          await cloudinary.uploader.destroy(doc.cloudinaryId);
        }
  
        doc.fileUrl = req.file.path;
        doc.cloudinaryId = req.file.filename;
      }
  
      doc.title = title;
      doc.type = type;
      await doc.save();
  
      res.json({ message: "Document mis à jour", doc });
    } catch (error) {
      res.status(500).json({ message: "Erreur modification", error });
    }
  };  


//  Supprimer un document
{/*exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document non trouvé' });

        fs.unlinkSync(path.resolve(__dirname, '..', document.filePath));
        await document.destroy();
        res.json({ message: 'Document supprimé' });
    } catch (err) {
    res.status(500).json({ message: 'Erreur de suppression', error: err });
}
};*/}
exports.deleteDocument = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await Document.findByPk(id);
      if (!doc) return res.status(404).json({ message: "Document introuvable" });
  
      if (doc.cloudinaryId) {
        await cloudinary.uploader.destroy(doc.cloudinaryId);
      }
  
      await doc.destroy();
      res.json({ message: "Document supprimé" });
    } catch (error) {
      res.status(500).json({ message: "Erreur suppression", error });
    }
  };

// Générer automatiquement une attestation (PDF) !!!! pas maintenant
exports.generateAttestation = async (req, res) => {
    const { employeeId, title = 'Attestation de Travail' } = req.body;
    const fileName = `attestation-${employeeId}-${Date.now()}.pdf`;
    const filePath = `uploads/documents/${fileName}`;
    const fullPath = path.join(__dirname, '..', filePath);

    try {
    // Créer le PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(fullPath));
        doc.fontSize(20).text('Attestation de Travail', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Certifie que l'employé avec l'ID ${employeeId} travaille actuellement dans notre entreprise.`);
        doc.end();

    // Enregistrer dans la base
    const createdDoc = await Document.create({
        employeeId,
        title,
        type: 'attestation',
        filePath
    });

    res.status(201).json({ message: 'Attestation générée', document: createdDoc });
    } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du PDF', error });
}
};

// obtenir document par employeId
exports.getDocumentsByEmployee = async (req, res) => {
    try {
        const documents = await Document.findAll({ where: { employeeId: req.params.id } });
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération', error: err.message });
    }
};

// 📃 Obtenir les documents d’un employé via email
exports.getDocumentsByEmail = async (req, res) => {
    try {
    const { email } = req.params;

    const user = await Employe.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const documents = await Document.findAll({ where: { employeeId: user.id } });
    res.status(200).json(documents);
    } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
    }
};

// get all documents ( tous poua admin et pour chaque employe ses doc)
exports.getAllDocuments = async (req, res) => {
    try {
        let whereCondition = {};

      // Si l'utilisateur est un employé, on filtre les documents par son propre ID
    if (req.user.role === "employe") {
        whereCondition = { employeeId: req.user.id };
    }

    const docs = await Document.findAll({
        where: whereCondition,
        include: {
            model: Employe,
            as: "employe",
            attributes: ["name", "email"],
        },
        order: [["createdAt", "DESC"]],
    });

        res.json(docs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};



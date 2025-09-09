const db = require('../config/db');

// Crear una nueva FAQ (Solo Admin)
exports.createFaq = (req, res) => {
  const { question, answer } = req.body;
  const created_by = req.user.id; // Obtenemos el ID del admin desde el token

  if (!question || !answer) {
    return res.status(400).json({ message: 'La pregunta y la respuesta son obligatorias.' });
  }

  const newFaq = { question, answer, created_by };
  db.query('INSERT INTO faqs SET ?', newFaq, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al crear la FAQ.' });
    }
    res.status(201).json({ message: 'FAQ creada exitosamente.', faqId: results.insertId });
  });
};

// Obtener todas las FAQs (Cualquier usuario logueado)
exports.getAllFaqs = (req, res) => {
  db.query('SELECT id, question, answer FROM faqs', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al obtener las FAQs.' });
    }
    res.status(200).json(results);
  });
};

// Actualizar una FAQ (Solo Admin)
exports.updateFaq = (req, res) => {
  const faqId = req.params.id;
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ message: 'La pregunta y la respuesta son obligatorias.' });
  }

  db.query('UPDATE faqs SET question = ?, answer = ? WHERE id = ?', [question, answer, faqId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al actualizar la FAQ.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'FAQ no encontrada.' });
    }
    res.status(200).json({ message: 'FAQ actualizada exitosamente.' });
  });
};

// Borrar una FAQ (Solo Admin)
exports.deleteFaq = (req, res) => {
  const faqId = req.params.id;

  db.query('DELETE FROM faqs WHERE id = ?', [faqId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al borrar la FAQ.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'FAQ no encontrada.' });
    }
    res.status(200).json({ message: 'FAQ eliminada exitosamente.' });
  });
};
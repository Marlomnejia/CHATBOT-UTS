const prisma = require('../config/prisma');

// --- Crear una nueva FAQ (Solo Admin) ---
const createFaq = async (req, res) => {
  const { question, answer } = req.body;
  const created_by = req.user.id;

  if (!question || !answer) {
    return res.status(400).json({ message: 'La pregunta y la respuesta son obligatorias.' });
  }

  try {
    const newFaq = await prisma.faqs.create({
      data: {
        question,
        answer,
        created_by
      }
    });
    res.status(201).json({ message: 'FAQ creada exitosamente.', faqId: newFaq.id });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la FAQ.', error: error.message });
  }
};

// --- Obtener todas las FAQs (Cualquier usuario logueado) ---
const getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faqs.findMany({
      select: { id: true, question: true, answer: true }
    });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las FAQs.', error: error.message });
  }
};

// --- Actualizar una FAQ (Solo Admin) ---
const updateFaq = async (req, res) => {
  const faqId = parseInt(req.params.id);
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ message: 'La pregunta y la respuesta son obligatorias.' });
  }

  try {
    await prisma.faqs.update({
      where: { id: faqId },
      data: { question, answer }
    });
    res.status(200).json({ message: 'FAQ actualizada exitosamente.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'FAQ no encontrada.' });
    }
    res.status(500).json({ message: 'Error al actualizar la FAQ.', error: error.message });
  }
};

// --- Borrar una FAQ (Solo Admin) ---
const deleteFaq = async (req, res) => {
  const faqId = parseInt(req.params.id);

  try {
    await prisma.faqs.delete({
      where: { id: faqId }
    });
    res.status(200).json({ message: 'FAQ eliminada exitosamente.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'FAQ no encontrada.' });
    }
    res.status(500).json({ message: 'Error al borrar la FAQ.', error: error.message });
  }
};

// --- Exportar todas las funciones explícitamente ---
module.exports = {
  createFaq,
  getAllFaqs,
  updateFaq,
  deleteFaq
};

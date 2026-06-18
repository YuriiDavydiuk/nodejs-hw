import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search, page = 1, perPage = 10 } = req.query; // берем параметри з URL

    const query = Note.find({ userId: req.user._id });

    // фільтр по тегу
    if (tag) {
      query.where({ tag });
    }

    // текстовий пошук
    if (search) {
      query.where({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const skip = (page - 1) * perPage;

    const [totalNotes, notes] = await Promise.all([
      query.clone().countDocuments(),
      query.skip(skip).limit(perPage),
    ]);

    //Загальна кількість сторінок
    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOne({ _id: noteId, userId: req.user._id });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id }, // шукаємо по id
    req.body,
    { returnDocument: 'after' }, //повертаємо оновлений документ
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

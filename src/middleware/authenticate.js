import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  const { sessionId, accessToken } = req.cookies;

  // Перевіряємо наявність кукі
  if (!sessionId || !accessToken) {
    throw createHttpError(401, 'Missing session or access token');
  }

  // Якщо все ок, шукаємо сесію
  const session = await Session.findOne({
    _id: sessionId,
    accessToken,
  });

  // Якщо такої сесії немає, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевіряємо термін дії access токена
  const isAccessTokenExpired = session.accessTokenValidUntil < new Date();

  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  // Якщо з токеном все добре і сесія існує, шукаємо користувача
  const user = await User.findById(session.userId);

  // Якщо користувача не знайдено
  if (!user) {
    throw createHttpError(401);
  }

  // Якщо користувач існує, додаємо його до запиту
  req.user = user;

  // Передаємо управління далі
  next();
};

import path from 'path';

/**
 * Restituisce il percorso fisico del file nel filesystem (per cancellazione, ecc.)
 * @param photoPath Percorso salvato nel DB (es. "/api/uploads/{userId}/{filename}")
 * @param uploadsDir Directory base delle upload
 */
export const getPhysicalFilePath = (photoPath: string, uploadsDir: string) => {

  const cleanedPath = photoPath.replace(/^\/?api\/uploads\//, '');

  return path.join(uploadsDir, cleanedPath);
};

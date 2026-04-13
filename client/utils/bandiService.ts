import { sampleBandi } from "./sampleBandi";

const STORAGE_KEY = "bandi";

/* inizializza storage */
export const initBandi = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBandi));
  }
};

/* READ ALL */
export const getBandi = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/* READ ONE */
export const getBando = (id: string) => {
  const bandi = getBandi();
  return bandi.find((b: any) => b.id === id);
};

/* CREATE */
export const createBando = (bando: any) => {
  const bandi = getBandi();

  const newBando = {
    ...bando,
    id: Date.now().toString(),
    inserimento: new Date().toISOString(),
  };

  bandi.push(newBando);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(bandi));

  return newBando;
};

/* UPDATE */
export const updateBando = (id: string, data: any) => {
  const bandi = getBandi();

  const updated = bandi.map((b: any) =>
    b.id === id ? { ...b, ...data } : b
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/* DELETE */
export const deleteBando = (id: string) => {
  const bandi = getBandi();

  const filtered = bandi.filter((b: any) => b.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
'use client';

export default function Banner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">Benvenuto su Bandi & Gare</h2>
      <p className="text-lg max-w-xl mx-auto">
        Scopri tutti i bandi e le gare disponibili per partecipare, candidarti e vincere!
      </p>
      <a href="#bandi" className="inline-block mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100">
        Scopri i bandi
      </a>
    </div>
  );
}
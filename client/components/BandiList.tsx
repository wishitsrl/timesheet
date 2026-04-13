'use client';

type Bando = {
  id: string;
  title: string;
  deadline: string;
  description: string;
};

const sampleBandi: Bando[] = [
  { id: '1', title: 'Bando Innovazione 2026', deadline: '2026-04-30', description: 'Partecipa al bando per progetti innovativi nel settore tech.' },
  { id: '2', title: 'Gara Creativa 2026', deadline: '2026-05-15', description: 'Mostra il tuo talento creativo e vinci premi fantastici.' },
  { id: '3', title: 'Bando Startup Digitali', deadline: '2026-06-01', description: 'Supporto finanziario per nuove startup digitali.' },
];

export default function BandiList() {
  return (
    <section id="bandi" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold mb-8 text-center">Bandi e Gare in Evidenza</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {sampleBandi.map(bando => (
            <div key={bando.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-2">{bando.title}</h4>
              <p className="text-gray-600 mb-4">{bando.description}</p>
              <p className="text-sm text-gray-400">Scadenza: {bando.deadline}</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Partecipa
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
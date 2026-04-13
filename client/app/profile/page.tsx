'use client';
import { useEffect, useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import { User, PaginatedUsers } from '../../interfaces/models';
import { getUserById, updateUser, getAllUsers, changeUserRole, deleteProfile, toggleUserActive } from '../../services/profileService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, refreshProfile, isActive} = useAuthSession();
    const attivo = isActive ? 'Sì' : 'No'
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [paginatedUsers, setPaginatedUsers] = useState<PaginatedUsers>({
      total: 0,
      page: 1,
      limit: 20,
      pages: 1,
      users: [],
    });

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('@token');
      if (!token) return;
      setLoadingUsers(true);
      const data = await getAllUsers(token, page, paginatedUsers.limit);
      setPaginatedUsers(data);
    } catch (err) {
      toast.error('Errore nel caricamento utenti' + err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('@token');
        if (!token) return;

        const userData = user ? await getUserById(token) : await refreshProfile();
        setForm(userData);

        if (userData?.role === 'ADMIN') {
          fetchUsers();
        }
      } catch (err: any) {
        console.error(err);
        setError('Impossibile caricare i dati utente');
      }
    };
    fetchProfile();
  }, [user, refreshProfile]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!form) return <p>Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateUser({
        firstName: form.firstName,
        lastName: form.lastName,
      });
      const refreshedProfile = await refreshProfile();
      if (refreshedProfile) setForm(refreshedProfile);
      toast.success('Profilo aggiornato con successo');
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Errore durante l\'aggiornamento del profilo');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    const activeToken = localStorage.getItem('@token');
    if (!activeToken) return;
    const original = await getUserById(activeToken);
    setForm(original);
    setIsEditing(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginatedUsers.pages) return;
    fetchUsers(newPage);
  };

   const handleRoleChange = async (targetUserId: string, newRole: 'USER' | 'ADMIN') => {
      try {
        const token = localStorage.getItem('@token');
        if (!token) return;
        await changeUserRole(targetUserId, newRole as any, token);
        toast.success(`Ruolo aggiornato a ${newRole}`);
        setPaginatedUsers((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === targetUserId ? { ...u, role: newRole } : u
        ),
      }));
      } catch (err: any) {
        console.error(err);
      }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('@token');
      if (!token) return;

      await toggleUserActive(userId, isActive, token);
      toast.success(`Utente ${isActive ? 'abilitato' : 'disabilitato'} con successo`);

      setPaginatedUsers((prev) => ({
        ...prev,
        users: prev.users.map(u =>
          u._id === userId ? { ...u, isActive } : u
        ),
      }));
    } catch (err: any) {
      toast.error('Errore durante il cambio stato utente');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('@token');
      if (!token) return;

      if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

      await deleteProfile(userId, token);
      toast.success('Utente eliminato con successo');

      setPaginatedUsers((prev) => ({
        ...prev,
        users: prev.users.filter(u => u._id !== userId),
      }));
    } catch (err: any) {
      toast.error('Errore durante l\'eliminazione dell\'utente');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-gray-800">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          <h2 className="text-2xl font-bold mb-4 mt-4 text-white">Profilo {user?.role}</h2>
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-7xl mx-auto">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold">Nome</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Cognome</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {saving ? 'Salvando...' : 'Salva'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Annulla
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><b>FullName:</b> {form.fullName}</p>
              <p><b>Nome:</b> {form.firstName}</p>
              <p><b>Cognome:</b> {form.lastName}</p>
              <p><b>Email:</b> {form.email}</p>
              <p><b>Ruolo:</b> {form.role}</p>
              <p><b>Utente attivo:</b> {attivo}</p>
              <p><b>Data di creazione profilo:</b> {new Date(form.createdAt).toLocaleString()}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Modifica
              </button>
            </div>
          )}
        </div>

        {form.role === 'ADMIN' && (
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 mt-4 text-white">Elenco utenti</h2>
            {loadingUsers ? (
              <p>Loading utenti...</p>
            ) : paginatedUsers.users.length === 0 ? (
              <p>Nessun utente trovato</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-2xl overflow-hidden shadow-lg">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Nome Completo</th>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Email</th>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Ruolo</th>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Abilitato</th>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Creato il</th>
                      <th className="py-3 px-4 text-left hover:bg-indigo-500 select-none">Azioni</th>                      
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.users.map(u => {
                      const isSelf = u._id === user?.id || u._id === user?._id;
                      const isAdminUser = u.role === 'ADMIN';

                      return (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{u.fullName}</td>
                          <td className="py-2 px-4">{u.email}</td>
                          <td className="py-2 px-4">{u.role}</td>
                          <td className="py-2 px-4">
                            {isAdminUser ? (
                              <span className="text-green-600 font-bold">ATTIVO</span>
                            ) : u.isActive ? (
                              <span className="text-green-600">Attivo</span>
                            ) : (
                              <span className="text-red-600">Disabilitato</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {new Date(u.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-center flex justify-center gap-2">
                            <select
                              value={u.role}
                              disabled={isSelf || isAdminUser}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="bg-gray-100 border-none text-[10px] font-black uppercase text-gray-600"
                            >
                              {['USER', 'ADMIN'].map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                            <input
                              type="checkbox"
                              checked={isAdminUser ? true : u.isActive}
                              disabled={isSelf || isAdminUser}
                              onChange={(e) => handleToggleActive(u._id, e.target.checked)}
                            />
                            <button
                              disabled={isSelf || isAdminUser}
                              onClick={() => handleDeleteUser(u._id)}
                              className={`text-sm ${
                                isSelf || isAdminUser
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-white hover:bg-gray-700'
                              }`}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400"
                  onClick={() => handlePageChange(paginatedUsers.page - 1)}
                  disabled={paginatedUsers.page === 1}
                >
                  &larr; Precedente
                </button>
                <span className="text-white">Pagina {paginatedUsers.page} di {paginatedUsers.pages}</span>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400"
                  disabled={paginatedUsers.page === paginatedUsers.pages}
                  onClick={() => handlePageChange(paginatedUsers.page + 1)}
                >
                  Successivo &rarr;
                </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
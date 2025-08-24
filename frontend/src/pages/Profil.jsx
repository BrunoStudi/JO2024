import { useState, useEffect } from "react";
import { useUser } from "../services/UserContext";
import { useAuth } from "../services/AuthContext";
import { User, Mail, MapPin, Phone, Edit2, Save } from "lucide-react";

const UserProfile = () => {
  const { user } = useAuth();             // Pour récupérer l'email
  const { userProfile, updateUserProfile, loading } = useUser(); // Pour récupérer et mettre à jour le profil

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialiser les champs dès que le profil est chargé
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setAddress(userProfile.address || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ firstName, lastName, address, phone });
      setSuccess('Profil mis à jour avec succès');
      setError('');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du profil');
      setSuccess('');
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Chargement du profil...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Mon Profil</h2>

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <Edit2 size={18} /> Modifier
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (lecture seule) */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="email"
              value={user?.username || ''}
              readOnly
              className="peer w-full pl-10 border border-gray-300 rounded-md px-3 pt-5 pb-2 placeholder-transparent bg-gray-100 cursor-not-allowed"
              placeholder="Email"
            />
            <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Email
            </label>
          </div>

          {/* Prénom */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              readOnly={!editMode}
              className={`peer w-full pl-10 border border-gray-300 rounded-md px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Prénom"
            />
            <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Prénom
            </label>
          </div>

          {/* Nom */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              readOnly={!editMode}
              className={`peer w-full pl-10 border border-gray-300 rounded-md px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nom"
            />
            <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Nom
            </label>
          </div>

          {/* Adresse */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly={!editMode}
              className={`peer w-full pl-10 border border-gray-300 rounded-md px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Adresse"
            />
            <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Adresse
            </label>
          </div>

          {/* Téléphone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={!editMode}
              className={`peer w-full pl-10 border border-gray-300 rounded-md px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Téléphone"
            />
            <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Téléphone
            </label>
          </div>

          {/* Bouton Enregistrer */}
          {editMode && (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
            >
              <Save size={18} /> Enregistrer
            </button>
          )}

          {/* Messages */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;

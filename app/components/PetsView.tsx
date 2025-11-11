import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { petsAPI } from '../lib/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

interface Pet {
  id: number;
  name: string;
  birthdate: string;
  sex: string;
  spayed_neutered: boolean;
  address: string;
  behavioral_notes: string;
  supplies_location: string;
  allergies?: string;
  active: boolean;
  origin_trainer: boolean;
}

export function PetsView() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [expandedPets, setExpandedPets] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await petsAPI.getAll();
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setIsDrawerOpen(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setIsDrawerOpen(true);
  };

  const handleDeletePet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
      await petsAPI.delete(id);
      await fetchPets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet');
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await petsAPI.updateActiveStatus(id, !active);
      await fetchPets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet status');
    }
  };

  const handleSavePet = async (petData: Partial<Pet>) => {
    try {
      if (editingPet) {
        await petsAPI.update(editingPet.id, petData);
      } else {
        // Mark as created from TrainerPath
        await petsAPI.create({ ...petData, origin_trainer: true } as any);
      }
      await fetchPets();
      setIsDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pet');
    }
  };

  const togglePetExpanded = (petId: number) => {
    setExpandedPets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(petId)) {
        newSet.delete(petId);
      } else {
        newSet.add(petId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const activePets = pets.filter(p => p.active);
  const inactivePets = pets.filter(p => !p.active);

  return (
    <div className="px-6 pt-8 pb-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Pets
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your training clients</p>
        </div>
        <button
          onClick={handleAddPet}
          className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Active Pets */}
      {activePets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-700 mb-3 px-2">Active Clients</h3>
          <div className="space-y-3">
            {activePets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isExpanded={expandedPets.has(pet.id)}
                onToggleExpand={togglePetExpanded}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Pets */}
      {inactivePets.length > 0 && (
        <div>
          <h3 className="text-gray-500 mb-3 px-2">Inactive Clients</h3>
          <div className="space-y-3">
            {inactivePets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isExpanded={expandedPets.has(pet.id)}
                onToggleExpand={togglePetExpanded}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-gray-900 mb-2">No pets yet</h3>
          <p className="text-gray-600 mb-6">Add your first training client to get started</p>
          <button
            onClick={handleAddPet}
            className="px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Add Your First Pet
          </button>
        </div>
      )}

      {/* Add/Edit Drawer */}
      <PetFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSavePet}
        pet={editingPet}
      />
    </div>
  );
}

function PetCard({
  pet,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  pet: Pet;
  isExpanded: boolean;
  onToggleExpand: (petId: number) => void;
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
}) {
  const age = pet.birthdate
    ? Math.floor((new Date().getTime() - new Date(pet.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        pet.active ? 'border-gray-200' : 'border-gray-200 opacity-60'
      } ${!pet.origin_trainer && 'bg-blue-50/30'}`}
    >
      {/* Clickable Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => onToggleExpand(pet.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-900">{pet.name}</h3>
              {pet.origin_trainer ? (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  TrainerPath
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Pocket Walks
                </span>
              )}
              {!pet.active && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              {pet.sex} • {age !== null ? `${age} years old` : 'Age unknown'} •{' '}
              {pet.spayed_neutered ? 'Fixed' : 'Not fixed'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pet);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
            {pet.origin_trainer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(pet.id);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <div className="space-y-2 text-sm pt-3">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <p className="text-gray-700">{pet.address}</p>
                </div>

                {pet.behavioral_notes && (
                  <div>
                    <span className="text-gray-500">Behavioral Notes:</span>
                    <p className="text-gray-700">{pet.behavioral_notes}</p>
                  </div>
                )}

                {pet.allergies && (
                  <div>
                    <span className="text-gray-500">Allergies:</span>
                    <p className="text-gray-700">{pet.allergies}</p>
                  </div>
                )}

                {pet.supplies_location && (
                  <div>
                    <span className="text-gray-500">Supplies:</span>
                    <p className="text-gray-700">{pet.supplies_location}</p>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(pet.id, pet.active);
                }}
                className={`w-full py-2 rounded-xl text-sm transition-all ${
                  pet.active
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {pet.active ? 'Mark as Inactive' : 'Mark as Active'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PetFormDrawer({
  isOpen,
  onClose,
  onSave,
  pet,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Partial<Pet>) => void;
  pet: Pet | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    sex: 'Male',
    spayed_neutered: false,
    address: '',
    behavioral_notes: '',
    supplies_location: '',
    allergies: '',
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        birthdate: pet.birthdate,
        sex: pet.sex,
        spayed_neutered: pet.spayed_neutered,
        address: pet.address,
        behavioral_notes: pet.behavioral_notes,
        supplies_location: pet.supplies_location,
        allergies: pet.allergies || '',
      });
    } else {
      setFormData({
        name: '',
        birthdate: '',
        sex: 'Male',
        spayed_neutered: false,
        address: '',
        behavioral_notes: '',
        supplies_location: '',
        allergies: '',
      });
    }
  }, [pet, isOpen]);

  const handleSubmit = () => {
    if (!formData.name || !formData.birthdate || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto overflow-x-hidden"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            <div className="max-w-md mx-auto w-full px-2">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-gray-900">{pet ? 'Edit Pet' : 'Add New Pet'}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 md:p-6 pb-12 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Max, Luna, Charlie"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Birthdate */}
                <div>
                  <label className="block text-gray-700 mb-2">Birthdate *</label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className="block text-gray-700 mb-2">Sex *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female'].map((sex) => (
                      <button
                        key={sex}
                        onClick={() => setFormData({ ...formData, sex })}
                        className={`py-3 rounded-xl transition-all ${
                          formData.sex === sex
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spayed/Neutered */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.spayed_neutered}
                      onChange={(e) =>
                        setFormData({ ...formData, spayed_neutered: e.target.checked })
                      }
                      className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Spayed/Neutered</span>
                  </label>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Behavioral Notes */}
                <div>
                  <label className="block text-gray-700 mb-2">Behavioral Notes *</label>
                  <textarea
                    value={formData.behavioral_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, behavioral_notes: e.target.value })
                    }
                    placeholder="Any behavioral concerns or training goals..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Supplies Location */}
                <div>
                  <label className="block text-gray-700 mb-2">Supplies Location *</label>
                  <input
                    type="text"
                    value={formData.supplies_location}
                    onChange={(e) =>
                      setFormData({ ...formData, supplies_location: e.target.value })
                    }
                    placeholder="Where training supplies are kept"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Allergies <span className="text-gray-400 text-sm">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Any known allergies"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{pet ? 'Update Pet' : 'Add Pet'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

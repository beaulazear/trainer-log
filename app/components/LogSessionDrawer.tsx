import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { petsAPI } from '../lib/api';

interface LogSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: {
    id?: string;
    date: string;
    petId?: number;
    dogName: string;
    duration: number;
    focus: string[];
  }) => void;
  editSession?: {
    id: string;
    date: string;
    petId?: number;
    dogName: string;
    duration: number;
    focus: string[];
  } | null;
}

interface Pet {
  id: number;
  name: string;
  active: boolean;
}

const focusTags = [
  'Leash Manners',
  'Recall',
  'Reactivity',
  'Socialization',
  'Basic Obedience',
  'Agility',
  'Scent Work',
  'Other',
];

export function LogSessionDrawer({ isOpen, onClose, onSave, editSession }: LogSessionDrawerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(undefined);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchPets();

      // Pre-populate form when editing
      if (editSession) {
        setDate(editSession.date);
        setDuration(editSession.duration);
        setSelectedPetId(editSession.petId);
        setSelectedFocus(editSession.focus || []);
        setCustomDuration('');
      } else {
        // Reset form for new session
        setDate(new Date().toISOString().split('T')[0]);
        setDuration(60);
        setCustomDuration('');
        setSelectedPetId(undefined);
        setSelectedFocus([]);
      }
    }
  }, [isOpen, editSession]);

  const fetchPets = async () => {
    try {
      setIsLoadingPets(true);
      const data = await petsAPI.getAll();
      setPets(data.filter((p: any) => p.active));
    } catch (err) {
      console.error('Failed to load pets:', err);
      setPets([]);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const handleSave = () => {
    const finalDuration = customDuration ? parseInt(customDuration) : duration;
    const selectedPet = pets.find(p => p.id === selectedPetId);

    onSave({
      id: editSession?.id,
      date,
      petId: selectedPetId,
      dogName: selectedPet?.name || editSession?.dogName || 'General Training',
      duration: finalDuration,
      focus: selectedFocus.length > 0 ? selectedFocus : ['General Training'],
    });

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setDuration(60);
    setCustomDuration('');
    setSelectedPetId(undefined);
    setSelectedFocus([]);
  };

  const toggleFocus = (tag: string) => {
    if (selectedFocus.includes(tag)) {
      setSelectedFocus(selectedFocus.filter(t => t !== tag));
    } else {
      setSelectedFocus([...selectedFocus, tag]);
    }
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[60] max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">{editSession ? 'Edit Training Session' : 'Log Training Session'}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 pb-8 space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Duration Quick Picks */}
                <div>
                  <label className="block text-gray-700 mb-3">Duration</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[30, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setDuration(mins);
                          setCustomDuration('');
                        }}
                        className={`py-4 px-4 rounded-xl transition-all ${
                          duration === mins && !customDuration
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-xl">{mins}</div>
                        <div className="text-xs opacity-80">min</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Duration */}
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Custom duration (minutes)</label>
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Enter minutes"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Pet Selection */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Select Pet <span className="text-gray-400 text-sm">(optional)</span>
                  </label>
                  {isLoadingPets ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-500 text-center">
                      Loading pets...
                    </div>
                  ) : pets.length > 0 ? (
                    <select
                      value={selectedPetId || ''}
                      onChange={(e) => setSelectedPetId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">General Training (No specific pet)</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm text-center">
                      No pets available. Add pets in the Pets tab to track training by dog.
                    </div>
                  )}
                </div>

                {/* Training Focus Tags */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    Training Focus <span className="text-gray-400 text-sm">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {focusTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleFocus(tag)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedFocus.includes(tag)
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{editSession ? 'Update Session' : 'Save Session'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

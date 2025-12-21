
import { create } from 'zustand';
import { Form, Block, BlockType, FormStatus, MCQOption } from './types';
import { db } from './services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';

interface ZienkState {
  currentForm: Form | null;
  forms: Form[];
  submissions: any[];
  isLoading: boolean;
  
  // Actions
  fetchForms: () => Promise<void>;
  saveCurrentForm: () => Promise<void>;
  setCurrentForm: (form: Form | null) => void;
  updateForm: (updates: Partial<Form>) => void;
  addBlock: (type: BlockType) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  addMCQOption: (blockId: string) => void;
  updateMCQOption: (blockId: string, optionId: string, updates: Partial<MCQOption>) => void;
  removeMCQOption: (blockId: string, optionId: string) => void;
  deleteForm: (formId: string) => Promise<void>;
}

export const useStore = create<ZienkState>((set, get) => ({
  currentForm: null,
  forms: [],
  submissions: [],
  isLoading: false,

  fetchForms: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const forms = querySnapshot.docs.map(doc => doc.data() as Form);
      set({ forms, isLoading: false });
    } catch (error) {
      console.error("Error fetching forms:", error);
      set({ isLoading: false });
    }
  },

  saveCurrentForm: async () => {
    const { currentForm } = get();
    if (!currentForm) return;
    
    set({ isLoading: true });
    try {
      await setDoc(doc(db, "forms", currentForm.id), currentForm);
      set({ isLoading: false });
      // Refresh list
      get().fetchForms();
    } catch (error) {
      console.error("Error saving form:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteForm: async (formId) => {
    try {
      await deleteDoc(doc(db, "forms", formId));
      set(state => ({ forms: state.forms.filter(f => f.id !== formId) }));
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  },

  setCurrentForm: (form) => set({ currentForm: form }),
  
  updateForm: (updates) => set((state) => ({
    currentForm: state.currentForm ? { ...state.currentForm, ...updates } : null
  })),

  addBlock: (type) => set((state) => {
    if (!state.currentForm) return state;
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      title: type === BlockType.INFO ? 'Info Title' : 'New Question',
      content: type === BlockType.INFO ? 'Provide information or context here for the user to read.' : '',
      required: type !== BlockType.INFO,
      aiEnabled: false,
      charLimit: 255,
      options: type === BlockType.MCQ ? [
        { id: crypto.randomUUID(), text: 'Option 1', points: 0, isCorrect: false }
      ] : undefined
    };
    return {
      currentForm: {
        ...state.currentForm,
        blocks: [...state.currentForm.blocks, newBlock]
      }
    };
  }),

  updateBlock: (blockId, updates) => set((state) => {
    if (!state.currentForm) return state;
    return {
      currentForm: {
        ...state.currentForm,
        blocks: state.currentForm.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
      }
    };
  }),

  removeBlock: (blockId) => set((state) => {
    if (!state.currentForm) return state;
    return {
      currentForm: {
        ...state.currentForm,
        blocks: state.currentForm.blocks.filter(b => b.id !== blockId)
      }
    };
  }),

  addMCQOption: (blockId) => set((state) => {
    if (!state.currentForm) return state;
    return {
      currentForm: {
        ...state.currentForm,
        blocks: state.currentForm.blocks.map(b => {
          if (b.id === blockId && b.options) {
            return {
              ...b,
              options: [...b.options, { id: crypto.randomUUID(), text: 'New Option', points: 0, isCorrect: false }]
            };
          }
          return b;
        })
      }
    };
  }),

  updateMCQOption: (blockId, optionId, updates) => set((state) => {
    if (!state.currentForm) return state;
    return {
      currentForm: {
        ...state.currentForm,
        blocks: state.currentForm.blocks.map(b => {
          if (b.id === blockId && b.options) {
            return {
              ...b,
              options: b.options.map(o => o.id === optionId ? { ...o, ...updates } : o)
            };
          }
          return b;
        })
      }
    };
  }),

  removeMCQOption: (blockId, optionId) => set((state) => {
    if (!state.currentForm) return state;
    return {
      currentForm: {
        ...state.currentForm,
        blocks: state.currentForm.blocks.map(b => {
          if (b.id === blockId && b.options) {
            return {
              ...b,
              options: b.options.filter(o => o.id !== optionId)
            };
          }
          return b;
        })
      }
    };
  })
}));

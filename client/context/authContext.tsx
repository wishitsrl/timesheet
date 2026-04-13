'use client';
import {
  createContext,
  useMemo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
  MutableRefObject,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService, logoutService, registerService } from '@/services/authService';
import { getUserById } from '../services/profileService';
import { isTokenValid } from './isTokenValid';
import { User } from '../interfaces/models';
import toast from 'react-hot-toast';

type AuthContextType = {
  signInAccesso: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, role: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: User | null) => void;
  refreshProfile: () => Promise<User | null>;
  user: User | null;
  role: string | null;
  isAdmin: boolean;
  token: MutableRefObject<string | null>;
  isLoading: boolean;
  errorMessage: string | null;
  isAuthenticated: boolean;
  isActive: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthSession = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthSession must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tokenRef = useRef<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const updateUser = useCallback((userData: User | null) => {
    if (!userData) {
      localStorage.removeItem('@user');
      localStorage.removeItem('@token');
      tokenRef.current = null;
      setUserState(null);
      setIsAuthenticated(false);
      return;
    }

    const existingToken = tokenRef.current || localStorage.getItem('@token');
    const newToken = userData.accessToken || existingToken || '';
    const userToSave: User = { ...userData, accessToken: newToken };

    localStorage.setItem('@user', JSON.stringify(userToSave));
    localStorage.setItem('@token', newToken);

    tokenRef.current = newToken;
    setUserState(userToSave);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    const token = localStorage.getItem('@token');
    if (token) {
      await logoutService(token).catch(() => toast.error('Server logout failed'));
    }
    localStorage.removeItem('@token');
    localStorage.removeItem('@user');
    tokenRef.current = null;
    setUserState(null);
    setIsAuthenticated(false);

    router.replace('/');
  }, [router]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('@token');
      const userJson = localStorage.getItem('@user');

      if (token && isTokenValid(token)) {
        tokenRef.current = token;
        if (userJson) setUserState(JSON.parse(userJson));
        setIsAuthenticated(true);
      } else if (token) {
        await signOut();
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [signOut]);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    const activeToken = tokenRef.current || localStorage.getItem('@token');
    if (!activeToken) return null;

    try {
      const response = await getUserById(activeToken);
      const userData: User = response.user || response;
      updateUser(userData);
      return userData;
    } catch (err: any) {
      toast.error('Failed to refresh profile');
      return null;
    }
  }, [updateUser]);

  const signInAccesso = async (email: string, password: string): Promise<void> => {
    setErrorMessage(null);
    try {
      const data = await authService(email, password);
      updateUser(data);
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMessage(error.message);
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, role: string, password: string): Promise<void> => {
    setErrorMessage(null);
    if (!role) {
      const msg = 'Per favore, seleziona un tipo di utente';
      toast.error(msg);
      setErrorMessage(msg);
      throw new Error(msg);
    }

    try {
      const data = await registerService(firstName, lastName, email, role, password);
      if (!data) {
        toast.error('Registration failed on server');
        throw new Error('Registration failed on server');
      }

      router.push('/login');
    } catch (error: any) {
      setErrorMessage(error.message);
      toast.error(error.message);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      register,
      signInAccesso,
      signOut,
      user,
      setUser: updateUser,
      refreshProfile,
      role: user?.role ?? null,
      isAdmin: user?.role === 'ADMIN',
      token: tokenRef,
      isLoading,
      errorMessage,
      isAuthenticated,
      isActive: user?.isActive ?? false,
    }),
    [user, isLoading, errorMessage, isAuthenticated, register, signInAccesso, signOut, refreshProfile, updateUser]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
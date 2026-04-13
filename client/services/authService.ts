import { apiClient } from './apiClient';
import { User } from '../interfaces/models';

const persistUser = (data: User): User => {
  const user: User = {
		id: data.id,
		email: data.email,
		fullName: data.fullName,
		firstName: data.firstName,
		lastName: data.lastName,
		role: data.role,
		accessToken: data.accessToken,
		isActive: data.isActive,
		createdAt: data.createdAt,
	};
	localStorage.setItem('@token', data.accessToken);
	localStorage.setItem('@user', JSON.stringify(user));
	return user;
};

export const authService = async (email: string, password: string): Promise<User> => {
	try {
		const { data } = await apiClient.post<User>('/auth/login', { email, password });
		if (!data?.accessToken) {
			throw new Error('Missing access token in login response.');
		}
		return data;
	} catch (error: any) {
		const message = error.response?.data?.message || 'Login fallito. Riprova più tardi.';
        throw new Error(message);
	}
};

export const registerService = async ( firstName: string, lastName: string, email: string, role: string, password: string): Promise<User> => {
	try {
		const { data } = await apiClient.post<User>('/auth/register', { firstName, lastName, email, role, password });
		return data;
	} catch (error: any) {
		const message = error.response?.data?.message || 'Registrazione fallita.';
        throw new Error(message);
	}
};

export const logoutService = async (accessToken: string): Promise<void> => {
	try {
		localStorage.removeItem('@token');
		localStorage.removeItem('@user');
		const response = await apiClient.delete('/auth/logout', {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (response.status !== 200) {
			throw new Error('Missing access token in logout response.');
		}
	} catch (error: any) {
		console.error('Error during logout:', error);
	}
};

export const forgotPasswordService = async (email: string): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
        return data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Errore nell\'invio dell\'email di recupero.';
        throw new Error(message);
    }
};

export const resetPasswordService = async (token: string, password: string): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.post<{ message: string }>(`/auth/reset-password/${token}`, { password });
        return data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Token non valido o scaduto.';
        throw new Error(message);
    }
};

export const refreshTokenService = async (): Promise<User> => {
    try {
        const { data } = await apiClient.post<User>(
            '/auth/refresh-token',
            {}, 
            { withCredentials: true }
        );
        if (!data?.accessToken?.trim()) {
            throw new Error('Refresh token failed: no access token returned.');
        }
        persistUser(data);
        return data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Refresh token fallito.';
        throw new Error(message);
    }
};

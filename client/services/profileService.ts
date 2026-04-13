import { apiClient } from './apiClient';
import { User, PaginatedUsers } from '../interfaces/models';

export const getUserById = async (token: string): Promise<User> => {
	try {
		const response = await apiClient.get<User>('/profile', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
    console.log('Fetched user profile:', response.data);
		return response.data.user;
	} catch (error) {
		console.error('Error fetching user profile:', error);
		throw error;
	}
};

export const getAllUsers = async (
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedUsers> => {
  try {
    const response = await apiClient.get<PaginatedUsers>('/profile/users', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });

    console.log('Fetched users:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (updatedData: Partial<User>): Promise<User> => {
	try {
		const response = await apiClient.put<User>('/profile', updatedData);
		return response.data;
	} catch (error) {
		console.error('Error updating user profile:', error);
		throw error;
	}
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
	try {
		await apiClient.put<User>('/profile/change-password', {
			currentPassword,
			newPassword,
		});
	} catch (error) {
		console.error('Error changing password:', error);
		throw error;
	}
};

export const deleteProfile = async (userId: string, token: string) => {
  try {
    await apiClient.delete(`/profile/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const changeUserRole = async (
  userId: string,
  role: 'USER' | 'ADMIN',
  token: string
): Promise<void> => {
  try {
    await apiClient.patch(`/profile/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
};

export const toggleUserActive = async (userId: string, isActive: boolean, token: string) => {
  try {
    const response = await apiClient.patch(
      `/profile/users/${userId}/active`,
      { isActive },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling user active status:', error);
    throw error;
  }
};

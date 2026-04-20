import { userRepository } from "../repositories/user.repository.js";
import { UserRole } from "@csirs/shared/types";

class UserService {
  async getAllUsers() {
    return userRepository.findAllUsers();
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    // Security: Prevent removing the last admin
    if (newRole === "REPORTER") {
      const admins = await userRepository.findAllAdmins();
      if (admins.length === 1) {
        const lastAdmin = admins[0];
        if (lastAdmin.id === userId) {
          throw new Error("Cannot demote the last admin account");
        }
      }
    }

    const updatedUser = await userRepository.updateRole(userId, newRole);
    return updatedUser;
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  // Add these methods to your existing UserService class

  async updateProfile(userId: string, name: string) {
    if (!userId) throw new Error("User ID is required");

    return userRepository.update(userId, { name }); // ← Fixed: now passing 2 arguments
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Verify current password
    const user = await userRepository.findById(userId); // You'll need to extend findById to include password if not already
    if (!user || !user.password) throw new Error("User not found");

    const isValid = await userRepository.verifyPassword(
      user.password,
      currentPassword,
    );
    if (!isValid) throw new Error("Current password is incorrect");

    // Update to new password
    return userRepository.updatePassword(userId, newPassword);
  }
}

export const userService = new UserService();
export default userService;

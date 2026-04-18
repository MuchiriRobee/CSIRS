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
}

export const userService = new UserService();
export default userService;

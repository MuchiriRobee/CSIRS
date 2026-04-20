import { useState } from 'react';
import { useForm } from 'react-hook-form';
//import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Eye, EyeOff, LogOut, User, Lock } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
    },
  });

  // Password Form
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleUpdateProfile = async (data: { name: string }) => {
    setIsUpdatingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: data.name }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Profile updated successfully');
        // Optional: refresh user in context if needed
      } else {
        toast.error(json.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (data.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Password changed successfully');
        passwordForm.reset();
      } else {
        toast.error(json.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-semibold text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Email Address</Label>
              <Input value={user?.email || ''} disabled className="bg-slate-50" />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...profileForm.register('name')}
                className="h-12"
              />
            </div>
          </div>

          <Button 
            onClick={profileForm.handleSubmit(handleUpdateProfile)}
            disabled={isUpdatingProfile}
            className="w-full md:w-auto"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account remains secure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Logout from Account</CardTitle>
          <CardDescription>Sign out of your CSIRS session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full md:w-auto flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
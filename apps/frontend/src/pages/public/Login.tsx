import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useLoginMutation } from '../../api/authApi';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
import { loginSchema } from '@csirs/shared';           // ← Import schema
import type { LoginInput } from '@csirs/shared';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),   // ← Full Zod resolver
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await loginMutation(data).unwrap();
      
      // Adjust based on your actual backend response shape (from Postman)
      const accessToken = response.data?.accessToken || response.accessToken;
      const user = response.data?.user || response.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      login(accessToken, user);
      toast.success(`Welcome back, ${user.name}!`);
      
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/my-reports');
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Invalid email or password';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">CSIRS</div>
              <div className="text-xs text-muted-foreground -mt-1">Campus Safety</div>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to track your reports and access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="reporter@example.com"
                  {...form.register('email')}
                  className="h-12"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...form.register('password')}
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'royalblue', fontWeight: 'Bold' }} className="hover:underline">
                Create one here
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link to="/" className="text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-1">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
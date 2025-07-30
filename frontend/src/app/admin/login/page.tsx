'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminCredentials } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useActionLogger, useComponentLifecycle } from '@/hooks/useActionLogger';

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: '',
    password: '',
  });

  // Initialize logging hooks
  const { logClick, logFormSubmit, logInputChange, logError, logPerformance } = useActionLogger('AdminLoginPage');
  useComponentLifecycle('AdminLoginPage');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    // Log input changes (without sensitive data)
    logInputChange(name, name === 'password' ? '[HIDDEN]' : value);
    
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const startTime = performance.now();
    
    // Log form submission attempt
    logFormSubmit('admin-login', {
      formName: 'admin-login',
      metadata: {
        hasUsername: !!credentials.username,
        hasPassword: !!credentials.password,
      },
    });
    
    try {
      const result = await login(credentials);
      const duration = performance.now() - startTime;
      
      if (result.success) {
        // Log successful login
        logPerformance('login_success', duration);
        logClick('login-success', {
          metadata: { redirectTo: '/admin' },
        });
        
        router.push('/admin');
      } else {
        // Log failed login attempt
        logError(new Error('Login failed: Invalid credentials'), 'authentication');
        logPerformance('login_failure', duration);
      }
    } catch (err) {
      const duration = performance.now() - startTime;
      const error = err instanceof Error ? err : new Error('Unknown login error');
      
      // Log login error
      logError(error, 'login_exception');
      logPerformance('login_error', duration);
      
      console.error('Login error:', err);
    }
  };

  const handleUsernameClick = (): void => {
    logClick('username-input', { inputField: 'username' });
  };

  const handlePasswordClick = (): void => {
    logClick('password-input', { inputField: 'password' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md border-black border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Masukkan kredensial untuk mengakses panel admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="username"
                    placeholder="Username"
                    className="pl-10"
                    value={credentials.username}
                    onChange={handleInputChange}
                    onClick={handleUsernameClick}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={credentials.password}
                    onChange={handleInputChange}
                    onClick={handlePasswordClick}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                onClick={() => logClick('login-button', { 
                  buttonId: 'login-submit',
                  metadata: { disabled: loading },
                })}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            Hanya untuk pengguna yang berwenang
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Welcome back to Recipe Card Builder</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <LoginForm />

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

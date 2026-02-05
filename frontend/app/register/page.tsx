import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register</h1>
          <p className="text-gray-600">Create your Recipe Card Builder account</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <RegisterForm />

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Amar Job</h1>
        <p className="text-gray-600">Find jobs and connect with clients</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default GetStarted;
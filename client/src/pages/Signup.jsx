import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate    = useNavigate();

  const [form, setForm]       = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'firstname', label: 'First Name',  type: 'text',     placeholder: 'John' },
    { name: 'lastname',  label: 'Last Name',   type: 'text',     placeholder: 'Doe' },
    { name: 'email',     label: 'Email',       type: 'email',    placeholder: 'you@example.com' },
    { name: 'password',  label: 'Password',    type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Create account</h1>
          <p className="mt-2 text-zinc-400 text-sm">Start organising your tasks today</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500
                             rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400
                             focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed
                         text-zinc-900 font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
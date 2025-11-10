"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

interface Settings {
  prompt: string;
  voiceOptions: VoiceOption[];
  selectedVoice: string;
  openai_model: string;
  simli_faceid: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaveStatus('Saving...');
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Failed to save settings');
      }
    } catch (error) {
      setSaveStatus('Error saving settings');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (loading) {
    return (
      <div className="bg-[#00235B] min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#00235B] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  placeholder="Enter password"
                  required
                />
              </div>
              {loginError && (
                <div className="text-red-300 text-sm">{loginError}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#00235B] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>

          {settings && (
            <div className="space-y-6">
              {/* Prompt Editor */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">System Prompt</h2>
                <textarea
                  value={settings.prompt}
                  onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
                  className="w-full h-96 px-4 py-3 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60 font-mono text-sm resize-y"
                  placeholder="Enter system prompt..."
                />
              </div>

              {/* Voice Selection */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Voice Settings</h2>
                <div className="mb-4">
                  <label className="block text-white mb-2">Selected Voice</label>
                  <select
                    value={settings.selectedVoice}
                    onChange={(e) => setSettings({ ...settings, selectedVoice: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  >
                    {settings.voiceOptions.map((voice) => (
                      <option key={voice.id} value={voice.id} className="bg-[#00235B]">
                        {voice.name} - {voice.description}
                      </option>
                    ))}
                  </select>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Available Voices</h3>
                <div className="space-y-3">
                  {settings.voiceOptions.map((voice, index) => (
                    <div key={voice.id} className="bg-white/10 p-4 rounded">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={voice.id}
                          onChange={(e) => {
                            const newVoices = [...settings.voiceOptions];
                            newVoices[index].id = e.target.value;
                            setSettings({ ...settings, voiceOptions: newVoices });
                          }}
                          className="px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                          placeholder="Voice ID"
                        />
                        <input
                          type="text"
                          value={voice.name}
                          onChange={(e) => {
                            const newVoices = [...settings.voiceOptions];
                            newVoices[index].name = e.target.value;
                            setSettings({ ...settings, voiceOptions: newVoices });
                          }}
                          className="px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                          placeholder="Voice Name"
                        />
                        <input
                          type="text"
                          value={voice.description}
                          onChange={(e) => {
                            const newVoices = [...settings.voiceOptions];
                            newVoices[index].description = e.target.value;
                            setSettings({ ...settings, voiceOptions: newVoices });
                          }}
                          className="px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                          placeholder="Description"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newVoices = settings.voiceOptions.filter((_, i) => i !== index);
                          setSettings({ ...settings, voiceOptions: newVoices });
                        }}
                        className="mt-2 text-red-300 hover:text-red-200 text-sm"
                      >
                        Remove Voice
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newVoice = { id: '', name: '', description: '' };
                      setSettings({ 
                        ...settings, 
                        voiceOptions: [...settings.voiceOptions, newVoice] 
                      });
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded transition-colors"
                  >
                    + Add New Voice
                  </button>
                </div>
              </div>

              {/* Other Settings */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Other Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">OpenAI Model</label>
                    <input
                      type="text"
                      value={settings.openai_model}
                      onChange={(e) => setSettings({ ...settings, openai_model: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                      placeholder="e.g., gpt-realtime"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Simli Face ID</label>
                    <input
                      type="text"
                      value={settings.simli_faceid}
                      onChange={(e) => setSettings({ ...settings, simli_faceid: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                      placeholder="Face ID"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveSettings}
                  className="bg-green-500/80 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded transition-colors"
                >
                  Save Settings
                </button>
                {saveStatus && (
                  <span className={`text-lg ${saveStatus.includes('success') ? 'text-green-300' : 'text-red-300'}`}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


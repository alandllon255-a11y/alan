import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { getProfile, uploadAvatar, updateProfile } from '../services/api.js';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ id: '', name: '', bio: '', avatarUrl: '', githubUrl: '', linkedinUrl: '', twitterUrl: '' });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    getProfile()
      .then((p) => {
        setForm((prev) => ({ ...prev, id: p.id, name: p.name || '', bio: p.bio || '', avatarUrl: p.avatarUrl || '' }));
        setPreview(p.avatarUrl || '');
      })
      .catch(() => setError('Falha ao carregar perfil'))
      .finally(() => setLoading(false));
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    uploadAvatar(file)
      .then(({ url }) => setForm((prev) => ({ ...prev, avatarUrl: url })))
      .catch(() => setError('Falha no upload do avatar'));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.id) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(form.id, { name: form.name, bio: form.bio, avatarUrl: form.avatarUrl });
      navigate('/');
    } catch (e) {
      setError('Falha ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-300">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Editar Perfil</h1>
        {error && (<div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-200 text-sm">{error}</div>)}

        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
          <div>
            <div {...getRootProps()} className={`rounded-lg border-2 ${isDragActive ? 'border-blue-500' : 'border-gray-700'} p-4 bg-gray-800 text-gray-300 cursor-pointer text-center`}>
              <input {...getInputProps()} />
              <div className="w-40 h-40 bg-gray-700 rounded-full overflow-hidden mx-auto mb-3">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sem avatar</div>
                )}
              </div>
              <div>Arraste uma imagem ou clique para enviar</div>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Nome">
              <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome" />
            </Field>
            <Field label="Bio">
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={5} className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Fale sobre você" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="GitHub">
                <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://github.com/usuario" />
              </Field>
              <Field label="LinkedIn">
                <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://linkedin.com/in/usuario" />
              </Field>
              <Field label="Twitter/X">
                <input name="twitterUrl" value={form.twitterUrl} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://twitter.com/usuario" />
              </Field>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className={`px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>Salvar</button>
              <button onClick={() => navigate('/')} className="px-5 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;


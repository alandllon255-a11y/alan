import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { profileService } from '../services/profileService';
import { ArrowLeft, Upload, Save, Link as LinkIcon, Github, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const initialForm = {
  name: '',
  bio: '',
  bannerUrl: '',
  headline: '',
  location: '',
  company: '',
  education: '',
  websiteUrl: '',
  avatarUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  portfolioUrl: '',
};

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const { success, error, toasts, removeToast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try {
      setUploading(true);
      const res = await profileService.uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatarUrl: res.url }));
    } catch (err) {
      error('Falha no upload', 'Não foi possível enviar o avatar');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  // Banner upload
  const onDropBanner = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    try {
      setUploadingBanner(true);
      const res = await profileService.uploadBanner(file);
      setForm((prev) => ({ ...prev, bannerUrl: res.url }));
    } catch (err) {
      error('Falha no upload', 'Não foi possível enviar o banner');
    } finally {
      setUploadingBanner(false);
    }
  }, []);

  const bannerDrop = useDropzone({
    onDrop: onDropBanner,
    maxFiles: 1,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }
  });

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const myUserId = useMemo(() => localStorage.getItem('devUserId') || '7', []);

  // Prefill current data
  useEffect(() => {
    (async () => {
      try {
        const res = await profileService.getMyProfile();
        setForm((prev) => ({
          ...prev,
          name: res?.name || '',
          bio: res?.bio || '',
          bannerUrl: res?.banner_url || '',
          headline: res?.headline || '',
          location: res?.location || '',
          company: res?.company || '',
          education: res?.education || '',
          websiteUrl: res?.website_url || '',
          avatarUrl: res?.avatar_url || '',
          githubUrl: res?.github_url || '',
          linkedinUrl: res?.linkedin_url || '',
          twitterUrl: res?.twitter_url || '',
          portfolioUrl: res?.portfolio_url || ''
        }));
      } catch {}
    })();
  }, []);

  const onSave = async () => {
    try {
      // URL validation (optional)
      const urlFields = ['websiteUrl', 'githubUrl', 'linkedinUrl', 'twitterUrl', 'portfolioUrl'];
      for (const f of urlFields) {
        const v = form[f];
        if (v && !/^https?:\/\//i.test(v)) {
          error('URL inválida', `O campo ${f} deve começar com http(s)://`);
          return;
        }
      }
      setSaving(true);
      await profileService.updateProfile(myUserId, form);
      success('Perfil atualizado', 'Suas informações foram salvas com sucesso');
      navigate('/profile');
    } catch (err) {
      error('Falha ao salvar', 'Não foi possível salvar suas informações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Banner uploader */}
      <div className="relative group rounded-2xl overflow-hidden mb-6">
        <div {...bannerDrop.getRootProps()} className={`w-full h-40 sm:h-56 ${form.bannerUrl ? '' : 'bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30'} cursor-pointer`}>
          <input {...bannerDrop.getInputProps()} />
          {form.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1 rounded-lg bg-gray-900/70 text-gray-200 text-sm">
            {uploadingBanner ? 'Enviando banner...' : 'Clique ou arraste para alterar o banner'}
          </span>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
                <p className="text-gray-400 text-sm">Atualize suas informações e avatar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar uploader */}
          <div className="lg:col-span-1">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-800/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-28 h-28 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {preview || form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview || form.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{uploading ? 'Enviando...' : 'Arraste uma imagem ou clique para enviar'}</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, GIF, WebP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-6 space-y-6">
              <div>
                <label className="block text-white mb-2">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Fale um pouco sobre você"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Headline</label>
                  <input
                    value={form.headline}
                    onChange={(e) => handleChange('headline', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@seunome | Seu cargo"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Localização</label>
                  <input
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cidade, País"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Empresa</label>
                  <input
                    value={form.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Onde você trabalha"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Formação</label>
                  <input
                    value={form.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua formação"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white mb-2">Website</label>
                  <input
                    value={form.websiteUrl}
                    onChange={(e) => handleChange('websiteUrl', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://meusite.dev"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</label>
                  <input
                    value={form.githubUrl}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/seuusuario"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</label>
                  <input
                    value={form.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/seuusuario"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter/X</label>
                  <input
                    value={form.twitterUrl}
                    onChange={(e) => handleChange('twitterUrl', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://x.com/seuusuario"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Portfólio</label>
                  <input
                    value={form.portfolioUrl}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://meusite.dev"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-700/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Container */}
      <div className="pointer-events-none">
        {/* eslint-disable-next-line react/jsx-pascal-case */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
};

export default ProfileEditPage;


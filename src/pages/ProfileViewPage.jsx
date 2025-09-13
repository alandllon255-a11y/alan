import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { Github, Linkedin, Twitter, Link as LinkIcon, User, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'projetos', label: 'Projetos' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'colaboracao', label: 'Colaboração' },
];

const ProfileViewPage = () => {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [activeTabId, setActiveTabId] = useState('projetos');

  const initials = useMemo(() => {
    const name = profile?.name?.trim() || '';
    if (!name) return 'DF';
    const parts = name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }, [profile?.name]);

  useEffect(() => {
    (async () => {
      try {
        const res = await profileService.getMyProfile();
        setProfile(res);
      } catch (e) {
        setLoadError('Falha ao carregar perfil');
      } finally {
        setIsLoadingProfile(false);
      }
    })();
  }, []);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center gap-3 text-gray-300">
          <Sparkles className="w-5 h-5 animate-pulse" /> Carregando perfil...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-red-400">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Banner estilizado na nossa paleta */}
      <div className="relative group rounded-2xl overflow-hidden mb-8 mx-auto max-w-6xl">
        <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-8 space-y-8">
              {/* Card do perfil */}
              <div className="relative -mt-32">
                <div className="p-6 rounded-2xl border border-gray-700/40 bg-gray-800/50 backdrop-blur">
                  <div className="flex justify-center">
                    <div className="relative group w-32 h-32">
                      <div className="w-full h-full rounded-full ring-4 ring-gray-900 bg-gradient-to-br from-blue-500/20 to-purple-600/20 overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-3xl font-bold text-gray-300">{initials}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <h1 className="text-2xl font-bold text-white">{profile?.name || 'Você'}</h1>
                    <p className="text-gray-400 text-sm">Nível {profile?.current_level} • {profile?.rank_title}</p>
                  </div>

                  <div className="mt-6 text-center">
                    {profile?.bio && (
                      <p className="text-gray-300 text-sm whitespace-pre-line">{profile.bio}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Link to="/profile/edit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all">Editar Perfil</Link>
                  </div>
                </div>
              </div>

              {/* Social / Links */}
              <div className="p-6 rounded-2xl border border-gray-700/40 bg-gray-800/50">
                <div className="grid grid-cols-1 gap-3">
                  {profile?.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="w-full text-center bg-gray-700/60 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm truncate">{profile.portfolio_url}</a>
                  )}
                  <div className="flex justify-center gap-5 mt-2">
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} title="LinkedIn" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin className="w-6 h-6" /></a>
                    )}
                    {profile?.github_url && (
                      <a href={profile.github_url} title="GitHub" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
                    )}
                    {profile?.twitter_url && (
                      <a href={profile.twitter_url} title="Twitter" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-sky-400 transition-colors"><Twitter className="w-6 h-6" /></a>
                    )}
                    {!profile?.portfolio_url && (
                      <span className="text-gray-500 text-xs flex items-center gap-1"><LinkIcon className="w-4 h-4" /> sem links</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal com abas */}
          <main className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-700/40 bg-gray-800/50">
              {/* Abas */}
              <div className="border-b border-gray-700/50 px-6">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTabId(t.id)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTabId === t.id
                          ? 'border-transparent text-white bg-gradient-to-r from-blue-500/20 to-purple-600/20 px-3 rounded-t'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Conteúdo das abas (placeholders) */}
              <div className="p-6">
                {activeTabId === 'projetos' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Projetos</h2>
                      <span className="text-xs text-gray-400">(em breve)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group relative bg-gray-800 rounded-xl border border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                        <div className="w-full h-40 bg-gradient-to-br from-blue-500/30 to-purple-600/30" />
                        <div className="p-5">
                          <h3 className="font-bold text-lg">Nome do Projeto</h3>
                          <p className="text-sm text-gray-300 mt-1">Breve descrição do projeto.</p>
                          <a href="#" className="text-blue-400 hover:underline text-sm mt-3 inline-block font-semibold">Ver projeto →</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'experiencia' && (
                  <div className="text-gray-300 text-sm">Experiências profissionais em breve.</div>
                )}

                {activeTabId === 'habilidades' && (
                  <div className="text-gray-300 text-sm">Habilidades e stacks em breve.</div>
                )}

                {activeTabId === 'colaboracao' && (
                  <div className="text-gray-300 text-sm">Colaborações e contribuições em breve.</div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewPage;


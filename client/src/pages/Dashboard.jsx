import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useQrCode } from '../hooks/useQrCode';
import { useAiFeatures } from '../hooks/useAiFeatures';
import { useAnalytics } from '../hooks/useAnalytics';
import { createUrl, getUrls, deleteUrl, updateUrl } from '../services/urlService';
import { 
  LogOut, Link2, PlusCircle, ExternalLink, BarChart3, 
  Clock, Trash2, Edit2, QrCode, Search, Copy, Check, 
  ChevronLeft, ChevronRight, Calendar, Loader2, Sparkles 
} from 'lucide-react';

function Dashboard() {
  const { user, logout, API_URL } = useAuth();
  const queryClient = useQueryClient();

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  // Form Inputs
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // UI States
  const [copiedCode, setCopiedCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUrlValue, setEditUrlValue] = useState('');
  // Consolidated local states and operations using Custom Hooks
  const {
    activeQrUrl,
    activeQrCode,
    loadingQrId,
    handleViewQr,
    closeQr
  } = useQrCode();

  const {
    aiSuggestions,
    generatingAliases,
    activeInsightsText,
    activeInsightsCode,
    loadingInsightsId,
    handleGenerateAiAliases,
    handleViewInsights,
    closeInsights,
    clearSuggestions
  } = useAiFeatures();

  const {
    activeStatsData,
    activeStatsCode,
    loadingStatsId,
    handleViewStats,
    closeStats
  } = useAnalytics();

  const { data: urlData, isLoading, isError, refetch } = useQuery({
    queryKey: ['urls', page, search],
    queryFn: () => getUrls(page, limit, search),
    keepPreviousData: true
  });

  // 2. React Query: Create URL Mutation
  const createMutation = useMutation({
    mutationFn: createUrl,
    onSuccess: () => {
      toast.success('Short URL created successfully!');
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      queryClient.invalidateQueries(['urls']); // Auto-refresh URL list
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || 'Failed to create short URL';
      toast.error(errMsg);
    }
  });

  // 3. React Query: Delete URL Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUrl,
    onSuccess: () => {
      toast.success('Link deleted successfully');
      queryClient.invalidateQueries(['urls']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete link');
    }
  });

  // 4. React Query: Edit URL Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, originalUrl }) => updateUrl(id, originalUrl),
    onSuccess: () => {
      toast.success('Link updated successfully');
      setEditingId(null);
      setEditUrlValue('');
      queryClient.invalidateQueries(['urls']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update link');
    }
  });

  const handleShortenSubmit = (e) => {
    e.preventDefault();
    if (!originalUrl) {
      toast.error('Please enter a destination URL');
      return;
    }
    createMutation.mutate({
      originalUrl,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt || undefined
    });
  };

  // Copy Short URL to clipboard utility
  const handleCopy = (code) => {
    const shortUrl = `${API_URL}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    toast.success('Copied short URL to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Format date safely for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if link is expired
  const isExpired = (expiresAtString) => {
    if (!expiresAtString) return false;
    return new Date(expiresAtString) < new Date();
  };

  // Delete handler using custom interactive toast confirmation
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col space-y-3 bg-slate-900 border border-slate-800 text-slate-100 p-4.5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-xs backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <span className="text-rose-500 text-base animate-pulse">⚠️</span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">Delete this link permanently?</span>
        </div>
        <div className="flex justify-end space-x-2 pt-1.5">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteMutation.mutate(id);
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition hover:shadow-[0_0_10px_rgba(244,63,94,0.35)] cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition border border-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0
      }
    });
  };

  // Logout handler using custom interactive toast confirmation
  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-3 bg-slate-900 border border-slate-800 text-slate-100 p-4.5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-xs backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <span className="text-violet-400 text-base animate-pulse">🚪</span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">Are you sure you want to logout?</span>
        </div>
        <div className="flex justify-end space-x-2 pt-1.5">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
            }}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition hover:shadow-[0_0_10px_rgba(139,92,246,0.35)] cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition border border-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0
      }
    });
  };

  // Edit Handlers
  const handleEditStart = (id, currentUrl) => {
    setEditingId(id);
    setEditUrlValue(currentUrl);
  };

  const handleEditSubmit = (id) => {
    if (!editUrlValue) {
      toast.error('URL cannot be empty');
      return;
    }
    editMutation.mutate({ id, originalUrl: editUrlValue });
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Premium Navbar */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-violet-600/10 border border-violet-500/30 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              ShortCut Pro
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition duration-150 border border-slate-750"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-grow space-y-8">
        
        {/* Simple URL Creation Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Shorten a new link</h2>
          
          <form onSubmit={handleShortenSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Link2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Paste your long URL here (e.g. https://google.com)..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm transition text-slate-100 placeholder-slate-650"
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-semibold transition duration-150 shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {createMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Shorten URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle Advanced Inputs */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition focus:outline-none"
              >
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Custom Alias / Expiration)'}
              </button>
            </div>

            {/* Advanced Inputs Container */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/50 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-350">Custom Alias (Optional)</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiAliases(originalUrl)}
                      disabled={generatingAliases || !originalUrl}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold transition disabled:opacity-40 cursor-pointer"
                    >
                      {generatingAliases ? 'AI Suggesting...' : 'AI Suggest'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. my-portfolio"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl py-2 px-3.5 text-xs text-slate-100"
                  />
                  {aiSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomAlias(sug);
                            clearSuggestions();
                          }}
                          className="text-[9px] bg-violet-950/40 hover:bg-violet-900/60 border border-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full transition cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-350">Expiration Date (Optional)</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                      onFocus={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl py-2 px-3.5 text-xs text-slate-100 text-left cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Live Search and URL List */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Your Shortened Links</h2>
            
            {/* Live Search Field */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search links..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset page to 1 when searching
                }}
                className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs transition text-slate-100 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Table List Container */}
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-2" />
              <p className="text-sm">Fetching your links...</p>
            </div>
          ) : isError ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-red-400">
              <p className="text-sm">Failed to load links from the server.</p>
            </div>
          ) : urlData?.data?.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Clock className="w-10 h-10 text-slate-750 mx-auto mb-3" />
              <p className="text-sm">No links found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
                
                {urlData.data.map((url) => {
                  const expired = isExpired(url.expiresAt);
                  
                  return (
                    <div key={url._id} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-850/30 transition">
                      {/* Left Block: URLs and Metadata */}
                      <div className="space-y-2 flex-grow min-w-0 max-w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-md tracking-wide">
                            /{url.shortCode}
                          </span>
                          
                          {/* Expiration Tag */}
                          {url.expiresAt && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              expired 
                                ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                                : 'bg-violet-950/40 text-violet-400 border border-violet-900/40'
                            }`}>
                              {expired ? 'Expired' : `Expires: ${formatDate(url.expiresAt)}`}
                            </span>
                          )}
                        </div>
                        
                        {editingId === url._id ? (
                          <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(url._id); }} className="flex items-center space-x-2 w-full pt-1">
                            <input
                              type="text"
                              value={editUrlValue}
                              onChange={(e) => setEditUrlValue(e.target.value)}
                              className="flex-grow bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-lg py-1.5 px-3 text-xs text-slate-100"
                              placeholder="New destination URL..."
                            />
                            <button
                              type="submit"
                              disabled={editMutation.isLoading}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <p className="text-xs text-slate-450 truncate" title={url.originalUrl}>
                            {url.originalUrl}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Created: {formatDate(url.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewStats(url._id, url.shortCode)}
                            className="flex items-center text-slate-450 hover:text-fuchsia-400 transition cursor-pointer"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-3 h-3 mr-1 text-fuchsia-450" />
                            Clicks: {url.clicks}
                          </button>
                        </div>
                      </div>

                      {/* Right Block: Action Buttons */}
                      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopy(url.shortCode)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg transition"
                          title="Copy Link"
                        >
                          {copiedCode === url.shortCode ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Open Original Link */}
                        <a
                          href={`${API_URL}/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg transition"
                          title="Visit Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* QR Code Button */}
                        <button
                          onClick={() => handleViewQr(url._id, url.shortCode)}
                          disabled={loadingQrId === url._id}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg transition disabled:opacity-50"
                          title="Generate QR Code"
                        >
                          {loadingQrId === url._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                          ) : (
                            <QrCode className="w-4 h-4" />
                          )}
                        </button>

                        {/* Analytics Stats Button */}
                        <button
                          onClick={() => handleViewStats(url._id, url.shortCode)}
                          disabled={loadingStatsId === url._id}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-450 hover:text-white border border-slate-850 rounded-lg transition disabled:opacity-50 animate-pulse-slow"
                          title="View Traffic Analytics"
                        >
                          {loadingStatsId === url._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-fuchsia-450" />
                          ) : (
                            <BarChart3 className="w-4 h-4 text-fuchsia-450 hover:text-fuchsia-350" />
                          )}
                        </button>

                        {/* AI Insights Button */}
                        <button
                          onClick={() => handleViewInsights(url._id, url.shortCode)}
                          disabled={loadingInsightsId === url._id}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg transition disabled:opacity-50"
                          title="Generate AI Insights"
                        >
                          {loadingInsightsId === url._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-violet-400 hover:text-violet-300" />
                          )}
                        </button>

                        {/* Edit Link Button */}
                        <button
                          onClick={() => handleEditStart(url._id, url.originalUrl)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg transition"
                          title="Edit Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Link Button */}
                        <button
                          onClick={() => handleDelete(url._id)}
                          disabled={deleteMutation.isLoading}
                          className="p-2 bg-red-950/20 hover:bg-red-900/35 border border-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition disabled:opacity-40"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Pagination Row */}
              {urlData?.pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                  <div className="text-xs text-slate-400">
                    Showing page <span className="font-semibold text-slate-200">{page}</span> of{' '}
                    <span className="font-semibold text-slate-200">
                      {urlData.pagination.totalPages}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, urlData.pagination.totalPages))}
                      disabled={page === urlData.pagination.totalPages}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* AI Insights Modal Overlay */}
      {activeInsightsText && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative animate-scaleIn">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-violet-500/15 rounded-lg text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-white tracking-wide">AI Analytics Insights</h3>
            </div>
            
            <div className="text-slate-450 text-[10px] font-bold uppercase tracking-wider">
              Short Link: <span className="text-slate-200 font-mono text-[11px]">/{activeInsightsCode}</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-xl text-slate-200 text-xs leading-relaxed font-medium">
              {activeInsightsText}
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={closeInsights}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 w-full sm:w-auto cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-xs w-full text-center space-y-5 shadow-2xl relative animate-scaleIn">
            <h3 className="text-md font-bold text-white tracking-wide">QR Code</h3>
            
            {/* White background card containing QR Code Image */}
            <div className="bg-white p-3.5 rounded-xl inline-block mx-auto">
              <img src={activeQrUrl} alt="Short URL QR Code" className="w-40 h-40 mx-auto" />
            </div>
            
            <p className="text-[10px] text-slate-400 break-all select-all font-mono font-medium p-2 bg-slate-950 border border-slate-850 rounded-xl">
              {activeQrCode}
            </p>
            
            <div className="flex space-x-2.5">
               <button
                 onClick={() => {
                   const link = document.createElement('a');
                   link.href = activeQrUrl;
                   link.download = `qrcode-${activeQrCode.split('/').pop()}.png`;
                   link.click();
                 }}
                 className="flex-grow py-2 bg-violet-600 hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] text-white rounded-xl text-xs font-semibold transition"
               >
                 Download
               </button>
               <button
                 onClick={closeQr}
                 className="flex-grow py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Stats Modal Overlay */}
      {activeStatsData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-fuchsia-500/15 rounded-lg text-fuchsia-400">
                  <BarChart3 className="w-5 h-5 text-fuchsia-450 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white tracking-wide">Link Analytics</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                    Short Link: <span className="text-slate-200 font-mono text-[11px]">/{activeStatsCode}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setActiveStatsData(null); setActiveStatsCode(''); }}
                className="text-xs text-slate-400 hover:text-white font-semibold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Overall Count cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-850/60 p-4 rounded-xl text-center shadow-inner">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">Total Clicks</span>
                <span className="text-2xl font-extrabold text-white">{activeStatsData.clicksCount}</span>
              </div>
              <div className="bg-slate-950 border border-slate-850/60 p-4 rounded-xl text-center shadow-inner">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">Last Accessed</span>
                <span className="text-xs font-semibold text-slate-200 block truncate mt-1.5">
                  {activeStatsData.lastAccessed ? formatDate(activeStatsData.lastAccessed) : 'Never'}
                </span>
              </div>
            </div>

            {/* Browsers & Referrers Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Browsers card */}
              <div className="bg-slate-950 border border-slate-850/60 p-4.5 rounded-xl space-y-3.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">Browser Share</span>
                {activeStatsData.browsers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No browser logs recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {activeStatsData.browsers.map((b, idx) => {
                      const percentage = activeStatsData.clicksCount > 0 
                        ? Math.round((b.count / activeStatsData.clicksCount) * 100) 
                        : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-350">
                            <span>{b.browser}</span>
                            <span className="text-slate-450 font-bold">{b.count} ({percentage}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-600 to-violet-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Referrers card */}
              <div className="bg-slate-950 border border-slate-850/60 p-4.5 rounded-xl space-y-3.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">Referrer Sources</span>
                {activeStatsData.referrers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No referrer logs recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {activeStatsData.referrers.map((r, idx) => {
                      const percentage = activeStatsData.clicksCount > 0 
                        ? Math.round((r.count / activeStatsData.clicksCount) * 100) 
                        : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-350">
                            <span>{r.referrer}</span>
                            <span className="text-slate-450 font-bold">{r.count} ({percentage}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Log list */}
            <div className="bg-slate-950 border border-slate-850/60 p-4.5 rounded-xl space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">Recent Clicks Activity Feed</span>
              {activeStatsData.recentActivity.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-4">No activity logged yet</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-slate-900/60 pr-1">
                  {activeStatsData.recentActivity.map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] text-slate-350 pt-2 first:pt-0">
                      <div>
                        <span className="font-semibold text-slate-200">{log.browser}</span>
                        <span className="text-slate-500 ml-1.5">({log.ip})</span>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">{log.referrer}</span>
                        <span className="text-slate-500">{new Date(log.clickedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-1">
              <button
                onClick={closeStats}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 w-full cursor-pointer"
              >
                Close Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;

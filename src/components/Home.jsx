'use client';
import axios from "axios";
import Navbar from "./Navbar";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import useAuthStore from '@/utility/justAuth';
import ProfileDropdown from './ProfileDropdown';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    articles: 0,
    books: 0,
    journals: 0,
    loading: true
  });
  const [animatedNumbers, setAnimatedNumbers] = useState({
    articles: 0,
    books: 0,
    journals: 0
  });
  const [recentSearches, setRecentSearches] = useState([]);

  const { isLoggedIn, logout, hasHydrated } = useAuthStore();

  // Memoized logout handler with error handling
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  }, [logout]);

  // Memoized search handler
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      const newSearch = searchTerm.trim();
      setRecentSearches(prev => {
        const updated = [newSearch, ...prev.filter(s => s !== newSearch)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });
      window.location.href = `/search/${encodeURIComponent(newSearch)}`;
    }
  }, [searchTerm]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Animated counter while loading
  useEffect(() => {
    let interval;
    if (stats.loading) {
      interval = setInterval(() => {
        setAnimatedNumbers(prev => ({
          articles: Math.floor(Math.random() * 999999) + 100000,
          books: Math.floor(Math.random() * 99999) + 10000,
          journals: Math.floor(Math.random() * 9999) + 1000
        }));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [stats.loading]);

  // Number formatting
  const formatNumber = (num) => {
    if (num >= 100000) return Math.floor(num / 100000) + "L+";
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    return num + "+";
  };

  // Data fetching functions
  const fetchDOAJCount = async () => {
    try {
      const response = await axios.get('/api/doaj-stats');
      return {
        articles: response.data?.articles || 0,
        journals: response.data?.journals || 0,
        total: response.data?.total || 0
      };
    } catch {
      return { articles: 0, journals: 0, total: 0 };
    }
  };

  const fetchLocalCount = async () => {
    try {
      const response = await axios.get(`/api/journal`);
      const journals = response.data?.journals || [];
      const articleCount = journals.filter(j => j.type && !j.type.toLowerCase().includes('book')).length;
      const bookCount = journals.filter(j => j.type && j.type.toLowerCase().includes('book')).length;
      return { articles: articleCount, books: bookCount, total: journals.length };
    } catch {
      return { articles: 0, books: 0, total: 0 };
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const [doajData, localData] = await Promise.all([
        fetchDOAJCount(),
        fetchLocalCount()
      ]);
      setStats({
        articles: localData.articles + doajData.articles,
        books: localData.books,
        journals: doajData.journals,
        loading: false
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Early return if store hasn't hydrated
  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(15,23,42,0.24), rgba(30,41,59,0.24)), url('/library.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <Navbar />

        {/* Hero Section - Enhanced Mobile Responsive */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 min-h-screen">
          {/* University Badge - Enhanced */}
          <div className="bg-white/12 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/30 mb-6 sm:mb-8 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
              🏛️ Rabindranath Tagore University, Hojai
            </span>
          </div>

          {/* Main Heading - Enhanced Typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6 tracking-tight px-2 drop-shadow-lg">
            Unlock Knowledge{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Beyond Limits
            </span>
          </h1>

          {/* Subtitle - Enhanced */}
          <p className="text-white/95 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-2xl md:max-w-3xl mb-8 sm:mb-10 leading-relaxed font-normal px-2 drop-shadow-md">
            Dive into our comprehensive digital library featuring cutting-edge research,
            academic excellence, and innovative learning resources in the heart of knowledge.
          </p>

          {/* Advanced Knowledge Search Section - Subtle Enhancement */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-white/30 shadow-2xl max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl w-full mb-8 sm:mb-12 mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 text-center tracking-tight drop-shadow-md">
              Advanced Knowledge Search
            </h2>
            <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 text-center font-normal px-2 drop-shadow-sm">
              Powered by AI to find exactly what you need
            </p>
            
            {/* Enhanced Search Bar - Refined Design */}
            <div className="flex w-full bg-black/35 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/35 overflow-hidden mb-6 sm:mb-8 shadow-xl">
              <div className="flex items-center pl-4 sm:pl-6 py-2">
                <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white/90" />
              </div>
              <input
                type="text"
                placeholder="Search books, articles, research papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="px-3 sm:px-4 py-3 sm:py-4 lg:py-5 w-full bg-transparent text-white placeholder-white/75 focus:outline-none text-sm sm:text-base lg:text-lg font-normal"
                aria-label="Search for academic resources"
              />
              <button
                onClick={handleSearch}
                className={`bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300 font-semibold px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-white text-sm sm:text-base lg:text-lg shadow-lg ${
                  !searchTerm.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-cyan-500/25'
                }`}
                disabled={!searchTerm.trim()}
                aria-label="Submit search"
              >
                SEARCH
              </button>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
                {recentSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/search/${encodeURIComponent(search)}`}
                    className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 text-xs sm:text-sm rounded-full transition-all duration-200"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            )}

            {/* Category Buttons - Refined Styling */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
              <Link
                href="/type/E-Books"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full bg-black/25 backdrop-blur-md border border-white/35 text-white font-medium hover:bg-black/35 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                E-Books
              </Link>
              <Link
                href="/subjects"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full bg-black/25 backdrop-blur-md border border-white/35 text-white font-medium hover:bg-black/35 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Journals
              </Link>
              <Link
                href="#"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full bg-black/25 backdrop-blur-md border border-white/35 text-white font-medium hover:bg-black/35 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Archives
              </Link>
              <Link
                href="#"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full bg-black/25 backdrop-blur-md border border-white/35 text-white font-medium hover:bg-black/35 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Datasets
              </Link>
              <Link
                href="/advanceSearch"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full bg-cyan-500/25 backdrop-blur-md border border-cyan-400/60 text-white font-medium hover:bg-cyan-500/35 hover:border-cyan-400/80 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm md:text-base shadow-md"
                aria-label="Advanced Search"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Advanced Search
              </Link>
            </div>
          </div> 

          {/* Enhanced Stats Section - Refined Glassmorphism */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl px-2 sm:px-4">
            {/* Articles */}
            <div className="bg-black/30 backdrop-blur-lg p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-center border border-white/30 hover:bg-black/40 hover:border-white/40 transition-all duration-300 group shadow-lg">
              <div className="bg-white/30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 shadow-md">
                <span className="text-sm sm:text-base md:text-lg">📄</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                {stats.loading ? formatNumber(animatedNumbers.articles) : formatNumber(stats.articles)}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-base font-medium drop-shadow-sm">Articles</p>
            </div>
            
            {/* Books */}
            <div className="bg-black/30 backdrop-blur-lg p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-center border border-white/30 hover:bg-black/40 hover:border-white/40 transition-all duration-300 group shadow-lg">
              <div className="bg-white/30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 shadow-md">
                <span className="text-sm sm:text-base md:text-lg">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                {stats.loading ? formatNumber(animatedNumbers.books) : formatNumber(stats.books)}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-base font-medium drop-shadow-sm">Books</p>
            </div>
            
            {/* Journals */}
            <div className="bg-black/30 backdrop-blur-lg p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-center border border-white/30 hover:bg-black/40 hover:border-white/40 transition-all duration-300 group shadow-lg">
              <div className="bg-white/30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 shadow-md">
                <span className="text-sm sm:text-base md:text-lg">📖</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                {stats.loading ? formatNumber(animatedNumbers.journals) : formatNumber(stats.journals)}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-base font-medium drop-shadow-sm">Journals</p>
            </div>
            
            {/* Access */}
            <div className="bg-black/30 backdrop-blur-lg p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-center border border-white/30 hover:bg-black/40 hover:border-white/40 transition-all duration-300 group shadow-lg">
              <div className="bg-white/30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 shadow-md">
                <span className="text-sm sm:text-base md:text-lg">🕒</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                24/7
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-base font-medium drop-shadow-sm">
                Access Always Available
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
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
          backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.6)), url('/library.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      >
        <Navbar />

        {/* Hero Section - Enhanced Mobile Responsive */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 min-h-screen">
          {/* University Badge - Enhanced */}
                    {/* University Badge - Fully Transparent */}
          <div className="rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/10 mb-6 sm:mb-8 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
              📚 Digital Library - Durama College
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
          <p className="text-white/90 text-lg sm:text-xl md:text-2xl max-w-xs sm:max-w-2xl md:max-w-4xl mb-12 sm:mb-16 leading-relaxed font-light px-2 drop-shadow-md">
            Access millions of academic resources, research papers, and
            <br className="hidden sm:block" />
            digital archives from anywhere in the world
          </p>

          {/* Advanced Knowledge Search Section */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/20 shadow-2xl max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-5xl w-full mb-12 sm:mb-16 mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 text-center tracking-tight drop-shadow-md">
              Advanced Knowledge Search
            </h2>
            <p className="text-white/80 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-center font-light px-2">
              Powered by AI to find exactly what you need across our vast collection
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="flex w-full bg-black/30 rounded-xl border border-white/20 overflow-hidden mb-8 shadow-2xl">
              <div className="flex items-center pl-4 sm:pl-6 py-2">
                <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white/90" />
              </div>
              <input
                type="text"
                placeholder="Search books, articles, research papers, datasets..."
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
                    className="px-3 sm:px-4 py-1 sm:py-1.5 hover:bg-white/10 text-gray-200 text-xs sm:text-sm rounded-full transition-all duration-200 border border-white/5 hover:border-white/15"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            )}

            {/* Category Buttons - Fully Transparent */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
              <Link
                href="/type/E-Books"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 hover:border-white/25 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                E-Books
              </Link>
              <Link
                href="/subjects"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 hover:border-white/25 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Journals
              </Link>
              <Link
                href="#"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 hover:border-white/25 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Archives
              </Link>
              <Link
                href="#"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 hover:border-white/25 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-md"
              >
                Datasets
              </Link>
              <Link
                href="/advanceSearch"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full border border-cyan-400/30 text-white font-medium hover:bg-cyan-500/15 hover:border-cyan-400/50 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm md:text-base shadow-md"
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

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-md md:max-w-5xl px-2 sm:px-4">
            {/* Research Articles */}
            <div className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl text-center border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                250K+
              </h3>
              <p className="text-white/80 text-sm sm:text-base font-medium">Research Articles</p>
            </div>
            
            {/* Digital Books */}
            <div className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl text-center border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                500K+
              </h3>
              <p className="text-white/80 text-sm sm:text-base font-medium">Digital Books</p>
            </div>
            
            {/* Academic Journals */}
            <div className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl text-center border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2H15" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                15K+
              </h3>
              <p className="text-white/80 text-sm sm:text-base font-medium">Academic Journals</p>
            </div>
            
            {/* Global Access */}
            <div className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl text-center border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                24/7
              </h3>
              <p className="text-white/80 text-sm sm:text-base font-medium">Global Access</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
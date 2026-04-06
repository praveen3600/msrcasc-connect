import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, profileAPI } from '../api';
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTrendingUp,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineChevronRight,
} from 'react-icons/hi2';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, hasProfile: false });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.allSettled([
          jobAPI.getAllJobs(),
          profileAPI.getMyProfile(),
        ]);

        if (jobsRes.status === 'fulfilled') {
          const jobs = jobsRes.value.data.data.jobs;
          setStats((prev) => ({ ...prev, jobs: jobs.length }));
          setRecentJobs(jobs.slice(0, 5));
        }
        if (profileRes.status === 'fulfilled') {
          setStats((prev) => ({ ...prev, hasProfile: true }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      label: 'Browse Jobs',
      desc: 'Find your next opportunity',
      icon: HiOutlineBriefcase,
      to: '/jobs',
      gradient: 'from-primary-600 to-primary-800',
    },
    {
      label: 'AI Tools',
      desc: 'Resume analysis & more',
      icon: HiOutlineSparkles,
      to: '/ai-tools',
      gradient: 'from-accent-cyan to-primary-600',
    },
    {
      label: 'Messages',
      desc: 'Chat with connections',
      icon: HiOutlineChatBubbleLeftRight,
      to: '/chat',
      gradient: 'from-accent-emerald to-accent-cyan',
    },
    {
      label: 'My Profile',
      desc: 'Update your profile',
      icon: HiOutlineUsers,
      to: '/profile',
      gradient: 'from-accent-amber to-accent-rose',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero greeting */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-cyan/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-dark-400 text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">{user?.name} 👋</h1>
          <p className="text-dark-400 max-w-xl">
            Welcome to MSRCASC Connect. {user?.role === 'student'
              ? 'Discover jobs, build your profile, and get AI-powered career insights.'
              : user?.role === 'recruiter'
                ? 'Post jobs, find talented candidates, and manage applications.'
                : 'Connect with the MSRCASC community and explore opportunities.'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-all duration-300 glow-hover"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-dark-100 mb-1">{action.label}</h3>
              <p className="text-sm text-dark-400">{action.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats + Profile completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <HiOutlineBriefcase className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">{stats.jobs}</p>
                <p className="text-sm text-dark-400">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center">
                <HiOutlineDocumentText className="w-6 h-6 text-accent-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">{stats.hasProfile ? 'Complete' : 'Incomplete'}</p>
                <p className="text-sm text-dark-400">Profile Status</p>
              </div>
            </div>
          </div>

          {!stats.hasProfile && (
            <Link
              to="/profile"
              className="block glass rounded-2xl p-6 border border-accent-amber/20 hover:border-accent-amber/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <HiOutlineArrowTrendingUp className="w-5 h-5 text-accent-amber" />
                <div>
                  <p className="text-sm font-medium text-accent-amber">Complete your profile</p>
                  <p className="text-xs text-dark-400">Increase your chances of being discovered</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-100">Recent Opportunities</h2>
            <Link to="/jobs" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineBriefcase className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/40 hover:bg-dark-800/70 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center shrink-0">
                    <HiOutlineBuildingOffice2 className="w-5 h-5 text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark-100 text-sm group-hover:text-primary-400 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-dark-400">{job.company} · {job.location} · {job.type}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {job.skillsRequired.slice(0, 2).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-400 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

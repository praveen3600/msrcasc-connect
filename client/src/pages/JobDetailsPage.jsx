import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../api';
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await jobAPI.getJob(id);
      setJob(data.data.job);
      // Check if already applied
      const hasApplied = data.data.job.applicants?.some(
        (app) => app.user?._id === user?._id || app.user === user?._id
      );
      setApplied(hasApplied);
    } catch (err) {
      setMessage('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobAPI.applyToJob(id);
      setApplied(true);
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-32">
        <p className="text-dark-400 text-lg">Job not found</p>
        <Link to="/jobs" className="text-primary-400 hover:underline mt-2 inline-block">← Back to Jobs</Link>
      </div>
    );
  }

  const typeColors = {
    'full-time': 'bg-accent-emerald/10 text-accent-emerald',
    'part-time': 'bg-accent-amber/10 text-accent-amber',
    internship: 'bg-accent-cyan/10 text-accent-cyan',
    contract: 'bg-primary-500/10 text-primary-400',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Job header */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-dark-700/80 flex items-center justify-center shrink-0">
              <HiOutlineBuildingOffice2 className="w-8 h-8 text-dark-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-dark-50">{job.title}</h1>
              <p className="text-lg text-dark-300 mt-1">{job.company}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-sm text-dark-400">
                  <HiOutlineMapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${typeColors[job.type] || ''}`}>
                  {job.type}
                </span>
                {job.salary && job.salary !== 'Not disclosed' && (
                  <span className="flex items-center gap-1 text-sm text-accent-emerald">
                    <HiOutlineCurrencyRupee className="w-4 h-4" /> {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-dark-500">
                  <HiOutlineClock className="w-4 h-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Apply button */}
          <div className="mt-6 flex items-center gap-4">
            {(user?.role === 'student' || user?.role === 'alumni') && (
              applied ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-emerald/10 text-accent-emerald font-medium text-sm">
                  <HiOutlineCheckCircle className="w-5 h-5" /> Applied
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-8 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 glow-hover transition-all"
                >
                  {applying ? 'Submitting...' : 'Apply Now'}
                </button>
              )
            )}
            <span className="flex items-center gap-1 text-sm text-dark-500">
              <HiOutlineUsers className="w-4 h-4" /> {job.applicants?.length || 0} applicants
            </span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm animate-fadeIn">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Job Description</h2>
          <div className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skills Required */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Posted By */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Posted By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {job.postedBy?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-200">{job.postedBy?.name || 'Unknown'}</p>
                <p className="text-xs text-dark-500">{job.postedBy?.email}</p>
              </div>
            </div>
          </div>

          {/* AI Tool */}
          <Link
            to="/ai-tools"
            className="block glass rounded-2xl p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all"
          >
            <p className="text-sm font-medium text-primary-400 mb-1">🤖 AI Skill Gap Analysis</p>
            <p className="text-xs text-dark-400">Check how your skills match this job</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;

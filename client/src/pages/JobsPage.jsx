import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../api';
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlinePlusCircle,
  HiOutlineClock,
} from 'react-icons/hi2';

const JobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '', company: '', description: '', skillsRequired: '',
    location: '', type: 'full-time', salary: '', deadline: '',
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [search, typeFilter]);

  const fetchJobs = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await jobAPI.getAllJobs(params);
      setJobs(data.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await jobAPI.createJob({
        ...newJob,
        skillsRequired: newJob.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowPostForm(false);
      setNewJob({ title: '', company: '', description: '', skillsRequired: '', location: '', type: 'full-time', salary: '', deadline: '' });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const jobTypes = ['full-time', 'part-time', 'internship', 'contract'];

  const typeColors = {
    'full-time': 'bg-accent-emerald/10 text-accent-emerald',
    'part-time': 'bg-accent-amber/10 text-accent-amber',
    internship: 'bg-accent-cyan/10 text-accent-cyan',
    contract: 'bg-primary-500/10 text-primary-400',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Job Opportunities</h1>
          <p className="text-dark-400 text-sm mt-1">{jobs.length} active positions</p>
        </div>
        {(user?.role === 'recruiter' || user?.role === 'admin') && (
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 glow-hover"
          >
            <HiOutlinePlusCircle className="w-4 h-4" />
            Post a Job
          </button>
        )}
      </div>

      {/* Post Job Form */}
      {showPostForm && (
        <div className="glass rounded-2xl p-6 animate-fadeIn">
          <h2 className="text-lg font-semibold text-dark-100 mb-5">Post New Job</h2>
          <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} required placeholder="Job Title"
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500" />
            <input value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} required placeholder="Company Name"
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500" />
            <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} required placeholder="Job Description" rows={3}
              className="md:col-span-2 px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 resize-none" />
            <input value={newJob.skillsRequired} onChange={(e) => setNewJob({ ...newJob, skillsRequired: e.target.value })} placeholder="Skills (comma separated)"
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500" />
            <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} placeholder="Location"
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500" />
            <select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500">
              {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} placeholder="Salary (e.g. ₹5-8 LPA)"
              className="px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={posting} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {posting ? 'Posting...' : 'Post Job'}
              </button>
              <button type="button" onClick={() => setShowPostForm(false)} className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              !typeFilter ? 'gradient-primary text-white' : 'bg-dark-800 border border-dark-700 text-dark-400 hover:text-dark-200'
            }`}
          >
            All
          </button>
          {jobTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                typeFilter === t ? 'gradient-primary text-white' : 'bg-dark-800 border border-dark-700 text-dark-400 hover:text-dark-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <HiOutlineBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300">No jobs found</h3>
          <p className="text-dark-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-200 group glow-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-dark-700/80 flex items-center justify-center shrink-0">
                  <HiOutlineBuildingOffice2 className="w-6 h-6 text-dark-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors truncate">{job.title}</h3>
                  <p className="text-sm text-dark-400 mt-0.5">{job.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${typeColors[job.type] || ''}`}>{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skillsRequired.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-dark-800 text-dark-300 text-xs">{skill}</span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-dark-800 text-dark-500 text-xs">+{job.skillsRequired.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700/50">
                <div className="flex items-center gap-1 text-xs text-dark-500">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
                {job.salary && job.salary !== 'Not disclosed' && (
                  <span className="text-xs text-accent-emerald font-medium">{job.salary}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;

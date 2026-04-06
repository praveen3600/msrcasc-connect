import { useState, useEffect } from 'react';
import { aiAPI, jobAPI } from '../api';
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
  HiOutlineChevronDown,
} from 'react-icons/hi2';

const AIToolsPage = () => {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);

  // Resume analyzer
  const [resumeText, setResumeText] = useState('');
  const [resumeResult, setResumeResult] = useState(null);

  // Job recommender
  const [skills, setSkills] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  // Skill gap
  const [gapSkills, setGapSkills] = useState('');
  const [gapJobId, setGapJobId] = useState('');
  const [gapResult, setGapResult] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await jobAPI.getAllJobs();
      setJobs(data.data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeAnalysis = async () => {
    if (!resumeText.trim() || resumeText.length < 50) return;
    setLoading(true);
    setResumeResult(null);
    try {
      const { data } = await aiAPI.analyzeResume(resumeText);
      setResumeResult(data.data.analysis);
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJobRecommendation = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    setRecommendations(null);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const { data } = await aiAPI.recommendJobs(skillsArray);
      setRecommendations(data.data.recommendations);
    } catch (err) {
      alert(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGap = async () => {
    if (!gapSkills.trim() || !gapJobId) return;
    setLoading(true);
    setGapResult(null);
    try {
      const skillsArray = gapSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const { data } = await aiAPI.analyzeSkillGap(skillsArray, gapJobId);
      setGapResult(data.data.analysis);
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resume', label: 'Resume Analyzer', icon: HiOutlineDocumentText },
    { id: 'recommend', label: 'Job Recommendations', icon: HiOutlineSparkles },
    { id: 'gap', label: 'Skill Gap Analysis', icon: HiOutlineLightBulb },
  ];

  const scoreColor = (score) => {
    if (score >= 75) return 'text-accent-emerald';
    if (score >= 50) return 'text-accent-amber';
    return 'text-accent-rose';
  };

  const scoreBarColor = (score) => {
    if (score >= 75) return 'bg-accent-emerald';
    if (score >= 50) return 'bg-accent-amber';
    return 'bg-accent-rose';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-cyan/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
            <HiOutlineSparkles className="w-7 h-7 text-accent-cyan" />
            AI Career Tools
          </h1>
          <p className="text-dark-400 mt-2">Powered by AI to help you land your dream job</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-white shadow-lg'
                  : 'glass text-dark-400 hover:text-dark-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── RESUME ANALYZER ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">📄 Paste Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste your resume text here (minimum 50 characters)..."
              className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-dark-500">{resumeText.length} characters</span>
              <button
                onClick={handleResumeAnalysis}
                disabled={loading || resumeText.length < 50}
                className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 glow-hover"
              >
                {loading ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineSparkles className="w-4 h-4" />}
                Analyze Resume
              </button>
            </div>
          </div>

          {resumeResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* ATS Score */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-medium text-dark-400 mb-3">ATS Compatibility Score</h3>
                <div className="flex items-end gap-4">
                  <span className={`text-5xl font-bold ${scoreColor(resumeResult.atsScore)}`}>
                    {resumeResult.atsScore}
                  </span>
                  <span className="text-dark-500 text-lg mb-1">/100</span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full mt-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${scoreBarColor(resumeResult.atsScore)}`}
                    style={{ width: `${resumeResult.atsScore}%` }}
                  />
                </div>
                <p className="text-sm text-dark-400 mt-4">{resumeResult.overallFeedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-accent-emerald mb-3">✅ Strengths</h3>
                  <ul className="space-y-2">
                    {resumeResult.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                        <span className="text-accent-emerald mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-accent-amber mb-3">⚠️ Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeResult.missingSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-accent-amber/10 text-accent-amber text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-medium text-primary-400 mb-3">💡 Suggestions</h3>
                <ul className="space-y-2">
                  {resumeResult.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                      <span className="text-primary-400 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── JOB RECOMMENDATIONS ─── */}
      {activeTab === 'recommend' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">🎯 Enter Your Skills</h2>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, MongoDB"
              className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
            <button
              onClick={handleJobRecommendation}
              disabled={loading || !skills.trim()}
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 glow-hover"
            >
              {loading ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineSparkles className="w-4 h-4" />}
              Get Recommendations
            </button>
          </div>

          {recommendations && (
            <div className="space-y-3 animate-fadeIn">
              {recommendations.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-dark-400">No matching jobs found. Try different skills.</p>
                </div>
              ) : (
                recommendations.map((rec, idx) => (
                  <div key={idx} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-dark-100">{rec.job.title}</h3>
                        <p className="text-sm text-dark-400">{rec.job.company} · {rec.job.location}</p>
                      </div>
                      <div className={`text-2xl font-bold ${scoreColor(rec.matchScore)}`}>
                        {rec.matchScore}%
                      </div>
                    </div>
                    <p className="text-sm text-dark-400 mt-3">{rec.reason}</p>
                    <div className="flex gap-2 mt-3">
                      {rec.matchedSkills.map((s) => (
                        <span key={s} className="px-2 py-1 rounded-md bg-accent-emerald/10 text-accent-emerald text-xs">{s}</span>
                      ))}
                      {rec.missingSkills.map((s) => (
                        <span key={s} className="px-2 py-1 rounded-md bg-accent-rose/10 text-accent-rose text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── SKILL GAP ANALYSIS ─── */}
      {activeTab === 'gap' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">🔍 Skill Gap Analysis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Your Skills</label>
                <input
                  value={gapSkills}
                  onChange={(e) => setGapSkills(e.target.value)}
                  placeholder="e.g. React, JavaScript, CSS"
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Target Job</label>
                <select
                  value={gapJobId}
                  onChange={(e) => setGapJobId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} — {job.company}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSkillGap}
                disabled={loading || !gapSkills.trim() || !gapJobId}
                className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 glow-hover"
              >
                {loading ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineLightBulb className="w-4 h-4" />}
                Analyze Gap
              </button>
            </div>
          </div>

          {gapResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Match score */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-dark-100">{gapResult.jobTitle}</h3>
                  <span className={`text-3xl font-bold ${scoreColor(gapResult.matchScore)}`}>
                    {gapResult.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-dark-400">{gapResult.company}</p>
                <div className="w-full h-2 bg-dark-800 rounded-full mt-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${scoreBarColor(gapResult.matchScore)}`}
                    style={{ width: `${gapResult.matchScore}%` }}
                  />
                </div>
                <p className="text-sm text-dark-300 mt-4">{gapResult.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-accent-emerald mb-3">✅ Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {gapResult.matchedSkills.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-accent-emerald/10 text-accent-emerald text-sm">{s}</span>
                    ))}
                    {gapResult.matchedSkills.length === 0 && <span className="text-sm text-dark-500">None</span>}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-accent-rose mb-3">❌ Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {gapResult.missingSkills.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-accent-rose/10 text-accent-rose text-sm">{s}</span>
                    ))}
                    {gapResult.missingSkills.length === 0 && <span className="text-sm text-dark-500">None — you're a perfect match!</span>}
                  </div>
                </div>
              </div>

              {/* Learning resources */}
              {gapResult.learningResources?.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-primary-400 mb-4">📚 Learning Resources</h3>
                  <div className="space-y-3">
                    {gapResult.learningResources.map((res, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/40">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <HiOutlineLightBulb className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-200 capitalize">{res.skill}</p>
                          <p className="text-xs text-dark-400 mt-0.5">{res.resource}</p>
                          <p className="text-xs text-dark-500 mt-0.5">⏱ {res.estimatedTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIToolsPage;

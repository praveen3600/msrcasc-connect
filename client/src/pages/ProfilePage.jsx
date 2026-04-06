import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineAcademicCap,
  HiOutlineWrenchScrewdriver,
  HiOutlineLink,
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    bio: '',
    department: '',
    skills: [],
    projects: [],
    resumeURL: '',
    cgpa: '',
    company: '',
    designation: '',
    linkedin: '',
    github: '',
    phone: '',
    graduationYear: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.getMyProfile();
      setProfile(data.data.profile);
      setForm({
        bio: data.data.profile.bio || '',
        department: data.data.profile.department || '',
        skills: data.data.profile.skills || [],
        projects: data.data.profile.projects || [],
        resumeURL: data.data.profile.resumeURL || '',
        cgpa: data.data.profile.cgpa || '',
        company: data.data.profile.company || '',
        designation: data.data.profile.designation || '',
        linkedin: data.data.profile.linkedin || '',
        github: data.data.profile.github || '',
        phone: data.data.profile.phone || '',
        graduationYear: data.data.profile.graduationYear || '',
      });
    } catch {
      setEditing(true); // No profile yet, show form
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await profileAPI.createProfile(form);
      setProfile(data.data.profile);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (idx) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) });
  };

  const addProject = () => {
    setForm({
      ...form,
      projects: [...form.projects, { title: '', description: '', techStack: [], link: '' }],
    });
  };

  const updateProject = (idx, field, value) => {
    const updated = [...form.projects];
    updated[idx][field] = value;
    setForm({ ...form, projects: updated });
  };

  const removeProject = (idx) => {
    setForm({ ...form, projects: form.projects.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-dark-50">{user?.name}</h1>
            <p className="text-dark-400">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm font-medium text-dark-200 hover:border-primary-500/50 transition-all"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm animate-fadeIn ${
          message.type === 'success' ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald'
            : 'bg-accent-rose/10 border border-accent-rose/20 text-accent-rose'
        }`}>
          <div className="flex items-center gap-2">
            <HiOutlineCheckCircle className="w-4 h-4" />
            {message.text}
          </div>
        </div>
      )}

      {editing ? (
        /* ─── EDIT MODE ─── */
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-primary-400" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 resize-none transition-all"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1.5">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      max="10"
                      value={form.cgpa}
                      onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">Graduation Year</label>
                    <input
                      type="number"
                      value={form.graduationYear}
                      onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                      placeholder="2026"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <HiOutlineWrenchScrewdriver className="w-5 h-5 text-accent-cyan" /> Skills
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                placeholder="Add a skill (e.g. React, Python)"
              />
              <button onClick={addSkill} className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm">
                  {skill}
                  <button onClick={() => removeSkill(idx)} className="hover:text-accent-rose transition-colors">×</button>
                </span>
              ))}
              {form.skills.length === 0 && <span className="text-sm text-dark-500">No skills added yet</span>}
            </div>
          </div>

          {/* Projects */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5 text-accent-emerald" /> Projects
              </h2>
              <button onClick={addProject} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
                <HiOutlinePlusCircle className="w-4 h-4" /> Add Project
              </button>
            </div>
            <div className="space-y-4">
              {form.projects.map((project, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      value={project.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="Project title"
                    />
                    <button onClick={() => removeProject(idx)} className="ml-2 p-2 text-dark-500 hover:text-accent-rose">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 resize-none"
                    placeholder="Brief description"
                  />
                  <input
                    value={project.link}
                    onChange={(e) => updateProject(idx, 'link', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="Project URL (optional)"
                  />
                </div>
              ))}
              {form.projects.length === 0 && <p className="text-sm text-dark-500 text-center py-4">No projects added yet</p>}
            </div>
          </div>

          {/* Links */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <HiOutlineLink className="w-5 h-5 text-accent-amber" /> Links & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Resume URL</label>
                <input
                  value={form.resumeURL}
                  onChange={(e) => setForm({ ...form, resumeURL: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="https://drive.google.com/your-resume"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">LinkedIn</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">GitHub</label>
                <input
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-hover"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        profile && (
          <div className="space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-sm font-medium text-dark-400 mb-2">About</h2>
                <p className="text-dark-200">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-medium text-dark-400 mb-3">Details</h2>
                {profile.department && (
                  <div className="flex items-center gap-3">
                    <HiOutlineAcademicCap className="w-4 h-4 text-dark-500" />
                    <span className="text-sm text-dark-200">{profile.department}</span>
                  </div>
                )}
                {profile.cgpa && (
                  <div className="flex items-center gap-3">
                    <span className="text-dark-500 text-xs font-medium">CGPA</span>
                    <span className="text-sm text-dark-200">{profile.cgpa}</span>
                  </div>
                )}
                {profile.graduationYear && (
                  <div className="flex items-center gap-3">
                    <span className="text-dark-500 text-xs font-medium">Grad Year</span>
                    <span className="text-sm text-dark-200">{profile.graduationYear}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <HiOutlineEnvelope className="w-4 h-4 text-dark-500" />
                    <span className="text-sm text-dark-200">{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-sm font-medium text-dark-400 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm">
                      {skill}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <span className="text-sm text-dark-500">No skills added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-sm font-medium text-dark-400 mb-4">Projects</h2>
                <div className="space-y-3">
                  {profile.projects.map((project, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-dark-800/40">
                      <h3 className="font-medium text-dark-100">{project.title}</h3>
                      {project.description && <p className="text-sm text-dark-400 mt-1">{project.description}</p>}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="text-sm text-primary-400 hover:underline mt-2 inline-block">
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-medium text-dark-400 mb-3">Links</h2>
              <div className="space-y-2">
                {profile.resumeURL && (
                  <a href={profile.resumeURL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:underline">
                    <HiOutlineDocumentText className="w-4 h-4" /> Resume
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:underline">
                    <HiOutlineLink className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:underline">
                    <HiOutlineLink className="w-4 h-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ProfilePage;

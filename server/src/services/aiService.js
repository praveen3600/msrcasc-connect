const Job = require('../models/Job');
const Profile = require('../models/Profile');

/**
 * AI Service — Mock implementation with OpenAI-ready structure.
 *
 * To enable real OpenAI integration, uncomment the OpenAI import
 * and replace mock functions with actual API calls.
 */

// ─── UNCOMMENT BELOW FOR REAL OPENAI INTEGRATION ───
// const OpenAI = require('openai');
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── RESUME ANALYZER ───
const analyzeResume = async (resumeText) => {
  // ── REAL OPENAI IMPLEMENTATION (uncomment when ready) ──
  // const completion = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [
  //     {
  //       role: 'system',
  //       content: `You are an expert ATS (Applicant Tracking System) resume analyzer.
  //         Analyze the resume and return a JSON object with:
  //         - atsScore (number 0-100)
  //         - strengths (array of strings)
  //         - missingSkills (array of strings)
  //         - suggestions (array of strings)
  //         - overallFeedback (string)
  //         Return ONLY valid JSON, no other text.`,
  //     },
  //     {
  //       role: 'user',
  //       content: `Analyze this resume:\n\n${resumeText}`,
  //     },
  //   ],
  //   temperature: 0.3,
  // });
  // return JSON.parse(completion.choices[0].message.content);

  // ── MOCK RESPONSE ──
  const keywords = resumeText.toLowerCase();
  const techSkills = ['javascript', 'python', 'react', 'node', 'mongodb', 'sql', 'java', 'typescript', 'aws', 'docker'];
  const foundSkills = techSkills.filter((skill) => keywords.includes(skill));
  const missingSkills = techSkills.filter((skill) => !keywords.includes(skill)).slice(0, 4);

  const baseScore = Math.min(40 + foundSkills.length * 8 + (keywords.length > 500 ? 10 : 0), 95);

  return {
    atsScore: baseScore,
    strengths: [
      foundSkills.length > 3 ? 'Strong technical skill set' : 'Has relevant technical skills',
      keywords.includes('project') ? 'Includes project experience' : 'Resume has structured content',
      keywords.length > 300 ? 'Good level of detail' : 'Concise resume format',
    ],
    missingSkills,
    suggestions: [
      'Add quantifiable achievements (e.g., "Increased performance by 30%")',
      'Include relevant certifications or courses',
      'Add a professional summary at the top',
      missingSkills.length > 0
        ? `Consider adding these in-demand skills: ${missingSkills.slice(0, 3).join(', ')}`
        : 'Your skill coverage is excellent',
    ],
    overallFeedback:
      baseScore >= 75
        ? 'Your resume is well-optimized for ATS systems. Focus on tailoring it to specific job descriptions.'
        : 'Your resume needs improvement for ATS compatibility. Add more relevant keywords and quantify your achievements.',
  };
};

// ─── JOB RECOMMENDER ───
const recommendJobs = async (userSkills) => {
  // ── REAL OPENAI IMPLEMENTATION (uncomment when ready) ──
  // Fetch jobs from DB, then use AI to rank them
  // const jobs = await Job.find({ isActive: true });
  // const completion = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [
  //     {
  //       role: 'system',
  //       content: 'You are a job recommendation engine. Given a list of user skills and available jobs, rank the jobs by relevance. Return a JSON array of { jobId, matchScore, reason }.',
  //     },
  //     {
  //       role: 'user',
  //       content: `User skills: ${userSkills.join(', ')}\n\nJobs: ${JSON.stringify(jobs.map(j => ({ id: j._id, title: j.title, company: j.company, skillsRequired: j.skillsRequired })))}`,
  //     },
  //   ],
  //   temperature: 0.3,
  // });
  // return JSON.parse(completion.choices[0].message.content);

  // ── MOCK: skill-based matching against DB ──
  const jobs = await Job.find({ isActive: true }).populate('postedBy', 'name');
  const skillsLower = userSkills.map((s) => s.toLowerCase());

  const scored = jobs.map((job) => {
    const required = job.skillsRequired.map((s) => s.toLowerCase());
    const matched = required.filter((s) => skillsLower.includes(s));
    const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 50;

    return {
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        skillsRequired: job.skillsRequired,
      },
      matchScore,
      matchedSkills: matched,
      missingSkills: required.filter((s) => !skillsLower.includes(s)),
      reason:
        matchScore >= 70
          ? `Strong match — you have ${matched.length}/${required.length} required skills`
          : `Partial match — consider learning ${required.filter((s) => !skillsLower.includes(s)).slice(0, 2).join(', ')}`,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
};

// ─── SKILL GAP ANALYZER ───
const analyzeSkillGap = async (userSkills, jobId) => {
  // ── REAL OPENAI IMPLEMENTATION (uncomment when ready) ──
  // const job = await Job.findById(jobId);
  // const completion = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [
  //     {
  //       role: 'system',
  //       content: 'You are a career advisor. Analyze the gap between a student\'s skills and a job\'s requirements. Return JSON with: matchScore (0-100), matchedSkills, missingSkills, learningResources (array of { skill, resource, estimatedTime }).',
  //     },
  //     {
  //       role: 'user',
  //       content: `Student skills: ${userSkills.join(', ')}\nJob requirements: ${job.skillsRequired.join(', ')}\nJob title: ${job.title}`,
  //     },
  //   ],
  //   temperature: 0.3,
  // });
  // return JSON.parse(completion.choices[0].message.content);

  // ── MOCK RESPONSE ──
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const skillsLower = userSkills.map((s) => s.toLowerCase());
  const required = job.skillsRequired.map((s) => s.toLowerCase());
  const matched = required.filter((s) => skillsLower.includes(s));
  const missing = required.filter((s) => !skillsLower.includes(s));
  const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0;

  const resourceMap = {
    javascript: { resource: 'MDN Web Docs + freeCodeCamp', estimatedTime: '4 weeks' },
    python: { resource: 'Python.org Tutorial + Automate the Boring Stuff', estimatedTime: '4 weeks' },
    react: { resource: 'React Official Docs + Scrimba Course', estimatedTime: '3 weeks' },
    node: { resource: 'NodeJS.org Guides + The Odin Project', estimatedTime: '3 weeks' },
    mongodb: { resource: 'MongoDB University Free Courses', estimatedTime: '2 weeks' },
    sql: { resource: 'SQLBolt + Khan Academy SQL', estimatedTime: '2 weeks' },
    java: { resource: 'Oracle Java Tutorials + MOOC.fi', estimatedTime: '6 weeks' },
    typescript: { resource: 'TypeScript Handbook + Exercism', estimatedTime: '2 weeks' },
    aws: { resource: 'AWS Free Tier + Cloud Practitioner Path', estimatedTime: '4 weeks' },
    docker: { resource: 'Docker Getting Started + Play with Docker', estimatedTime: '2 weeks' },
  };

  return {
    jobTitle: job.title,
    company: job.company,
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    learningResources: missing.map((skill) => ({
      skill,
      ...(resourceMap[skill] || { resource: `Search for "${skill} tutorial" on YouTube/Udemy`, estimatedTime: '2-4 weeks' }),
    })),
    recommendation:
      matchScore >= 80
        ? 'You are a great fit! Apply with confidence.'
        : matchScore >= 50
          ? 'You have a solid foundation. Fill the skill gaps and you\'ll be competitive.'
          : 'Consider upskilling in the missing areas before applying.',
  };
};

module.exports = { analyzeResume, recommendJobs, analyzeSkillGap };

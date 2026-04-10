import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 p-8 pt-20">
      <div className="max-w-4xl mx-auto bg-dark-900 rounded-xl p-8 shadow-lg border border-dark-800">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">1. Introduction</h2>
            <p>Welcome to MSRCASC Connect. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, and educational details.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Profile Data:</strong> includes your interests, preferences, feedback, resume data, and survey responses.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, and browser plug-in types.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>To register you as a new user.</li>
              <li>To provide you with networking and job placement services.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our platform, products/services, marketing or customer relationships.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. Only authorized members of the institution and necessary third-party services have access to it.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">5. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing. To exercise these rights, please contact the administration.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

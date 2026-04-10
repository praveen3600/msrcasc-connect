import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 p-8 pt-20">
      <div className="max-w-4xl mx-auto bg-dark-900 rounded-xl p-8 shadow-lg border border-dark-800">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="mb-4 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using MSRCASC Connect, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">2. User Conduct</h2>
            <p>You agree to use the platform only for lawful purposes related to educational networking and job placement. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or the Content.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Do not harass, abuse, or harm other users.</li>
              <li>Do not post false, inaccurate, or misleading information.</li>
              <li>Do not distribute spam or malicious content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">3. Intellectual Property Rights</h2>
            <p>The platform and its original content, features, and functionality are owned by M S Ramaiah College and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">4. Termination</h2>
            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary-400 mb-2">5. Disclaimer</h2>
            <p>Job postings and network connections are provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the outcome of your usage of this platform for career placement.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

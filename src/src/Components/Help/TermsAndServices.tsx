export function TermsAndServicesHelp() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms and Services</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          By using this website, you agree to the following terms and conditions.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Free Service</h2>
        <p>
          This decklist submission service is provided completely free of charge. As a free service, there are no guarantees 
          regarding availability, functionality, or continuity of service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">No Warranties</h2>
        <p>
          This service is provided "as is" without warranties of any kind, either express or implied. We make no guarantees 
          regarding uptime, reliability, or accuracy of the service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Limited Liability</h2>
        <p>
          We will not be liable for any damages or losses related to your use of this website, including but not limited to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Inability to submit a decklist</li>
          <li>Loss of decklist data</li>
          <li>Service outages or downtime</li>
          <li>Any errors or inaccuracies in the content or functionality</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Service Discontinuation</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue this service at any time without prior notice.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">User Responsibility</h2>
        <p>
          Users are responsible for:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Ensuring their decklists are submitted correctly and on time</li>
          <li>Backing up their decklist information elsewhere if needed</li>
          <li>Using the service in compliance with all applicable laws and regulations</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Disagreement with Terms</h2>
        <p>
          If you disagree with any part of these terms, please do not use this website. Your continued use of the service 
          constitutes your acceptance of these terms.
        </p>
        
        <p className="mt-8 text-sm text-gray-600">
          Last updated: 31st of March 2025
        </p>
      </div>
    </div>
  );
}

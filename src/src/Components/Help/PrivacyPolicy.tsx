export function PrivacyHelp() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          This privacy policy explains how data is handled when using this website. As a service operating within the European Union, it complies with GDPR regulations and prioritizes your privacy rights.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Email Information</h2>
        <p>
          Email addresses are not stored in the database. Your email is only used for authentication purposes during the sign-in process.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Cookies</h2>
        <p>
          Cookies are only used for authentication purposes. These cookies are essential for the functioning of this service 
          as they allow you to stay logged in during your session. No cookies are used for tracking, 
          analytics, or advertising purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Google Authentication</h2>
        <p>
          If you choose to sign in with Google, please be aware that Google may set cookies on your device as part of their authentication process. By using Google Sign-In, you accept Google's privacy policy regarding how they handle your data.
        </p>
        <p className="mt-2">
          For more information about how Google processes your data, please visit their{" "}
          <a 
            href="https://policies.google.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Amazon Web Services (AWS)</h2>
        <p>
          This website is hosted on Amazon Web Services (AWS) in the Frankfurt region (EU-Central-1). The following AWS services are used to operate this platform:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>AWS Lambda - For serverless computing to run the application code</li>
          <li>Amazon DynamoDB - For database storage of decklists and event information</li>
          <li>Amazon SES (Simple Email Service) - For processing email communications</li>
          <li>Amazon CloudFront - For content delivery and distribution</li>
        </ul>
        <p className="mt-2">
          All data is stored within the European Union. For more information about how AWS handles your data, please refer to their{" "}
          <a 
            href="https://aws.amazon.com/privacy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Your Data Rights</h2>
        <p>
          As a user based in the European Union, you have certain rights regarding your personal data, including the right to access, correct, or delete any information held about you.
        </p>
        <p>
          Only the name you provide on your decklist is stored in the database, and you can delete that data yourself by deleting your decklist.
        </p>
        <p>
          This website prioritizes data minimization and does not retain data from past events. No statistics about your gameplay habits or preferences are collected. This website was created to simplify the decklist submission process for the community and avoid common issues with paper submissions such as illegible handwriting or missing information.
        </p>
        <p>
          If you wish to delete your data, you can do so by removing your decklist. If you've forgotten the email you used to log in with, assistance may not be possible as all data in the database is strongly encrypted. This encryption ensures that even in the unlikely event of a data breach, your information remains protected. No emails, passwords, personal identifiers, or any sensitive personal information are stored in the database.
        </p>
        <p>
          All decklists and information about events are automatically deleted within a week after the event ends to maintain data minimization principles.
        </p>
        <p>
          For contact regarding this website, please email: jonas DOT swiatek AT gmail DOT com
        </p>
        
        <p className="mt-8 text-sm text-gray-600">
          Last updated: 31st of March 2025
        </p>
      </div>
    </div>
  );
}

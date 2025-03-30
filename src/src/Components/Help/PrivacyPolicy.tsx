
export function PrivacyHelp() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          This privacy policy explains how we handle your data when using our services. As a company operating within the European Union, we comply with GDPR regulations and prioritize your privacy rights.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Email Information</h2>
        <p>
          We do not store your email address in our database. Your email is only used for authentication purposes during the sign-in process.
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
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Email Authentication</h2>
        <p>
          If you choose to log in via email, we use Sendgrid (a third-party email service provider) to send authentication emails. When you request an email login link, your email address is temporarily processed by Sendgrid to deliver the authentication email.
        </p>
        <p className="mt-2">
          For more information about how Sendgrid handles your data, please refer to their{" "}
          <a 
            href="https://www.twilio.com/en-us/legal/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Your Data Rights</h2>
        <p>
          As a user based in the European Union, you have certain rights regarding your personal data, including the right to access, correct, or delete any information we hold about you.
        </p>
        <p>
          Only the name you provide on your decklist is stored in our database, and you can delete that data yourself by deleting your decklist.
        </p>
        <p>
          Frankly I don't want to pay to store data about you, so I don't keep any data around for events in the past. I don't gather statistics about what you play, because I don't give two shits. I made this website because I'm tired of reading your crumpled up decklists written on napkins, with your shitty handwriting and your inability to locate the upper right corner on a decklist when you're being asked to write your table number on it.
        </p>
        <p>
          Want your data deleted? Do it yourself then. If you forgot the email you used to log in with, I can't help you. I encrypt all the data to shit in the database so even I can't fucking tell which of the entries in the database belongs to you. I do it like that because if some nerd manages to run away with the content of the database, it's all just a garbled mess containing no emails, no password, no birthdays, sexual orientations, skincolors, what you had for dinner or whatever the fuck else people want to know.
        </p>
        <p>
          All decklists and information about events are deleted within a week after the event ends. Irrecoverably so, because I don't want to pay to keep that shit around.
        </p>
        <p>
          If you really need me for anything, then you can reach me on jonas DOT swiatek AT gmail DOT com
        </p>
        
        <p className="mt-8 text-sm text-gray-600">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
}

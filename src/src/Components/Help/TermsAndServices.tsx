import { PageContainer } from "@/Components/layout/PageContainer";

export function TermsAndServicesHelp() {
  return (
    <PageContainer size="default">
      <h1 className="text-3xl font-bold tracking-tight">Terms and Services</h1>

      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          By using this website, you agree to the following terms and conditions.
        </p>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">Free Service</h2>
        <p>
          This decklist submission service is provided completely free of charge. As a free service, there are no guarantees
          regarding availability, functionality, or continuity of service.
        </p>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">No Warranties</h2>
        <p>
          This service is provided "as is" without warranties of any kind, either express or implied. We make no guarantees
          regarding uptime, reliability, or accuracy of the service.
        </p>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">Limited Liability</h2>
        <p>
          We will not be liable for any damages or losses related to your use of this website, including but not limited to:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Inability to submit a decklist</li>
          <li>Loss of decklist data</li>
          <li>Service outages or downtime</li>
          <li>Any errors or inaccuracies in the content or functionality</li>
        </ul>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">Service Discontinuation</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue this service at any time without prior notice.
        </p>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">User Responsibility</h2>
        <p>
          Users are responsible for:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Ensuring their decklists are submitted correctly and on time</li>
          <li>Backing up their decklist information elsewhere if needed</li>
          <li>Using the service in compliance with all applicable laws and regulations</li>
        </ul>

        <h2 className="pt-2 text-2xl font-semibold text-foreground">Disagreement with Terms</h2>
        <p>
          If you disagree with any part of these terms, please do not use this website. Your continued use of the service
          constitutes your acceptance of these terms.
        </p>

        <p className="pt-4 text-sm">
          Last updated: 31st of March 2025
        </p>
      </div>
    </PageContainer>
  );
}

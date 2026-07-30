import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Plus, QrCode } from "lucide-react";
import { getEvent } from '../../model/api/apimodel';
import { EventList } from "../Events/EventList";
import { useAuthQuery } from "../../Hooks/useAuthQuery";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";

export function LandingPage() {
    const { authorized } = useAuthQuery();

    const [joinCode, setJoinCode] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);

    const navigate = useNavigate();

    const goToEvent = async () => {
        setShowError(false);
        if (joinCode && joinCode.length > 0) {
            try {
                const eventDetails = await getEvent(joinCode.toLowerCase());
                navigate(`/e/${eventDetails.event_id.toLowerCase()}`);
            }
            catch {
                setShowError(true);
            }
        }
    };

    return (
        <PageContainer size="lg">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card px-6 py-12 sm:px-10 sm:py-16">
                <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative max-w-2xl">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Free · No ads · Open to everyone
                    </span>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        Register your decklist
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground">
                        Decklists for your Magic: the Gathering tournaments — fast, simple and free.
                    </p>
                </div>
            </section>

            {/* Join a tournament */}
            <section className="mt-8">
                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                <QrCode className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Joining a tournament?</h2>
                                <p className="text-sm text-muted-foreground">
                                    Enter the event code, or scan the QR code provided by the tournament to upload your decklist.
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
                            <Input
                                placeholder="Enter event code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && goToEvent()}
                                aria-label="Event code"
                            />
                            <Button onClick={goToEvent} className="sm:w-auto">
                                Join event
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                        {showError && (
                            <p className="text-sm text-destructive">
                                This code doesn't seem right. Check that you entered it correctly.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Your tournaments */}
            <section className="mt-8">
                {authorized ? (
                    <EventList />
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Log in to see and manage your tournaments.
                            </p>
                            <Button asChild variant="outline" className="shrink-0">
                                <a href="/login">Log in</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Create CTA */}
            <section className="mt-8 flex justify-end">
                <Button size="lg" onClick={() => navigate('/e/new')}>
                    <Plus className="size-4" />
                    Create tournament
                </Button>
            </section>
        </PageContainer>
    )
}

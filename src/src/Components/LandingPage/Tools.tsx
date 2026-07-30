import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";

export function Tools() {
    const navigate = useNavigate();

    const handleTournamentTimersClick = () => {
        navigate("/timers");
    };

    return (
        <PageContainer size="default">
            <div className="flex justify-center">
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleTournamentTimersClick}
                    className="flex h-auto min-h-[100px] min-w-[150px] flex-col items-center gap-2 p-4"
                >
                    <Clock className="size-8" />
                    <span>Tournament Timers</span>
                </Button>
            </div>
        </PageContainer>
    )
}

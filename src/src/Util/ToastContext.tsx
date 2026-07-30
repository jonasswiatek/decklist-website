import { toast } from 'sonner';
import { Toaster } from '@/Components/ui/sonner';

type ToastVariant = 'success' | 'danger' | 'warning';

/**
 * Renders the global toast host. Kept as a component named `ToastProvider`
 * for backwards compatibility; it no longer needs React context because
 * sonner exposes an imperative `toast()` API.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}

/**
 * Backwards-compatible hook. `showToast(message, variant)` maps the old
 * bootstrap variants onto sonner's typed toasts.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const showToast = (message: string, variant: ToastVariant = 'success') => {
        switch (variant) {
            case 'danger':
                toast.error(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            default:
                toast.success(message);
                break;
        }
    };

    return { showToast };
}

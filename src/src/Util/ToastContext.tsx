import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

type ToastVariant = 'success' | 'danger' | 'warning';

type ToastItem = {
    id: number;
    message: string;
    variant: ToastVariant;
};

type ToastContextType = {
    showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(0);

    const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
        const id = nextId.current++;
        setToasts(prev => [...prev, { id, message, variant }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer position="top-end" className="position-fixed p-3" style={{ zIndex: 1080 }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        bg={toast.variant}
                        autohide
                        delay={5000}
                        onClose={() => removeToast(toast.id)}
                    >
                        <Toast.Body className="text-white">{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

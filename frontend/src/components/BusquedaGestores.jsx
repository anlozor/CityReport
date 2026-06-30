import { useEffect } from "react";

export default function BusquedaGestores({open, onClose, children}) {
    if (!open) {
        return null;
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: "12px",
                    width: "400px",
                    maxHeight: "500px",
                    overflowY: "auto",
                    padding: "16px"
                }}
            >
                {children}
            </div>
        </div>
    );
}
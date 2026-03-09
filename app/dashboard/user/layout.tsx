import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="w-full mx-auto grid place-items-center">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
        </div>
    );
};

export default layout;
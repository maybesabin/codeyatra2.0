import { FC, ReactNode } from "react";

type InfoItemProps = {
    icon: FC<{ size?: number }>;
    children: ReactNode;
};

export const InfoItem: FC<InfoItemProps> = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2">
        <Icon size={16} />
        {children}
    </div>
);
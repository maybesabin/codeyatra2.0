import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid place-items-center">
      <div className="md:w-[80vw] w-full">{children}</div>
    </div>
  );
};

export default layout;

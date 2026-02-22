"use client";

import { useState } from "react";
import InputField from "./inputfield";
import Members from "./members";

interface Member {
  id: number;
  name: string;
  age: number;
  gender: string;
}

const page = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [showpopup, setShowpopup] = useState<boolean>(false);

  return (
    <div>
      {showpopup && (
        <InputField
          setShowpopup={setShowpopup}
          members={members}
          setMembers={setMembers}
        />
      )}
      <Members
        setShowpopup={setShowpopup}
        members={members}
        setMembers={setMembers}
      />
    </div>
  );
};

export default page;

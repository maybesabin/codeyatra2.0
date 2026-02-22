import React from "react";

interface Member {
  id: number;
  name: string;
  age: number;
  gender: string;
}
interface propsType {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setShowpopup: React.Dispatch<React.SetStateAction<boolean>>;
}

const Members = ({ members, setMembers, setShowpopup }: propsType) => {
  return (
    <div>
      <div className="flex justify-between items-center p-3">
        <p className="font-bold text-xl ">Family Members</p>
        <div
          className="text-2xl z-9 bg-primary/30 px-2 hover:bg-primary/80 cursor-pointer rounded-lg"
          onClick={() => {
            setShowpopup(true);
          }}
        >
          +
        </div>
      </div>{" "}
      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members added yet.</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="p-4 border rounded-2xl flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  Age: {member.age} | Gender: {member.gender}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Members;

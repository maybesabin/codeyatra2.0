"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

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

const InputField = ({ members, setMembers, setShowpopup }: propsType) => {
  const [familyName, setFamilyName] = useState<string>("from database");

  const [memberName, setMemberName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  const addMember = (): void => {
    if (!memberName.trim() || !age || !gender) return;

    const newMember: Member = {
      id: Date.now(),
      name: memberName,
      age: Number(age),
      gender,
    };

    setMembers((prev) => [...prev, newMember]);
    setMemberName("");
    setAge("");
    setGender("");
    console.log(newMember);
  };

  return (
    <div className="absolute z-10 w-full grid place-items-center bg-black/40 h-svh">
      <div className="w-[80vw] relative max-w-xl">
        <Card className="rounded-2xl shadow-xl">
          <div
            className="absolute z-9  right-4"
            onClick={() => setShowpopup(false)}
          >
            <X />
          </div>
          <CardContent className="relative space-y-6">
            
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold">{familyName} Family</h1>
                <p className="text-sm text-muted-foreground">
                  Add family members below
                </p>
              </div>

              <div className="grid gap-4">
                <Input
                  placeholder="Member Name"
                  value={memberName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMemberName(e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAge(e.target.value)
                  }
                />
                <Select
                  value={gender}
                  onValueChange={(value: string) => setGender(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addMember}>Add Member</Button>
              </div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputField;

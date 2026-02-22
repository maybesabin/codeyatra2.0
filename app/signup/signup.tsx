"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { User, UserPen, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="  grid place-items-center h-screen w-full ">
      <div className="border shadow-xl bg-white h-150 grid place-items-center w-90 rounded-2xl">
        <h1 className="font-bold text-2xl ">Sign Up</h1>
        <p className="-mt-5">Create your account</p>

        <div className="flex justify-center mb-5">
          <label className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center cursor-pointer">
            {profilePic ? (
              <img
                src={profilePic}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-3xl">+</span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-72">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border rounded-md py-2 pl-10 outline-none"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border rounded-md py-2 pl-10 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border rounded-md py-2 pl-10 pr-10 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="relative">
            <UserPen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-full border rounded-md py-2 pl-10 outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <hr />

        <p className="-mt-8">
          Already have an account?
          <a href="" className="cursor-pointer text-blue-500">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

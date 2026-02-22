"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  return (
    <div className="  grid place-items-center h-screen w-full ">
      <div className="border shadow-lg h-100 grid place-items-center w-90 rounded-2xl">
        <h1 className="font-bold text-3xl ">Log In</h1>
        <p className="-mt-8 font-bold">Welcome back</p>

        <form onSubmit={handleSubmit} className="space-y-4 w-72">
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

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Log In
          </button>
        </form>

        <hr />

        <p className="-mt-15">
          Don’t have an account?{" "}
          <a href="" className="text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

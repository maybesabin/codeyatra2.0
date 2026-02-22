import { Button } from "@/components/ui/button";
import { ArrowRight, Ghost } from "lucide-react";
import Image from "next/image";
import React from "react";
import image from "../assets/landingPageDoctor.jpeg";
const page = () => {
  return (
    <div>
      <div className="grid grid-cols-2 place-items-center h-svh">
        <div className="w-1/2 grid gap-6">
          <div className="ring ring-primary bg-primary/20 rounded-full flex  items-center w-max pl-2 pr-4 py-1">
            <div className="size-2 mx-2 rounded-full animate-pulse bg-primary"></div>
            <p>Now available nationwide</p>
          </div>
          <h1 className="text-7xl font-semibold">
            Healthcare, reimagine for the digital age
          </h1>
          <p className="text-neutral-600">
            Connect patients and providers through a secure, intellegent
            platform designed for modern care delivery. Streamline workflows,
            improve outcomes.
          </p>
          <div className="flex gap-3">
            <Button>
              Request Access <ArrowRight />{" "}
            </Button>
            <Button variant={"outline"}>Explore Platform</Button>
          </div>
        </div>
        <div>
          <Image alt="doctor" src={image} className="rounded-xl shadow-lg" />
        </div>
      </div>
      <div>
        <div className="border p-10 w-1/4 grid place-items-center">
          <p className="text-5xl font-semibold">98%</p>
          <p className="text-sm text-neutral-500">Patient Satisfactory rate</p>
        </div>
        <div className="border p-10 w-1/4 grid place-items-center">
          <p className="text-5xl font-semibold">2M+</p>
          <p className="text-sm text-neutral-500">Consultations completed</p>
        </div>
        <div className="border p-10 w-1/4 grid place-items-center">
          <p className="text-5xl font-semibold">98%</p>
          <p className="text-sm text-neutral-500">Patient Satisfactory rate</p>
        </div>
        <div className="border p-10 w-1/4 grid place-items-center">
          <p className="text-5xl font-semibold">98%</p>
          <p className="text-sm text-neutral-500">Patient Satisfactory rate</p>
        </div>
      </div>
    </div>
  );
};

export default page;

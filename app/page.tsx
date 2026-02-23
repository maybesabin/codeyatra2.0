import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChartColumnDecreasing,
  Clock,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import image from "../assets/landingPageDoctor.jpeg";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

const page = () => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-center items-center h-svh w-full max-w-7xl mx-auto">
        <div className="grid gap-6 p-4">
          <div className="ring ring-primary bg-primary/20 rounded-full flex  items-center w-max pl-2 pr-4 py-1">
            <div className="size-2 mx-2 rounded-full animate-pulse bg-primary"></div>
            <p>Now available nationwide</p>
          </div>
          <h1 className="text-5xl xl:text-7xl font-semibold">
            Healthcare, reimagine for the digital age
          </h1>
          <p className="text-neutral-600">
            Connect patients and providers through a secure, intellegent
            platform designed for modern care delivery. Streamline workflows,
            improve outcomes.
          </p>
          <div className="flex gap-3">
            <Button>
              <Link href="/signup" className="flex gap-3 items-center">
                Request Access <ArrowRight />{" "}
              </Link>
            </Button>
            <Button variant={"outline"}>
              <Link href={"/signup"}>Explore Platform</Link>
            </Button>
          </div>
        </div>

        <Image
          alt="doctor"
          src={image}
          className=" object-cover hidden md:block w-[30rem] h-[60vh] rounded-xl shadow-lg"
        />
      </div>
      <div className="flex flex-wrap grow bg-white">
        <div className="border p-10 grow grid place-items-center">
          <p className="text-3xl md:text-5xl font-semibold">98%</p>
          <p className="text-sm text-neutral-500">Patient Satisfactory rate</p>
        </div>
        <div className="border p-10 grow grid place-items-center">
          <p className="text-3xl md:text-5xl font-semibold">2M+</p>
          <p className="text-sm text-neutral-500">Consultations completed</p>
        </div>
        <div className="border p-10 grow grid place-items-center">
          <p className="text-3xl md:text-5xl font-semibold">45%</p>
          <p className="text-sm text-neutral-500">Reduction in wait time</p>
        </div>
        <div className="border p-10 grow grid place-items-center">
          <p className="text-3xl md:text-5xl font-semibold">500+</p>
          <p className="text-sm text-neutral-500">Healthcare providers</p>
        </div>
      </div>

      <div className="my-30 gap-3 grid  place-items-center">
        <p className="text-primary font-semibold">PLATFROM</p>
        <p className="font-semibold text-3xl text-center">
          Everything you need for modern healthcare
        </p>
        <p className="text-neutral-600 text-center p-1">
          A comprehensive suite of tools designed to transform how care is
          delivered and experienced
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center p-5">
        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <Zap />
            </CardTitle>
            <CardDescription className="font-semibold text-black pt-3">
              Instant consultation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              Connect with healthcare professionals in real-time through secure
              video calls and messaging .
            </p>
          </CardContent>
        </Card>

        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <Shield />
            </CardTitle>
            <CardDescription className="font-semibold text-black pt-3">
              HIPPA Complaint
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              Enterprise-grade security ensuring all patient data is encrypted
              and fully complaint.
            </p>
          </CardContent>
        </Card>

        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <Users />
            </CardTitle>
            <CardDescription className="font-semibold text-black pt-3">
              Care Coordination
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              Seamless collaboration between providers, specialists, and care
              team for better outcomes.
            </p>
          </CardContent>
        </Card>

        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <ChartColumnDecreasing />
            </CardTitle>
            <CardDescription className="font-semibold text-black pt-3">
              Health Analytics
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              Actionalble insights from patient data to drive critical decisions
              and improve care quality.
            </p>
          </CardContent>
        </Card>
        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <Lock />
            </CardTitle>
            <CardDescription className="font-semibold text-black pt-3">
              Secure Records
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              Centralized electronic health records with role-based access and
              full audit traits.
            </p>
          </CardContent>
        </Card>
        <Card className="h-60">
          <CardHeader>
            <CardTitle className="bg-primary/20 ring ring-primary rounded-lg w-fit p-3">
              <Clock />
            </CardTitle>
            <CardDescription className="pt-3 font-semibold text-black ">
              Smart Scheduling
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-stone-600">
              AI-powered scheduling that reduces no-shows and optimizes provider
              availibility.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-10 m-2 md:m-5 rounded-2xl bg-primary items-center justify-center text-white flex flex-col gap-6">
        <p className="text-2xl font-semibold ">
          Ready to transform your practise?
        </p>
        <p>
          Join hundreds of healthcare providers already using CareSync to
          deliver better care and improve patient outcome.
        </p>
        <div className="flex gap-3">
          <Button className="bg-white hover:bg-neutral-100 cursor-pointer text-primary">
            <Link href={"/signup"} className="flex gap-3 items-center">
              Get Started <ArrowRight />{" "}
            </Link>
          </Button>
          <Button
            variant={"ghost"}
            className="cursor-pointer hover:bg-primary/10 ring ring-white hover:text-white"
          >
            <Link href={"/singup"}>Schedule a Demo</Link>
          </Button>
        </div>
      </div>
    </div >
  );
};

export default page;

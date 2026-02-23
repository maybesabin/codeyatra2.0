"use client";

import React from "react";
import Patients from "./pateients";
import Appointments from "./appointments";
import Calendar from "./Calendar";

const page = () => {
  return (
    <>
      <Appointments />
      <Calendar />
      <Patients />
    </>
  );
};

export default page;

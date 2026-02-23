"use client";

import React, { useState } from "react";
import Appointments from "./appointments";
import Patients from "./pateients";
const page = () => {
  return (
    <>
      <Appointments />
      <Patients />
    </>
  );
};

export default page;

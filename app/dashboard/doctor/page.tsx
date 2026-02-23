"use client";

import React, { useState } from "react";
import Patients from "./pateients";
import Appointments from "./appointments";

const page = () => {
  return (
    <>
      <Appointments />
      <Patients />
    </>
  );
};

export default page;

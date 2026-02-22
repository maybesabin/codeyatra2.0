"use client";

import React, { useState } from "react";
import Patients from "./pateients";
import Appointments from "./appointments";

const page = () => {
  return (
    <div>
      <Appointments />
      <Patients />
    </div>
  );
};

export default page;

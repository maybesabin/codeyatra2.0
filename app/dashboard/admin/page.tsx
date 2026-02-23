"use client";

import React, { useState } from "react";
import Patients from "./users";
import Appointments from "./overview";

const page = () => {
  return (
    <>
      <Appointments />
      <Patients />
    </>
  );
};

export default page;

"use client";

import React, { useState } from "react";
import Patients from "./pateients";
import Appointments from "./appointments";

const page = () => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div>
      <div className="font-semibold text-2xl px-1 py-10">
        Appointments:
        <p className="text-neutral-500 text-sm font-medium">
          {date.toDateString()}
        </p>
      </div>
      <Appointments />
      <p className="font-semibold text-2xl px-1 py-10">Patients:</p>
      <Patients />
    </div>
  );
};

export default page;

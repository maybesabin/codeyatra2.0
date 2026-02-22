import React, { useState } from "react";

const appoinetments = [
  {
    Total: 4,
    Confirmed: 5,
    Pending: 5,
    Rejected: 7,
  },
];

const Appointments = () => {
  const [date, setDate] = useState<Date>(new Date());
  return (
    <div className="p-6">
      <header className="my-6">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-stone-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>
      <div className="flex flex-wrap w-full gap-4">
        {Object.entries(appoinetments[0]).map(([key, value]) => (
          <div
            key={key}
            className="p-6 flex-1 ring ring-neutral-300 shadow-md rounded-xl"
          >
            <p className="text-sm text-neutral-500">{key}</p>
            <p className="font-semibold text-primary text-2xl">{value}</p>
            <p className="text-sm text-neutral-500">{key} appointments</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;

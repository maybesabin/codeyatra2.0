"use client";

import { InfoItem } from "@/components/InfoItem";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { LocationEdit, Phone, PhoneCall, Send } from "lucide-react";
import { useEffect, useState } from "react";

const page = () => {
    const [pharmacies, setPharmacies] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const res = await axios.get(`/api/pharmacies?lat=${latitude}&lng=${longitude}`);
                setPharmacies(res.data);
            } catch (err) {
                console.error("Axios error:", err);
                setPharmacies([]);
            }
        });
    }, []);

    return (
        <>
            <h2
                className="text-3xl font-semibold py-4">
                Nearby Pharmacies
            </h2>

            {pharmacies.map((p: Pharmacy, idx) => (
                <div key={idx} className="border text-sm rounded-xl w-full flex flex-col items-start gap-4 p-4">
                    <h3 className="text-xl font-semibold">{p.name}</h3>

                    <>
                        <InfoItem icon={Send}>{p.address}</InfoItem>
                        <InfoItem icon={LocationEdit}>Distance: {p.distance} km</InfoItem>
                        <InfoItem icon={PhoneCall}>{p.phone || "N/A"}</InfoItem>
                    </>

                    <Button
                        variant={"default"}
                        className="w-full"
                    >
                        Call
                    </Button>
                </div>
            ))}
        </>
    );
}

export default page;
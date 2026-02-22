import axios from "axios";
import { NextResponse } from "next/server";

// Haversine formula to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const nameVariants = ["pharmacy", "pharma", "chemist"];

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");


    const query = `
    [out:json];
    node["amenity"="pharmacy"](around:10000,${lat},${lng});
    out;
  `;

    const response = await axios.post(
        "https://overpass-api.de/api/interpreter", query
    );

    const data = response.data

    const formatted = data.elements
        .map((item: any) => {
            const distance = getDistanceFromLatLonInKm(lat, lng, item.lat, item.lon);
            return {
                id: item.id,
                name: item.tags?.name || "Unnamed Pharmacy",
                address: item.tags?.["addr:street"] || "Address not listed",
                lat: item.lat,
                lng: item.lon,
                phone: item.tags?.phone || item.tags?.["contact:phone"] || "N/A",
                distance: parseFloat(distance.toFixed(2))
            };
        })
        .filter((item: any) =>
            // Ensure it's within 10km
            item.distance <= 10 &&
            nameVariants.some((v) => item.name.toLowerCase().includes(v))
        )
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 20);

    return NextResponse.json(formatted);
}
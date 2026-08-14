const XLSX = require("xlsx");
const path = require("path");

const columns = [
    "propertyName", "description", "purpose", "type", "price", "priceNegotiable",
    "bedrooms", "bathrooms", "area", "livingRooms", "parkingSpaces", "floorNumber",
    "totalFloors", "yearBuilt", "furnishing", "addressLine1", "addressLine2",
    "areaName", "municipality", "contactPhone", "contactWhatsapp", "amenities",
    "nearbyTags", "otherFeatures", "latitude", "longitude", "extraProperties", "photos"
];

const sampleRow = {
    propertyName: "Luxury 4-BR Villa in The Pearl Qatar",
    description: "Stunning 4-bedroom villa with private pool and sea view",
    purpose: "SALE",
    type: "Villa",
    price: 5500000,
    priceNegotiable: false,
    bedrooms: 4,
    bathrooms: 5,
    area: 450.5,
    livingRooms: 2,
    parkingSpaces: 2,
    floorNumber: "",
    totalFloors: "",
    yearBuilt: 2019,
    furnishing: "Fully Furnished",
    addressLine1: "Porto Arabia Tower 5",
    addressLine2: "",
    areaName: "The Pearl Qatar",
    municipality: "Doha",
    contactPhone: "+97455512345",
    contactWhatsapp: "+97455512345",
    amenities: "Swimming Pool, Covered Parking, Garden",
    nearbyTags: "school, mall, beach",
    otherFeatures: "Comes with a dedicated boat berth in the marina",
    latitude: 25.3548,
    longitude: 51.1839,
    extraProperties: "{\"privatePool\": true, \"gardenAreaSqm\": 200}",
    photos: "https://cdn.example.com/photo1.jpg, https://cdn.example.com/photo2.jpg"
};

const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: columns });
worksheet["!cols"] = columns.map((c) => ({ wch: Math.max(16, c.length + 4) }));

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");

const outPath = path.join(__dirname, "..", "public", "templates", "bulk-upload-sample-template.xlsx");
XLSX.writeFile(workbook, outPath);
console.log("Template written to", outPath);

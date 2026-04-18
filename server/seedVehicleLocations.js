// Script to add geolocation coordinates to existing vehicles in MongoDB
// Run this from the server folder: node seedVehicleLocations.js

require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("./models/Vehicle");

// Nepal test locations
const testLocations = [
  { name: "Kathmandu City Center", latitude: 27.7172, longitude: 85.324 },
  { name: "Thamel, Kathmandu", latitude: 27.7245, longitude: 85.3340 },
  { name: "Pokhara City", latitude: 28.2096, longitude: 83.9856 },
  { name: "Bhaktapur Durbar Square", latitude: 27.6735, longitude: 85.4338 },
  { name: "Lalitpur (Patan)", latitude: 27.6538, longitude: 85.3226 },
  { name: "Biratnagar", latitude: 26.4524, longitude: 87.2676 }
];

async function seedVehicleLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const vehicles = await Vehicle.find();
    console.log(`Found ${vehicles.length} vehicles`);

    let updated = 0;
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const location = testLocations[i % testLocations.length];

      // Only update if location doesn't have coordinates yet
      if (!vehicle.location?.coordinates || !vehicle.location.coordinates.coordinates) {
        const currentAddress = typeof vehicle.location === 'string' 
          ? vehicle.location 
          : vehicle.location?.address || location.name;

        vehicle.location = {
          address: currentAddress,
          coordinates: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          }
        };

        await vehicle.save();
        updated++;
        console.log(`✅ Updated: ${vehicle.title} - ${currentAddress}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} vehicles with coordinates!`);
    console.log("You can now see vehicles on the map view.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedVehicleLocations();

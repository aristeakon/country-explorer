const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

// Φόρτωση των μεταβλητών από το config.env
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Σύνδεση με τη MongoDB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Database connection successful!'))
    .catch(err => console.error('Database connection error:', err));

// Ορισμός Σχήματος για MongoDB
const countrySchema = new mongoose.Schema({
    country: { type: String, required: true },
    qualityOfLife: Number,
    adventure: Number,
    heritage: Number,
    costOfLivingIndex: Number,
    restaurantPriceIndex: Number,
    homicideRate: Number,
});

// Δημιουργία Μοντέλου
const Country = mongoose.model('Country', countrySchema);

// Λειτουργία Καθαρισμού Βάσης Δεδομένων
async function clearDatabase() {
    try {
        console.log('Clearing database...');
        await Country.deleteMany({});
        console.log('Database cleared!');
    } catch (err) {
        console.error('Error clearing database:', err);
    }
}

// Λειτουργία Αποθήκευσης Δεδομένων από JSON
async function storeDataFromJSON() {
    try {
        console.log('Storing data from JSON...');

        // Φόρτωση του συγχωνευμένου JSON αρχείου
        const mergedDataPath = './Merged_Country_Data.json';
        const mergedData = JSON.parse(fs.readFileSync(mergedDataPath, 'utf8'));

        // Φιλτράρισμα δεδομένων που περιέχουν τιμή στο `Country`
        const validData = mergedData.filter(entry => entry.Country);

        // Εισαγωγή δεδομένων στη βάση
        await Country.insertMany(validData.map(entry => ({
            country: entry.Country,
            qualityOfLife: entry["Quality of Life"] || null,
            adventure: entry.Adventure || null,
            heritage: entry.Heritage || null,
            costOfLivingIndex: entry["Cost of Living Index"] || null,
            restaurantPriceIndex: entry["Restaurant Price Index"] || null,
            homicideRate: entry["Homicide Rate"] || null,
        })));

        console.log('Data successfully stored in MongoDB!');
    } catch (err) {
        console.error('Error storing data in MongoDB:', err);
    }
}

// Εκτέλεση Λειτουργιών Καθαρισμού και Αποθήκευσης
(async () => {
    await clearDatabase(); // Καθαρισμός της βάσης
    await storeDataFromJSON(); // Αποθήκευση των δεδομένων από το JSON
})();

// Εκκίνηση του server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

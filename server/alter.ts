import sequelize from './config/database.js';

const run = async () => {
    try {
        await sequelize.query("ALTER TABLE Packages ADD COLUMN community ENUM('town', 'school') DEFAULT 'town';");
        console.log("Success");
    } catch(e) {
        console.log("Error:", e);
    }
    process.exit(0);
}

run();

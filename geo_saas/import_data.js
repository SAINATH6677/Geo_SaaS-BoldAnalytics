const fs = require('fs');
const csv = require('csv-parser');
const db = require('./config/db');

// Maps for unique data
const states = new Map();
const districts = new Map();
const subDistricts = new Map();

async function insertData() {
  const rows = [];

  console.log("📥 Reading CSV...");

  fs.createReadStream('final_data.csv')
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      console.log(`✅ CSV Loaded: ${rows.length} rows`);

      // =============================
      // STEP 1: Extract Unique Data
      // =============================
      for (let row of rows) {
        const stateCode = parseInt(row.state_code);
        const districtCode = parseInt(row.district_code);
        const subDistrictCode = parseInt(row.sub_district_code);
        const villageCode = parseInt(row.village_code);

        // Skip invalid rows
        if (
          isNaN(stateCode) ||
          isNaN(districtCode) ||
          isNaN(subDistrictCode) ||
          isNaN(villageCode)
        ) {
          continue;
        }

        states.set(stateCode, row.state_name);

        districts.set(districtCode, {
          name: row.district_name,
          state_code: stateCode
        });

        subDistricts.set(subDistrictCode, {
          name: row.sub_district_name,
          district_code: districtCode
        });
      }

      console.log(`🧠 Unique States: ${states.size}`);
      console.log(`🧠 Unique Districts: ${districts.size}`);
      console.log(`🧠 Unique SubDistricts: ${subDistricts.size}`);

      // =============================
      // STEP 2: Insert States
      // =============================
      console.log("🚀 Inserting States...");
      for (let [code, name] of states) {
        try {
          await db.query(
            'INSERT INTO states(state_code, state_name) VALUES($1,$2) ON CONFLICT DO NOTHING',
            [code, name]
          );
        } catch (err) {
          console.log(`❌ State ${code}: ${err.message}`);
        }
      }

      // =============================
      // STEP 3: Insert Districts
      // =============================
      console.log("🚀 Inserting Districts...");
      for (let [code, d] of districts) {
        try {
          await db.query(
            'INSERT INTO districts(district_code, district_name, state_code) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
            [code, d.name, d.state_code]
          );
        } catch (err) {
          console.log(`❌ District ${code}: ${err.message}`);
        }
      }

      // =============================
      // STEP 4: Insert SubDistricts
      // =============================
      console.log("🚀 Inserting Sub-Districts...");
      for (let [code, s] of subDistricts) {
        try {
          await db.query(
            'INSERT INTO sub_districts(sub_district_code, sub_district_name, district_code) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
            [code, s.name, s.district_code]
          );
        } catch (err) {
          console.log(`❌ SubDistrict ${code}: ${err.message}`);
        }
      }

      // =============================
      // STEP 5: Insert Villages
      // =============================
      console.log("🚀 Inserting Villages...");
      let count = 0;

      for (let row of rows) {
        const villageCode = parseInt(row.village_code);
        const subDistrictCode = parseInt(row.sub_district_code);

        if (isNaN(villageCode) || isNaN(subDistrictCode)) continue;

        try {
          await db.query(
            'INSERT INTO villages(village_code, village_name, sub_district_code) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
            [villageCode, row.village_name, subDistrictCode]
          );

          count++;

          if (count % 10000 === 0) {
            console.log(`📊 Inserted ${count} villages...`);
          }

        } catch (err) {
          console.log(`❌ Village ${villageCode}: ${err.message}`);
        }
      }

      console.log(`🎉 Done! Inserted ${count} villages`);
      console.log("✅ ALL DATA INSERTED SUCCESSFULLY");

      process.exit();
    })
    .on('error', (err) => {
      console.log("❌ Error reading CSV:", err.message);
    });
}

insertData();
import pandas as pd
import glob

# Get all files from dataset folder
files = glob.glob("dataset/*")

all_data = []

for file in files:
    # Process only Excel-type files
    if file.endswith(('.xls', '.xlsx', '.ods')):
        print(f"\n📂 Reading: {file}")
        
        try:
            df = pd.read_excel(file)

            # Normalize column names (remove spaces + uppercase)
            df.columns = [col.strip().upper() for col in df.columns]

            print(f"📊 Columns found: {df.columns.tolist()}")

            # Rename columns to standard format
            df = df.rename(columns={
                "MDDS STC": "state_code",
                "STATE NAME": "state_name",
                "MDDS DTC": "district_code",
                "DISTRICT NAME": "district_name",
                "MDDS SUB_DT": "sub_district_code",
                "SUB-DISTRICT NAME": "sub_district_name",
                "MDDS PLCN": "village_code",
                "AREA NAME": "village_name"
            })

            # Required columns
            required = [
                "state_name",
                "district_name",
                "sub_district_name",
                "village_name"
            ]

            # Check missing columns
            missing = [col for col in required if col not in df.columns]

            if missing:
                print(f"⚠️ Skipping {file} → missing columns: {missing}")
                continue

            # Clean text fields
            for col in required:
                df[col] = df[col].astype(str).str.strip().str.lower()

            # Remove invalid rows (village_code = 0)
            if "village_code" in df.columns:
                df = df[df["village_code"] != 0]

            # Keep only needed columns (clean dataset)
            df = df[[
                "state_code",
                "state_name",
                "district_code",
                "district_name",
                "sub_district_code",
                "sub_district_name",
                "village_code",
                "village_name"
            ]]

            all_data.append(df)

            print(f"✅ Finished: {file} | Rows added: {len(df)}")

        except Exception as e:
            print(f"❌ Error in {file}: {e}")

# Final merge
print("\n🔄 Merging all files...")

if not all_data:
    print("❌ No valid data found. Check dataset.")
    exit()

final_df = pd.concat(all_data, ignore_index=True)

# Remove duplicates
before = len(final_df)
final_df.drop_duplicates(inplace=True)
after = len(final_df)

print(f"🧹 Removed duplicates: {before - after}")

# Save final CSV
final_df.to_csv("final_data.csv", index=False)

print(f"\n🎉 Done! Created final_data.csv with {len(final_df)} rows")
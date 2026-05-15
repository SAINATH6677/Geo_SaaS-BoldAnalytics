import pandas as pd

print("📥 Loading CSV...")
df = pd.read_csv("final_data.csv")

print("📊 Total rows before cleaning:", len(df))

# -------------------------
# 🧹 NORMALIZE COLUMN NAMES
# -------------------------
df.columns = [col.strip().lower() for col in df.columns]

# Rename columns properly
df = df.rename(columns={
    "mdds stc": "state_code",
    "state name": "state_name",
    "mdds dtc": "district_code",
    "district name": "district_name",
    "mdds sub_dt": "sub_district_code",
    "sub-district name": "sub_district_name",
    "mdds plcn": "village_code",
    "area name": "village_name"
})

# -------------------------
# ⚠️ DEBUG (optional)
# -------------------------
missing_rows = df[df.isna().any(axis=1)]
print("⚠️ Rows with missing values:", len(missing_rows))

# -------------------------
# 🧹 CLEAN DATA
# -------------------------
df = df.dropna(subset=[
    "state_code",
    "district_code",
    "sub_district_code",
    "village_code",
    "state_name",
    "district_name",
    "sub_district_name",
    "village_name"
])

print("🧹 Rows after cleaning:", len(df))

# -------------------------
# 🔢 FIX FLOAT → INT SAFELY
# -------------------------
df["state_code"] = pd.to_numeric(df["state_code"], errors="coerce").astype("Int64")
df["district_code"] = pd.to_numeric(df["district_code"], errors="coerce").astype("Int64")
df["sub_district_code"] = pd.to_numeric(df["sub_district_code"], errors="coerce").astype("Int64")
df["village_code"] = pd.to_numeric(df["village_code"], errors="coerce").astype("Int64")

# Drop any rows that failed conversion
df = df.dropna(subset=[
    "state_code",
    "district_code",
    "sub_district_code",
    "village_code"
])

# Convert to normal int (safe now)
df["state_code"] = df["state_code"].astype(int)
df["district_code"] = df["district_code"].astype(int)
df["sub_district_code"] = df["sub_district_code"].astype(int)
df["village_code"] = df["village_code"].astype(int)

print("🔢 Data types fixed")

# -------------------------
# 🟢 STATES
# -------------------------
states = df[["state_code", "state_name"]].drop_duplicates()
states.to_csv("states.csv", index=False)
print("✅ states.csv:", len(states))

# -------------------------
# 🟡 DISTRICTS
# -------------------------
districts = df[["district_code", "district_name", "state_code"]].drop_duplicates()
districts.to_csv("districts.csv", index=False)
print("✅ districts.csv:", len(districts))

# -------------------------
# 🔵 SUB-DISTRICTS
# -------------------------
sub_districts = df[["sub_district_code", "sub_district_name", "district_code"]].drop_duplicates()
sub_districts.to_csv("sub_districts.csv", index=False)
print("✅ sub_districts.csv:", len(sub_districts))

# -------------------------
# 🔴 VILLAGES
# -------------------------
villages = df[["village_code", "village_name", "sub_district_code"]].drop_duplicates()
villages.to_csv("villages.csv", index=False)
print("✅ villages.csv:", len(villages))

print("\n🎉 ALL FILES CREATED SUCCESSFULLY 🎉")
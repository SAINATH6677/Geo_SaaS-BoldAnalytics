import { useEffect, useState } from "react";

const API = "https://geo-saas-api.onrender.com/v1";

export default function GeoSearch() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");

  // Load states
  useEffect(() => {
    fetch(`${API}/states`)
      .then((res) => res.json())
      .then((data) => {
        setStates(data.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Load districts
  const handleStateChange = async (e) => {
    const stateCode = e.target.value;

    setSelectedState(stateCode);
    setSelectedDistrict("");
    setSelectedSubdistrict("");

    setDistricts([]);
    setSubdistricts([]);
    setVillages([]);

    try {
      const res = await fetch(`${API}/districts/${stateCode}`);
      const data = await res.json();

      setDistricts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load subdistricts
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;

    setSelectedDistrict(districtCode);
    setSelectedSubdistrict("");

    setSubdistricts([]);
    setVillages([]);

    try {
      const res = await fetch(`${API}/subdistricts/${districtCode}`);
      const data = await res.json();

      setSubdistricts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load villages
  const handleSubdistrictChange = async (e) => {
    const subdistrictCode = e.target.value;

    setSelectedSubdistrict(subdistrictCode);

    setVillages([]);

    try {
      const res = await fetch(`${API}/villages/${subdistrictCode}`);
      const data = await res.json();

      setVillages(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#0f172a",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "40px",
        }}
      >
        Geo SaaS Search Portal
      </h1>

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#0f174a",
          padding: "30px",
          borderRadius: "15px",
        }}
      >
        {/* States */}
        <div style={{ marginBottom: "20px" }}>
          <label>State</label>

          <select
            value={selectedState}
            onChange={handleStateChange}
            style={selectStyle}
          >
            <option value="">Select State</option>

            {states.map((state) => (
              <option
                key={state.state_code}
                value={state.state_code}
                style={{ color: "black" }}
              >
                {state.state_name}
              </option>
            ))}
          </select>
        </div>

        {/* Districts */}
        <div style={{ marginBottom: "20px" }}>
          <label>District</label>

          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            style={selectStyle}
          >
            <option value="">Select District</option>

            {districts.map((district) => (
              <option
                key={district.district_code}
                value={district.district_code}
                style={{ color: "black" }}
              >
                {district.district_name}
              </option>
            ))}
          </select>
        </div>

        {/* Subdistricts */}
        <div style={{ marginBottom: "20px" }}>
          <label>Subdistrict</label>

          <select
            value={selectedSubdistrict}
            onChange={handleSubdistrictChange}
            style={selectStyle}
          >
            <option value="">Select Subdistrict</option>

            {subdistricts.map((sub) => (
              <option
                key={sub.sub_district_code}
                value={sub.sub_district_code}
                style={{ color: "black" }}
              >
                {sub.sub_district_name}
              </option>
            ))}
          </select>
        </div>

        {/* Villages */}
        <div>
          <label>Villages</label>

          <div
            style={{
              marginTop: "15px",
              maxHeight: "300px",
              overflowY: "auto",
              background: "#000000",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            {villages.length === 0 ? (
              <p>No villages loaded</p>
            ) : (
              villages.map((village) => (
                <div
                  key={village.village_code}
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #475569",
                  }}
                >
                  {village.village_name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px",
  border: "none",
  fontSize: "16px",
  backgroundColor: "white",
  color: "black",
  outline: "none",
};
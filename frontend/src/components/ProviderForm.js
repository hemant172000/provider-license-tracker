// // src/components/ProviderForm.js
// import React, { useState } from "react";

// function ProviderForm({ onProviderAdded }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     licenseNumber: "",
//     licenseExpiry: "",
//     email: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       const token = localStorage.getItem("token"); // get JWT from login
//       const response = await fetch("http://localhost:8080/providers", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const data = await response.json();
//       onProviderAdded(data); // update parent state
//       setFormData({ name: "", licenseNumber: "", licenseExpiry: "", email: "" });
//     } catch (error) {
//       alert("Error adding provider: " + error.message);
//     }
//   };

//   return (
//     <div>
//       <h2>Add Provider</h2>
//       <input
//         id="name"
//         value={formData.name}
//         onChange={handleChange}
//         placeholder="Name"
//       />
//       <input
//         id="licenseNumber"
//         value={formData.licenseNumber}
//         onChange={handleChange}
//         placeholder="License Number"
//       />
//       <input
//         id="licenseExpiry"
//         type="date"
//         value={formData.licenseExpiry}
//         onChange={handleChange}
//       />
//       <input
//         id="email"
//         type="email"
//         value={formData.email}
//         onChange={handleChange}
//         placeholder="Email"
//       />
//       <button onClick={handleSubmit}>Add Provider</button>
//     </div>
//   );
// }

// export default ProviderForm;

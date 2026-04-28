console.log("JS jalan");

fetch("http://localhost:1317")
  .then(res => res.json())
  .then(data => {
    console.log("Data dari Canopy:", data);
  })
  .catch(err => {
    console.error("Error:", err);
  });
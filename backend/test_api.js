async function test() {
  try {
    // 1. Login
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "darpanparmar1707@gmail.com",
        password: "password"
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error("Login failed:", loginData);
      return;
    }
    const token = loginData.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("Logged in successfully! Token obtained.");

    // 2. Fetch vehicle
    const vehicleRes = await fetch("http://localhost:3000/api/vehicles/V051", { headers });
    const vehicleData = await vehicleRes.json();
    console.log("GET /api/vehicles/V051 status:", vehicleRes.status);
    console.log("Vehicle data:", JSON.stringify(vehicleData, null, 2));

    // 3. Try to hit the parallel endpoints
    const endpoints = [
      { name: "Trips", url: "http://localhost:3000/api/trips" },
      { name: "Fuel", url: "http://localhost:3000/api/fuel" },
      { name: "Maintenance", url: "http://localhost:3000/api/maintenance" },
      { name: "Expenses", url: "http://localhost:3000/api/expenses" }
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, { headers });
        const data = await res.json();
        console.log(`GET ${ep.url} status:`, res.status, `(Count: ${data.length || 0})`);
        if (!res.ok) {
          console.error("  Error detail:", data);
        }
      } catch (err) {
        console.error(`FAILED GET ${ep.url}:`, err.message);
      }
    }
  } catch (err) {
    console.error("TEST FAILED:", err.message);
  }
}

test();

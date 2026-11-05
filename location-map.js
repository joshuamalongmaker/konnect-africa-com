(() => {
  const mapElement = document.getElementById("south-sudan-map-canvas");
  const statusElement = document.getElementById("south-sudan-map-status");

  if (!mapElement || !statusElement) return;

  const setStatus = (message, state) => {
    statusElement.textContent = message;
    statusElement.dataset.state = state;
  };

  if (!window.L) {
    setStatus("The interactive map library could not be loaded. Please check your connection and reload the page.", "error");
    return;
  }

  const map = L.map(mapElement, { scrollWheelZoom: false }).setView([7.5, 30.5], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  const rivers = L.featureGroup().addTo(map);
  const lakes = L.featureGroup().addTo(map);
  L.control.layers(null, { "Nile and named reaches": rivers, "Mapped lakes": lakes }).addTo(map);

  const query = `
    [out:json][timeout:25];
    area["ISO3166-1"="SS"]["admin_level"="2"]->.southSudan;
    (
      way(area.southSudan)["waterway"="river"]["name"~"Nile|White Nile|Bahr el Jebel|Bahr al Jabal",i];
      relation(area.southSudan)["waterway"="river"]["name"~"Nile|White Nile|Bahr el Jebel|Bahr al Jabal",i];
    )->.nile;
    (
      nwr(area.southSudan)["natural"="water"]["water"~"lake|oxbow",i];
      nwr(area.southSudan)["water"="lake"];
    )->.lakes;
    .nile out geom;
    .lakes out center;
  `;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const featureName = (element, fallback) => escapeHtml(element.tags?.name || fallback);
  const addRiver = (element) => {
    const name = element.tags?.name || "Nile waterway";
    const points = element.geometry?.map(({ lat, lon }) => [lat, lon]);
    if (!points || points.length < 2) return false;
    L.polyline(points, { color: "#247fa0", weight: 4, opacity: 0.85 })
      .bindPopup(`<strong>${featureName(element, "Nile waterway")}</strong><br>Mapped river reach`)
      .addTo(rivers);
    return true;
  };

  const addLake = (element) => {
    const point = element.center || element;
    if (typeof point.lat !== "number" || typeof point.lon !== "number") return false;
    const name = featureName(element, "Unnamed mapped lake");
    L.circleMarker([point.lat, point.lon], {
      radius: 6,
      color: "#174f73",
      weight: 1,
      fillColor: "#63b3ce",
      fillOpacity: 0.9
    })
      .bindPopup(`<strong>${name}</strong><br>Mapped lake`)
      .bindTooltip(name)
      .addTo(lakes);
    return true;
  };

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: `data=${encodeURIComponent(query)}`
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Water feature service returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data.elements)) throw new Error("Water feature service returned invalid map data");
      const seen = new Set();
      let riverCount = 0;
      let lakeCount = 0;

      data.elements.forEach((element) => {
        const key = `${element.type}/${element.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        if (element.tags?.waterway === "river") {
          if (addRiver(element)) riverCount += 1;
        } else if (element.tags?.natural === "water" || element.tags?.water === "lake") {
          if (addLake(element)) lakeCount += 1;
        }
      });

      if (riverCount + lakeCount === 0) {
        setStatus("No Nile reaches or lakes are currently mapped for this area in OpenStreetMap.", "error");
        return;
      }

      setStatus(`Loaded ${riverCount} mapped river reach${riverCount === 1 ? "" : "es"} and ${lakeCount} mapped lake${lakeCount === 1 ? "" : "s"} from OpenStreetMap.`, "loaded");
    })
    .catch((error) => {
      console.error("Could not load South Sudan water features:", error);
      setStatus("Live water-feature data could not be loaded. The base map is available; please try again later.", "error");
    });
})();

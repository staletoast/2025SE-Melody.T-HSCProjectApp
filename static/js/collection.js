// Fetch and display creatures for the beastiary page
fetch("/api/collection")
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("unlockedCount").textContent = data.unlocked_count;
    document.getElementById("totalCount").textContent = data.total_count;
    const grid = document.getElementById("creatureGrid");
    grid.innerHTML = "";
    data.creatures.forEach((creature) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4 mb-5 px-3";
      col.innerHTML = `
        <div class="card ${creature.unlocked ? "" : "bg-light"}" style="max-height: 220px; max-width: 200px; margin: 0 auto;">
          <img src="${creature.image}" class="card-img-top" alt="${
        creature.name
      }" style="height:60px;object-fit:contain;padding:8px;">
          <div class="card-body text-center p-2">
            <h6 class="card-title mb-1" style="font-size: 0.9rem;">${creature.name}</h6>
            <p class="card-text small mb-2" style="font-size: 0.75rem; line-height: 1.2;">${creature.description}</p>
            <span class="badge ${
              creature.unlocked ? "bg-success" : "bg-secondary"
            }" style="font-size: 0.7rem;">${creature.unlocked ? "Unlocked" : "Locked"}</span>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });
  });

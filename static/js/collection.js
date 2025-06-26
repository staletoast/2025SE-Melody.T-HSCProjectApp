// Fetch and display creatures for the collection page
fetch('/api/collection')
  .then(res => res.json())
  .then(data => {
    document.getElementById('unlockedCount').textContent = data.unlocked_count;
    document.getElementById('totalCount').textContent = data.total_count;
    const grid = document.getElementById('creatureGrid');
    grid.innerHTML = '';
    data.creatures.forEach(creature => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3 mb-4';
      col.innerHTML = `
        <div class="card ${creature.unlocked ? '' : 'bg-light'}">
          <img src="${creature.image}" class="card-img-top" alt="${creature.name}" style="height:100px;object-fit:contain;">
          <div class="card-body text-center">
            <h5 class="card-title">${creature.name}</h5>
            <p class="card-text">${creature.description}</p>
            <span class="badge ${creature.unlocked ? 'bg-success' : 'bg-secondary'}">${creature.unlocked ? 'Unlocked' : 'Locked'}</span>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });
  });

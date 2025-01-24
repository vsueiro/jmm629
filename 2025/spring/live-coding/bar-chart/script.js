let data = [1, 2, 3];

for (let item of data) {
  chart.innerHTML += `<div style="height: ${item * 100}px"></div>`;
}

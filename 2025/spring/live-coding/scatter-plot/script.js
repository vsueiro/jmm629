let dots = [
  {
    hungriness: 12,
    sleepiness: 85,
  },
  {
    hungriness: 50,
    sleepiness: 20,
  },
  {
    hungriness: 100,
    sleepiness: 100,
  },
];

for (let dot of dots) {
  document.body.innerHTML += `<div style="
    top: ${dot.hungriness}vh;
    left: ${dot.sleepiness}vw;
  "></div>`;
}

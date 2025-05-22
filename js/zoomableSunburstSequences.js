// Sunburst Diagram Ayarları
const width = 640;
const radius = width / 2;

// Renk Skalası
const color = d3.scaleOrdinal(d3.schemeCategory10);

// SVG Alanını Oluştur
const svg = d3.select("#sunburst-container")
  .append("svg")
  .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
  .style("max-width", `${width}px`)
  .style("font", "12px sans-serif");

const label = svg.append("text")
  .attr("text-anchor", "middle")
  .attr("fill", "#888")
  .style("visibility", "hidden");

label.append("tspan")
  .attr("class", "percentage")
  .attr("x", 0)
  .attr("y", 0)
  .attr("dy", "-0.1em")
  .attr("font-size", "3em")
  .text("");

label.append("tspan")
  .attr("x", 0)
  .attr("y", 0)
  .attr("dy", "1.5em")
  .text("of total");

// Arc Tanımları
const arc = d3.arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1) - 1);

const mousearc = d3.arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(radius);

// Partition Fonksiyonu
function partition(data) {
  return d3.partition()
    .size([2 * Math.PI, radius * radius])
    (d3.hierarchy(data)
      .sum(d => d.value || 0)  // JSON'daki value değerlerini okur
      .sort((a, b) => b.value - a.value));
}

// Sunburst Diagramı Çizme
function drawSunburst(data) {
  const root = partition(data);

  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))  // Derinlik 1'den büyük olanları al
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc);

  svg.append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .join("path")
    .attr("d", mousearc)
    .on("mouseenter", (event, d) => {
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label.style("visibility", null).select(".percentage").text(percentage + "%");
    })
    .on("mouseleave", () => {
      label.style("visibility", "hidden");
    });
}

// JSON Yükleme ve Sunburst Çizme
d3.json("json5.json").then(data => {
  console.log("JSON Yüklendi:", data);  // JSON'un yüklendiğini kontrol etmek için
  drawSunburst(data);
}).catch(error => {
  console.error("JSON yüklenirken hata oluştu:", error);
});

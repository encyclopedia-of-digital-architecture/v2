const fill = "#ccc";
const fillOpacity = 1.0;

function loadZoomableSunburstChart() {
    var zoomableSunburstContainer = document.getElementById('zoomableSunburstContainer');
    console.log(zoomableSunburstContainer.innerHTML);  // Burada SVG'nin doğru şekilde eklendiğinden emin olun
    zoomableSunburstContainer.innerHTML = ''; // Önceki içeriği temizle
    console.log("Loading Zoomable Sunburst Chart...");

    // JSON dosyasını yükle
    fetch("json/keyword_tree_structure3.json")
        .then(response => response.json()) // JSON verisini al
        .then(data => {
            createChart(data); // Veriyi kullanarak diyagramı oluştur
        })
        .catch(error => {
            console.error("Error loading JSON data:", error); // Hata mesajı
        });
}

// Function to create the zoomable sunburst chart
function createChart(keyword_tree_structure3) {
    const width = window.innerWidth * 1;
    const height = width;
    const radius = width / 6;
    const color = d3.scaleOrdinal()
        .domain(keyword_tree_structure3.children.map((_, i) => i))
        .range(["#005599", "#abd0f1", "#638DB6"]);


    const hierarchy = d3.hierarchy(keyword_tree_structure3)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Create root partition
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);
    root.each(d => d.current = d);

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.create("svg")
        .attr("id", "chart-svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("font", "24px Segoe UI")
        .style("width", "100%")
        .style("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet");

    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current))
        .on("click", clicked)
        .each(function (d) {
            if (d.depth === 1 && d.data.name.startsWith("URBAN-SOCIAL-PLANNING")) {
                d3.select(this).classed("highlighted-section", true);
            }
        });

    // For zooming in/out when clicking on paths
    d3.selectAll('path')
        .on('click', function (event, d) {
            // Handle zoom behavior here
            clicked(event, d);
        });


    path.filter(d => d.children)
        .style("cursor", "pointer");

    const format = d3.format(",d"); // Bu satır muhtemelen yukarıda bir yerde

    const tooltip = d3.select("#customTooltip");

    path
        .on("mouseover", function (event, d) {
            const hierarchy = d.ancestors().reverse().map(d => d.data.name);
            tooltip
                .style("display", "block")
                .html(`${hierarchy.join(" › <br>")}`);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });



    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .style("font-size", "27px")
        .style("font-family", "Segoe UI")
        .text(d => d.data.name.length > 20 ? d.data.name.slice(0, 15) + "..." : d.data.name);

    // ... (createChart fonksiyonunun başı)

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none") // Dolgu yok
        .attr("stroke", "none") // Başlangıçta dış çizgi yok
        .attr("stroke-width", 5) // Dış çizgi kalınlığını belirleyelim (görünür olması için)
        .attr("pointer-events", "all")
        .style("cursor", "pointer") // Fare imlecini işaretçi yapalım
        .on("click", clicked)
        .on("mouseover", function (event, d) { // Fare üzerine gelince
            // Sadece geri dönülebilecek bir seviyedeysek vurgula (root değilse)
            if (parent.datum() && parent.datum().depth > 0) {
                d3.select(this)
                    .transition() // Yumuşak geçiş için
                    .duration(150)  // Geçiş süresi (ms)
                    .attr("stroke", "#005599"); // Dış çizgi rengini #005599 yap
            }
        })
        .on("mouseout", function (event, d) { // Fare üzerinden çekilince
            d3.select(this)
                .transition() // Yumuşak geçiş için
                .duration(150)  // Geçiş süresi (ms)
                .attr("stroke", "none"); // Dış çizgiyi kaldır (şeffaf yap)
        });


    let parentNameLabel = svg.append("text")
        .attr("dy", "0.5em")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .attr("fill-opacity", 1)
        .style("font-size", "48px")
        .style("font-family", "Segoe UI")
        .style("font-weight", "bold")
        .text(root.data.name);

    let currentDepth = 1;

    function clicked(event, p) {
        parent.datum(p.depth === 0 ? null : p.parent || root);
        parentNameLabel.text(p.depth === 0 ? root.data.name : p.data.name);

        root.each(d => d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
        });

        const t = svg.transition().duration(750);

        path.transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
            })
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
            .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));

        handleContentDisplay(p.data.name);

        currentDepth = p.depth; // Update the current depth
    }

    document.addEventListener("DOMContentLoaded", function () {
        // initial chart loading
        fetch("json/keyword_tree_structure3.json")
            .then(response => response.json())
            .then(data => {
                createChart(data);  // Initial chart rendering
            })
            .catch(error => console.error("Error loading JSON data:", error));
    });

    function handleContentDisplay(name) {
        // Display content based on the clicked item
        const content = document.getElementById('content-display');  // Ensure this container exists in HTML
        content.innerHTML = `<h2>${name}</h2><p>Content for ${name} goes here.</p>`;
    }


    // Call `goBackOneStep` when you need to go up one level in the hierarchy
    function goBackOneStep() {
        if (currentDepth > 1) {
            currentDepth--;
            clicked(null, parent.datum().parent);
        }
    }

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    document.getElementById('zoomableSunburstContainer').appendChild(svg.node());
}

// Fetch data and create the chart
document.addEventListener('DOMContentLoaded', function () {
    fetch("json/keyword_tree_structure3.json")
        .then(response => response.json())
        .then(keyword_tree_structure3 => {
            createChart(keyword_tree_structure3);
        })
        .catch(error => console.error("Error loading JSON data:", error));
});
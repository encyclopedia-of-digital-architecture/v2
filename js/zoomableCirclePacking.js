document.addEventListener("DOMContentLoaded", function () {
  let svg; // SVG elementini global olarak tanımlıyoruz (fonksiyon kapsamında)

  // Tooltip elementini DOM yüklendiğinde bir kez seçiyoruz
  const tooltip = d3.select("#customTooltip");

  function toggleZoomableCirclePacking() {
    const container = document.getElementById("zoomableCirclePackingContainer");
    // Konteynerin genişliğini al, yoksa varsayılan 800 kullan
    const width = container.clientWidth || 800;
    // Yüksekliği genişliğe eşitle (veya farklı bir oran kullanabilirsiniz)
    // transform'daki ofseti hesaba katmak için yüksekliği biraz azaltabiliriz
    // Ancak viewBox bunu zaten hallediyor, yüksekliği genişliğe eşitlemek genellikle yeterli
    const height = width;

    // Renk skalası
    const color = d3.scaleLinear()
      .domain([0, 5]) // Derinlik seviyesine göre renk
      .range(["#005599", "#abd0f1", "#638DB6"]) // Renk aralığı
      .interpolate(d3.interpolateHcl); // Daha iyi renk geçişi için

    // D3 Pack Layout Fonksiyonu
    const pack = data => d3.pack()
      .size([width, height]) // Boyutları ayarla
      .padding(3) // Daireler arası boşluk
      (d3.hierarchy(data) // Hiyerarşik veri yapısı oluştur
        .sum(d => d.value) // Daire boyutunu 'value' alanına göre belirle
        .sort((a, b) => b.value - a.value)); // Büyükten küçüğe sırala

    // JSON verisini çek
    fetch("./json/keyword_tree_structure3.json") // JSON dosyasının yolu
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Veri üzerinde pack layout'unu çalıştır
        const root = pack(data);

        // Eğer mevcut bir SVG varsa, onu kaldır (yeniden çizim için)
        if (svg) {
          svg.remove();
        }

        // Yeni SVG elementini oluştur
        svg = d3.create("svg")
          // viewBox ile koordinat sistemini ayarla (merkez (0,0))
          .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
          .attr("width", width)  // Gerçek genişlik
          .attr("height", height) // Gerçek yükseklik
          // Stil ayarları (konteyner içinde kalması ve imleç)
          .attr("style", `max-width:85%; height: auto; display: block; margin: auto; background: #f8f9fa; cursor: pointer;`);
        // Önceki transform kaldırıldı, viewBox merkezlemeyi sağlıyor. Arkaplan eklendi.  #f8f9fa

        // Daireleri (node) çiz
        const node = svg.append("g") // Tüm daireleri bir grup içine al
          .selectAll("circle")
          .data(root.descendants().slice(1)) // Kök hariç tüm düğümler
          .join("circle")
          // Dolgu rengi: Çocukları varsa derinliğe göre, yoksa (yaprak) beyaz
          .attr("fill", d => d.children ? color(d.depth) : "white")
          // Kenarlık: Çocukları varsa yok, yapraksa hafif gri
          .attr("stroke", d => d.children ? null : "#bbb")
          // Pointer events: Çocukları yoksa (yaprak) olayları tetiklemesin
          // .attr("pointer-events", d => !d.children ? "none" : null) // Tooltip'i yapraklarda da göstermek için bu satırı yorumlayın veya kaldırın
          .attr("pointer-events", "all") // Tüm daireler olayları tetiklesin

          // --- Tooltip ve Vurgu için Mouse Olayları ---
          .on("mouseover", function (event, d) {
            // 1. Vurgu: Kenarlığı belirginleştir
            d3.select(this).attr("stroke", "#222").attr("stroke-width", 2);

            // 2. Tooltip Gösterme:
            // Hiyerarşiyi al (kökten yaprağa)
            const hierarchy = d.ancestors()
              .reverse() // Sırayı ters çevir (kök başta)
              .map(node => node.data.name); // İsimleri al

            tooltip
              .style("opacity", 1) // Görünür yap
              .style("display", "block") // Display'i de ayarla
              // İçeriği ayarla (isimleri aralarına ' › ' koyarak birleştir)
              .html(hierarchy.join(" › <br>"));

            // Tooltip'i konumlandır (mousemove'den önce ilk konum)
            // Sayfa kenarlarına taşmayı engellemek için basit kontrol
            const tooltipWidth = tooltip.node().offsetWidth;
            const x = event.pageX + 15;
            const y = event.pageY - 10;
            const PADDING = 10; // Kenarlara olan minimum mesafe

            tooltip.style("left", (x + tooltipWidth + PADDING > window.innerWidth ? event.pageX - tooltipWidth - 15 : x) + "px")
              .style("top", y + "px");

          })
          .on("mousemove", function (event, d) {
            // Fare hareket ettikçe tooltip'i takip ettir
            const tooltipWidth = tooltip.node().offsetWidth;
            const x = event.pageX + 15; // Farenin biraz sağı
            const y = event.pageY - 10; // Farenin biraz üstü
            const PADDING = 10;

            // Yatayda sayfa dışına taşmayı engelle
            const finalX = (x + tooltipWidth + PADDING > window.innerWidth)
              ? event.pageX - tooltipWidth - 15 // Taşarsa sola al
              : x; // Taşmıyorsa sağda kalsın

            tooltip.style("left", finalX + "px")
              .style("top", y + "px");
          })
          .on("mouseout", function (event, d) {
            // 1. Vurgu Kaldırma: Kenarlığı orijinal haline getir
            d3.select(this)
              .attr("stroke", d.children ? null : "#bbb") // Orijinal stroke
              .attr("stroke-width", 1); // Orijinal kalınlık

            // 2. Tooltip Gizleme:
            tooltip
              .style("opacity", 0) // Gizle
              .style("display", "none"); // Display'i de ayarla
          })
          // --- Bitiş: Tooltip ve Vurgu Olayları ---

          // Tıklama olayı (Zoom için)
          .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

        // Etiketleri (label) çiz
        const label = svg.append("g")
          .style("font", "14px Segoe UI") // Font stili
          .attr("pointer-events", "none") // Etiketler fare olaylarını engellemesin
          .attr("text-anchor", "middle") // Metni ortala
          .selectAll("text")
          .data(root.descendants()) // Kök dahil tüm düğümler
          .join("text")
          // Görünürlük: Sadece mevcut odak noktasının çocukları görünsün
          .style("fill-opacity", d => d.parent === root ? 1 : 0)
          .style("display", d => d.parent === root ? "inline" : "none")
          .style("fill", "#fff") // Etiket rengi (arka planla kontrast)
          .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)") // Okunabilirlik
          .text(d => d.data.name); // Düğüm ismini yaz

        // SVG'nin kendisine tıklanınca kök seviyesine zoom yap
        svg.on("click", (event) => zoom(event, root));

        // Zoom ile ilgili değişkenler
        let focus = root; // Mevcut odaklanılan düğüm
        let view; // Mevcut görünüm (x, y, yarıçap*2)

        // Başlangıç zoom seviyesini ayarla (kök)
        zoomTo([focus.x, focus.y, focus.r * 2]);

        // Belirtilen görünüme zoom yapan fonksiyon
        function zoomTo(v) {
          const k = width / v[2]; // Zoom katsayısı
          view = v; // Mevcut görünümü güncelle

          // Etiketleri yeni görünüme göre dönüştür/ölçeklendir
          label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);

          // Daireleri yeni görünüme göre dönüştür/ölçeklendir
          node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
          node.attr("r", d => d.r * k); // Yarıçapı ölçeklendir
        }

        // Belirli bir düğüme (d) zoom yapan fonksiyon
        function zoom(event, d) {
          const focus0 = focus; // Önceki odak noktasını sakla
          focus = d; // Yeni odak noktasını ayarla

          // Zoom animasyonunu başlat
          const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750) // Alt tuşu ile yavaş zoom
            .tween("zoom", d => {
              // Mevcut görünümden hedef görünüme interpolasyon yap
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
              // Animasyonun her adımı için zoomTo fonksiyonunu çağır
              return t => zoomTo(i(t));
            });

          // Etiketlerin görünürlüğünü animasyonla ayarla
          label
            // Sadece yeni odak noktasının çocukları veya zaten görünür olanlar
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
            // Yeni odak noktasının çocukları ise tamamen görünür yap, değilse gizle
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            // Animasyon başında: Yeni odak noktasının çocukları ise görünür yap
            .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
            // Animasyon sonunda: Yeni odak noktasının çocuğu değilse gizle
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        // Oluşturulan SVG'yi HTML içindeki konteynere ekle
        container.appendChild(svg.node());

      })
      .catch(error => {
        console.error("Error loading or processing JSON data:", error);
        // Hata durumunda kullanıcıya bilgi verilebilir
        container.innerHTML = `<p style='color:red; text-align:center;'>Grafik verisi yüklenirken bir hata oluştu: ${error.message}</p>`;
      });
  }

  // Buton elementini seç
  const circlePackingButton = document.querySelector(".overflow-inner1b");
  // Buton bulunduysa tıklama olayını ekle
  if (circlePackingButton) {
    circlePackingButton.addEventListener("click", toggleZoomableCirclePacking);
    // Sayfa ilk yüklendiğinde grafiği otomatik çizmek için:
    // toggleZoomableCirclePacking();
  } else {
    // Buton bulunamazsa konsola uyarı yaz
    console.warn("Button with class '.overflow-inner1b' not found.");
  }
});

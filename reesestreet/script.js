// === 1. Map Initialization ===
const map = L.map('map').setView([39.5, -98.35], 4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// === 2. Layer Definitions ===
const layerDefs = {
  boundary: {
    path: 'data/rsboundary.geojson',
    style: {
      color: '#b50505ff',
      weight: 3,
      fillOpacity: 0.5
    }
  },
  boundary2: {
    path: 'data/rsboundary.geojson',
    style: {
      color: '#3f19a7ff',
      weight: 3,
      fillOpacity: 0.5
    }
  },
  historic_sites: {
    path: 'data/Local_Historic_Sites.geojson',
    style: {
      color: '#32a852',
      weight: 3,
      fillOpacity: 1
    }
  },
  street_path: {
    path: 'data/Street_Centerline.geojson',
    style: {
      color: 'red',
      weight: 5
    },
    line: true,
    drawSpeed: 3
  },
  church: {
    path: 'data/church.geojson',
    style: {
      color: '#0000ff',
      weight: 3,
      fillOpacity: 1
    },
    svgPath: 'data/church-svgrepo-com.svg',
    svgSize: 50
  },
  athenshighind: {
    path: 'data/athenshighind.geojson',
    style: {
      color: '#ff00ff',
      weight: 5,
      fillOpacity: 1
    },
    svgPath: 'data/School_icon.svg',
    svgSize: 50
  },
  reesestreetschool: {
    path: 'data/reesestreetschool.geojson',
    style: {
      color: '#00ffff',
      weight: 5,
      fillOpacity: 1
    },
    svgPath: 'data/School_icon.svg',
    svgSize: 50,
    popupFn: (feature, def) => {
      const name = feature.properties?.name || 'Reese Street School';
      const yearBuilt = feature.properties?.year_built || 'Unknown Year';
      return `<strong>${name}</strong><br/>Built: ${yearBuilt}`;
    }
  },
  knoxinst: {
    path: 'data/knoxinst.geojson',
    style: {
      color: '#ffa500',
      weight: 5,
      fillOpacity: 1
    },
    svgPath: 'data/School_icon.svg',
    svgSize: 50
  },
  northfinley: {
    path: 'data/northfinley.geojson',
    style: {
      color: '#ffa601ff',
      weight: 30,
      opacity: 0.01
    }
  },
  onezeroone: {
    path: 'data/101nfs.geojson',
    style: {
      stroke: '#a31f1fff',
      width: 5,
      weight: 30,
      opacity: 0.01
    },
    svgPath: 'data/home.svg',
    svgSize: 70,
    svgText: '101',
    svgColor: '#a31f1fff'
  },
  houses: {
    path: 'data/houses.geojson',
    style: {
      color: '#ffa601ff',
      weight: 5,
      fillOpacity: 1
    },
    svgPath: 'data/home.svg',
    svgSize: 50
  },
  boundary_draw: {
    path: 'data/boundaryline.geojson',
    style: {
      color: '#ff6600',
      weight: 5
    },
    line: true
  }
};

// Layer store
const layerStore = {};
let currentLayers = [];

// Line draw coords store
const lineCoordsStore = {};   // { layerName: [ [ [lat,lng], ... ], [ [lat,lng], ... ] ] }
const linePolylineStore = {}; // { layerName: L.polyline }

// SVG store
const svgCache = {}; // { layerKey: svgString|null }

// --- safe SVG template loader (uses def.svgPath) ---
async function loadSvgTemplatesSafe() {
  const keys = Object.keys(layerDefs);
  for (const key of keys) {
    const def = layerDefs[key];
    if (!def || !def.svgPath) { svgCache[key] = null; continue; }
    try {
      const res = await fetch(def.svgPath);
      if (!res.ok) {
        console.warn(`SVG not found for layer ${key}: ${def.svgPath} (${res.status})`);
        svgCache[key] = null;
        continue;
      }
      const svgText = await res.text();
      svgCache[key] = svgText;
      console.log(`✅ Loaded SVG template for ${key}`);
    } catch (err) {
      console.error(`❌ Error loading SVG template for ${key}:`, err);
      svgCache[key] = null;
    }
  }
}

// build svg/html for a feature (token replace {color}/{size} if present)
function buildSvgHtml(layerKey, feature) {
  const def = layerDefs[layerKey];
  const size = (def.svgSize && !isNaN(def.svgSize)) ? def.svgSize : 32; // pixels
  const color = (feature && feature.properties && feature.properties.svgColor) || def.style?.color || '#333';
  let svgText = svgCache[layerKey];
  if (!svgText) return null;

  // remove any hardcoded width/height attributes so SVG becomes responsive
  svgText = svgText.replace(/\s(width|height)=["'].*?["']/gi, '');

  // ensure the <svg> tag sets 100% size and preserves aspect ratio
  svgText = svgText.replace(/<svg([^>]*)>/i, `<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`);

  // token replacement if your SVG includes {color} or {size}
  svgText = svgText.replace(/\{color\}/g, color).replace(/\{size\}/g, size);

  // wrapper controls actual rendered pixel size
  return `<div style="width:${size}px;height:${size}px;display:inline-block">${svgText}</div>`;
}

// Load all GeoJSON layers (awaits SVG preload)
async function loadGeoJsonLayers() {
  // preload SVGs first (non-fatal)
  await loadSvgTemplatesSafe();

  for (const [key, def] of Object.entries(layerDefs)) {
    try {
      const res = await fetch(def.path);
      if (!res.ok) throw new Error(`Failed to load ${def.path} (${res.status})`);
      const data = await res.json();

      // Store line coordinates for animation
      if (def.line) {
        const segments = [];
        data.features.forEach(feature => {
          if (!feature.geometry) return;
          if (feature.geometry.type === "LineString") {
            const rawCoords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            segments.push(densifyLine(rawCoords, 2));
          } else if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach(line => {
              const rawCoords = line.map(([lng, lat]) => [lat, lng]);
              segments.push(densifyLine(rawCoords, 2));
            });
          }
        });
        lineCoordsStore[key] = segments;
        linePolylineStore[key] = L.polyline([], {
          color: def.style.color || '#d62728',
          weight: def.style.weight || 5,
          opacity: def.style.opacity || 1
        });
      }

      // pointToLayer logic (support per-layer SVGs)
      let options = { style: def.style || {} };

      if (def.svgPath) {
        const size = def.svgSize || 32;
        options.pointToLayer = function(feature, latlng) {
          // build icon (inline SVG preferred)
          const html = buildSvgHtml(key, feature);
          if (html) {
            const icon = L.divIcon({
              html,
              className: 'geojson-svg-icon',
              iconSize: [size, size],
              iconAnchor: [Math.round(size/2), Math.round(size/2)]
            });
            return L.marker(latlng, { icon });
          } else {
            // fallback to external svg file as icon
            const icon = L.icon({
              iconUrl: def.svgPath,
              iconSize: [size, size],
              iconAnchor: [Math.round(size/2), Math.round(size/2)],
              className: 'external-svg-icon'
            });
            return L.marker(latlng, { icon });
          }
        };
      } else if (key === 'historic_sites') {
        options.pointToLayer = function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 10,
            fillColor: def.style.color || "#3f0303ff",
            color: "#810202ff",
            weight: 2,
            opacity: 1,
            fillOpacity: def.style.fillOpacity || 0.8
          });
        };
      }

      // --- new: bind popups for all feature types reliably ---
      options.onEachFeature = function(feature, layer) {
        let popupContent = null;
        if (typeof def.popupFn === 'function') {
          popupContent = def.popupFn(feature, def);
        } else if (def.popupTemplate) {
          popupContent = def.popupTemplate.replace(/\{([\w\-]+)\}/g, (_, k) => (feature.properties && feature.properties[k]) ?? '');
        } else if (feature && feature.properties) {
          popupContent = feature.properties.popup || feature.properties.name || null;
        }

        if (popupContent) {
          layer.bindPopup(popupContent, { maxWidth: 300 });
        }
      };

      layerStore[key] = L.geoJSON(data, options);
      console.log(`✅ Loaded layer: ${key}`);
    } catch (err) {
      console.error(`❌ Error loading layer "${key}":`, err);
    }
  }
}

// Toggle layer on/off
function fadeLayer(layer, fromOpacity, toOpacity, duration = 400, fillFrom = null, fillTo = null) {
  if (!layer.setStyle) return;
  const steps = 20;
  const stepTime = duration / steps;
  let current = 0;
  function animate() {
    current++;
    const t = current / steps;
    const opacity = fromOpacity + (toOpacity - fromOpacity) * t;
    const fillOpacity = fillFrom !== null && fillTo !== null
      ? fillFrom + (fillTo - fillFrom) * t
      : undefined;
    layer.setStyle({
      opacity: opacity,
      fillOpacity: fillOpacity !== undefined ? fillOpacity : toOpacity
    });
    if (current < steps) {
      setTimeout(animate, stepTime);
    }
  }
  animate();
}

// fade-in for any L.GeoJSON (handles markers & vectors)
function fadeInLayer(layer, duration = 400) {
  // vector style layers
  if (layer.setStyle) {
    try {
      // set features to transparent then animate to target
      layer.setStyle({ opacity: 0, fillOpacity: 0 });
      const targetOpacity = layer.options && layer.options.opacity !== undefined ? layer.options.opacity : 1;
      const targetFill = layer.options && layer.options.fillOpacity !== undefined ? layer.options.fillOpacity : 0.5;
      setTimeout(() => fadeLayer(layer, 0, targetOpacity, duration, 0, targetFill), 20);
      return;
    } catch (e) { /* fallthrough */ }
  }

  // marker layers inside the GeoJSON group
  if (layer.eachLayer) {
    layer.eachLayer(l => {
      if (l && l._icon) {
        l._icon.style.transition = `opacity ${duration}ms`;
        // ensure starts at 0
        l._icon.style.opacity = 0;
        // trigger fade
        setTimeout(() => { l._icon.style.opacity = 1; }, 20);
      }
      if (l && l._path) {
        l._path.style.transition = `opacity ${duration}ms`;
        l._path.style.opacity = 0;
        setTimeout(() => { l._path.style.opacity = 1; }, 20);
      }
    });
  }
}

// fade-out then remove
function fadeOutAndRemove(layer, duration = 400) {
  if (!layer) return;
  if (layer.setStyle) {
    // vector
    fadeLayer(layer, layer.options.opacity ?? 1, 0, duration, layer.options.fillOpacity ?? 1, 0);
    setTimeout(() => { try { if (map.hasLayer(layer)) map.removeLayer(layer); } catch(e) {} }, duration + 10);
    return;
  }
  if (layer.eachLayer) {
    layer.eachLayer(l => {
      if (l && l._icon) {
        l._icon.style.transition = `opacity ${duration}ms`;
        l._icon.style.opacity = 0;
      }
      if (l && l._path) {
        l._path.style.transition = `opacity ${duration}ms`;
        l._path.style.opacity = 0;
      }
    });
    setTimeout(() => { try { if (map.hasLayer(layer)) map.removeLayer(layer); } catch(e) {} }, duration + 10);
  } else {
    try { if (map.hasLayer(layer)) map.removeLayer(layer); } catch(e) {}
  }
}

// keep track of which layers are currently "visible"
let visibleLayerNames = new Set();
let showLayerTimer = null;

// helper: set opacity/visibility for one layer (vector or marker GeoJSON group)
function setLayerVisibilityByName(name, visible, duration = 400) {
  const layer = layerStore[name];
  if (!layer) return;

  // Helper to apply transition to a DOM node
  function ensureTransition(el) {
    if (!el) return;
    el.style.transition = `opacity ${duration}ms`;
    if (el.style.opacity === '' || typeof el.style.opacity === 'undefined') {
      el.style.opacity = 0;
    }
  }

  // Vector layers (polylines/polygons)
  if (layer.setStyle) {
    if (visible) {
      if (!map.hasLayer(layer)) map.addLayer(layer);
      // start transparent then fade to target
      layer.setStyle({ opacity: 0, fillOpacity: 0 });
      setTimeout(() => fadeLayer(layer, 0, layer.options.opacity ?? 1, duration, 0, layer.options.fillOpacity ?? 0.5), 20);
    } else {
      // fade out then remove
      fadeLayer(layer, layer.options.opacity ?? 1, 0, duration, layer.options.fillOpacity ?? 1, 0);
      setTimeout(() => { try { if (map.hasLayer(layer)) map.removeLayer(layer); } catch(e) {} }, duration + 30);
    }
    if (visible) visibleLayerNames.add(name); else visibleLayerNames.delete(name);
    return;
  }

  // Marker/icon GeoJSON groups
  if (layer.eachLayer) {
    if (visible) {
      if (!map.hasLayer(layer)) map.addLayer(layer);
      // set initial opacity 0 for icons/paths then fade to 1
      layer.eachLayer(l => {
        if (l._icon) {
          ensureTransition(l._icon);
          l._icon.style.opacity = 0;
          const inner = l._icon.querySelector('svg, img');
          if (inner) { inner.style.transition = `opacity ${duration}ms`; inner.style.opacity = 0; }
        }
        if (l._path) {
          ensureTransition(l._path);
          l._path.style.opacity = 0;
        }
      });
      setTimeout(() => {
        layer.eachLayer(l => {
          if (l._icon) {
            l._icon.style.opacity = 1;
            const inner = l._icon.querySelector('svg, img');
            if (inner) inner.style.opacity = 1;
          }
          if (l._path) l._path.style.opacity = 1;
        });
      }, 25);
      visibleLayerNames.add(name);
    } else {
      // fade icons/paths to 0 then remove layer from map
      layer.eachLayer(l => {
        if (l._icon) {
          ensureTransition(l._icon);
          l._icon.style.opacity = 0;
          const inner = l._icon.querySelector('svg, img');
          if (inner) inner.style.opacity = 0;
        }
        if (l._path) {
          ensureTransition(l._path);
          l._path.style.opacity = 0;
        }
      });
      setTimeout(() => { try { if (map.hasLayer(layer)) map.removeLayer(layer); } catch(e) {} }, duration + 30);
      visibleLayerNames.delete(name);
    }
    return;
  }

  // fallback: simple add/remove
  if (visible) { if (!map.hasLayer(layer)) map.addLayer(layer); visibleLayerNames.add(name); }
  else { if (map.hasLayer(layer)) map.removeLayer(layer); visibleLayerNames.delete(name); }
}

// show multiple layers without removing/re-adding (debounced)
function showLayer(layerAttr) {
  // debounce small rapid changes (adjust delay if needed)
  if (showLayerTimer) clearTimeout(showLayerTimer);
  showLayerTimer = setTimeout(() => {
    const requested = new Set();
    if (!layerAttr) {
      // hide everything if null
      Array.from(visibleLayerNames).forEach(name => setLayerVisibilityByName(name, false, 250));
      visibleLayerNames.clear();
      return;
    }

    const names = Array.isArray(layerAttr)
      ? layerAttr.map(s => s.trim()).filter(Boolean)
      : layerAttr.split(',').map(s => s.trim()).filter(Boolean);

    names.forEach(n => requested.add(n));

    // Fade in requested layers
    requested.forEach(name => {
      // if already visible, skip extra work
      if (visibleLayerNames.has(name)) return;
      setLayerVisibilityByName(name, true, 350);
    });

    // Fade out layers that are visible but not requested
    Array.from(visibleLayerNames).forEach(name => {
      if (!requested.has(name)) setLayerVisibilityByName(name, false, 250);
    });

    // ensure visibleLayerNames matches requested (small tolerance for async fades)
    visibleLayerNames = new Set([...visibleLayerNames].filter(n => requested.has(n)).concat([...requested]));
  }, 30);
}

// Draw line animation
// remove the old routeLine/routeCoords single-line loader and replace with a safe loader (handles MultiLineString)
// If you don't need this separate loader you can keep it removed; below is a safe version:

async function loadRouteLine() {
  try {
    const res = await fetch('data/boundaryline.geojson');
    if (!res.ok) throw new Error('Failed to load boundaryline.geojson');
    const data = await res.json();

    // collect all LineString/MultiLineString coords as segments (lat,lng)
    const segments = [];
    data.features.forEach(feature => {
      if (!feature.geometry) return;
      if (feature.geometry.type === 'LineString') {
        const raw = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        segments.push(densifyLine(raw, 2));
      } else if (feature.geometry.type === 'MultiLineString') {
        feature.geometry.coordinates.forEach(line => {
          const raw = line.map(([lng, lat]) => [lat, lng]);
          segments.push(densifyLine(raw, 2));
        });
      }
    });

    // if you want a single legacy routeLine, create one polyline (but we recommend using the linePolylineStore approach)
    if (segments.length) {
      // optional: add a debug polyline (empty) — not required if you use linePolylineStore
      // routeLine = L.polyline([], { color:'#d62728', weight:10, opacity:1 }).addTo(map);
      console.log('✅ boundaryline loaded, segments:', segments.length);
    } else {
      console.warn('⚠️ boundaryline loaded but no LineString/MultiLineString found');
    }
  } catch (err) {
    console.error('❌ Failed to load boundaryline.geojson', err);
  }
}

// Updated updateRouteDraw: treat drawSpeed as a divisor (drawSpeed > 1 = slower)
function updateRouteDraw(progress, lineLayerName) {
  const segments = lineCoordsStore[lineLayerName];
  const polyline = linePolylineStore[lineLayerName];
  if (!segments || !polyline) return;

  // drawSpeed acts as a divisor: 1 = normal, 2 = twice as slow, 0.5 = twice as fast
  const drawSpeed = layerDefs[lineLayerName]?.drawSpeed ?? 1;
  let effectiveProgress = progress / drawSpeed;
  if (effectiveProgress > 1) effectiveProgress = 1;
  if (effectiveProgress < 0) effectiveProgress = 0;

  // Calculate total points across all segments
  const totalPoints = segments.reduce((sum, seg) => sum + seg.length, 0);
  const drawPoints = Math.floor(effectiveProgress * totalPoints);

  // Build the array of segments to draw up to drawPoints
  let pointsLeft = drawPoints;
  const drawnSegments = [];
  for (const seg of segments) {
    if (pointsLeft <= 0) break;
    if (pointsLeft >= seg.length) {
      drawnSegments.push(seg.slice());
      pointsLeft -= seg.length;
    } else {
      drawnSegments.push(seg.slice(0, pointsLeft));
      break; // Stop after the partial segment
    }
  }

  polyline.setLatLngs(drawnSegments);
}

function resetRouteDraw(lineLayerName) {
  const polyline = linePolylineStore[lineLayerName];
  if (polyline) polyline.setLatLngs([]);
}

// Title screen and background
document.querySelectorAll('.title-screen').forEach(el => {
  const bg = el.getAttribute('data-bg');
  if (bg) el.style.backgroundImage = `url(${bg})`;
});
const steps = document.querySelectorAll('.step');
steps.forEach(step => {
  const side = step.getAttribute('data-side') || 'left';
  const width = step.getAttribute('data-width') || '40%';
  const sidecar = step.querySelector('.sidecar');
  if (sidecar) {
    sidecar.style.width = width;
    sidecar.classList.add(`sidecar-${side}`);
  }
});

// Run everything after the layers are loaded
loadGeoJsonLayers().then(() => {
  loadRouteLine();

  const scroller = scrollama();
  scroller
    .setup({
      step: '.step',
      offset: 0.6,
      progress: true
    })
    .onStepEnter(response => {
      const stepEl = steps[response.index];
      const lat = parseFloat(stepEl.getAttribute('data-lat'));
      const lng = parseFloat(stepEl.getAttribute('data-lng'));
      const zoom = parseInt(stepEl.getAttribute('data-zoom'), 10);
      const layerAttr = stepEl.getAttribute('data-layer'); // e.g. "boundary,church"
      const isLineStep = stepEl.hasAttribute('data-line-step');
      const lineLayerName = stepEl.getAttribute('data-line-layer');

      
      // Remove all animated polylines
      Object.values(linePolylineStore).forEach(polyline => map.removeLayer(polyline));

      if (isLineStep && linePolylineStore[lineLayerName]) {
        linePolylineStore[lineLayerName].addTo(map);
      }

      if (!isLineStep && lineLayerName) {
        resetRouteDraw(lineLayerName);
      }

      steps.forEach((s, i) => s.classList.toggle('is-active', i === response.index));

      if (!isNaN(lat) && !isNaN(lng) && zoom) {
        map.flyTo([lat, lng], zoom, { duration: 2 });
      }

      showLayer(layerAttr);

      if (!isLineStep) resetRouteDraw();

      // --- Sidecar image ---
      const imageUrl = stepEl.getAttribute('data-image');
      const imageWidth = stepEl.getAttribute('data-image-width') || 'auto';
      const imageHeight = stepEl.getAttribute('data-image-height') || 'auto';
      const sidecar = stepEl.querySelector('.sidecar');

      // Only touch sidecar if it exists
      if (sidecar) {
        // Remove any previous sidecar image
        const oldImg = sidecar.querySelector('.sidecar-img');
        if (oldImg) oldImg.remove();

        // Add new sidecar image if present
        if (imageUrl) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.className = 'sidecar-img';
          img.style.width = imageWidth === 'auto' ? '' : imageWidth + 'px';
          img.style.height = imageHeight === 'auto' ? '' : imageHeight + 'px';
          img.style.display = 'block';
          img.style.margin = '1em auto';
          sidecar.insertBefore(img, sidecar.firstChild);
        }
      }

      // --- Floating image on map ---
      const floatImageUrl = stepEl.getAttribute('data-float-image');
      const floatImageLat = parseFloat(stepEl.getAttribute('data-float-image-lat'));
      const floatImageLng = parseFloat(stepEl.getAttribute('data-float-image-lng'));
      const floatImageWidth = parseInt(stepEl.getAttribute('data-float-image-width'), 10) || 120;
      const floatImageHeight = parseInt(stepEl.getAttribute('data-float-image-height'), 10) || 120;

      if (window.imageMarker && map.hasLayer(window.imageMarker)) {
        map.removeLayer(window.imageMarker);
        window.imageMarker = null;
      }
      if (floatImageUrl && !isNaN(floatImageLat) && !isNaN(floatImageLng)) {
        const imgIcon = L.divIcon({
          html: `<img src="${floatImageUrl}" style="width:${floatImageWidth}px; height:${floatImageHeight}px; border:3px solid #fff; border-radius:8px; box-shadow:2px 2px 10px rgba(0,0,0,0.3);" />`,
          className: 'floating-image-icon',
          iconSize: [floatImageWidth, floatImageHeight],
          iconAnchor: [floatImageWidth / 2, floatImageHeight / 2]
        });
        window.imageMarker = L.marker([floatImageLat, floatImageLng], { icon: imgIcon, interactive: false }).addTo(map);
      }
    })
    .onStepProgress(response => {
      const stepEl = steps[response.index];
      const isLineStep = stepEl.hasAttribute('data-line-step');
      const lineLayerName = stepEl.getAttribute('data-line-layer');
      if (isLineStep && lineLayerName) {
        updateRouteDraw(response.progress, lineLayerName);
      }
    });

  window.addEventListener('resize', scroller.resize);
});

// Floating image marker
let imageMarker = null;

function showImageMarker(lat, lng, imageUrl, width = 120, height = 120) {
  if (imageMarker && map.hasLayer(imageMarker)) {
    map.removeLayer(imageMarker);
  }
  const imgIcon = L.divIcon({
    html: `<img src="${imageUrl}" style="width:${width}px; height:${height}px; border:3px solid #fff; border-radius:8px; box-shadow:2px 2px 10px rgba(0,0,0,0.3);" />`,
    className: 'floating-image-icon',
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2]
  });
  imageMarker = L.marker([lat, lng], { icon: imgIcon, interactive: true }).addTo(map);
}

function hideImageMarker() {
  if (imageMarker && map.hasLayer(imageMarker)) {
    map.removeLayer(imageMarker);
  }
}

// Line densification (make)
function densifyLine(coords, segmentLengthMeters = 3) {
  const densified = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[i + 1];
    densified.push([lat1, lng1]);
    const dist = map.distance([lat1, lng1], [lat2, lng2]);
    const steps = Math.max(1, Math.floor(dist / segmentLengthMeters));
    for (let j = 1; j < steps; j++) {
      const lat = lat1 + ((lat2 - lat1) * j) / steps;
      const lng = lng1 + ((lng2 - lng1) * j) / steps;
      densified.push([lat, lng]);
    }
  }
  densified.push(coords[coords.length - 1]);
  return densified;
}



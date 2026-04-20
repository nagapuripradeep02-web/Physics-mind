// ============================================================
// Field 3D Renderer — Three.js global mode (standalone)
// Reads window.SIM_CONFIG (Field3DConfig)
// ============================================================

(function() {
    "use strict";

    var config = window.SIM_CONFIG;
    if (!config) { console.error("No SIM_CONFIG"); return; }

    var PM_currentState = "STATE_1";
    var scene, camera, renderer, animationId;
    var sceneObjects = [];
    var isDragging = false, prevMouse = { x: 0, y: 0 };
    var spherical = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8 };
    var targetSpherical = { theta: spherical.theta, phi: spherical.phi, radius: spherical.radius };
    var animating = false;
    var isMobile = window.innerWidth < 768;

    // ── Mobile fallback ───────────────────────────────────────────────────
    if (isMobile) {
        showMobileFallback();
        setupPostMessage();
        return;
    }

    // ── Three.js setup ────────────────────────────────────────────────────
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.pvl_colors ? config.pvl_colors.background : "#0A0A1A");

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    updateCameraFromSpherical();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // ── Manual orbit controls ─────────────────────────────────────────────
    renderer.domElement.addEventListener("mousedown", function(e) {
        isDragging = true;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
    });
    renderer.domElement.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        var dx = e.clientX - prevMouse.x;
        var dy = e.clientY - prevMouse.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
        updateCameraFromSpherical();
    });
    renderer.domElement.addEventListener("mouseup", function() { isDragging = false; });
    renderer.domElement.addEventListener("mouseleave", function() { isDragging = false; });
    renderer.domElement.addEventListener("wheel", function(e) {
        spherical.radius = Math.max(3, Math.min(20, spherical.radius + e.deltaY * 0.01));
        targetSpherical.radius = spherical.radius;
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });

    // Touch support
    var touchStart = null;
    renderer.domElement.addEventListener("touchstart", function(e) {
        if (e.touches.length === 1) {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    renderer.domElement.addEventListener("touchmove", function(e) {
        if (!touchStart || e.touches.length !== 1) return;
        var dx = e.touches[0].clientX - touchStart.x;
        var dy = e.touches[0].clientY - touchStart.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });
    renderer.domElement.addEventListener("touchend", function() { touchStart = null; });

    // ── Camera helpers ────────────────────────────────────────────────────
    function updateCameraFromSpherical() {
        var r = spherical.radius;
        camera.position.set(
            r * Math.sin(spherical.phi) * Math.cos(spherical.theta),
            r * Math.cos(spherical.phi),
            r * Math.sin(spherical.phi) * Math.sin(spherical.theta)
        );
        camera.lookAt(0, 0, 0);
    }

    function animateCameraTo(pos) {
        if (!pos) return;
        var r = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
        targetSpherical.radius = r || 8;
        targetSpherical.phi = r > 0 ? Math.acos(Math.max(-1, Math.min(1, pos[1] / r))) : Math.PI / 3;
        targetSpherical.theta = Math.atan2(pos[2], pos[0]);
        animating = true;
    }

    function lerpSpherical() {
        if (!animating) return;
        var t = 0.05;
        spherical.theta += (targetSpherical.theta - spherical.theta) * t;
        spherical.phi += (targetSpherical.phi - spherical.phi) * t;
        spherical.radius += (targetSpherical.radius - spherical.radius) * t;
        if (Math.abs(spherical.theta - targetSpherical.theta) < 0.001 &&
            Math.abs(spherical.phi - targetSpherical.phi) < 0.001 &&
            Math.abs(spherical.radius - targetSpherical.radius) < 0.01) {
            spherical.theta = targetSpherical.theta;
            spherical.phi = targetSpherical.phi;
            spherical.radius = targetSpherical.radius;
            animating = false;
        }
        updateCameraFromSpherical();
    }

    // ── Scene management ──────────────────────────────────────────────────
    function clearScene() {
        for (var i = sceneObjects.length - 1; i >= 0; i--) {
            var obj = sceneObjects[i];
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(function(m) { m.dispose(); });
                } else {
                    obj.material.dispose();
                }
            }
        }
        sceneObjects = [];
    }

    function addToScene(obj) {
        scene.add(obj);
        sceneObjects.push(obj);
    }

    // ── Geometry helpers ──────────────────────────────────────────────────
    function hexToThreeColor(hex) {
        return new THREE.Color(hex);
    }

    function createChargeSphere(pos, color, radius) {
        var geo = new THREE.SphereGeometry(radius || 0.3, 24, 24);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.4,
            shininess: 80
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        return mesh;
    }

    function createTubeLine(points, color, tubeRadius) {
        if (points.length < 2) return null;
        var vectors = points.map(function(p) { return new THREE.Vector3(p[0], p[1], p[2]); });
        var curve = new THREE.CatmullRomCurve3(vectors);
        var geo = new THREE.TubeGeometry(curve, Math.max(points.length * 4, 20), tubeRadius || 0.02, 8, false);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: config.field_lines ? (config.field_lines.opacity || 0.8) : 0.8
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    function createArrowHead(position, direction, color) {
        var geo = new THREE.ConeGeometry(0.06, 0.15, 8);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        var dir = new THREE.Vector3(direction[0], direction[1], direction[2]).normalize();
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createPlate(width, height, position, color) {
        var geo = new THREE.BoxGeometry(width, height, 0.05);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: 0.6
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        return mesh;
    }

    function createWire(start, end, color, radius) {
        var dir = new THREE.Vector3(end[0]-start[0], end[1]-start[1], end[2]-start[2]);
        var length = dir.length();
        dir.normalize();
        var geo = new THREE.CylinderGeometry(radius || 0.05, radius || 0.05, length, 12);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        var mid = [(start[0]+end[0])/2, (start[1]+end[1])/2, (start[2]+end[2])/2];
        mesh.position.set(mid[0], mid[1], mid[2]);
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createEquipotentialSurface(radius, color, opacity) {
        var geo = new THREE.SphereGeometry(radius, 32, 32);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: opacity || 0.12,
            wireframe: true
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    function createCoilGeometry(turns, radius, axis, length) {
        var group = new THREE.Group();
        var tubeRadius = 0.03;
        for (var t = 0; t < turns; t++) {
            var points = [];
            for (var a = 0; a <= 64; a++) {
                var angle = (a / 64) * Math.PI * 2;
                var x = radius * Math.cos(angle);
                var y = radius * Math.sin(angle);
                var z = (length || 3) * ((t + a / 64) / turns - 0.5);
                points.push(new THREE.Vector3(x, y, z));
            }
            var curve = new THREE.CatmullRomCurve3(points);
            var geo = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
            var mat = new THREE.MeshPhongMaterial({ color: 0xFFAB40 });
            group.add(new THREE.Mesh(geo, mat));
        }
        if (axis && (axis[0] !== 0 || axis[2] !== 0)) {
            var d = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
            var u = new THREE.Vector3(0, 0, 1);
            var q = new THREE.Quaternion();
            q.setFromUnitVectors(u, d);
            group.setRotationFromQuaternion(q);
        }
        return group;
    }

    // ── Scenario builders ─────────────────────────────────────────────────

    function buildPointChargeField(charge, lineCount) {
        var color = charge.sign > 0
            ? (config.field_lines.color_positive || "#EF5350")
            : (config.field_lines.color_negative || "#42A5F5");
        var chargeColor = charge.color || color;

        var sphere = createChargeSphere(charge.position, chargeColor, 0.3);
        sphere.userData = { elementType: "charge", id: charge.id };
        addToScene(sphere);

        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var y = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtY = Math.sqrt(1 - y * y);
            var theta = goldenAngle * i;
            var dx = radiusAtY * Math.cos(theta);
            var dy = y;
            var dz = radiusAtY * Math.sin(theta);

            var points = [];
            var arrowPoints = [];
            var numSegments = 20;
            var lineLength = 3.5;
            for (var s = 0; s <= numSegments; s++) {
                var t = s / numSegments;
                var r = 0.35 + t * lineLength;
                var d = charge.sign > 0 ? 1 : -1;
                points.push([
                    charge.position[0] + dx * r * d,
                    charge.position[1] + dy * r * d,
                    charge.position[2] + dz * r * d
                ]);
                if (s > 0 && s % (config.field_lines.arrow_spacing || 5) === 0) {
                    arrowPoints.push({
                        pos: points[s],
                        dir: [points[s][0] - points[s-1][0], points[s][1] - points[s-1][1], points[s][2] - points[s-1][2]]
                    });
                }
            }

            var tube = createTubeLine(points, color, 0.02);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_" + charge.id + "_" + i };
                addToScene(tube);
            }
            for (var a = 0; a < arrowPoints.length; a++) {
                var arrow = createArrowHead(arrowPoints[a].pos, arrowPoints[a].dir, color);
                arrow.userData = { elementType: "arrow", id: "arr_" + charge.id + "_" + i + "_" + a };
                addToScene(arrow);
            }
        }
    }

    function buildDipoleField(posCharge, negCharge, lineCount) {
        var posColor = posCharge.color || config.field_lines.color_positive || "#EF5350";
        var negColor = negCharge.color || config.field_lines.color_negative || "#42A5F5";

        var posSphere = createChargeSphere(posCharge.position, posColor, 0.3);
        posSphere.userData = { elementType: "charge", id: posCharge.id };
        addToScene(posSphere);

        var negSphere = createChargeSphere(negCharge.position, negColor, 0.3);
        negSphere.userData = { elementType: "charge", id: negCharge.id };
        addToScene(negSphere);

        var p1 = posCharge.position;
        var p2 = negCharge.position;
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;
            var bulge = 1.5 + Math.abs(frac) * 1.5;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;
            var offZ = radiusAtFrac * Math.sin(theta) * bulge;

            var points = [];
            var segments = 24;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cx = p1[0] * (1 - t) + p2[0] * t;
                var cy = p1[1] * (1 - t) + p2[1] * t;
                var cz = p1[2] * (1 - t) + p2[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([cx + offX * blend, cy + offY * blend, cz + offZ * blend]);
            }

            var flColor = config.field_lines.color_positive || "#EF5350";
            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_dipole_" + i };
                addToScene(tube);
            }
            var midIdx = Math.floor(segments / 2);
            if (midIdx > 0 && midIdx < points.length) {
                var arrowDir = [
                    points[midIdx][0] - points[midIdx - 1][0],
                    points[midIdx][1] - points[midIdx - 1][1],
                    points[midIdx][2] - points[midIdx - 1][2]
                ];
                var arrowMesh = createArrowHead(points[midIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_dipole_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildParallelPlatesField() {
        var sep = 3;
        var plateW = 3, plateH = 3;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flColor = config.field_lines ? config.field_lines.color_positive : "#FFF176";

        var posPlate = createPlate(plateW, plateH, [-sep/2, 0, 0], posColor || "#EF5350");
        posPlate.userData = { elementType: "plate_positive", id: "plate_pos" };
        addToScene(posPlate);

        var negPlate = createPlate(plateW, plateH, [sep/2, 0, 0], negColor || "#42A5F5");
        negPlate.userData = { elementType: "plate_negative", id: "plate_neg" };
        addToScene(negPlate);

        var gridN = 4;
        for (var iy = 0; iy < gridN; iy++) {
            for (var iz = 0; iz < gridN; iz++) {
                var y = ((iy + 0.5) / gridN - 0.5) * (plateH * 0.7);
                var z = ((iz + 0.5) / gridN - 0.5) * (plateW * 0.7);
                var points = [];
                for (var s = 0; s <= 12; s++) {
                    var t = s / 12;
                    points.push([-sep/2 + 0.1 + t * (sep - 0.2), y, z]);
                }
                var tube = createTubeLine(points, flColor, 0.02);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_plate_" + iy + "_" + iz };
                    addToScene(tube);
                }
                var mid = Math.floor(12 / 2);
                var arrowMesh = createArrowHead(points[mid], [1, 0, 0], flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_plate_" + iy + "_" + iz };
                addToScene(arrowMesh);
            }
        }
    }

    function buildSolenoidField() {
        var coilConf = config.coil || { turns: 8, radius: 0.8, axis: [0, 0, 1] };
        var solenoidLength = 4;
        var flColor = config.field_lines ? config.field_lines.color_positive : "#66BB6A";
        var lineCount = config.field_lines ? config.field_lines.count : 8;

        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, solenoidLength);
        coilGroup.userData = { elementType: "coil", id: "solenoid_coil" };
        addToScene(coilGroup);

        var internalLines = Math.max(4, Math.floor(lineCount * 0.6));
        for (var i = 0; i < internalLines; i++) {
            var angle = (i / internalLines) * Math.PI * 2;
            var r = coilConf.radius * 0.5;
            var x = r * Math.cos(angle);
            var y = r * Math.sin(angle);
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                points.push([x, y, -solenoidLength / 2 + t * solenoidLength]);
            }
            var tube = createTubeLine(points, flColor, 0.025);
            if (tube) {
                tube.userData = { elementType: "field_line_internal", id: "fl_int_" + i };
                addToScene(tube);
            }
            var arrowMesh = createArrowHead(points[8], [0, 0, 1], flColor);
            arrowMesh.userData = { elementType: "arrow", id: "arr_int_" + i };
            addToScene(arrowMesh);
        }

        var externalLines = Math.max(3, Math.floor(lineCount * 0.4));
        for (var i = 0; i < externalLines; i++) {
            var angle = (i / externalLines) * Math.PI * 2;
            var bulge = 1.5 + (i / externalLines) * 1.5;
            var points = [];
            for (var s = 0; s <= 24; s++) {
                var t = s / 24;
                var z = -solenoidLength / 2 + t * solenoidLength;
                var blend = Math.sin(t * Math.PI);
                var extR = coilConf.radius + bulge * blend;
                points.push([extR * Math.cos(angle), extR * Math.sin(angle), z]);
            }
            var tube = createTubeLine(points, flColor, 0.015);
            if (tube) {
                tube.userData = { elementType: "field_line_external", id: "fl_ext_" + i };
                addToScene(tube);
            }
        }
    }

    function buildBarMagnetField() {
        var magnetLength = 2;
        var flColor = config.field_lines ? config.field_lines.color_positive : "#66BB6A";
        var lineCount = config.field_lines ? config.field_lines.count : 10;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";

        var nGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var nMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(posColor || "#EF5350") });
        var nMesh = new THREE.Mesh(nGeo, nMat);
        nMesh.position.set(0, 0, magnetLength / 4);
        nMesh.userData = { elementType: "magnet_north", id: "magnet_n" };
        addToScene(nMesh);

        var sGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var sMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(negColor || "#42A5F5") });
        var sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.set(0, 0, -magnetLength / 4);
        sMesh.userData = { elementType: "magnet_south", id: "magnet_s" };
        addToScene(sMesh);

        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;
            var bulge = 1.2 + Math.abs(frac) * 1.8;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;

            var points = [];
            var segments = 28;
            var nPos = [0, 0, magnetLength / 2];
            var sPos = [0, 0, -magnetLength / 2];
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cz = nPos[2] * (1 - t) + sPos[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([offX * blend, offY * blend, cz]);
            }

            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_mag_" + i };
                addToScene(tube);
            }

            var aIdx = Math.floor(segments / 3);
            if (aIdx > 0) {
                var arrowDir = [
                    points[aIdx][0] - points[aIdx-1][0],
                    points[aIdx][1] - points[aIdx-1][1],
                    points[aIdx][2] - points[aIdx-1][2]
                ];
                var arrowMesh = createArrowHead(points[aIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_mag_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildStraightWireField() {
        var wireColor = (config.current && config.current.wire_color) ? config.current.wire_color : "#FFAB40";
        var flColor = config.field_lines ? config.field_lines.color_positive : "#66BB6A";
        var lineCount = config.field_lines ? config.field_lines.count : 6;

        var wire = createWire([0, -3, 0], [0, 3, 0], wireColor, 0.08);
        wire.userData = { elementType: "wire", id: "wire_main" };
        addToScene(wire);

        var currArrow = createArrowHead([0, 1.5, 0], [0, 1, 0], wireColor);
        currArrow.userData = { elementType: "current_arrow", id: "curr_arr" };
        addToScene(currArrow);

        var heights = [-1.5, 0, 1.5];
        for (var h = 0; h < heights.length; h++) {
            for (var ri = 0; ri < lineCount; ri++) {
                var radius = 0.6 + ri * 0.5;
                var points = [];
                var segments = 48;
                for (var s = 0; s <= segments; s++) {
                    var angle = (s / segments) * Math.PI * 2;
                    points.push([radius * Math.cos(angle), heights[h], radius * Math.sin(angle)]);
                }
                var tube = createTubeLine(points, flColor, 0.015);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_wire_" + h + "_" + ri };
                    addToScene(tube);
                }
                var qIdx = Math.floor(segments / 4);
                if (qIdx > 0) {
                    var arrowDir = [
                        points[qIdx][0] - points[qIdx-1][0],
                        points[qIdx][1] - points[qIdx-1][1],
                        points[qIdx][2] - points[qIdx-1][2]
                    ];
                    var arrowMesh = createArrowHead(points[qIdx], arrowDir, flColor);
                    arrowMesh.userData = { elementType: "arrow", id: "arr_wire_" + h + "_" + ri };
                    addToScene(arrowMesh);
                }
            }
        }
    }

    function buildChangingFluxField() {
        var coilConf = config.coil || { turns: 5, radius: 1.0, axis: [0, 0, 1] };
        var flColor = config.field_lines ? config.field_lines.color_positive : "#66BB6A";

        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, 1.5);
        coilGroup.position.set(0, 0, 0);
        coilGroup.userData = { elementType: "coil", id: "induction_coil" };
        addToScene(coilGroup);

        var magnetGeo = new THREE.BoxGeometry(0.4, 0.4, 1.5);
        var magnetMat = new THREE.MeshPhongMaterial({ color: 0xEF5350 });
        var magnetMesh = new THREE.Mesh(magnetGeo, magnetMat);
        magnetMesh.position.set(0, 0, 3);
        magnetMesh.userData = { elementType: "magnet", id: "moving_magnet" };
        addToScene(magnetMesh);

        var sHalfGeo = new THREE.BoxGeometry(0.41, 0.41, 0.75);
        var sHalfMat = new THREE.MeshPhongMaterial({ color: 0x42A5F5 });
        var sHalfMesh = new THREE.Mesh(sHalfGeo, sHalfMat);
        sHalfMesh.position.set(0, 0, 3 - 0.375);
        sHalfMesh.userData = { elementType: "magnet_south_half", id: "magnet_s_half" };
        addToScene(sHalfMesh);

        for (var i = 0; i < 6; i++) {
            var angle = (i / 6) * Math.PI * 2;
            var r = 0.3;
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                var z = 3.75 - t * 5;
                var blend = Math.sin(t * Math.PI);
                points.push([r * Math.cos(angle) * (1 + blend), r * Math.sin(angle) * (1 + blend), z]);
            }
            var tube = createTubeLine(points, flColor, 0.015);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_flux_" + i };
                addToScene(tube);
            }
        }

        var emfGeo = new THREE.SphereGeometry(0.15, 16, 16);
        var emfMat = new THREE.MeshPhongMaterial({
            color: 0xFFF176, emissive: 0xFFF176, emissiveIntensity: 0.6,
            transparent: true, opacity: 0.7
        });
        var emfMesh = new THREE.Mesh(emfGeo, emfMat);
        emfMesh.position.set(0, 0, 0);
        emfMesh.userData = { elementType: "emf_indicator", id: "emf_glow" };
        addToScene(emfMesh);
    }

    // ── Equipotential surfaces ────────────────────────────────────────────
    function buildEquipotentialSurfaces() {
        if (!config.equipotential || !config.equipotential.show) return;
        var nSurfaces = config.equipotential.surfaces || 3;
        var eqColor = config.equipotential.color || "#4FC3F7";
        var eqOpacity = config.equipotential.opacity || 0.12;
        for (var i = 0; i < nSurfaces; i++) {
            var radius = 1.0 + i * 1.2;
            var surf = createEquipotentialSurface(radius, eqColor, eqOpacity);
            surf.userData = { elementType: "equipotential", id: "eq_" + i };
            addToScene(surf);
        }
    }

    // ── Build scenario ────────────────────────────────────────────────────
    function buildScenario() {
        clearScene();
        var scenario = config.scenario_type;
        var charges = config.charges || [];

        switch (scenario) {
            case "point_charge_positive":
            case "point_charge_negative":
                var charge = charges[0] || {
                    id: "q1", sign: scenario === "point_charge_positive" ? 1 : -1,
                    magnitude: 1, position: [0, 0, 0],
                    label: scenario === "point_charge_positive" ? "+q" : "-q",
                    color: scenario === "point_charge_positive" ? "#EF5350" : "#42A5F5"
                };
                buildPointChargeField(charge, config.field_lines ? config.field_lines.count : 12);
                buildEquipotentialSurfaces();
                break;
            case "dipole":
                var posCharge = charges.find(function(c) { return c.sign > 0; }) || {
                    id: "q_pos", sign: 1, magnitude: 1, position: [-1.5, 0, 0], label: "+q", color: "#EF5350"
                };
                var negCharge = charges.find(function(c) { return c.sign < 0; }) || {
                    id: "q_neg", sign: -1, magnitude: 1, position: [1.5, 0, 0], label: "-q", color: "#42A5F5"
                };
                buildDipoleField(posCharge, negCharge, config.field_lines ? config.field_lines.count : 10);
                buildEquipotentialSurfaces();
                break;
            case "parallel_plates":
                buildParallelPlatesField();
                break;
            case "solenoid_field":
                buildSolenoidField();
                break;
            case "bar_magnet":
                buildBarMagnetField();
                break;
            case "straight_wire_current":
                buildStraightWireField();
                break;
            case "changing_flux":
                buildChangingFluxField();
                break;
            default:
                buildPointChargeField(
                    { id: "q1", sign: 1, magnitude: 1, position: [0,0,0], label: "+q", color: "#EF5350" },
                    config.field_lines ? config.field_lines.count : 12
                );
        }
        applyState(PM_currentState);
    }

    // ── State management ──────────────────────────────────────────────────
    function applyState(stateId) {
        PM_currentState = stateId;
        var stateDef = config.states[stateId];
        if (!stateDef) return;

        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";

        var vis = stateDef.visible_elements || [];
        var showAll = vis.length === 0 || vis.indexOf("all") >= 0;

        for (var i = 0; i < sceneObjects.length; i++) {
            var obj = sceneObjects[i];
            var ud = obj.userData;
            if (!ud || !ud.elementType) { obj.visible = true; continue; }
            if (showAll) { obj.visible = true; }
            else {
                var match = false;
                for (var v = 0; v < vis.length; v++) {
                    if (ud.elementType === vis[v] || ud.id === vis[v] ||
                        ud.elementType.indexOf(vis[v]) >= 0 || (ud.id && ud.id.indexOf(vis[v]) >= 0)) {
                        match = true; break;
                    }
                }
                obj.visible = match;
            }
        }

        if (stateDef.camera_position) animateCameraTo(stateDef.camera_position);
        updateLegend(stateDef);
    }

    function updateLegend(stateDef) {
        var legendEl = document.getElementById("legend");
        if (!legendEl) return;
        var scenario = config.scenario_type;
        var lines = [];
        lines.push("<b>" + (stateDef.label || PM_currentState) + "</b>");
        if (scenario.indexOf("charge") >= 0 || scenario === "dipole") {
            lines.push("\u26aa Red = +q \u2022 Blue = \u2212q");
            lines.push("\u26aa Lines = E field direction");
        } else if (scenario.indexOf("magnet") >= 0 || scenario === "solenoid_field") {
            lines.push("\u26aa Red = N \u2022 Blue = S");
            lines.push("\u26aa Lines = B field");
        } else if (scenario === "straight_wire_current") {
            lines.push("\u26aa Wire carries current I");
            lines.push("\u26aa Circles = B field");
        } else if (scenario === "parallel_plates") {
            lines.push("\u26aa Red = + \u2022 Blue = \u2212");
            lines.push("\u26aa Lines = uniform E");
        } else if (scenario === "changing_flux") {
            lines.push("\u26aa Coil + moving magnet");
            lines.push("\u26aa Glow = induced EMF");
        }
        lines.push("<i>Drag to rotate \u2022 Scroll to zoom</i>");
        legendEl.innerHTML = lines.join("<br>");
    }

    // ── Animation loop ────────────────────────────────────────────────────
    var time = 0;
    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.016;
        lerpSpherical();

        var stateDef = config.states[PM_currentState];
        if (config.scenario_type === "changing_flux" && stateDef && stateDef.animate) {
            for (var i = 0; i < sceneObjects.length; i++) {
                var obj = sceneObjects[i];
                if (obj.userData && obj.userData.elementType === "magnet") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2;
                }
                if (obj.userData && obj.userData.elementType === "magnet_south_half") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2 - 0.375;
                }
                if (obj.userData && obj.userData.elementType === "emf_indicator") {
                    var emfIntensity = Math.abs(Math.cos(time * 1.5));
                    obj.material.emissiveIntensity = 0.2 + emfIntensity * 0.8;
                    obj.material.opacity = 0.3 + emfIntensity * 0.7;
                }
            }
        }

        renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────────────────────
    window.addEventListener("resize", function() {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── postMessage bridge ────────────────────────────────────────────────
    function setupPostMessage() {
        window.addEventListener("message", function(e) {
            var data = e.data;
            if (!data || !data.type) return;
            switch (data.type) {
                case "INIT_CONFIG":
                    if (data.config) {
                        window.SIM_CONFIG = data.config;
                        config = data.config;
                        if (!isMobile) buildScenario();
                        else renderMobileSVG();
                    }
                    parent.postMessage({ type: "SIM_READY" }, "*");
                    break;
                case "SET_STATE":
                    var newState = data.state || data.payload;
                    if (newState && config.states[newState]) {
                        if (!isMobile) applyState(newState);
                        else { PM_currentState = newState; renderMobileSVG(); }
                        parent.postMessage({ type: "STATE_REACHED", state: newState }, "*");
                    }
                    break;
                case "PING":
                    parent.postMessage({ type: "PONG" }, "*");
                    break;
            }
        });
    }

    // ── Mobile SVG fallback ───────────────────────────────────────────────
    function showMobileFallback() {
        var container = document.getElementById("mobile-fallback");
        if (container) container.style.display = "block";
        renderMobileSVG();
    }

    function renderMobileSVG() {
        var container = document.getElementById("mobile-fallback");
        if (!container) return;
        var w = window.innerWidth, h = window.innerHeight;
        var cx = w / 2, cy = h / 2;
        var stateDef = config.states[PM_currentState] || {};
        var textCol = config.pvl_colors ? config.pvl_colors.text : "#D4D4D8";
        var posCol = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negCol = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flCol = config.field_lines ? config.field_lines.color_positive : "#FFF176";
        var bgCol = config.pvl_colors ? config.pvl_colors.background : "#0A0A1A";

        var svg = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">';
        svg += '<rect width="100%" height="100%" fill="' + bgCol + '"/>';
        svg += '<text x="' + cx + '" y="30" fill="' + textCol + '" font-size="14" text-anchor="middle" font-family="system-ui">' + (stateDef.caption || '') + '</text>';

        var scenario = config.scenario_type;
        if (scenario === "point_charge_positive" || scenario === "point_charge_negative") {
            var sign = scenario === "point_charge_positive" ? 1 : -1;
            var col = sign > 0 ? posCol : negCol;
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="' + col + '"/>';
            svg += '<text x="' + cx + '" y="' + (cy + 5) + '" fill="white" font-size="16" text-anchor="middle">' + (sign > 0 ? '+' : '\u2212') + '</text>';
            for (var i = 0; i < 8; i++) {
                var angle = (i / 8) * Math.PI * 2;
                var x1 = cx + 30 * Math.cos(angle), y1 = cy + 30 * Math.sin(angle);
                var x2 = cx + 100 * Math.cos(angle), y2 = cy + 100 * Math.sin(angle);
                svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + flCol + '" stroke-width="2" opacity="0.7"/>';
            }
        } else if (scenario === "dipole") {
            svg += '<circle cx="' + (cx - 80) + '" cy="' + cy + '" r="18" fill="' + posCol + '"/>';
            svg += '<circle cx="' + (cx + 80) + '" cy="' + cy + '" r="18" fill="' + negCol + '"/>';
            for (var i = 0; i < 6; i++) {
                var offset = (i - 2.5) * 25;
                svg += '<path d="M' + (cx - 60) + ',' + (cy + offset) + ' Q' + cx + ',' + (cy + offset - 40) + ' ' + (cx + 60) + ',' + (cy + offset) + '" fill="none" stroke="' + flCol + '" stroke-width="1.5" opacity="0.6"/>';
            }
        } else {
            svg += '<text x="' + cx + '" y="' + cy + '" fill="' + textCol + '" font-size="16" text-anchor="middle">3D view \u2014 rotate on desktop</text>';
        }
        svg += '<text x="' + cx + '" y="' + (h - 15) + '" fill="' + textCol + '" font-size="11" text-anchor="middle" opacity="0.6">Rotate on desktop for full 3D</text>';
        svg += '</svg>';
        container.innerHTML = svg;

        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";
    }

    // ── Initialize ────────────────────────────────────────────────────────
    setupPostMessage();
    buildScenario();
    animate();

    setTimeout(function() {
        parent.postMessage({ type: "SIM_READY" }, "*");
    }, 300);

})();

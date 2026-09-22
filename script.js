import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
const scene = new THREE.Scene();
 
// ELEMENTOS DE LA PANTALLA DE CARGA// 
const pantallaCarga = document.getElementById("pantallaCarga");
const porcentaje = document.getElementById("porcentaje");
const progreso = document.getElementById("progreso");
const textoCarga = document.getElementById("textoCarga");

//MOSTRAR CARGADOR SOLO LA PRIMERA VEZ//
const yaCargo = sessionStorage.getItem("cristoYaCargo");

if (yaCargo === "true") {
    pantallaCarga.style.display = "none";
}

//  FONDO REALISTA DEL CIELO//
const texturaCielo =  new THREE.TextureLoader().load("CIELO3.png");
scene.background = texturaCielo;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-85, 8, 100);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUCES//
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(luzAmbiental);
const luzDireccional = new THREE.DirectionalLight(  0xffffff, 1);
luzDireccional.position.set(5, 10, 5);
scene.add(luzDireccional);

//  MODELO DEL CRISTO//
let modeloCristo = null;

// CARGAR MODELO GLB//
console.log("THREE:", THREE);
console.log("GLTFLoader:", GLTFLoader);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(
    "MODELO_TERMINADO_.glb",

    function (gltf) {
    modeloCristo = gltf.scene;
    scene.add(modeloCristo);
        console.log("Modelo GLB cargado correctamente");
        modeloCristo.position.set(0, 0, 0);
        modeloCristo.scale.set(1, 1, 1);

    //  CARGA TERMINADA///
    porcentaje.textContent = "100%";
    progreso.style.width = "100%";
    textoCarga.textContent = "CARGA COMPLETA";
    sessionStorage.setItem("cristoYaCargo", "true");

    setTimeout(() => {
        pantallaCarga.style.opacity = "0";
        pantallaCarga.style.visibility = "hidden";
    }, 500);

    },
 function (xhr) {
    if (xhr.total > 0) {

        const porcentajeCarga =Math.round( (xhr.loaded / xhr.total) * 100);
        porcentaje.textContent =porcentajeCarga + "%";
        progreso.style.width = porcentajeCarga + "%";
        textoCarga.textContent =   "CARGANDO...";
    }
},
    function (error) {
        console.error("Error al cargar el modelo GLB:", error );
    }
);

// CONTROLES DE CÁMARA//
const controls = new PointerLockControls(camera, document.body);

//  POSICIÓN INICIAL DEL RECORRIDO//
const posicionInicio = new THREE.Vector3(-85, 8, 100);
let explorando = false;
let pausado = false;

// TECLAS//
const teclas = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false
}; 
// DETECTAR DISTANCIA AL CRISTO//
function comprobarDistanciaCristo() {

    if (!modeloCristo || !explorando) {
        return;
    }
    // CENTRO DEL CRISTO//
    const puntoCristo = new THREE.Vector3(0, 0, 0);

    //  DISTANCIA HORIZONTAL//
    const dx = camera.position.x - puntoCristo.x;
    const dz = camera.position.z - puntoCristo.z;
    const distancia =Math.sqrt(  dx * dx +  dz * dz);
    console.log(  " POSICIÓN JUGADOR:", camera.position.x.toFixed(1),camera.position.z.toFixed(1) );
    console.log( " DISTANCIA AL CRISTO:", distancia.toFixed(1));

    //  CERCA DEL CRISTO//
    if (distancia <= 25) {
        panelCristo.style.display = "block";
    }
    //  LEJOS DEL CRISTO//
    else {
        panelCristo.style.display = "none";
    }
}
// BOTONES EXPLORAR Y SALIR//
const btnExplorar = document.getElementById("btnExplorar");

const btnSalir = document.getElementById("btnSalir");

//  MENÚ LATERAL//
const menuLateral = document.getElementById("menuLateral");

const portada = document.getElementById("portada");

//  PANEL DE INFORMACIÓN DEL CRISTO//
const panelCristo =
    document.getElementById("panelCristo");

//INICIAR EXPLORACIÓN//

btnExplorar.addEventListener("click", function () {
    console.log(" MODO EXPLORACIÓN ACTIVADO");

    explorando = true;
    pausado = false;
    camera.lookAt(0, 10, 0);
    btnExplorar.style.display = "none";
    btnSalir.style.display = "block";
    menuLateral.classList.add("menuOculto");
    portada.classList.add("portadaOculta");

    controls.lock();
});
// MOUSE LIBERADO//

controls.addEventListener("unlock", function () {
    console.log("🖱️ MOUSE LIBERADO");

    if (pausado) {

        console.log(" RECORRIDO PAUSADO");
      
        btnExplorar.style.display = "none";
        btnSalir.style.display = "block";

        return;
    }
});

// BOTÓN SALIR//
btnSalir.addEventListener("click", function () {
    console.log("🚪 SALIENDO DE LA EXPLORACIÓN");

    explorando = false;
    pausado = false;
    // Detener movimiento
    teclas.w = false;
    teclas.a = false;
    teclas.s = false;
    teclas.d = false;
    teclas.q = false;
    teclas.e = false;
  
    panelCristo.style.display = "none";

    camera.position.copy(posicionInicio);
    controls.unlock();
    btnSalir.style.display = "none";
    btnExplorar.style.display = "block";
  
menuLateral.classList.remove("menuOculto");
});

//PRESIONAR TECLA//

document.addEventListener("keydown", function (event) {
    console.log("TECLA:", event.code);

    if (event.code === "Space" && controls.isLocked) {
        event.preventDefault();
        pausado = true;

        teclas.w = false;
        teclas.a = false;
        teclas.s = false;
        teclas.d = false;
        teclas.q = false;
        teclas.e = false;

        controls.unlock();

        console.log("⏸️ RECORRIDO PAUSADO");
        return;
    }
    if (!explorando || !controls.isLocked) {
        return;
    }
    if (event.code === "KeyW") {
        teclas.w = true;
    }
    if (event.code === "KeyA") {
        teclas.a = true;
    }
    if (event.code === "KeyS") {
        teclas.s = true;
    }
    if (event.code === "KeyD") {
        teclas.d = true;
    }
    if (event.code === "KeyQ") {
        teclas.q = true;
    }
    if (event.code === "KeyE") {
        teclas.e = true;
    }
});

//SOLTAR TECLA//
document.addEventListener("keyup", function (event) {
    if (event.code === "KeyW") {
        teclas.w = false;
    }
    if (event.code === "KeyA") {
        teclas.a = false;
    }
    if (event.code === "KeyS") {
        teclas.s = false;
    }
    if (event.code === "KeyD") {
        teclas.d = false;
    }
    if (event.code === "KeyQ") {
        teclas.q = false;
    }
    if (event.code === "KeyE") {
        teclas.e = false;
    }
});
// VELOCIDAD//
const velocidad = 0.6;

//ANIMACIÓN//
function animate() {
    requestAnimationFrame(animate);
    if (teclas.w) {
        controls.moveForward(velocidad);
    }
    if (teclas.s) {
        controls.moveForward(-velocidad);
    }
    if (teclas.a) {
        controls.moveRight(-velocidad);
    }
    if (teclas.d) {
        controls.moveRight(velocidad);
    }
    if (teclas.q) {
        camera.position.y += velocidad;
    } 
    if (teclas.e) {
        camera.position.y -= velocidad;
    }
    if (explorando) {
    comprobarDistanciaCristo();
}
    renderer.render(scene, camera);
}
animate();
// AJUSTAR AL CAMBIAR TAMAÑO //
window.addEventListener("resize", function () {
    camera.aspect =
        window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
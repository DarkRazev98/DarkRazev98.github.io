import * as THREE from 'three'; //importanción de los modulos principales
import { OrbitControls } from 'OrbitControls'; // importacion de controles
import { FBXLoader } from 'FBXLoader';// importacion de Loader para .glb y .gltf

const clock = new THREE.Clock();
let mixer, mixer2;

function main(){
  //Variables para generar la escena de treejs
  const canvas = document.querySelector('#c'); // objeto de html que mostrará la escena
  const renderer = new THREE.WebGLRenderer({canvas}); //instancia del render de treejs

  const loader = new FBXLoader();
  const cameraPrincipal = cameras(75, 2, 0.1, 10);//instancia de camara principal
  const scene = new THREE.Scene();// instancia de la escena
  scene.background = new THREE.Color(0x333333);
  scene.background = new THREE.TextureLoader().load("/fondo.jpg");

  {// luz en la escena
    const color = 0xFFFFFF;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 2, 4);
    light2.position.set(0, 2, -4);
    scene.add(light);
    scene.add(light2);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let INTERSECTED;
  const Objetos = geometries(); //Genera las geometrias en una lista

  // controles orbitales
  const controls = new OrbitControls( cameraPrincipal, renderer.domElement );
  controls.enableDamping = true; //Movimiento de camara suave
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 0.5;
	controls.maxDistance = 7.5;
	controls.maxPolarAngle = Math.PI ;

  canvas.addEventListener('mousemove',(e)=>{
    onPoniterData(e);
    onHoverMap();
  })

  canvas.addEventListener('click', (e)=>{
    onPoniterData(e);
    onClickMap();    
  })

  function cameras(fov=75, aspect=2, near=0.1, far=5, position = [0, 0, 3.5]){// función genera cámaras 
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far, position = [0, 0, 3.5]);
    camera.position.set(position[0], position[1], position[2]);
    return camera;
  }

  function geometries(){// Geometrías para dibujar en la escena
    const objets = [];
    
    // model
    loader.load('models/mecanismo.fbx', function ( object ) {
      mixer = new THREE.AnimationMixer( object );
      object.position.y = -1;
      object.scale.set( .1, .1, .1);
      const action = mixer.clipAction( object.animations[ 0 ] );
      action.play();
      
      scene.add( object );
      objets.push( object );

    } );
    
    loader.load( 'models/carcasa.fbx', function ( object ) {

      mixer2 = new THREE.AnimationMixer( object );

      object.position.y = -1;
      object.scale.set( .1, .1, .1);
      console.log(object.children[4]);

      const action = mixer2.clipAction( object.animations[ 0 ] );
      action.play();
      
      scene.add( object );
      objets.push( object );

    } );
    
    return objets;

  }

  function onPoniterData(e){
    pointer.x = ( e.offsetX / canvas.clientWidth ) * 2 - 1;
    pointer.y = - ( e.offsetY / canvas.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, cameraPrincipal );
  }

  function onHoverMap(){
    const intersects = raycaster.intersectObjects( Objetos );

    if (intersects.length > 0) {
      if ( INTERSECTED != intersects[ 0 ].object ) {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = intersects[ 0 ].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex( 0xaaaaaa );
      }   

    }else{

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
					INTERSECTED = null;

    }

  }

  function onClickMap(){
    const intersects = raycaster.intersectObjects( Objetos );

    if (intersects.length > 0) {
      document.querySelector('.contenido').innerHTML=intersects[0].object.name;
    }

  }

  function Animations(){ //Animaciones para los objetos en la escena
    requestAnimationFrame( Animations );
		const delta = clock.getDelta();

		if ( mixer ) mixer.update( delta );
				renderer.render( scene, cameraPrincipal);

    if ( mixer2 ) mixer2.update( delta );
				renderer.render( scene, cameraPrincipal);

  }

  function resizeRendererToDisplaySize(renderer) { // Restablece el tamaño de los objetos en la escena
    //De acuerdo al tamaño del contenedor de la escena en el html
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render(time) { //dibuja la escena
    time *= 0.001;  // conviete el tiempo a segundos
  
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        cameraPrincipal.aspect = canvas.clientWidth / canvas.clientHeight;
        cameraPrincipal.updateProjectionMatrix();
    }
    
    Animations(); 
    renderer.render(scene, cameraPrincipal);
    requestAnimationFrame(render);
    controls.update();

  }

  requestAnimationFrame(render);

}
main();


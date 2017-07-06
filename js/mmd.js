"use strict";

let width = window.innerWidth;
let height = window.innerHeight;
let modelReady = false;

// シーン、カメラ、レンダラーを作成
let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer({antialial:true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width,height);
rederer.setClearColor(new THREE.Color(0xffffff));
document.body.appendChild(renderer.domElement);

let camera = new THREE.PerspectiveCamera(50, width/height,0.1,1000);
camera.position.set(0,-2,10);

//orbitcontrolの設定
let controls = new THREE.OrbitControls(camera,renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 60;


//平行光源の作成、シーンへの追加
let ambient = new THREE.AmbientLight(0xeeeeee);
scene.add(ambient);
let light1 = new THREE.DirectionalLight(0x888888,0.03);
light1.position.set(-50,15,30);
scene.add(light1);
let light2 = new THREE.DirectionalLight(0x888888,0.03);
light2.position.set(50,15,30);
scene.add(light2);

//床の作成
let planeGeo = new THREE.PlaneGeometry(12,12);
let planeMat = new THREE.MeshLambertMaterial({
	color: 0xF0A32F,
	wireframe: true,
	side: THREE.DoubleSide
});
let plane = new THREE.Mesh(planeGeo,planeMat);
plane.position.set(0,-3,0);
plane.rotation.x += Math.PI/2;
scene.add(plane);

//背景色
renderer.setClearColor(0x888888);


//ドロップシャドウの設定
plane.receiveShadow = true;
renderer.shadowMap.enabled = true;

//背景の宇宙
let spaceGeo = new THREE.SphereGeometry(900,128,128);
let spaceMat;
let space;
let spaceLoader = new THREE.TextureLoader();
spaceLoader.load("models/img/skybox.jpg",function(image){
	image.wrapS = THREE.RepeatWrapping;
	image.wrapT = THREE.RepeatWrapping;
	image.repeat.set(5,5);

	spaceMat = new THREE.MeshBasicMaterial({
		map: image,
		color: 0xA9A9F5,
		side: THREE.BackSide
	});
	space = new THREE.Mesh(spaceGeo,spaceMat);
	space.position.z = 0;
	scene.add(space);
});

//背景のフレーム
let backMesh = new THREE.Mesh(
	new THREE.IcosahedronGeometry(800,1),
	new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true,
		wireframeLinewidth: 10,
		metal: true
	})
	);
backMesh.position.z = -1;
scene.add(backMesh);

//mmdLoader,mmdHelper
let mmdLoader = new THREE.MMDLoader();
let mmdHelper = new THREE.MMDHelper(renderer);

//mmdデータを読み込み、オブジェクト生成、シーンへの追加
let model;
let ikHelper;
mmdLoader.loadModel("models/Tdamiku.pmx",function(object){
	model = object;
	model.scale.set(0.3,0.3,0.3);
	model.position.set(0,-3,0);
	model.receiveShadow = true;
	model.castShadow = true;
	mmdHelper.add(model);

	ikHelper = new THREE.CCDIKHelper(model);
	ikHelper.visible = false;
	scene.add(ikHelper);
	mmdHelper.setAnimation(model);
	mmdHelper.setPhysics(model);



	//ダンス設定
	mmdLoader.loadVmd("models/nekomimi_lat.vmd",function(vmd){
		mmdLoader.pourVmdIntoModel(model,vmd);
		mmdHelper.setAnimation(model);
		scene.add(model);
	});
});

//VR
let vrControls = new THREE.VRControls(camera);
let effect = new THREE.VREffect(renderer);
effect.setSize(width,height);

let clock = new THREE.Clock();

//アニメーション処理
(function render(){
	requestAnimationFrame(render);
	//rendererに先回の呼び出し時間からの差分を渡し、経過に応じたアニメーションを行う
	mmdHelper.animate(clock.getDelta());
	backMesh.rotation.y += 0.001;
	space.rotation.y -= 0.001;
	vrControls.update();
	effect.render(scene,camera);
	renderer.render(scene,camera);
})();

//resize
window.addEventListener("resize",function(){
	width = window.innerWidth;
	height = window.innerHeight;
	effect.setSize(width,height);
	renderer.setSize(width,height);
	renderer.setViewport(0,0,width,height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
},false);
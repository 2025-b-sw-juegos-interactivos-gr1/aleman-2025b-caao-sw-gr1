import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Scene } from '@babylonjs/core/scene';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF';

export function createScene(engine, canvas) {
  const scene = new Scene(engine);

  // Register GLTF loader
  SceneLoader.RegisterPlugin(new GLTFFileLoader());

  const camera = new FreeCamera('camera1', new Vector3(0, 5, -15), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  // Create different light types
  const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity = 0.9;
  hemisphericLight.setEnabled(false);

  const directionalLight = new DirectionalLight('directionalLight', new Vector3(-1, -1, -1), scene);
  directionalLight.intensity = 0.8;
  directionalLight.setEnabled(false);

  const pointLight = new PointLight('pointLight', new Vector3(0, 5, 0), scene);
  pointLight.intensity = 1.0;
  pointLight.setEnabled(false);

  const spotLight = new SpotLight('spotLight', new Vector3(0, 10, 0), new Vector3(0, -1, 0), Math.PI / 3, 2, scene);
  spotLight.intensity = 1.2;
  spotLight.setEnabled(false);

  // Start with hemispheric light
  hemisphericLight.setEnabled(true);
  let currentLightType = 'hemispheric';

  // Solid colors for materials
  const boxMat = new StandardMaterial('boxMat', scene);
  boxMat.diffuseColor = new Color3(0.8, 0.4, 0.2); // Orange-brown

  const box = MeshBuilder.CreateBox('box', { size: 2 }, scene);
  box.position = new Vector3(-4, 1, 0);
  box.material = boxMat;

  const sphereMat = new StandardMaterial('sphereMat', scene);
  sphereMat.diffuseColor = new Color3(0.2, 0.6, 0.8); // Blue

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
  sphere.position = new Vector3(-1.5, 1, 0);
  sphere.material = sphereMat;

  const cylinderMat = new StandardMaterial('cylinderMat', scene);
  cylinderMat.diffuseColor = new Color3(0.7, 0.7, 0.7); // Gray

  const cylinder = MeshBuilder.CreateCylinder('cylinder', { height: 2, diameter: 1.5 }, scene);
  cylinder.position = new Vector3(1.5, 1, 0);
  cylinder.material = cylinderMat;

  const torusMat = new StandardMaterial('torusMat', scene);
  torusMat.diffuseColor = new Color3(0.8, 0.2, 0.5); // Pink

  const torus = MeshBuilder.CreateTorus('torus', { diameter: 2, thickness: 0.5 }, scene);
  torus.position = new Vector3(4, 1, 0);
  torus.material = torusMat;

  const groundMat = new StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new Color3(0.3, 0.6, 0.3); // Green

  const ground = MeshBuilder.CreateGround('ground', { width: 12, height: 12 }, scene);
  ground.material = groundMat;

  // Load GLTF model
  SceneLoader.ImportMesh('', './assets/models/', 'Yeti.gltf', scene, function (meshes, particleSystems, skeletons, animationGroups) {
    // Position the loaded model alongside other figures
    const rootMesh = meshes[0];
    rootMesh.position = new Vector3(6, 1, 0);
    
    // Scale to match other figures (approximately size 2)
    rootMesh.scaling = new Vector3(0.1, 0.1, 0.1);
    
    console.log('GLTF model loaded successfully');
    console.log('Meshes:', meshes.length);
    console.log('Animations:', animationGroups.length);
  }, function (progress) {
    console.log('Loading progress:', progress.loaded / progress.total * 100 + '%');
  }, function (scene, message, exception) {
    console.error('Error loading GLTF model:', message, exception);
  });

  // Function to switch lighting types
  function switchLightType() {
    // Disable all lights
    hemisphericLight.setEnabled(false);
    directionalLight.setEnabled(false);
    pointLight.setEnabled(false);
    spotLight.setEnabled(false);

    // Cycle through light types
    switch (currentLightType) {
      case 'hemispheric':
        directionalLight.setEnabled(true);
        currentLightType = 'directional';
        console.log('Switched to Directional Light');
        break;
      case 'directional':
        pointLight.setEnabled(true);
        currentLightType = 'point';
        console.log('Switched to Point Light');
        break;
      case 'point':
        spotLight.setEnabled(true);
        currentLightType = 'spot';
        console.log('Switched to Spot Light');
        break;
      case 'spot':
        hemisphericLight.setEnabled(true);
        currentLightType = 'hemispheric';
        console.log('Switched to Hemispheric Light');
        break;
    }
  }

  // Add keyboard event listener for switching lights
  window.addEventListener('keydown', (event) => {
    if (event.key === 'l' || event.key === 'L') {
      switchLightType();
    }
  });

  // Add instructions to the console
  console.log('Press L to cycle through lighting types: Hemispheric -> Directional -> Point -> Spot -> Hemispheric');

  return scene;
}

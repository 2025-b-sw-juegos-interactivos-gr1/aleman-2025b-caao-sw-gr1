import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/core/Materials/standardMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Scene } from '@babylonjs/core/scene';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF';

export function createScene(engine, canvas) {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.05, 0.05, 0.15, 1); // Dark blue night sky
  
  // Limit the number of lights per mesh to avoid shader errors
  scene.maxLightsPerMesh = 8;

  // Register GLTF loader
  SceneLoader.RegisterPlugin(new GLTFFileLoader());

  // Camera - Arc Rotate for better RPG view
  const camera = new ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 3, 25, Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 40;
  camera.attachControl(canvas, true);

  // LIGHTING SYSTEM - Multiple lights for atmosphere
  // Moon light (dim hemispheric)
  const moonLight = new HemisphericLight('moonLight', new Vector3(0, 1, 0), scene);
  moonLight.intensity = 0.3;
  moonLight.diffuse = new Color3(0.5, 0.6, 0.8); // Cool blue moonlight
  moonLight.groundColor = new Color3(0.1, 0.1, 0.2);

  // Directional light for shadows
  const sunLight = new DirectionalLight('sunLight', new Vector3(1, -2, 1), scene);
  sunLight.intensity = 0.2;
  sunLight.diffuse = new Color3(0.8, 0.7, 0.6);

  // GROUND - Forest floor
  const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
  const groundMat = new StandardMaterial('groundMat', scene);
  try {
    groundMat.diffuseTexture = new Texture('./assets/textures/wood.jpg', scene);
    groundMat.diffuseTexture.uScale = 20;
    groundMat.diffuseTexture.vScale = 20;
  } catch (e) {
    groundMat.diffuseColor = new Color3(0.2, 0.3, 0.15); // Dark forest green
  }
  groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
  ground.material = groundMat;
  ground.receiveShadows = true;

  // Helper function to create cell-shaded material
  function createCellMaterial(name, baseColor, scene) {
    const mat = new StandardMaterial(name, scene);
    mat.diffuseColor = baseColor;
    mat.specularColor = new Color3(0.2, 0.2, 0.2);
    // Simulate cell shading with reduced specular power
    mat.specularPower = 2;
    return mat;
  }

  // TREES - Dense forest
  function createTree(x, z) {
    // Tree trunk
    const trunk = MeshBuilder.CreateCylinder(`trunk_${x}_${z}`, { 
      height: 8, 
      diameterTop: 0.5, 
      diameterBottom: 0.8 
    }, scene);
    trunk.position = new Vector3(x, 4, z);
    
    const trunkMat = createCellMaterial('trunkMat', new Color3(0.3, 0.2, 0.1), scene);
    try {
      trunkMat.diffuseTexture = new Texture('./assets/textures/wood.jpg', scene);
    } catch (e) {}
    trunk.material = trunkMat;
    trunk.receiveShadows = true;

    // Tree foliage (multiple cones for depth)
    for (let i = 0; i < 3; i++) {
      const foliage = MeshBuilder.CreateCylinder(`foliage_${x}_${z}_${i}`, { 
        height: 4 - i * 0.5, 
        diameterTop: 0, 
        diameterBottom: 4 - i * 0.5 
      }, scene);
      foliage.position = new Vector3(x, 7 + i * 2, z);
      
      const foliageMat = createCellMaterial(`foliageMat_${i}`, 
        new Color3(0.1 + i * 0.05, 0.3 + i * 0.05, 0.1), scene);
      foliage.material = foliageMat;
      foliage.receiveShadows = true;
    }
  }

  // Create dense forest
  const treePositions = [
    // Ring around the yeti
    [-8, -8], [-8, 8], [8, -8], [8, 8],
    [-12, 0], [12, 0], [0, -12], [0, 12],
    [-10, -5], [-10, 5], [10, -5], [10, 5],
    [-5, -10], [5, -10], [-5, 10], [5, 10],
    // Outer ring
    [-15, -15], [-15, 0], [-15, 15],
    [15, -15], [15, 0], [15, 15],
    [0, -15], [0, 15],
    // Random scattered trees
    [-7, -12], [7, -12], [-12, -7], [12, -7],
    [-7, 12], [7, 12], [-12, 7], [12, 7],
  ];

  treePositions.forEach(pos => createTree(pos[0], pos[1]));

  // ROCKS AND ENVIRONMENT
  function createRock(x, y, z, scale) {
    const rock = MeshBuilder.CreateSphere(`rock_${x}_${z}`, { 
      diameter: 1,
      segments: 6 
    }, scene);
    rock.position = new Vector3(x, y, z);
    rock.scaling = new Vector3(scale, scale * 0.6, scale);
    
    const rockMat = createCellMaterial('rockMat', new Color3(0.3, 0.3, 0.35), scene);
    rock.material = rockMat;
    rock.receiveShadows = true;
    return rock;
  }

  // Scatter rocks
  const rockPositions = [
    [-3, 0.3, -3, 0.8], [3, 0.4, -4, 1.2], [-4, 0.35, 3, 1.0],
    [4, 0.3, 4, 0.9], [-6, 0.4, -1, 1.1], [6, 0.35, 2, 0.85],
  ];
  rockPositions.forEach(pos => createRock(pos[0], pos[1], pos[2], pos[3]));

  // TORCHES - Create animated torches with fire
  function createTorch(x, z) {
    // Torch pole
    const pole = MeshBuilder.CreateCylinder(`torchPole_${x}_${z}`, { 
      height: 3, 
      diameter: 0.2 
    }, scene);
    pole.position = new Vector3(x, 1.5, z);
    
    const poleMat = createCellMaterial('poleMat', new Color3(0.3, 0.2, 0.1), scene);
    pole.material = poleMat;

    // Torch top
    const torchTop = MeshBuilder.CreateSphere(`torchTop_${x}_${z}`, { 
      diameter: 0.5 
    }, scene);
    torchTop.position = new Vector3(x, 3.2, z);
    
    const torchMat = new StandardMaterial('torchMat', scene);
    torchMat.emissiveColor = new Color3(1, 0.5, 0.1);
    torchMat.diffuseColor = new Color3(0.8, 0.4, 0.1);
    torchTop.material = torchMat;

    // Point light for torch
    const torchLight = new PointLight(`torchLight_${x}_${z}`, new Vector3(x, 3.5, z), scene);
    torchLight.diffuse = new Color3(1, 0.5, 0.1);
    torchLight.specular = new Color3(1, 0.4, 0);
    torchLight.intensity = 10;
    torchLight.range = 12;

    // Flickering animation
    let time = Math.random() * 100;
    scene.registerBeforeRender(() => {
      time += 0.05;
      torchLight.intensity = 8 + Math.sin(time) * 2 + Math.cos(time * 1.5) * 1;
      torchTop.position.y = 3.2 + Math.sin(time * 2) * 0.05;
    });

    // Fire particles
    const fireSystem = new ParticleSystem(`fire_${x}_${z}`, 200, scene);
    fireSystem.particleTexture = new Texture('https://assets.babylonjs.com/textures/flare.png', scene);
    fireSystem.emitter = new Vector3(x, 3.3, z);
    fireSystem.minEmitBox = new Vector3(-0.1, 0, -0.1);
    fireSystem.maxEmitBox = new Vector3(0.1, 0, 0.1);
    
    fireSystem.color1 = new Color4(1, 0.5, 0, 1);
    fireSystem.color2 = new Color4(1, 0.3, 0, 1);
    fireSystem.colorDead = new Color4(0.2, 0.1, 0, 0);
    
    fireSystem.minSize = 0.1;
    fireSystem.maxSize = 0.3;
    fireSystem.minLifeTime = 0.2;
    fireSystem.maxLifeTime = 0.5;
    
    fireSystem.emitRate = 100;
    fireSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    fireSystem.gravity = new Vector3(0, 0, 0);
    fireSystem.direction1 = new Vector3(-0.3, 1, -0.3);
    fireSystem.direction2 = new Vector3(0.3, 1.5, 0.3);
    fireSystem.minEmitPower = 0.5;
    fireSystem.maxEmitPower = 1;
    fireSystem.updateSpeed = 0.01;
    
    fireSystem.start();
  }

  // Place torches in a circle around the yeti (reduced number)
  const torchPositions = [
    [-5, -5], [5, -5], [-5, 5], [5, 5]
  ];
  torchPositions.forEach(pos => createTorch(pos[0], pos[1]));

  // MYSTERIOUS AMBIENT LIGHTS (floating magical lights) - reduced
  function createFloatingLight(x, y, z, color) {
    const sphere = MeshBuilder.CreateSphere(`magicLight_${x}_${z}`, { 
      diameter: 0.3 
    }, scene);
    sphere.position = new Vector3(x, y, z);
    
    const mat = new StandardMaterial('magicMat', scene);
    mat.emissiveColor = color;
    sphere.material = mat;

    const light = new PointLight(`magicPointLight_${x}_${z}`, new Vector3(x, y, z), scene);
    light.diffuse = color;
    light.intensity = 3;
    light.range = 8;

    // Float animation
    let time = Math.random() * 100;
    const startY = y;
    scene.registerBeforeRender(() => {
      time += 0.02;
      const newY = startY + Math.sin(time) * 0.5;
      sphere.position.y = newY;
      light.position.y = newY;
      light.intensity = 2 + Math.sin(time * 2) * 1;
    });
  }

  // Add magical floating lights (only 2)
  createFloatingLight(-10, 2, -8, new Color3(0.2, 0.8, 1));
  createFloatingLight(10, 2.5, 8, new Color3(1, 0.8, 0.2));

  // FOG for atmosphere
  scene.fogMode = Scene.FOGMODE_EXP;
  scene.fogDensity = 0.015;
  scene.fogColor = new Color3(0.05, 0.05, 0.15);

  // YETI - Center piece
  SceneLoader.ImportMesh('', './assets/models/', 'Yeti.gltf', scene, function (meshes, particleSystems, skeletons, animationGroups) {
    const rootMesh = meshes[0];
    rootMesh.position = new Vector3(0, 1, 0); // Center of the scene
    rootMesh.scaling = new Vector3(0.1, 0.1, 0.1);
    
    // Apply cell-shading effect to yeti meshes
    meshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material.specularPower = 2; // Low specular for toon effect
      }
      mesh.receiveShadows = true;
    });

    // Spotlight on the yeti for dramatic effect
    const yetiSpotlight = new SpotLight('yetiSpot', new Vector3(0, 15, -5), 
      new Vector3(0, -1, 0.2), Math.PI / 4, 5, scene);
    yetiSpotlight.diffuse = new Color3(0.8, 0.9, 1);
    yetiSpotlight.intensity = 20;

    // Play animations if available
    if (animationGroups.length > 0) {
      animationGroups[0].start(true);
    }
    
    console.log('🎮 RPG Forest Scene Loaded!');
    console.log('✨ Yeti positioned at center with', meshes.length, 'meshes');
    console.log('🔥', torchPositions.length, 'torches illuminating the scene');
    console.log('🌲', treePositions.length, 'trees creating the forest');
  }, function (progress) {
    console.log('Loading Yeti:', Math.round(progress.loaded / progress.total * 100) + '%');
  }, function (scene, message, exception) {
    console.error('Error loading Yeti model:', message, exception);
  });

  // BUSHES/UNDERGROWTH
  function createBush(x, z) {
    for (let i = 0; i < 3; i++) {
      const bush = MeshBuilder.CreateSphere(`bush_${x}_${z}_${i}`, { 
        diameter: 0.5 + Math.random() * 0.3,
        segments: 8 
      }, scene);
      bush.position = new Vector3(
        x + (Math.random() - 0.5) * 0.5, 
        0.2, 
        z + (Math.random() - 0.5) * 0.5
      );
      bush.scaling.y = 0.6;
      
      const bushMat = createCellMaterial('bushMat', 
        new Color3(0.15, 0.35, 0.15), scene);
      bush.material = bushMat;
    }
  }

  // Scatter bushes
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 4 + Math.random() * 3;
    createBush(
      Math.cos(angle) * radius, 
      Math.sin(angle) * radius
    );
  }

  console.log('🌙 RPG Forest Scene Created!');
  console.log('🎮 Controls: Mouse to rotate camera, scroll to zoom');
  console.log('✨ Features: Cell-shaded graphics, dynamic lighting, particle effects');

  return scene;
}

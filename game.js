// 3D Shooter Game - Complete Implementation

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 300, 500);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('gameContainer').appendChild(renderer.domElement);

// Game State
const gameState = {
    health: 100,
    maxHealth: 100,
    score: 0,
    level: 1,
    gameOver: false,
    enemies: [],
    bullets: [],
    particles: []
};

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2d3436 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(200, 40, 0x444444, 0x222222);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Player
const player = {
    position: new THREE.Vector3(0, 2, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    direction: new THREE.Vector3(0, 0, -1),
    speed: 0.3,
    jumpPower: 0.8,
    isJumping: false,
    canJump: false,
    rotation: { x: 0, y: 0 }
};

// Player model (simple capsule)
const playerGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
playerMesh.castShadow = true;
playerMesh.receiveShadow = true;
scene.add(playerMesh);

// Input handling
const keys = {};
const mouse = { x: 0, y: 0, clicked: false };

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    player.rotation.y -= mouse.x * 0.005;
    player.rotation.x -= mouse.y * 0.005;
    
    player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotation.x));
});

window.addEventListener('click', () => {
    if (!gameState.gameOver) {
        shoot();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Shooting
function shoot() {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.rotation.x);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    
    bullet.position.copy(player.position).add(direction.multiplyScalar(2));
    bullet.velocity = direction.multiplyScalar(1);
    bullet.life = 500;
    
    scene.add(bullet);
    gameState.bullets.push(bullet);
}

// Create Enemy
function createEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    const enemyGeometry = new THREE.OctahedronGeometry(0.8);
    const enemyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemyMesh.position.set(x, 2, z);
    enemyMesh.castShadow = true;
    enemyMesh.receiveShadow = true;
    scene.add(enemyMesh);
    
    const enemy = {
        mesh: enemyMesh,
        position: new THREE.Vector3(x, 2, z),
        health: 20,
        shootTimer: 0,
        speed: 0.15
    };
    
    gameState.enemies.push(enemy);
}

// Spawn wave of enemies
function spawnWave() {
    const enemyCount = 3 + gameState.level * 2;
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => createEnemy(), i * 500);
    }
}

// Particle effect
function createExplosion(position) {
    for (let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5) });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 1.5,
            (Math.random() - 0.5) * 2
        );
        
        particle.velocity = velocity;
        particle.life = 30;
        particle.maxLife = 30;
        
        scene.add(particle);
        gameState.particles.push(particle);
    }
}

// Update HUD
function updateHUD() {
    document.getElementById('health').textContent = Math.max(0, gameState.health);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('enemies').textContent = gameState.enemies.length;
}

// Update function
function update() {
    // Player movement
    const moveDirection = new THREE.Vector3();
    if (keys['w']) moveDirection.z -= player.speed;
    if (keys['s']) moveDirection.z += player.speed;
    if (keys['a']) moveDirection.x -= player.speed;
    if (keys['d']) moveDirection.x += player.speed;
    
    moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    player.position.add(moveDirection);
    
    // Keep player in bounds
    player.position.x = Math.max(-90, Math.min(90, player.position.x));
    player.position.z = Math.max(-90, Math.min(90, player.position.z));
    
    // Jump
    if (keys[' '] && player.canJump && !player.isJumping) {
        player.velocity.y = player.jumpPower;
        player.isJumping = true;
        player.canJump = false;
    }
    
    // Gravity
    player.velocity.y -= 0.02;
    player.position.y += player.velocity.y;
    
    if (player.position.y <= 2) {
        player.position.y = 2;
        player.velocity.y = 0;
        player.isJumping = false;
        player.canJump = true;
    }
    
    // Update player mesh
    playerMesh.position.copy(player.position);
    
    // Update camera
    camera.position.copy(player.position);
    camera.position.y += 0.5;
    
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.rotation.x);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    camera.lookAt(camera.position.clone().add(forward));
    
    // Update bullets
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        bullet.position.add(bullet.velocity);
        bullet.life--;
        
        if (bullet.life <= 0 || bullet.position.distanceTo(player.position) > 200) {
            scene.remove(bullet);
            gameState.bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with enemies
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            const distance = bullet.position.distanceTo(enemy.position);
            
            if (distance < 1.5) {
                enemy.health -= 25;
                createExplosion(bullet.position);
                
                scene.remove(bullet);
                gameState.bullets.splice(i, 1);
                
                if (enemy.health <= 0) {
                    scene.remove(enemy.mesh);
                    gameState.enemies.splice(j, 1);
                    gameState.score += 100;
                }
                break;
            }
        }
    }
    
    // Update enemies
    for (let i = 0; i < gameState.enemies.length; i++) {
        const enemy = gameState.enemies[i];
        
        // Move towards player
        const direction = player.position.clone().sub(enemy.position).normalize();
        enemy.position.add(direction.multiplyScalar(enemy.speed));
        enemy.mesh.position.copy(enemy.position);
        
        // Enemy shooting
        enemy.shootTimer++;
        if (enemy.shootTimer > 60) {
            const bulletDir = player.position.clone().sub(enemy.position).normalize();
            const enemyBulletGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const enemyBulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const enemyBullet = new THREE.Mesh(enemyBulletGeometry, enemyBulletMaterial);
            
            enemyBullet.position.copy(enemy.position).add(bulletDir.multiplyScalar(1.5));
            enemyBullet.velocity = bulletDir.multiplyScalar(0.5);
            enemyBullet.life = 300;
            enemyBullet.isEnemyBullet = true;
            
            scene.add(enemyBullet);
            gameState.bullets.push(enemyBullet);
            enemy.shootTimer = 0;
        }
        
        // Check collision with player
        const dist = enemy.position.distanceTo(player.position);
        if (dist < 2) {
            gameState.health -= 0.5;
        }
    }
    
    // Update particles
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.position.add(particle.velocity);
        particle.velocity.y -= 0.02;
        particle.life--;
        particle.material.opacity = particle.life / particle.maxLife;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            gameState.particles.splice(i, 1);
        }
    }
    
    // Check collisions with enemy bullets
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        if (bullet.isEnemyBullet) {
            const dist = bullet.position.distanceTo(player.position);
            if (dist < 1) {
                gameState.health -= 10;
                scene.remove(bullet);
                gameState.bullets.splice(i, 1);
                createExplosion(bullet.position);
            }
        }
    }
    
    // Level progression
    if (gameState.enemies.length === 0 && gameState.level > 0) {
        gameState.level++;
        gameState.health = Math.min(gameState.maxHealth, gameState.health + 20);
        spawnWave();
    }
    
    // Game over check
    if (gameState.health <= 0) {
        gameState.gameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('levelReached').textContent = gameState.level;
    }
    
    updateHUD();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!gameState.gameOver) {
        update();
    }
    
    renderer.render(scene, camera);
}

// Start game
spawnWave();
animate();

let ROWS = 10,
    COLS = 10;

class Node {
    constructor(id, alive) {
	this.id = id;
	this.alive = alive;
	this.mesh = null;
	this.neighbor_ids = [];
    }
}

class Graph {
    constructor() {
	//create the front face grid
	this.f_grid = [];

	let counter = 0;
	for(let i = 0; i < COLS; i += 1) {
	    this.f_grid.push([]);
	    for(let j = 0; j < ROWS; j += 1) {
		this.f_grid.at(-1).push(new Node(counter, false));
		counter += 1;
	    }
	}

	//making an oscillator to test.
	this.f_grid[5][5].alive = true;
	this.f_grid[4][5].alive = true;
	this.f_grid[6][5].alive = true;
	
	//assign the neighbors for each node
	for(let i = 0; i < COLS; i += 1) {
	    for(let j = 0; j < ROWS; j += 1) {
		if(i > 0) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i-1][j].id
		    );
		}
		if(i < COLS-1) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i+1][j].id
		    );
		}
		if(j > 0) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i][j-1].id
		    );
		}
		if(j < ROWS-1) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i][j+1].id
		    );
		}
		//upper left
		if(i > 0 && j > 0) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i-1][j-1].id
		    );
		}
		//lower left
		if(i > 0 && j < ROWS-1) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i-1][j+1].id
		    );
		}
		//upper right
		if(i < COLS-1 && j > 0) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i+1][j-1].id
		    );
		}
		//lower right
		if(i < COLS-1 && j < ROWS-1) {
		    this.f_grid[i][j].neighbor_ids.push(
			this.f_grid[i+1][j+1].id
		    );
		}
	    }
	}
    }
    
    isAliveById(node_id) {
	for(let i = 0; i < COLS; i += 1) {
	    for(let j = 0; j < ROWS; j += 1) {
		if(this.f_grid[i][j].id === node_id) {
		    return this.f_grid[i][j].alive;
		}
	    }
	}
	return false;
    }
    
    nxValue(given_node) {
	let live_neigh_count = 0;
	for(let i = 0; i < given_node.neighbor_ids.length; i += 1) {
	    if(this.isAliveById(given_node.neighbor_ids[i])) {
		live_neigh_count += 1;
	    }
	}

	if(given_node.alive) {
	    if(live_neigh_count < 2) {
		return false;
	    }
	    else if(live_neigh_count == 2 ||
		    live_neigh_count == 3) {
		return true;
	    }
	    else if(live_neigh_count > 3) {
		return false;
	    }
	}
	else {
	    if(live_neigh_count == 3) {
		return true;
	    }
	}   
	
	return false;
    }
    
    update() {
	let nu_grid = this.f_grid.map(col => col.map(node => {
	    let clone = new Node(node.id, node.alive);
	    clone.neighbor_ids = [...node.neighbor_ids];
	    clone.mesh = node.mesh;
	    return clone;
	}));
	for(let i = 0; i < this.f_grid.length; i += 1) {
	    for(let j = 0; j < this.f_grid[i].length; j += 1) {
		nu_grid[i][j].alive = this.nxValue(this.f_grid[i][j]);
	    }
	}

	this.f_grid = nu_grid.map(col => [...col]);
    }
}


//3D ENV setup
const CANVAS_WIDTH = 600, CANVAS_HEIGHT = 400;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, CANVAS_WIDTH/CANVAS_HEIGHT, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
renderer.setClearColor(0x000000);

document.getElementById('animation').appendChild(renderer.domElement);
renderer.domElement.style.borderRadius = '20px';
renderer.setAnimationLoop(animate);

//graph setup
let graph = new Graph();

//wireframe for cube
var cgol_cube = {geo: new THREE.BoxGeometry(0.5, 0.5, 0.5)};
cgol_cube.edges = new THREE.EdgesGeometry(cgol_cube.geo);
cgol_cube.line = new THREE.LineSegments(
    cgol_cube.edges,
    new THREE.LineBasicMaterial({color: 0xffffff})
);
scene.add(cgol_cube.line);

// draw the front face initially
const face_geo = new THREE.PlaneGeometry(.045, .045);
const face_mat = new THREE.MeshBasicMaterial({color: 0x00ff00});
for(let i = 0; i < COLS; i += 1) {
    for(let j = 0; j < ROWS; j += 1) {
	graph.f_grid[i][j].mesh = new THREE.Mesh(face_geo,
	    new THREE.MeshBasicMaterial({color: 0x00ff00}));
	graph.f_grid[i][j].mesh.position.x = -0.225+(0.5/COLS)*i;
	graph.f_grid[i][j].mesh.position.y = -0.225+(0.5/ROWS)*j;
	graph.f_grid[i][j].mesh.position.z = 0.25;
	scene.add(graph.f_grid[i][j].mesh);
    }
}

function redrawFrontFace() {
    for(let i = 0; i < COLS; i += 1) {
	for(let j = 0; j < ROWS; j += 1) {
	    if(graph.f_grid[i][j].alive == true) {
		graph.f_grid[i][j].mesh.material.color.set('black');
	    }
	    else {
		graph.f_grid[i][j].mesh.material.color.set('white');
	    }
	}
    }
}

graph.update();

//animation function
let frame = 0;
function animate(time) {
    // camera orbits origin
    camera.position.y = 0.1;
    camera.position.x = 0.5*Math.cos(frame/100);
    camera.position.z = 0.9;
    camera.lookAt(0,0,0);

    if(frame % 50 == 0) {
	graph.update();
	redrawFrontFace();
    }
    
    renderer.render(scene, camera);

    frame += 1;
}


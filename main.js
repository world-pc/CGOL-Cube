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

        this.grid = [];

        let counter = 0;
        for(let i = 0; i < 4*COLS; i += 1) {
            this.grid.push([]);
            for(let j = 0; j < ROWS; j += 1) {
                this.grid.at(-1).push(new Node(counter, (Math.random() < 0.5)));
                counter += 1;
            }
        }
        
        //assign the neighbors for each node
        const glen = this.grid.length;
        for(let i = 0; i < this.grid.length; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                
                //left
                this.grid[i][j].neighbor_ids.push(
                    this.grid[(((i-1)%glen)+glen)%glen][j].id
                );

                //right
                this.grid[i][j].neighbor_ids.push(
                    this.grid[(i+1)%glen][j].id
                );

                //up
                if(j > 0) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[i][j-1].id
                    );
                }

                //down
                if(j < ROWS-1) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[i][j+1].id
                    );
                }

                //upper left
                if(j > 0) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[(((i-1)%glen)+glen)%glen][j-1].id
                    );
                }
                //lower left
                if(j < ROWS-1) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[(((i-1)%glen)+glen)%glen][j+1].id
                    );
                }

                //upper right
                if(j > 0) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[(i+1)%glen][j-1].id
                    );
                }

                //lower right
                if(j < ROWS-1) {
                    this.grid[i][j].neighbor_ids.push(
                        this.grid[(i+1)%glen][j+1].id
                    );
                }
            }
        }
    }
    
    isAliveById(node_id) {
        for(let i = 0; i < this.grid.length; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                if(this.grid[i][j].id === node_id) {
                    return this.grid[i][j].alive;
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
            //console.log('live node has ' + live_neigh_count + ' alive neighbors.');
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
        let nu_grid = this.grid.map(col => col.map(node => {
            let clone = new Node(node.id, node.alive);
            clone.neighbor_ids = [...node.neighbor_ids];
            clone.mesh = node.mesh;
            return clone;
        }));

        for(let i = 0; i < this.grid.length; i += 1) {
            for(let j = 0; j < this.grid[i].length; j += 1) {
                nu_grid[i][j].alive = this.nxValue(this.grid[i][j]);
            }
        }

        this.grid = nu_grid.map(col => [...col]);
    }
}

const CANVAS_WIDTH = 600, CANVAS_HEIGHT = 400;
let scene, camera, renderer, graph, controls;
function initialize() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, CANVAS_WIDTH/CANVAS_HEIGHT, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    renderer.setClearColor(0x000000);

    // drag-to-orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.update();

    camera.position.set(0, 0.1, 0.9); 

    document.getElementById('animation').appendChild(renderer.domElement);
    renderer.domElement.style.borderRadius = '20px';
    renderer.setAnimationLoop(animate);

    //graph setup
    graph = new Graph();

    //wireframe for cube
    var cgol_cube = {geo: new THREE.BoxGeometry(0.5, 0.5, 0.5)};
    cgol_cube.edges = new THREE.EdgesGeometry(cgol_cube.geo);
    cgol_cube.line = new THREE.LineSegments(
        cgol_cube.edges,
        new THREE.LineBasicMaterial({color: 0xffffff})
    );
    scene.add(cgol_cube.line);

    const face_geo = new THREE.PlaneGeometry(.045, .045);

    //draw front face
    for(let i = 0; i < COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.grid[i][j].mesh.position.x = -0.225+(0.5/COLS)*i;
            graph.grid[i][j].mesh.position.y = -0.225+(0.5/ROWS)*j;
            graph.grid[i][j].mesh.position.z = 0.25;
            scene.add(graph.grid[i][j].mesh);
        }
    }

    //draw right face
    for(let i = COLS; i < 2*COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.grid[i][j].mesh.position.x = 0.25;
            graph.grid[i][j].mesh.position.y = -0.225+(0.5/ROWS)*j;
            graph.grid[i][j].mesh.position.z = 0.225-(0.5/COLS)*(i-COLS);
            graph.grid[i][j].mesh.rotateY(Math.PI / 2);
            scene.add(graph.grid[i][j].mesh);
        }
    }

    //draw back face
    for(let i = 2*COLS; i < 3*COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.grid[i][j].mesh.position.x = 0.225-(0.5/COLS)*(i-2*COLS);
            graph.grid[i][j].mesh.position.y = -0.225+(0.5/ROWS)*j;
            graph.grid[i][j].mesh.position.z = -0.25;
            scene.add(graph.grid[i][j].mesh);
        }
    }

    //draw left face
    for(let i = 3*COLS; i < 4*COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.grid[i][j].mesh.position.x = -0.25;
            graph.grid[i][j].mesh.position.y = -0.225+(0.5/ROWS)*j;
            graph.grid[i][j].mesh.position.z = -0.225+(0.5/COLS)*(i-3*COLS);
            graph.grid[i][j].mesh.rotateY(Math.PI/2);
            scene.add(graph.grid[i][j].mesh);
        }
    }
}

function redrawFrontFace() {
    for(let i = 0; i < graph.grid.length; i += 1) {
	for(let j = 0; j < ROWS; j += 1) {
	    if(graph.grid[i][j].alive == true) {
            graph.grid[i][j].mesh.material.color.set('black');
	    }
	    else {
            graph.grid[i][j].mesh.material.color.set('white');
	    }
	}
    }
}

initialize();

//animation function
let frame = 0;
function animate(time) {
    /* camera orbits origin
    camera.position.y = 0.1;
    camera.position.x = Math.cos(frame/100 + Math.PI/3.5);
    camera.position.z = Math.sin(frame/100 + Math.PI/3.5);
    camera.lookAt(0,0,0); */

    controls.update();

    if(frame % 25 == 0) {
        graph.update();
        redrawFrontFace();
    }
    
    renderer.render(scene, camera);

    frame += 1;
}

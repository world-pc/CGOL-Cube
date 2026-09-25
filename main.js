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
                /*if ((j <= ROWS/2) && (i % COLS < COLS/2)) {
                    this.grid.at(-1).push(new Node(counter, true));
                }
                else {
                    this.grid.at(-1).push(new Node(counter, false));
                }*/
                this.grid.at(-1).push(new Node(counter, (Math.random() < 0.5)));
                counter += 1;
            }
        }
 
        this.t_grid = []; //the top face grid

        //populate the top face grid.
        for(let i = 0; i < COLS; i += 1) {
            this.t_grid.push([]);
            for(let j = 0; j < ROWS; j += 1) {
                this.t_grid.at(-1).push(new Node(counter, (Math.random() < 0.5)));
                counter += 1;
            }
        }

        this.b_grid = []; //the bottom face grid

        //populate the bottom face grid
        for(let i = 0; i < COLS; i += 1) {
            this.b_grid.push([]);
            for(let j = 0; j < ROWS; j += 1) {
                this.b_grid.at(-1).push(new Node(counter, (Math.random() < 0.5)));
                counter += 1;
            }
        }

        //assign the neighbors for each node on Front, Right, Back, and Left faces
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

        //neighbors for bottom grid
        //first connect all adjacent cells within the bottom grid
        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                if(i > 0) {
                    //orthogonal left
                    this.b_grid[i][j].neighbor_ids.push(
                        this.b_grid[i-1][j].id
                    );

                    //upper left
                    if(j > 0) {
                        this.b_grid[i][j].neighbor_ids.push(
                            this.b_grid[i-1][j-1].id
                        );
                    }

                    //lower left
                    if(j < ROWS-1) {
                        this.b_grid[i][j].neighbor_ids.push(
                            this.b_grid[i-1][j+1].id
                        );
                    }
                }

                //right
                if(i < ROWS-1) {
                    //orthogonal right
                    this.b_grid[i][j].neighbor_ids.push(
                        this.b_grid[i+1][j].id
                    );

                    //upper right
                    if(j > 0) {
                        this.b_grid[i][j].neighbor_ids.push(
                            this.b_grid[i+1][j-1].id
                        );
                    }

                    //lower right
                    if(j < ROWS-1) {
                        this.b_grid[i][j].neighbor_ids.push(
                            this.b_grid[i+1][j+1].id
                        );
                    }
                }

                //up
                if(j > 0) {
                    this.b_grid[i][j].neighbor_ids.push(
                        this.b_grid[i][j-1].id
                    );
                }

                //down
                if(j < ROWS-1) {
                    this.b_grid[i][j].neighbor_ids.push(
                        this.b_grid[i][j+1].id
                    );
                }
            }
        }

        //connect top row of each side-face with corresponding bottom grid edge cells
        //front face
        for(let i = 0; i < COLS; i += 1) {
            //up
            this.b_grid[i][ROWS-1].neighbor_ids.push(
                this.grid[i][ROWS-1].id
            );
            this.grid[i][ROWS-1].neighbor_ids.push(
                this.b_grid[i][ROWS-1].id
            );
            //up-right diagonals
            if(i < COLS-1) {
                this.grid[i+1][ROWS-1].neighbor_ids.push(
                    this.b_grid[i][ROWS-1].id
                );
                this.b_grid[i][ROWS-1].neighbor_ids.push(
                    this.grid[i+1][ROWS-1].id
                );
            }
            //up-left diagonals
            if(i > 0) {
                this.grid[i][ROWS-1].neighbor_ids.push(
                    this.b_grid[i-1][ROWS-1].id
                );
                this.b_grid[i][ROWS-1].neighbor_ids.push(
                    this.grid[i-1][ROWS-1].id
                );
            }
        }

        //right face
        for(let i = 0; i < COLS; i += 1) {
            let t_i = COLS - 1 - i;

            //up
            this.b_grid[COLS-1][t_i].neighbor_ids.push(
                this.grid[COLS+i][ROWS-1].id
            );
            this.grid[COLS+i][ROWS-1].neighbor_ids.push(
                this.b_grid[COLS-1][t_i].id
            );
            //up-right diagonals
            if(t_i > 0) {
                this.grid[COLS+i][ROWS-1].neighbor_ids.push(
                    this.b_grid[COLS-1][t_i-1].id
                );
                this.b_grid[COLS-1][t_i-1].neighbor_ids.push(
                    this.grid[COLS+i][ROWS-1].id
                );
            }
            //up-left diagonals
            if(t_i < ROWS-1) {
                this.grid[COLS+i][ROWS-1].neighbor_ids.push(
                    this.b_grid[COLS-1][t_i+1].id
                );
                this.b_grid[COLS-1][t_i+1].neighbor_ids.push(
                    this.grid[COLS+i][ROWS-1].id
                );
            }
        }

        //back face
        for(let i = 0; i < COLS; i += 1) {
            let t_i = COLS - 1 - i;

            //up
            this.t_grid[t_i][0].neighbor_ids.push(
                this.grid[2*COLS+i][0].id
            );
            this.grid[2*COLS+i][0].neighbor_ids.push(
                this.t_grid[t_i][0].id
            );

            //up-right diagonals
            if(t_i > 0) {
                this.t_grid[t_i-1][0].neighbor_ids.push(
                    this.grid[2*COLS+i][0].id
                );
                this.grid[2*COLS+i][0].neighbor_ids.push(
                    this.t_grid[t_i-1][0].id
                );
            }

            //up-left diagonals
            if(t_i < ROWS-1) {
                this.t_grid[t_i+1][0].neighbor_ids.push(
                    this.grid[2*COLS+i][0].id
                );
                this.grid[2*COLS+i][0].neighbor_ids.push(
                    this.t_grid[t_i+1][0].id
                );
            }
        }

        //left face
        for(let i = 0; i < COLS; i += 1) {

            //up
            this.t_grid[0][i].neighbor_ids.push(
                this.grid[3*COLS+i][0].id
            );
            this.grid[3*COLS+i][0].neighbor_ids.push(
                this.t_grid[0][i].id
            );

            //up-right
            if(i < ROWS-1) {
                this.t_grid[0][i+1].neighbor_ids.push(
                    this.grid[3*COLS + i][0].id
                );
                this.grid[3*COLS + i][0].neighbor_ids.push(
                    this.t_grid[0][i+1].id
                );
            }

            //up-left
            if(i > 0) {
                this.t_grid[0][i-1].neighbor_ids.push(
                    this.grid[3 * COLS + i][0].id
                );
                this.grid[3 * COLS + i][0].neighbor_ids.push(
                    this.t_grid[0][i-1].id
                );
            }
        }

        //neighbors for top grid
        //first connect all adjacent cells within the top grid
        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                
                //left
                if(i > 0) {
                    //orthogonal left
                    this.t_grid[i][j].neighbor_ids.push(
                        this.t_grid[i-1][j].id
                    );

                    //upper left
                    if(j > 0) {
                        this.t_grid[i][j].neighbor_ids.push(
                            this.t_grid[i-1][j-1].id
                        );
                    }

                    //lower left
                    if(j < ROWS-1) {
                        this.t_grid[i][j].neighbor_ids.push(
                            this.t_grid[i-1][j+1].id
                        );
                    }
                }

                //right
                if(i < ROWS-1) {
                    //orthogonal right
                    this.t_grid[i][j].neighbor_ids.push(
                        this.t_grid[i+1][j].id
                    );

                    //upper right
                    if(j > 0) {
                        this.t_grid[i][j].neighbor_ids.push(
                            this.t_grid[i+1][j-1].id
                        );
                    }

                    //lower right
                    if(j < ROWS-1) {
                        this.t_grid[i][j].neighbor_ids.push(
                            this.t_grid[i+1][j+1].id
                        );
                    }
                }

                //up
                if(j > 0) {
                    this.t_grid[i][j].neighbor_ids.push(
                        this.t_grid[i][j-1].id
                    );
                }

                //down
                if(j < ROWS-1) {
                    this.t_grid[i][j].neighbor_ids.push(
                        this.t_grid[i][j+1].id
                    );
                }
           }
        }

        //connect top row of each side-face with corresponding top grid edge cells
        //front face
        for(let i = 0; i < COLS; i += 1) {
            //up
            this.t_grid[i][ROWS-1].neighbor_ids.push(
                this.grid[i][0].id
            );
            this.grid[i][0].neighbor_ids.push(
                this.t_grid[i][ROWS-1].id
            );
            //up-right diagonals
            if(i < COLS-1) {
                this.grid[i+1][0].neighbor_ids.push(
                    this.t_grid[i][ROWS-1].id
                );
                this.t_grid[i][ROWS-1].neighbor_ids.push(
                    this.grid[i+1][0].id
                );
            }
            //up-left diagonals
            if(i > 0) {
                this.grid[i][0].neighbor_ids.push(
                    this.t_grid[i-1][ROWS-1].id
                );
                this.t_grid[i][ROWS-1].neighbor_ids.push(
                    this.grid[i-1][0].id
                );
            }
        }

        //right face
        for(let i = 0; i < COLS; i += 1) {
            let t_i = COLS - 1 - i;

            //up
            this.t_grid[COLS-1][t_i].neighbor_ids.push(
                this.grid[COLS+i][0].id
            );
            this.grid[COLS+i][0].neighbor_ids.push(
                this.t_grid[COLS-1][t_i].id
            );
            //up-right diagonals
            if(t_i > 0) {
                this.grid[COLS+i][0].neighbor_ids.push(
                    this.t_grid[COLS-1][t_i-1].id
                );
                this.t_grid[COLS-1][t_i-1].neighbor_ids.push(
                    this.grid[COLS+i][0].id
                );
            }
            //up-left diagonals
            if(t_i < ROWS-1) {
                this.grid[COLS+i][0].neighbor_ids.push(
                    this.t_grid[COLS-1][t_i+1].id
                );
                this.t_grid[COLS-1][t_i+1].neighbor_ids.push(
                    this.grid[COLS+i][0].id
                );
            }
        }

        //back face
        for(let i = 0; i < COLS; i += 1) {
            let t_i = COLS - 1 - i;

            //up
            this.t_grid[t_i][0].neighbor_ids.push(
                this.grid[2*COLS+i][0].id
            );
            this.grid[2*COLS+i][0].neighbor_ids.push(
                this.t_grid[t_i][0].id
            );

            //up-right diagonals
            if(t_i > 0) {
                this.t_grid[t_i-1][0].neighbor_ids.push(
                    this.grid[2*COLS+i][0].id
                );
                this.grid[2*COLS+i][0].neighbor_ids.push(
                    this.t_grid[t_i-1][0].id
                );
            }

            //up-left diagonals
            if(t_i < ROWS-1) {
                this.t_grid[t_i+1][0].neighbor_ids.push(
                    this.grid[2*COLS+i][0].id
                );
                this.grid[2*COLS+i][0].neighbor_ids.push(
                    this.t_grid[t_i+1][0].id
                );
            }
        }

        //left face
        for(let i = 0; i < COLS; i += 1) {

            //up
            this.t_grid[0][i].neighbor_ids.push(
                this.grid[3*COLS+i][0].id
            );
            this.grid[3*COLS+i][0].neighbor_ids.push(
                this.t_grid[0][i].id
            );

            //up-right
            if(i < ROWS-1) {
                this.t_grid[0][i+1].neighbor_ids.push(
                    this.grid[3*COLS + i][0].id
                );
                this.grid[3*COLS + i][0].neighbor_ids.push(
                    this.t_grid[0][i+1].id
                );
            }

            //up-left
            if(i > 0) {
                this.t_grid[0][i-1].neighbor_ids.push(
                    this.grid[3 * COLS + i][0].id
                );
                this.grid[3 * COLS + i][0].neighbor_ids.push(
                    this.t_grid[0][i-1].id
                );
            }
        }
    }
    
    isAliveById(node_id) {

        //check front, right, back, and left faces
        for(let i = 0; i < this.grid.length; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                if(this.grid[i][j].id === node_id) {
                    return this.grid[i][j].alive;
                }
            }
        }

        //check top face
        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                if(this.t_grid[i][j].id === node_id) {
                    console.log('('+i+', '+j+') is alive!');
                    return this.t_grid[i][j].alive;
                }
            }
        }

        //check bottom face
        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                if(this.b_grid[i][j].id === node_id) {
                    console.log('('+i+', '+j+') is alive!');
                    return this.b_grid[i][j].alive;
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

        console.log('live neigh count: '+live_neigh_count);

        if(given_node.alive) {
            if(live_neigh_count < 1) {
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
        //front, right, back, left face
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

        //top face
        let nu_t_grid = this.t_grid.map(col => col.map(node => {
            let clone = new Node(node.id, node.alive);
            clone.neighbor_ids = [...node.neighbor_ids];
            clone.mesh = node.mesh;
            return clone;
        }));

        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                nu_t_grid[i][j].alive = this.nxValue(this.t_grid[i][j]);
            }
        }

        //bottom face
        let nu_b_grid = this.b_grid.map(col => col.map(node => {
            let clone = new Node(node.id, node.alive);
            clone.neighbor_ids = [...node.neighbor_ids];
            clone.mesh = node.mesh;
            return clone;
        }));
        
        for(let i = 0; i < COLS; i += 1) {
            for(let j = 0; j < ROWS; j += 1) {
                nu_b_grid[i][j].alive = this.nxValue(this.b_grid[i][j]);
            }
        }

        this.grid = nu_grid.map(col => [...col]);
        this.t_grid = nu_t_grid.map(col => [...col]);
        this.b_grid = nu_b_grid.map(col => [...col]);
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

    camera.position.set(0.25, 0.5, 0.4);

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
            graph.grid[i][j].mesh.position.y = 0.225-(0.5/ROWS)*j;
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
            graph.grid[i][j].mesh.position.y = 0.225-(0.5/ROWS)*j;
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
            graph.grid[i][j].mesh.position.y = 0.225-(0.5/ROWS)*j;
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
            graph.grid[i][j].mesh.position.y = 0.225-(0.5/ROWS)*j;
            graph.grid[i][j].mesh.position.z = -0.225+(0.5/COLS)*(i-3*COLS);
            graph.grid[i][j].mesh.rotateY(Math.PI/2);
            scene.add(graph.grid[i][j].mesh);
        }
    }

    //draw top face
    for(let i = 0; i < COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.t_grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.t_grid[i][j].mesh.position.x = -0.225+(0.5/COLS)*i;
            graph.t_grid[i][j].mesh.position.y = 0.25;
            graph.t_grid[i][j].mesh.position.z = -0.225+(0.5/COLS)*j;
            graph.t_grid[i][j].mesh.rotateX(Math.PI/2);
            scene.add(graph.t_grid[i][j].mesh);
        }
    }

    //draw bottom face
    for(let i = 0; i < COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            graph.b_grid[i][j].mesh = new THREE.Mesh(face_geo,
                new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
            graph.b_grid[i][j].mesh.position.x = -0.225 + (0.5/COLS)*i;
            graph.b_grid[i][j].mesh.position.y = -0.25;
            graph.b_grid[i][j].mesh.position.z = -0.225+(0.5/COLS)*j;
            graph.b_grid[i][j].mesh.rotateX(Math.PI/2);
            scene.add(graph.b_grid[i][j].mesh);
        }
    }
}

function redrawFaces() {
    //front, right, back, and left face
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

    //top face
    for(let i = 0; i < COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            if(graph.t_grid[i][j].alive == true) {
                graph.t_grid[i][j].mesh.material.color.set('black');
            }
            else {
                graph.t_grid[i][j].mesh.material.color.set('white');
            }
        }
    }

    //bottom face
    for(let i = 0; i < COLS; i += 1) {
        for(let j = 0; j < ROWS; j += 1) {
            if(graph.b_grid[i][j].alive == true) {
                graph.b_grid[i][j].mesh.material.color.set('black');
            }
            else {
                graph.b_grid[i][j].mesh.material.color.set('white');
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
        redrawFaces();
    }
    
    renderer.render(scene, camera);

    frame += 1;
}

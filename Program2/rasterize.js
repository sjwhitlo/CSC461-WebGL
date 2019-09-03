/*
 @author Sam Whitlock
 @assignment Senior Re-Exam
 @assignment Program 2
 @dueDate June 3, 2017
 
 Learning WebGL tutorials used for assistance.
 */

/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://ncsucgclass.github.io/prog2/ellipsoids.json"; // ellipsoids file loc

// Viewing vars
var Eye = new vec3.fromValues( 0.5, 0.5, -0.5 ); // initial eye position in world space
var Center = new vec3.fromValues( 0.5, 0.5, 0.5 ); // initial center in world space
var Up = new vec3.fromValues( 0.0, 1.0, 0.0 ); // initial up in world space
var VIEW_DISP = 0.05; // how much to displace the view by on each key press
var ROT_DISP = 0.05; // how much to displace the rotation by on each key press

/* For html text rendering and key bindings */
var currMod = null; // the currently selected model
var selectedIdx = -1; // the currently selected model by idx into array

/* light variables */
var lightPos  = new vec3.fromValues( 2.0, 4.0, -0.5 ); // light for the model
var lightAmb  = new vec3.fromValues( 1.0, 1.0,  1.0 ); // light - ambient
var lightDiff = new vec3.fromValues( 1.0, 1.0,  1.0 ); // light - diffuse
var lightSpec = new vec3.fromValues( 1.0, 1.0,  1.0 ); // light - specular

/* lighting variables */
var ltModels = [ "Phong", "Blinn-Phong" ]; // lighting models
var ltMod = 0; // keep track of which lighting model
var ltModInc = 1; // increment for model increment
var ltWtInc = 0.1; // increment for light weights
var DEF_WT = 1; // default weight for lighting components

var mvMatrix = mat4.create(); // Model View Matrix
var pMatrix = mat4.create(); // Perspective Matrix
var shaderProgram;

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var inTri = []; // The place where the triangles reside
var inEll = []; // the place where the ellipsoids reside
var vertexBuffer = []; // this contains vertex coordinates in triples by array
var triangleBuffer = []; // this contains indices into vertexBuffer in triples by array
var normBuffer = []; // contains normal vectors for vertices by array
var vertexPositionAttrib; // where to put position for vertex shader


// ASSIGNMENT HELPER FUNCTIONS

// handles an action when a key is pressed
function keyPress(event) {
    
    function incLight( lightPart ) {
        var comp = lightPart[0]; // all elements same, take the first element
        comp += ltWtInc;
        comp = ( comp > 1.0 ) ? 0.0 : comp;
        comp = Math.round( comp * 10 ) / 10;
        lightPart = [ comp, comp, comp ];
        return lightPart;
    } // end incLight
    
    function select( type, idx ) {
        if ( currMod != null ) {
            currMod.selected = false; // deselect model
        }
        selectedIdx = idx; // get ref to current idx
        if ( type === "tri" ) { // is a triangle
            currMod = inTri[ idx ];
        } else { // is an ellipsoid
            currMod = inEll[ idx ];
        } // end if/else
        currMod.selected = true; // current model now selected
    } // end select
    
    function translate( disp ) {
        if ( currMod != null ) { // if not null
            vec3.add( currMod.trans, currMod.trans, disp );
        } // end if not null
    } // end translate
    
    // Changes to view wrt camera, not model.
    // XYZ not valid parameters for such cases
    // Use IJK, such that
    // i -> camera x axis, positive right
    // j -> camera y axis, positive up (essentially look up)
    // k -> camera z axis, positive away (essentially look at)
    // positive values i(>), j(^), k(x)
    var temp = vec3.create; // stores temporary values
    var i = vec3.create();
    // j is unused, so not declared
    var k = vec3.create();
    k = vec3.normalize( k, vec3.subtract( temp, Center, Eye ) ); // k (look at) always center - eye
    i = vec3.normalize( i, vec3.cross( temp, k, Up ) ); // i (look right) always lookat cross up (k x Up)
    
    
    switch (event.code) {
            
            // Part 4 – Interactively change view
        case "KeyA": // lc trans left. UC rot left
            // to translate, move Eye and Center to right
            // to rotate, move Center
            // no matter what, Center moves
            vec3.add( Center, Center, vec3.scale( temp, i, VIEW_DISP ) );
            if ( !event.getModifierState( "Shift" ) ) {
                vec3.add( Eye, Eye, vec3.scale( temp, i, VIEW_DISP ) );
            }
            break;
        case "KeyD": // lc trans right. UC rot right
            vec3.sub( Center, Center, vec3.scale( temp, i, VIEW_DISP ) );
            if ( !event.getModifierState( "Shift" ) ) {
                vec3.sub( Eye, Eye, vec3.scale( temp, i, VIEW_DISP ) );
            }
            break;
        case "KeyW": // lc trans pos z. UC rot down
            // no matter what, Eye moves
            if ( event.getModifierState( "Shift" ) ) { // rotata camera
                vec3.sub( Center, Center, vec3.scale( temp, Up, VIEW_DISP ) );
                Up = vec3.cross( Up, i, vec3.sub( k, Center, Eye ) );
            } else { // move camera
                vec3.add( Center, Center, vec3.scale( temp, k, VIEW_DISP ) );
                vec3.add( Eye, Eye, vec3.scale( temp, k, VIEW_DISP ) );
            }
            break;
        case "KeyS": // lc trans neg z. UC rot up
            // no matter what, Eye moves
            if ( event.getModifierState( "Shift" ) ) { // rotata camera
                vec3.add( Center, Center, vec3.scale( temp, Up, VIEW_DISP ) );
                Up = vec3.cross( Up, i, vec3.sub( k, Center, Eye ) );
            } else { // move camera
                vec3.sub( Center, Center, vec3.scale( temp, k, VIEW_DISP ) );
                vec3.sub( Eye, Eye, vec3.scale( temp, k, VIEW_DISP ) );
            }
            break;
        case "KeyQ": // lc trans down
            vec3.sub( Center, Center, vec3.scale( temp, Up, VIEW_DISP ) );
            vec3.sub( Eye, Eye, vec3.scale( temp, Up, VIEW_DISP ) );
            break;
        case "KeyE": // lc trans up
            vec3.add( Center, Center, vec3.scale( temp, Up, VIEW_DISP ) );
            vec3.add( Eye, Eye, vec3.scale( temp, Up, VIEW_DISP ) );
            break;
            
            
            // Part 5 – Interactively select model
        case "ArrowLeft": // select previous triangle set
            // if 0, next idx = len - 1. else curr idx - 1
            var nextIdx = ( selectedIdx <= 0 ) ? ( inTri.length - 1 ) : ( selectedIdx - 1 );
            select( "tri", nextIdx );
            break;
        case "ArrowRight": // select next triangle set
            // mod div so never over bounds
            var nextIdx = ( selectedIdx + 1 ) % inTri.length;
            select( "tri", nextIdx );
            break;
        case "ArrowUp": // select next ellipsoid set
            // mod div so never over bounds
            var nextIdx = ( selectedIdx + 1 ) % inEll.length;
            select( "ell", nextIdx );
            break;
        case "ArrowDown": // select previous ellipsoid set
            // if 0, next idx = len - 1. else curr idx - 1
            var nextIdx = ( selectedIdx <= 0 ) ? ( inEll.length - 1 ) : ( selectedIdx - 1 );
            select( "ell", nextIdx );
            break;
        case "Space": // deselect
            // if a model is selected, deselect it
            if ( currMod != null ) {
                currMod.selected = false;
            }
            // current model to null
            currMod = null;
            // idx to -1
            selectedIdx = -1;
            break;
            
            
            // Part 6 - Interactively change lighting
        case "KeyB": // Toggle Phong and Blinn-Phong
            ltMod += ltModInc;
            ltMod %= ltModels.length;
            break;
        case "KeyN": // Increment specular integer
            if ( currMod != null ) {
                var specExp = currMod.lighting.n; // just to make the reading easier
                specExp += 1; // increment
                specExp = ( specExp > 20 ) ? 0 : specExp; // make sure within bounds
                specExp = Math.round( specExp ); // round
                currMod.lighting.n = specExp; // set actual var to correct val
            } // end if not null
            break;
        case "Digit1": // increment ambient weight
            if ( currMod != null ) {
                currMod.lighting.amb_wt = incLight( currMod.lighting.amb_wt );
            } // end if not null
            break;
        case "Digit2": // increment diffuse weight
            if ( currMod != null ) {
                currMod.lighting.diff_wt = incLight( currMod.lighting.diff_wt );
            } // end if not null
            break;
        case "Digit3": // increment specular weight
            if ( currMod != null ) {
                currMod.lighting.spec_wt = incLight( currMod.lighting.spec_wt );
            } // end if not null
            break;
            
            
            // Part 7 – Interactively transform models
        case "KeyK": // lc trans left
            translate( vec3.scale( temp, i, VIEW_DISP ) );
            break;
        case "Semicolon": // lc trans right
            translate( vec3.scale( temp, i, -VIEW_DISP ) );
            break;
        case "KeyO": // lc trans forward
            translate( vec3.scale( temp, k, VIEW_DISP ) );
            break;
        case "KeyL": // lc trans backward
            translate( vec3.scale( temp, k, -VIEW_DISP ) );
            break;
        case "KeyI": // lc trans down
            translate( vec3.scale( temp, Up, VIEW_DISP ) );
            break;
        case "KeyP": // lc trans up
            translate( vec3.scale( temp, Up, -VIEW_DISP ) );
            break;
    } // end switch
} // end keyPress

// load the values of light model
function loadHTMLText() {
    
    function round( n ) {
        return Math.round( n * 100 ) / 100;
    } // end round
    
    document.getElementById("txtLt").innerHTML = ltModels[ ltMod ]; // update lighting model
    
    // Update Eye data
    var strEye = "(" + round( Eye[0] ) + ", " + round( Eye[1] ) + ", " + round( Eye[2] ) + ")"; // make string
    document.getElementById("eye_pos").innerHTML = strEye; // update eye
    var strCenter = "(" + round( Center[0] ) + ", " + round( Center[1] ) + ", " + round( Center[2] ) + ")"; // make string
    document.getElementById("eye_center").innerHTML = strCenter; // update center
    var strUp = "(" + round( Up[0] ) + ", " + round( Up[1] ) + ", " + round( Up[2] ) + ")"; // make string
    document.getElementById("eye_up").innerHTML = strUp; // update up
    
    // Only Render if a model is selected
    if ( currMod != null ) {
        // get the current model
        // set selected to the currently selected model
        var selected = currMod;
        
        // Update center positions
        // center + translated
        var pos = round( selected.center[0] + selected.trans[0] ); // calculate
        document.getElementById("x_pos").innerHTML = pos; // update x
        pos = round( selected.center[1] + selected.trans[1] ); // calculate
        document.getElementById("y_pos").innerHTML = pos; // update y
        pos = round( selected.center[2] + selected.trans[2] ); // calculate
        document.getElementById("z_pos").innerHTML = pos; // update z
        
        // Update lighting vars
        document.getElementById("amb_wt").innerHTML = selected.lighting.amb_wt[0]; // update ambient
        document.getElementById("diff_wt").innerHTML = selected.lighting.diff_wt[0]; // update diffuse
        document.getElementById("spec_wt").innerHTML = selected.lighting.spec_wt[0]; // update specular
        document.getElementById("shine").innerHTML = selected.lighting.n; // update shininess coefficient
    } else { // don't render
        // Update center positions
        document.getElementById("x_pos").innerHTML = "N/A"; // update x
        document.getElementById("y_pos").innerHTML = "N/A"; // update y
        document.getElementById("z_pos").innerHTML = "N/A"; // update z
        
        // Update lighting vars
        document.getElementById("amb_wt").innerHTML = "N/A"; // update ambient
        document.getElementById("diff_wt").innerHTML = "N/A"; // update diffuse
        document.getElementById("spec_wt").innerHTML = "N/A"; // update specular
        document.getElementById("shine").innerHTML = "N/A"; // update shininess coefficient
    }
} // end loadHTMLText

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {
    
    // Make key actions
    document.onkeydown = keyPress; // when key pressed, do
    
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        }
    } // end try
    
    catch(e) {
        console.log(e);
    } // end catch
    
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inTri = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
    
    if (inTri != String.null) {
        for (var triSet=0; triSet<inTri.length; triSet++) {
            // set up vars per triangle set
            // Center
            inTri[triSet].center = vec3.fromValues( 0, 0, 0 );
            // translation
            inTri[triSet].trans = vec3.fromValues( 0, 0, 0 );
            // selected
            inTri[triSet].selected = false;
            // scale
            inTri[triSet].scale = vec3.fromValues( 1, 1, 1 );
            // lighting
            inTri[triSet].lighting = [];
            inTri[triSet].lighting.amb_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
            inTri[triSet].lighting.diff_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
            inTri[triSet].lighting.spec_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
            inTri[triSet].lighting.n = inTri[triSet].material.n; // specular coefficient
            // Data for WebGl
            inTri[triSet].glData = [];
            inTri[triSet].glData.vtxs = []; // hold vertices for triangle set
            inTri[triSet].glData.norms = []; // hold normals for triangle set
            inTri[triSet].glData.idxs = []; // hold indices for triangle set
            
            // loop through for vertex data
            // assume perfect file
            var vtxsInTri = inTri[triSet].vertices.length;
            for ( var vtx = 0; vtx < vtxsInTri; vtx++ ) { // for every vertex in triangle
                // for readability
                var currVtx = inTri[triSet].vertices[vtx]; // current vtx
                var currNorm = inTri[triSet].normals[vtx]; // current norm
                // push given data to a buffer for webGL
                inTri[triSet].glData.vtxs.push( currVtx[0], currVtx[1], currVtx[2] ); // push vtxs to webGL buff
                inTri[triSet].glData.norms.push( currNorm[0], currNorm[1], currNorm[2] ); // push vtxs to webGL buff
                // calculate center
                // Center = ( center + all_vtxs ) / numVtxs
                // summation
                // vec3.add( dest, op1, op2 )
                vec3.add( inTri[triSet].center, inTri[triSet].center, currVtx );
            }
            // divide - no divide, so multiply by inverse
            // vec3.scale( dest, vec, val )
            vec3.scale( inTri[triSet].center, inTri[triSet].center, ( 1 / vtxsInTri ) );
            // console.log( inTri[triSet].center ); // log to ensure correctness
            
            // loop through triangle idxs
            for (var idx = 0; idx < inTri[triSet].triangles.length; idx++ ) {
                // for readability
                var currTri = inTri[triSet].triangles[idx]; // current idx
                // push to buffer for webGL
                inTri[triSet].glData.idxs.push( currTri[0], currTri[1], currTri[2] );
            }
            
            // Send everything to webGL
            // send the vertex coords to webGL
            vertexBuffer[triSet] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[triSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inTri[triSet].glData.vtxs),gl.STATIC_DRAW); // coords to that buffer
            
            // send normals to WebGL
            normBuffer[triSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer[triSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inTri[triSet].glData.norms), gl.STATIC_DRAW);
            
            // send the triangle indices to webGL
            triangleBuffer[triSet] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[triSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inTri[triSet].glData.idxs),gl.STATIC_DRAW); // indices to that buffer
            
            // console.log( inTri[triSet] );
        } // end for each triangle set
        
        // make makeEllipsoid
        function makeEllipsoid( ex, ey, ez, ea, eb, ec ) {
            // convention for arguments: Ellipsoid (e) then attribute
            var latBands = longBands = 40; // same number of slices and cuts
            var numVtx = ( latBands + 1 ) * ( longBands + 1 );
            
            var usVertices = []; // vertices of the ellipsoid
            var usNormals = []; // normals of the ellispoid
            var usIndices = []; // indices for the ellipsoid
            
            // going around the sphere, so need to end where we started, not before
            for ( var lat = 0; lat <= latBands; lat++ ) {
                // using method of calculation where:    (transform)
                //    x = ea * sin( theta ) * cos( phi ) + ex
                //    y = eb * cos( theta )              + ey
                //    z = ec * sin( theta ) * sin( phi ) + ez
                
                // need theta (and the sin and cos versions to save time later)
                var theta = lat * Math.PI / latBands;
                var sinTheta = Math.sin( theta );
                var cosTheta = Math.cos( theta );
                
                // For each band, make a "cake" slice
                // again, want an overlap
                for ( var long = 0; long <= longBands; long++ ) {
                    // need phi (and the sin and cos versions to save time later)
                    var phi = long * 2 * Math.PI / longBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);
                    
                    // calculate position of surface
                    var x = ea * cosPhi * sinTheta;
                    var y = eb * cosTheta;
                    var z = ec * sinPhi * sinTheta;
                    
                    // calculate magnitude
                    var mag = Math.sqrt( x*x + y*y + z*z );
                    
                    //                    console.log( "x: " + x + "\ny: " + y + "\nz: " + z + "\nmag: " + mag +
                    //                                "\nux: " + x/mag + "\nuy: " + y/mag + "\nuz: " + z/mag );
                    
                    usVertices.push( x+ex, y+ey, z+ez ); // push the vertices onto the vertex array
                    usNormals.push( x/mag, y/mag, z/mag ); // push the normals onto the normal array
                } // end for long
            } // end for lat
            
            // make the data for indexing
            for ( var lat = 0; lat < latBands; lat++ ) {
                for ( var long = 0; long < longBands; long++ ) {
                    var a = ( lat * ( longBands + 1 ) ) + long;
                    var b = a + longBands + 1;
                    
                    // add triangles in a polar rectangle
                    // triangle 1
                    usIndices.push(a);
                    usIndices.push(b);
                    usIndices.push(a + 1);
                    
                    // tirangle 2
                    usIndices.push(b);
                    usIndices.push(b + 1);
                    usIndices.push(a + 1);
                } // end for long
            } // end for lat
            
            // return the unit sphere data
            return ( { vertices: usVertices,
                    normals: usNormals,
                    indices: usIndices } );
        } // end make ellipsoid
        
        // get JSON
        inEll = getJSONFile(INPUT_ELLIPSOIDS_URL,"ellipsoids");
        
        if (inEll != String.null) {
            
            for ( var i = 0; i < inEll.length; i++ ) {
                // get ref to current ellipsoid
                var currEll = inEll[ i ];
                
                // set up vars per ellipsoid set
                // Center
                currEll.center = vec3.fromValues( currEll.x, currEll.y, currEll.z );
                // translation
                currEll.trans = vec3.fromValues( 0, 0, 0 );
                // selected
                currEll.selected = false;
                // scale
                currEll.scale = vec3.fromValues( 1, 1, 1 );
                // lighting
                currEll.lighting = [];
                currEll.lighting.amb_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
                currEll.lighting.diff_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
                currEll.lighting.spec_wt = [ DEF_WT, DEF_WT, DEF_WT ]; // weights of light components
                currEll.lighting.n = currEll.n; // specular coefficient
                // Data for WebGl
                currEll.glData = [];
                currEll.glData.vtxs = []; // hold vertices for ellipsoid set
                currEll.glData.norms = []; // hold normals for ellipsoid set
                currEll.glData.idxs = []; // hold indices for ellipsoid set
                
                // make new unit sphere, and send x, y, z, a, b, c to function
                var ellipsoid = makeEllipsoid( currEll.x, // send x
                                              currEll.y, // send y
                                              currEll.z, // send z
                                              currEll.a, // send a
                                              currEll.b, // send b
                                              currEll.c ); // send c
                
                // TODO vtxs, norms, idxs
                currEll.glData = [];
                currEll.glData.vtxs = ellipsoid.vertices; // vtx data
                currEll.glData.norms = ellipsoid.normals; // norm data
                currEll.glData.idxs = ellipsoid.indices; // idx data
                
                // This idx is number of triangles + i
                var thisIdx = inTri.length + i;
                
                // TODO Add to buffers
                // Send everything to webGL
                // send the vertex coords to webGL
                vertexBuffer[thisIdx] = gl.createBuffer(); // init empty vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[thisIdx]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currEll.glData.vtxs),gl.STATIC_DRAW); // coords to that buffer
                
                // send normals to WebGL
                normBuffer[thisIdx] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer[thisIdx]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(currEll.glData.norms), gl.STATIC_DRAW);
                
                // send the triangle indices to webGL
                triangleBuffer[thisIdx] = gl.createBuffer(); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[thisIdx]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(currEll.glData.idxs),gl.STATIC_DRAW); // indices to that buffer
                
                // Logging for info
                // console.log( currEll );
            } // end for each ellipsoid
        } // end if ellipsoids found
    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
    
    precision mediump float;
    
    uniform vec3 uEye;
    
    uniform vec3 uLightPos;
    uniform vec3 uLightAmb;
    uniform vec3 uLightDiff;
    uniform vec3 uLightSpec;
    uniform int uPhong; // Here 0 is Phong, acts as a boolean
    
    // triangle set specific colors
    uniform vec3 uAmb;
    uniform vec3 uDiff;
    uniform vec3 uSpec;
    uniform float uShine;

    // Lighting weights per triangle set
    uniform vec3 uAmbWt;
    uniform vec3 uDiffWt;
    uniform vec3 uSpecWt;
    
    varying vec3 vWorldPos; // world xyz of fragment
    varying vec3 vVtxNorm; // normal of fragment
    
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // all fragments are white
        
        // L = light minus point
        vec3 l = normalize( uLightPos - vWorldPos );
        
        // N = point minus center
        vec3 n = normalize( vVtxNorm );
        
        // V = eye minus point
        vec3 v = normalize( uEye - vWorldPos );
        
        float ndotl = max( 0.0, dot( n, l ) );
        
        vec3 amb = uAmb * uLightAmb; // amb_light * amb_object
        vec3 diff = uDiff * uLightDiff * ndotl; // amb_light * amb_obj * ( N dot L )
        
        // leave off the scaling factor
        vec3 spec = uSpec * uLightSpec;
        
        // if blinn-phong (phong == 1)
        if ( uPhong == 1 ) { // Blinn-Phong
            vec3 h = normalize( l + v );
            spec *= pow( max( 0.0, dot( n, h ) ), uShine );
        } else { // Phong
            // calculate the specular if the diffuse term is positive
            if ( dot( n, l ) > 0.0 ) {
                vec3 r = normalize( reflect( -l, n ) );
                spec *= pow( max( 0.0, dot( r, v ) ), uShine );
            } else { // end if specular positive
                spec = vec3( 0.0, 0.0, 0.0 );
            } // end else
        } // end if
        // all times user defined weights
        amb *= uAmbWt;
        diff *= uDiffWt;
        spec *= uSpecWt;
        
        gl_FragColor = vec4( ( amb + diff + spec ), 1.0 ); // set the color of the vertex to the color we defined
    }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    
    // for each fragment
    varying vec3 vWorldPos;
    varying vec3 vVtxNorm;
    
    void main(void) {
        // gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); // use the transformed position
        
        // vertex position
        vec4 vWorldPos4 = uMVMatrix * vec4(aVertexPosition, 1.0);
        vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
        gl_Position = uPMatrix * vec4(aVertexPosition, 1.0);
        
        // vertex normal (assume no non-uniform scale)
        vec4 vWorldNorm4 = uMVMatrix * vec4(aVertexNormal, 0.0);
        vVtxNorm = normalize(vec3(vWorldNorm4.x,vWorldNorm4.y,vWorldNorm4.z));
        
//        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); // use the transformed position
    }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution
        
        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
        
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context
            
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locations of vertex position
                vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // get pointer to vertex shader input
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                
                // get surface normals
                shaderProgram.vertexNormal = gl.getAttribLocation(shaderProgram, "aVertexNormal");
                gl.enableVertexAttribArray(shaderProgram.vertexNormal);
                
                // Get locations of the uniforms
                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                
                // Get locations of light uniforms
                shaderProgram.lightPos = gl.getUniformLocation(shaderProgram, "uLightPos");
                shaderProgram.lightAmb = gl.getUniformLocation(shaderProgram, "uLightAmb");
                shaderProgram.lightDiff = gl.getUniformLocation(shaderProgram, "uLightDiff");
                shaderProgram.lightSpec = gl.getUniformLocation(shaderProgram, "uLightSpec");
                shaderProgram.lightPhong = gl.getUniformLocation(shaderProgram, "uPhong");
                // set light uniforms
                gl.uniform3fv(shaderProgram.lightPos, lightPos);
                gl.uniform3fv(shaderProgram.lightAmb, lightAmb);
                gl.uniform3fv(shaderProgram.lightDiff, lightDiff);
                gl.uniform3fv(shaderProgram.lightSpec, lightSpec);
                
                // pointers to material uniforms
                shaderProgram.amb = gl.getUniformLocation(shaderProgram, "uAmb");
                shaderProgram.diff = gl.getUniformLocation(shaderProgram, "uDiff");
                shaderProgram.spec = gl.getUniformLocation(shaderProgram, "uSpec");
                shaderProgram.shine = gl.getUniformLocation(shaderProgram, "uShine");
                
                // pointers to light weights for objects
                shaderProgram.ambWt = gl.getUniformLocation(shaderProgram, "uAmbWt");
                shaderProgram.diffWt = gl.getUniformLocation(shaderProgram, "uDiffWt");
                shaderProgram.specWt = gl.getUniformLocation(shaderProgram, "uSpecWt");
                
                // Get location of eye uniform
                shaderProgram.eye = gl.getUniformLocation(shaderProgram, "uEye");
                // set Eye uniforms
                gl.uniform3fv(shaderProgram.eye, Eye);
                
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    
    function transform( model ) {
        if ( model != null ) {
            
            var scale = model.scale;
            var rot = model.axis;
            var noRotation = mat4.create();
            mat4.set( noRotation,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 1 );
            if ( model.selected == true ) {
                // scale if selected
                scale = vec3.fromValues( 1.2, 1.2, 1.2 );
            } // end if selected
            // fromRotationTranslationScaleOrigin(out(m4), rot_quaternion(m4), trans(v3), scale(v3), origin to scale around(v3))
             mat4.fromRotationTranslationScaleOrigin( mMatrix, noRotation, model.trans, scale, model.center ); // no rotation
        } // end if selected not null
    } // end transform
    
    // re-render frame
    window.requestAnimationFrame(renderTriangles);
    
    // re-render text
    loadHTMLText();
    
    // matrices for viewing and transformations
    var hMatrix = mat4.create(); // Handedness (to fix neg x)
    var pMatrix = mat4.create(); // Projection
    var vMatrix = mat4.create(); // View
    var mMatrix = mat4.create(); // Model
    var hpvMatrix = mat4.create(); // Hand * Projection * View
    var hpvmMatrix = mat4.create(); // Hand * Projection * View * Model
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // handedness matrix
    mat4.fromScaling( hMatrix, vec3.fromValues( -1, 1, 1 ) );
    // Set the perspective
    var canvas = document.getElementById("myWebGLCanvas");
    mat4.perspective( pMatrix, Math.PI/2, canvas.width / canvas.height, 0.1, 100.0 );
    // set view
    mat4.lookAt( vMatrix, Eye, Center, Up );
    // hand * proj -> hpv (intermediary)
    mat4.multiply( hpvMatrix, hMatrix, pMatrix );
    // hand * proj * view -> hpv
    mat4.multiply( hpvMatrix, hpvMatrix, vMatrix );
    
    // for each triangle set
    for ( var i = 0; i < inTri.length; i++ ) {
        // var to current triangle set for readability
        var currTri = inTri[i];
        
        // do transformations
        transform( currTri );
        // hand * proj * view * model
        mat4.multiply( hpvmMatrix, hpvMatrix, mMatrix );
        // set matrix uniforms
        gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mMatrix );
        gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, hpvmMatrix );
        
        // pass in uniforms
        // material
        gl.uniform3fv( shaderProgram.amb, currTri.material.ambient );
        gl.uniform3fv( shaderProgram.diff, currTri.material.diffuse );
        gl.uniform3fv( shaderProgram.spec, currTri.material.specular );
        gl.uniform1f( shaderProgram.shine, currTri.lighting.n );
        // light weights
        gl.uniform3fv( shaderProgram.ambWt, currTri.lighting.amb_wt );
        gl.uniform3fv( shaderProgram.diffWt, currTri.lighting.diff_wt );
        gl.uniform3fv( shaderProgram.specWt, currTri.lighting.spec_wt );
        // specular lighting calculation can vary
        gl.uniform1i(shaderProgram.lightPhong, ltMod);
        
        // pass in vtx, norm data
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[i]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normBuffer[i]); // activate
        gl.vertexAttribPointer(shaderProgram.vertexNormal,3,gl.FLOAT,false,0,0); // feed
        
        // pass in idx data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer[i]); // activate
        gl.drawElements(gl.TRIANGLES,inTri[i].glData.idxs.length,gl.UNSIGNED_SHORT,0); // render
    } // end for each triangle
    
    
    // for each ellipsoid set
    for ( var i = 0; i < inEll.length; i++ ) {
        // add length of tri array so idxng is easy
        var numTris = inTri.length;
        var thisBuffIdx = numTris + i; // add number of tris to i
        // var to current triangle set for readability
        var currEll = inEll[i];
        
        // do transformations
        transform( currEll );
        // hand * proj * view * model
        mat4.multiply( hpvmMatrix, hpvMatrix, mMatrix );
        // set matrix uniforms
        gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mMatrix );
        gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, hpvmMatrix );
        
        // pass in uniforms
        // material
        gl.uniform3fv( shaderProgram.amb, currEll.ambient );
        gl.uniform3fv( shaderProgram.diff, currEll.diffuse );
        gl.uniform3fv( shaderProgram.spec, currEll.specular );
        gl.uniform1f( shaderProgram.shine, currEll.lighting.n );
        // light weights
        gl.uniform3fv( shaderProgram.ambWt, currEll.lighting.amb_wt );
        gl.uniform3fv( shaderProgram.diffWt, currEll.lighting.diff_wt );
        gl.uniform3fv( shaderProgram.specWt, currEll.lighting.spec_wt );
        // specular lighting calculation can vary
        gl.uniform1i(shaderProgram.lightPhong, ltMod);
        
        // pass in vtx, norm data
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[thisBuffIdx]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normBuffer[thisBuffIdx]); // activate
        gl.vertexAttribPointer(shaderProgram.vertexNormal,3,gl.FLOAT,false,0,0); // feed
        
        // pass in idx data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer[thisBuffIdx]); // activate
        gl.drawElements(gl.TRIANGLES,inEll[i].glData.idxs.length,gl.UNSIGNED_SHORT,0); // render
    } // end for each ellipsoid
} // end render triangles

/* MAIN -- HERE is where execution begins after window load */

function main() {
    
    setupWebGL(); // set up the webGL environment
    loadTriangles(); // load in the triangles from tri file
    setupShaders(); // setup the webGL shaders
    renderTriangles(); // draw the triangles using webGL
    loadHTMLText(); // on load, render the text in the HTML
    
} // end main

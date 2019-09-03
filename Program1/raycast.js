///////////////
//  classes  //
///////////////

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor
    
    // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
    
    // Adjusts any negative color component to be 0 and pos to be 255
    fixColor() {
        if ( this.r < 0 )
            this.r = 0;
        if ( this.g < 0 )
            this.g = 0;
        if ( this.b < 0 )
            this.b = 0;
        if ( this.r > 255 )
            this.r = 255;
        if ( this.g > 255 )
            this.g = 255;
        if ( this.b > 255 )
            this.b = 255;
    } // end fix color
} // end color class

// Eye class
class Eye {
    constructor( pos, vuv, lav ) {
        try {
            if ( !( pos instanceof Point ) )
                throw "eye component not a Point";
            if ( !( vuv instanceof Vector ) || !( lav instanceof Vector ) )
                throw "eye component not a Vector";
            else {
                this.pos = pos; this.vuv = vuv; this.lav = lav;
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Eye constructor
} // end Eye class

// Point class
class Point {
    constructor( x, y, z ) {
        try {
            if ( ( typeof( x ) !== "number" ) || ( typeof( y ) !== "number" ) || ( typeof( z ) !== "number" ) )
                throw "point location not a number";
            else
                this.x = x; this.y = y; this.z = z;
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Point constructor
} // end Point class

// Vector class - uses sqrt function from Math library
class Vector {
    constructor( x, y, z ) {
        try {
            if ( ( typeof( x ) !== "number" ) || ( typeof( y ) !== "number" ) || ( typeof( z ) !== "number" ) )
                throw "vector direction not a number";
            else
                this.x = x; this.y = y; this.z = z;
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Vector constructor
    
    normalize() {
        // Calculate magnitude of length
        var mag = Math.sqrt( ( this.x * this.x ) + ( this.y * this.y ) + ( this.z * this.z ) );
        
        // div each component by magnitude
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    } // end normalize method
} // end Vector class

// Frame class
class Frame {
    constructor( c, d ) {
        try {
            if ( !( c instanceof Point ) )
                throw "frame component not a Point";
            else if ( typeof( d ) !== "number" )
                throw "eye component not a number";
            else {
                this.center = c; this.distance = d;
            }
            
            // set the corners
            this.minXYPlane = new Point( 0, 0, 0 );
            this.maxXYPlane = new Point( 1, 1, 0 );
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Frame constructor
} // end Frame class

/////////////////////////
//  utility functions  //
/////////////////////////

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel

// get the input spheres from the standard class URL
function getInputSpheres() {
        const INPUT_SPHERES_URL =
        "https://ncsucgclass.github.io/prog1/spheres.json";
    
    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
} // end get input spheres

// get the input lights from the standard class URL
function getInputLights() {
    const INPUT_LIGHTS_URL =
    "https://ncsucgclass.github.io/prog1/lights.json";
    
    // load the lights file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_LIGHTS_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input lights file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
} // end get input lights

///////////////////////////
//  Ray Trace Functions  //
///////////////////////////

// Determines the dot product
function dotProd( v1, v2 ) {
    try {
        if ( !( v1 instanceof Vector ) || !( v2 instanceof Vector ) )
            throw "vector not a vector";
        
        // Perform dot product calculation
        return ( v1.x * v2.x ) + ( v1.y * v2.y ) + ( v1.z * v2.z );
    } // end try
    
    catch (e) {
        console.log(e);
    }
} // end dot method

// calculate the discriminant - Returns the value of the discriminant
function discriminant( a, b, c ) {
    // discriminant = ( b * b ) - ( 4 * a * c )
    return ( b * b ) - ( 4 * a * c );
} // end discriminant

// calculate the roots of the equation
// uses sqrt function from Math library
// returns smallest root, or -1 if no roots
function quadratic( a, b, c ) {
    try {
        if ( ( typeof( a ) !== "number" ) || ( typeof( b ) !== "number" ) || ( typeof( c ) !== "number" ) )
            throw "quadratic input must be a number";
    } // end try
    
    catch (e) {
        console.log(e);
    }
    
    // Get the discriminant
    var d = discriminant( a, b, c );
    
    // if the discriminant is greater than or equal to 0, there are intersections
    if ( d >= 0 ) {
        // 2a
        var a2 = a * 2
        
        // sqrt of discriminant
        var s = Math.sqrt( d );
        
        // if discriminant is 0, there is one root. return it
        if ( d == 0 ) {
            return ( -1 * b + s ) / a2;
        }
        // Otherwise, calculate both roots, and return the lesser
        else {
            // the roots
            var x1 = ( -1 * b + s ) / a2;
            var x2 = ( -1 * b - s ) / a2;
            
            // return the smaller
            return ( x1 < x2 ) ? x1 : x2;
        } // end else/if
    } else {
        // no intersection, return -1
        return -1;
    } // end if ( d >= 0 )
} // end quadratic

// Sets up the dot product stuff for the quadratic equation
// Returns the result of the quadratic equation
function intersects( c, e, d, r ) {
    var ec = new Vector( e.x - c.x,
                        e.y - c.y,
                        e.z - c.z );
    
    // Set up a, b, and c
    var a = dotProd( d, d );
    var b = 2 * dotProd( d, ec );
    var c = dotProd( ec, ec ) - ( r * r );
    
    // Return what quadratic returns
    return quadratic( a, b, c );
} // end intersects

// Determines if the point will be in shadow
// Returns true if there is a shadow
function shadow( light, spheres, point, s ) {
    // define ray: light -> pixel
    var ray = new Vector( point.x - light.x,
                         point.y - light.y,
                         point.z - light.z );
    
    // Check every sphere for an intersection.
    for ( var i = 0; i < spheres.length; i++ ) {
        // If not checking intersection with current sphere
        if ( i !== s ) {
            // Define variable for center of sphere
            var c = new Point( spheres[ i ].x,
                              spheres[ i ].y,
                              spheres[ i ].z );
            
            var shad = intersects( c, light, ray, spheres[ i ].r );
            
            // ask if the ray intersects
            // intersection noted if result is greater than or equal to 1
            if ( shad >= 0 && shad < 1 ) {
                // There was an intersection. break out
                return true;
            }
        }
    } // end for spheres
    
    // There is no shadow on this point
    return false;
} // end function shadow

// Calculates the ambient light on the model
// Returns a Color object with the normalized values
function calcAmbient( spheres, lights, s ) {
    // Initialize color object
    var color = new Color( 0, 0, 0, 0 );
    
    // Summate the ambient light
    for ( var i = 0; i < lights.length; i++ ) {
        color.r += lights[ i ].ambient[ 0 ] * spheres[ s ].ambient[ 0 ] * 255;
        color.g += lights[ i ].ambient[ 1 ] * spheres[ s ].ambient[ 1 ] * 255;
        color.b += lights[ i ].ambient[ 2 ] * spheres[ s ].ambient[ 2 ] * 255;
    } // end for lights
    
    // Fix the colors to be 0 or greater
    color.fixColor();
    
    // return the color
    return color;
} // end calc ambient

// Calculates the diffuse light on the model
// Returns a Color object with the normalized values
function calcDiffuse( spheres, lights, s, n, point ) {
    // Initialize color object
    var color = new Color( 0, 0, 0, 0 );
    
    // For each light
    for ( var i = 0; i < lights.length; i++ ) {
        // If not in shadow, do
        if ( !shadow( lights[ i ], spheres, point, s ) ) {
            // Need L
            var l = new Vector( lights[ i ].x - point.x,
                               lights[ i ].y - point.y,
                               lights[ i ].z - point.z );
            // Normalize L
            l.normalize();
            // dot product
            var ndotl = dotProd( n, l );
            // calculation
            color.r += lights[ i ].diffuse[ 0 ] * spheres[ s ].diffuse[ 0 ] * ndotl * 255;
            color.g += lights[ i ].diffuse[ 1 ] * spheres[ s ].diffuse[ 1 ] * ndotl * 255;
            color.b += lights[ i ].diffuse[ 2 ] * spheres[ s ].diffuse[ 2 ] * ndotl * 255;
        } // end if shadow
    } // end for lights
    
    // Fix the colors to be 0 or greater
    color.fixColor();
    
    // return the color
    return color;
} // end calc diffuse

// Calculates the Blinn-Phong Specular light on the model
// Returns a Color object with the normalized values
function calcBlinnPhong( spheres, lights, s, n, v, point, eyeLoc ) {
    // Initialize color object
    var color = new Color( 0, 0, 0, 0 );
    
    // For each light
    for ( var i = 0; i < lights.length; i++ ) {
        // If not in shadow, do
        if ( !shadow( lights[ i ], spheres, point, s ) ) {
            // Need L
            var l = new Vector( lights[ i ].x - point.x,
                               lights[ i ].y - point.y,
                               lights[ i ].z - point.z );
            // Normalize L
            l.normalize();
            
            // Vector H is halfway between L and V
            var h = new Vector( ( l.x + v.x ) / 2,
                               ( l.y + v.y ) / 2,
                               ( l.z + v.z ) / 2 )
            
            // Normalize H
            h.normalize();
            
            // dot product
            var ndoth = dotProd( n, h );
            
            // The parenthesis and exponent
            var mult = Math.pow( ndoth, spheres[ s ].n );
            
            // calculation
            color.r += lights[ i ].specular[ 0 ] * spheres[ s ].specular[ 0 ] * mult * 255;
            color.g += lights[ i ].specular[ 1 ] * spheres[ s ].specular[ 1 ] * mult * 255;
            color.b += lights[ i ].specular[ 2 ] * spheres[ s ].specular[ 2 ] * mult * 255;
        } // end if shadow
    } // end for lights
    
    // Fix the colors to be 0 or greater
    color.fixColor();
    
    // return the color
    return color;
} // end calc specular

// Calculates the color for the pixel
// Returns color
function calcColor( eye, ref, spheres, lights, r, numRecursions ) {
    const ITERATIONS = 1;
    const REFLECTIVITY = 0.9;
    // Temp instance of Color
    var color = new Color( 0, 0, 0, 255 );
    
    // recurse number of times specified
    if ( numRecursions < ITERATIONS ) {
        // Calculate the color at this point
        // the farthest a point can be
        var closest = Number.MAX_SAFE_INTEGER;
        
        // For each object in scene:
        for ( var s = 0; s < spheres.length; s++ ) {
            // Define variable for center of sphere
            var c = new Point( spheres[ s ].x,
                              spheres[ s ].y,
                              spheres[ s ].z );
            
            // ask if the ray intersects
            var temp = intersects( c, eye, r, spheres[ s ].r )
            // ask if the ray intersects
            if ( temp >= 0 && temp < closest ) {
                // update closest
                closest = temp;
                
                // Use this to find the intersection in space
                var currentPoint = new Point( eye.x + ( ref.x - eye.x ) * closest,
                                             eye.y + ( ref.y - eye.y ) * closest,
                                             eye.z + ( ref.z - eye.z ) * closest );
                
                // Need N
                var n = new Vector( currentPoint.x - spheres[ s ].x,
                                   currentPoint.y - spheres[ s ].y,
                                   currentPoint.z - spheres[ s ].z );
                // Normalize N
                n.normalize();
                
                // Need V
                var v = new Vector( eye.x - currentPoint.x,
                                   eye.y - currentPoint.y,
                                   eye.z - currentPoint.z );
                // Normalize V
                v.normalize();
                
                // define newr: -2 * N * ( V dot N ) + V
                var paren = dotProd( v, n );
                var newr = new Vector( -2 * n.x * paren + v.x,
                                      -2 * n.y * paren + v.y,
                                      -2 * n.z * paren + v.z );
                
                // Pick any point on the new ray to be the ref point
                var newRef = new Point( newr.x, newr.y, newr.z );
                
                // Calculate the components of the color
                var amb = calcAmbient( spheres, lights, s );
                var diff = calcDiffuse( spheres, lights, s, n, currentPoint );
                var spec = calcBlinnPhong( spheres, lights, s, n, v, currentPoint, eye );
                
                // Set the color after calculating the components
                var red = amb.r + diff.r + spec.r;
                var green = amb.g + diff.g + spec.g;
                var blue = amb.b + diff.b + spec.b;
                
                // Change the color
                color.change( ( red > 255 ) ? 255 : red,
                             ( green > 255 ) ? 255 : green,
                             ( blue > 255 ) ? 255 : blue,
                             255 );
                
                // The actual recurrsion
                var nextColor = calcColor( currentPoint, newRef, spheres, lights, newr, numRecursions + 1 );
                
                // Add the colors
                color.r += nextColor.r * REFLECTIVITY;
                color.g += nextColor.g * REFLECTIVITY;
                color.b += nextColor.b * REFLECTIVITY;
            } // end if intersects
        } // end for spheres
        
        // Return the color
        return color;
    } else {
        // Return black. End of recursion
        return new Color( 0, 0, 0, 255 );
    } // end else
} // end function calcColor

// performes the raytrace
function raytrace( context, eye, frame ) {
    var inputSpheres = getInputSpheres();
    var inputLights = getInputLights();
    var width = context.canvas.width;
    var height = context.canvas.height;
    var imagedata = context.createImageData( width, height );
    
    // Increment steps
    var widthInc = 1 / ( width - 1 );
    var heightInc = 1 / ( height - 1 );
    
    // Locate pixels of frame
    for ( var j = 0; j < height; j++ ) {
        for ( var i = 0; i < width; i++ ) {
            // Find the pixel represented by this spot in the map
            var currentPixel = new Point( frame.minXYPlane.x + ( i * widthInc ),
                                         frame.maxXYPlane.y - ( j * heightInc ),
                                         frame.minXYPlane.z );
            
            // define ray: eye -> pixel
            var ray = new Vector( currentPixel.x - eye.pos.x,
                                 currentPixel.y - eye.pos.y,
                                 currentPixel.z - eye.pos.z );
            
            var color = calcColor( eye.pos, currentPixel, inputSpheres, inputLights, ray, 0 );
            drawPixel( imagedata, i, j, color );
            
        } // end for width
    } // end for height
    context.putImageData(imagedata, 0, 0);
} // end for raytrace

////////////////////////////////////////////////////////////////
//  main -- here is where execution begins after window load  //
////////////////////////////////////////////////////////////////

function main() {
    
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    
    // Create the image
    
    // Locate eye
    var eye = new Eye( new Point( 0.5, 0.5, -0.5 ), // Eye Location
                      new Vector( 0, 1, 0 ), // View Up Vector
                      new Vector( 0, 0, 1 ) // Look At Vector
                      );
    
    // Locate corners
    var frame = new Frame( new Point( 0.5, 0.5, 0 ), // Frame center
                          0.5 // distance to Eye
                          );
    
    raytrace( context, eye, frame );
}
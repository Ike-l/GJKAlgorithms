class Mesh {
    constructor(modelMatrix) {
        this.ModelMatrix = modelMatrix
        this.VertexPositions = this.GenerateVertexPositions()

        this.WorldPositions = this.GenerateWorldPositions()
    }
    GenerateWorldPositions() {
        return this.TransformVertices(this.VertexPositions, this.ModelMatrix)
    }
    TransformVertices(vertices, modelMatrix) {
        const transformedVertices = []
        for (let i = 0; i < vertices.length / 3; i += 3) {
            let worldVertex = vec3.create()
            let position = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])
            vec3.transformMat4(worldVertex, position, modelMatrix)
            transformedVertices.push(worldVertex)
        }
        return transformedVertices
    }
}
class Cube extends Mesh {
    constructor(modelMatrix) {
        super(modelMatrix)
    }
    GenerateVertexPositions() {
        const positions = []

        positions.push(-0.5, 0.5, -0.5)
        positions.push(-0.5, -0.5, -0.5)
        positions.push(0.5, 0.5, -0.5)
        positions.push(0.5, -0.5, -0.5)

        positions.push(-0.5, 0.5, 0.5)
        positions.push(-0.5, -0.5, 0.5)
        positions.push(0.5, 0.5, 0.5)
        positions.push(0.5, -0.5, 0.5)

        positions.push(-0.5, 0.5, 0.5)
        positions.push(-0.5, -0.5, 0.5)
        positions.push(-0.5, 0.5, -0.5)
        positions.push(-0.5, -0.5, -0.5)

        positions.push(0.5, 0.5, -0.5)
        positions.push(0.5, -0.5, -0.5)
        positions.push(0.5, 0.5, 0.5)
        positions.push(0.5, -0.5, 0.5)

        positions.push(-0.5, 0.5, -0.5)
        positions.push(0.5, 0.5, -0.5)
        positions.push(-0.5, 0.5, 0.5)
        positions.push(0.5, 0.5, 0.5)

        positions.push(-0.5, -0.5, 0.5)
        positions.push(-0.5, -0.5, -0.5)
        positions.push(0.5, -0.5, 0.5)
        positions.push(0.5, -0.5, -0.5)

        return positions
    }
}

class Simplex {
    constructor() {
        this.A = []
        this.B = []
        this.C = []
        this.D = []

        this.count = 1
    }
    get a() {
        return this.A
    }
    set a(a) {
        this.A[0] = a[0]
        this.A[1] = a[1]
        this.A[2] = a[2]
    }
    get b() {
        return this.B
    }
    set b(b) {
        this.B[0] = b[0]
        this.B[1] = b[1]
        this.B[2] = b[2]
    }
    get c() {
        return this.C
    }
    set c(c) {
        this.C[0] = c[0]
        this.C[1] = c[1]
        this.C[2] = c[2]
    }
    get d() {
        return this.D
    }
    set d(d) {
        this.D[0] = d[0]
        this.D[1] = d[1]
        this.D[2] = d[2]
    }
}
const equalsCheck = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
}

// Support
function sameDirection(vec1, vec2) {
    return vec3.dot(vec1, vec2) > 0
}
function getSupport(vertices, direction) {
    let largestDot = vec3.dot(vertices[0], direction)
    let largestVertex = vertices[0]
    for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i]
        const currentDot = vec3.dot(vertex, direction)
        if (currentDot > largestDot) {
            largestDot = currentDot
            largestVertex = vertex
        }
    }
    return largestVertex
}
// Simplex
function solveSimplexLine(simplex) {
    const ab = vec3.create()
    const ao = vec3.create()

    vec3.subtract(ab, simplex.b, simplex.a)
    vec3.subtract(ao, vec3.create(), simplex.a)

    if (sameDirection(ab, ao)) {
        const cross1 = vec3.create()
        const cross2 = vec3.create()
        vec3.cross(cross1, ab, ao)
        vec3.cross(cross2, cross1, ab)
        return cross2
    } else {
        simplex.count = 1
        return ao
    }
}
function solveSimplexTriangle(simplex, direction) {
    const abc = vec3.create()
    const ao = vec3.create()

    const subtract1 = vec3.create()
    const subtract2 = vec3.create()

    vec3.subtract(subtract1, simplex.b, simplex.a)
    vec3.subtract(subtract2, simplex.c, simplex.a)

    const ac = subtract2
    vec3.subtract(ao, vec3.create(), simplex.a)
    vec3.cross(abc, subtract1, subtract2)

    const cross1 = vec3.create()
    vec3.cross(cross1, abc, ac)
    if (sameDirection(cross1, ao)) {
        if (sameDirection(ac, ao)) {
            simplex.b = simplex.c
            simplex.count = 2
            const cross2 = vec3.create()
            const cross3 = vec3.create()
            vec3.cross(cross2, ac, ao)
            vec3.cross(cross3, cross2, ac)
            return cross3
        } else {
            const ab = subtract1
            if (sameDirection(ab, ao)) {
                simplex.count = 2
                const cross2 = vec3.create()
                const cross3 = vec3.create()
                vec3.cross(cross2, ab, ao)
                vec3.cross(cross3, cross2, ab)
                return cross3
            } else {
                simplex.count = 1
                return ao
            }
        }
    } else {
        const ab = subtract1
        const cross2 = vec3.create()
        vec3.cross(cross2, ab, ao)
        if (sameDirection(cross2, ao)) {
            if (sameDirection(ab, ao)) {
                simplex.count = 2
                const cross3 = vec3.create()
                vec3.cross(cross3, cross2, ab)
                return cross3
            } else {
                simplex.count = 1
                return ao
            }
        } else {
            if (sameDirection(abc, ao)) {
                return abc
            } else {
                const temp = simplex.b
                simplex.b = simplex.c
                simplex.c = temp
                const negativeAbc = vec3.create()
                vec3.subtract(negativeAbc, vec3.create(), abc)
                return negativeAbc
            }
        }
    }
}
function solveSimplexTetrahedron(simplex, direction) {
    const abc = vec3.create()
    const acd = vec3.create()
    const adb = vec3.create()
    const ao = vec3.create()

    const subtract1 = vec3.create()
    const subtract2 = vec3.create()
    const subtract3 = vec3.create()

    vec3.subtract(subtract1, simplex.b, simplex.a)
    vec3.subtract(subtract2, simplex.c, simplex.a)
    vec3.subtract(subtract3, simplex.d, simplex.a)

    vec3.cross(abc, subtract1, subtract2)
    vec3.cross(acd, subtract2, subtract3)
    vec3.cross(adb, subtract3, subtract1)

    vec3.subtract(ao, vec3.create(), simplex.a)

    if (sameDirection(abc, ao)) {
        simplex.count = 3
        return [false, solveSimplexTriangle(simplex, direction)]
    }
    if (sameDirection(acd, ao)) {
        simplex.b = simplex.c
        simplex.c = simplex.d
        simplex.count = 3
        return [false, solveSimplexTriangle(simplex, direction)]
    }
    if (sameDirection(adb, ao)) {
        simplex.c = simplex.b
        simplex.b = simplex.d
        simplex.count = 3
        return [false, solveSimplexTriangle(simplex, direction)]
    }
    return [true, [0, 0, 0]]
}
// GJK algorithm
function solveSimpleGJK(v1, v2) {
    const simplex = new Simplex()
    let direction = vec3.create()
    let negativeDirection = vec3.create()
    let aTemp = vec3.create()
    vec3.subtract(direction, v1[0], v2[0])
    vec3.subtract(negativeDirection, vec3.create(), direction)
    vec3.subtract(aTemp, getSupport(v2, direction), getSupport(v1, negativeDirection))
    simplex.a = aTemp
    vec3.subtract(direction, vec3.create(), simplex.a)
    let __Count = 0
    while (true) {
        __Count++
        if (__Count % 2500 == 0) {
            break
        }
        simplex.d = simplex.c
        simplex.c = simplex.b
        simplex.b = simplex.a

        simplex.count++

        aTemp = vec3.create()
        vec3.subtract(negativeDirection, vec3.create(), direction)
        vec3.subtract(aTemp, getSupport(v2, direction), getSupport(v1, negativeDirection))
        simplex.a = aTemp

        if (vec3.dot(simplex.a, direction) < 0) {
            return false
        }

        switch (simplex.count) {
            case 2:
                direction = solveSimplexLine(simplex, direction)
                break
            case 3:
                direction = solveSimplexTriangle(simplex, direction)
                break
            case 4:
                let collide
                [collide, direction] = solveSimplexTetrahedron(simplex, direction)
                if (collide) {
                    return true
                }
                break
            default:
                console.warn("Invalid simplex dimension!")
        }
    }
    return false
}

// mat4, mat4, expected outcome
const TestCases = [
    [
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0.6000000238418579, 0.6000000238418579, 0, 1,
        ],
        true,
    ], [
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 1.8000000715255737, 1,
        ],
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0.6000000238418579, 0.6000000238418579, 0, 1,
        ],
        false,
    ], [
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            3, 1, 3, 1,
        ],
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -3, 3, 3, 1,
        ],
        false,
    ], [
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            3, 2, 1, 1,
        ],
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            3, 1, 1, 1,
        ],
        true,
    ], [
        [
            1.197820782661438, 0, 0, 0,
            0, 2.4658079147338867, 0, 0,
            0, 0, 2.4658079147338867, 0,
            0, 1.600000023841858, 1.600000023841858, 1,
        ],
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
        true,
    ], [
        [
            1, 0, 0, 0,
            0, 0.9685828685760498, -0.24868984520435333, 0,
            0, 0.24868984520435333, 0.9685828685760498, 0,
            1.2000000476837158, 0.6000000238418579, 1.2000000476837158, 1,
        ],
        [
            1, 0, 0, 0,
            0, 0.8270800709724426, 0.5620830059051514, 0,
            0, -0.5620830059051514, 0.8270800709724426, 0,
            0.6000000238418579, 0.6000000238418579, 0, 1,
        ],
        true,
    ], [
        [
            0.33873745799064636, 0.5288524031639099, -0.7781828045845032,
            0, 0, 0.8270800709724426, 0.5620830059051514,
            0, 0.9408796429634094, -0.19039849936962128, 0.2801630198955536,
            0, 0.6000000238418579, 0.6000000238418579, 0, 1,
        ],
        [
            9.167542457580566, -0.14343756437301636, -0.558652400970459, 0,
            0, 0.9685828685760498, -0.24868984520435333, 0,
            0.09009024500846863, 0.35610976815223694, 1.3869558572769165, 0,
            5, 0.6000000238418579, 1.2000000476837158, 1,
        ],
        true,
    ], [
        [
            1.0387152433395386, 1.6216896772384644, -2.386244297027588, 0,
            0, 10.291351318359375, 6.993994235992432, 0,
            5.052239894866943, -1.0223824977874756, 1.5043909549713135, 0,
            0.6000000238418579, 0.6000000238418579, 0, 1,
        ],
        [
            6.7850422859191895, 3.9912712574005127, -4.73380708694458, 0,
            -0.46792852878570557, -0.21978318691253662, -0.855998158454895, 0,
            -0.6961621642112732, 1.2531858682632446, 0.058791112154722214, 0,
            27.799997329711914, 0.6000000238418579, 1.2000000476837158, 1,
        ],
        false,
    ], [
        [
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1
        ],
        [
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
        ],
        true,
    ]
]
const TestMeshes = TestCases.map((test) => {
    const A = new Cube(test[0])
    const B = new Cube(test[1])
    return [A, B]
})
console.log(TestCases.length)

const iterations = 1e5
const startTime = performance.now()
for (let i = 0; i < iterations; i++) {
    const results = TestCases.map((test, index) => {
        const result = test[2] === solveSimpleGJK(TestMeshes[index][0].WorldPositions, TestMeshes[index][1].WorldPositions)
        return result || equalsCheck(TestCases[index][0], TestCases[index][1])
    })
    if (0 === i) {
        const bool = results.includes(false)
        if (bool) {
            console.error("Test Failed")
        } else {
            console.log("Test Successful")
        }
    }
}
const endTime = performance.now()
const totalTime = endTime - startTime
const averageTime = totalTime / (TestCases.length * iterations)
console.log(`Total Execution Time: ${totalTime}ms`)
console.log(`Average Execution Time: ${averageTime}ms`)

const positionInMesh = solveSimpleGJK(TestMeshes[8][1].WorldPositions, [[0, 0, -10], [0, 0, 10]])
// Expected true, (index 0 is translated 1 unit x, index 1 is centered around origin)
console.log(positionInMesh)
// const positionInMesh = solveSimpleGJK(TestMeshes[8][1].WorldPositions, [[0.5, 0, 0]])
// // Expected true, (index 0 is translated 1 unit x, index 1 is centered around origin)
// console.log(positionInMesh)


/*
const averageTimeS = averageTimeMS / 1000
console.log((1/RefreshRate) / averageTimeS) -> Need aproximately 3500 objects to cause a delay of 1 frame
*/
/*
Firefox:
    1e6:
        9481ms, 0.001185125ms ->
        8870ms, 0.00110875ms
*/
/*
Chrome:
    1e6:
        17563.400000000373ms, 0.00219542499999993ms
        17861.5ms, 0.0022326875ms
*/
// Chrome is wildly more inefficient lol


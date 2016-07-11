
class PolyhedronBuilder2 {
    public Center: Vector3D;
    public AtomRadius: number;
    public WaterRadius: number;
    public Surfaces: DirectionalSurface3D2[] = [];
    public boxUnit: number;
    public options: SurfaceSearchOptions;
    public hydrophilic: boolean;
    constructor(center: Vector3D, atomRadius: number, waterRadius: number, options: SurfaceSearchOptions, hydrophilic: boolean) {
        this.Center = center;
        this.AtomRadius = atomRadius;
        this.WaterRadius = waterRadius;
        this.hydrophilic = hydrophilic;
        this.boxUnit = (atomRadius + waterRadius) * (hydrophilic ? options.hydrophobicFactor : options.hydrophobicFactor);
        var boxUnit = this.boxUnit;
        this.options = options;
        this.Surfaces.push(
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = 1.0;
                ds.Y = 0.0;
                ds.Z = 0.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            }),
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = -1.0;
                ds.Y = 0.0;
                ds.Z = 0.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            }),
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = 0.0;
                ds.Y = 1.0;
                ds.Z = 0.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            }),
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = 0.0;
                ds.Y = -1.0;
                ds.Z = 0.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            }),
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = 0.0;
                ds.Y = 0.0;
                ds.Z = 1.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            }),
            set(new DirectionalSurface3D2(), (ds) => {
                ds.X = 0.0;
                ds.Y = 0.0;
                ds.Z = -1.0;
                ds.C = boxUnit;
                ds.Origin = ds.multiplyAsVector3D(boxUnit);
                ds.Direction = ds.multiplyAsVector3D(-1);
                ds.NormalizedDirection = ds.Direction.base;
                ds.ProjectionRadius = 0;
            })
        );
    }
    static Zero = new Vector3D();
    /**The collection for subtracting surfaces*/
    public SubtractingSurfaces: DirectionalSurface3D2[] = [];

    public TrySubtract = (subtractAtomPosition: Vector3D, subtractAtomRadius: number):boolean => {
        let sur = DirectionalSurface3D2.TryGetDirectionalSurface(this.AtomRadius, subtractAtomPosition.subtract(this.Center), subtractAtomRadius, this.WaterRadius, this.options, this.hydrophilic);
        //if (sur) this.Surfaces.push(sur);
        if (typeof sur == 'string') return false;
        //the surface should be checked here
        //if the surface is not inside any of others, it will be added to the SubtractingSurfaces;
        if (sur) this.checkSubtractingSurfaces(<DirectionalSurface3D2>sur);
        return true;
    }
    public FoundPoint: Vector3D;
    public IsEmpty = (isDebugging?: boolean) => {

        //this is where we can add additional optimization codes
        
        //var Vertices: Vector3D[] = [];
        //var count = 0;

        //put all SubtractingSurfaces into Surfaces;
        this.SubtractingSurfaces.forEach(surface => this.Surfaces.push(surface));
        let boxUnit = this.boxUnit;
        var point: Vector3D = this.Surfaces.someCombinationCheck2(3,
            (item1, item2) => Edge.isOutOfBoxByRad(item1, item2, boxUnit),
            (com) => {
                //this may not be any advantage. solving vertex and determine whether it is greater than the boxUnit should be faster.
                //if (Edge.isOutOfBoxByRad(com[0], com[2], boxUnit)) return false;
                //if (Edge.isOutOfBoxByRad(com[1], com[2], boxUnit)) return false;
                var p = Vertex.TryGetVertex(com[0], com[1], com[2]);
                if (p){
                    if ((Math.abs(p.x) <= (boxUnit)) && (Math.abs(p.y) <= (boxUnit)) && (Math.abs(p.z) <= (boxUnit)) && (p.length >= boxUnit)) {
                        if( this.Surfaces.every(
                            (surf) => {
                                if (com.indexOf(surf) > -1) return true;
                                return surf.IsPositive(p);
                            })) return p;
                    }
                }
                return false;
            });
        //theoreticall we should be able to make a 'water molecule' at the position of the point;
        //here we check if that's correct:
        if (point) this.FoundPoint = point;
        //if (isDebugging && point) {
        //    console.log('point: ', point);
        //    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>Point to Center > Radius: ', point.length > this.Radius, point.length, this.Radius);
        //    this.Surfaces.every((surface) => {
        //        if (!surface.AtomCenter) return true;
        //        var dis = point.subtract(surface.AtomCenter);
        //        var result = dis.length >= surface.AtomRadius;
        //        //console.log('Point to Atom > Radius: ', result, dis.length, surface.AtomRadius, surface.AtomCenter);
        //        //console.log(dis);
        //        return result;
        //    });
        //}
        return !point;
        //return count == 0;
    }
    public toString(): string {
        var lines: string[] = [];
        lines.push('PolyhedronBuilder Start:\r\n');
        lines.push('Center,' + this.Center.toString() + '\r\n');
        lines.push('Radius,' + this.AtomRadius + '\r\n');
        this.Surfaces.forEach((surface) => lines.push(surface.toString() + '\r\n'));
        lines.push('End PolyhedronBuilder\r\n');
        return lines.join('');
    }

    /**Algorithm that uses circle project to reduce the number of surface*/
    public reduceByCircle = () => {
        // the distance from Origin to Center of the chord (OC) can be used to calculate the sweeping radius
        // OC/boxUnit = Cos[Radius]

        //how to tell if the center of another circle is inside one cirlce or not?
        // OC1 OC2
        // Use the direction, the Cos[Delta] can be worked out
        // Cos[Delta] = DotProduct[Direction(OC1), Direction(OC2)]
        // if Cos[Delta] < Cos[Radius1] then OC2 is inside OC1

        //how to tell if the whole another circle is inside one circle or not?

        // Delta < Radius1 And Delta + Radius2 > Radius1

        let reduced: DirectionalSurface3D2[] = [];

        this.Surfaces.forEach(surface => {
            let furtherReduced: DirectionalSurface3D2[] = [];

            if (reduced.some(existing => {
                let delta = Math.acos(existing.NormalizedDirection.dotProduct(surface.NormalizedDirection));
                if (existing.ProjectionRadius > delta + surface.ProjectionRadius) {
                    //surface is inside existing
                    //there will be no need to modify reduced as surface won't be added to the furtherReduced
                    return true;
                }
                if (surface.ProjectionRadius > delta + existing.ProjectionRadius) {
                    //existing is inside surface;
                    //keep surface and remove existing;
                    //
                }
                else {
                    //in this case, both surface and existing shall be added to the furtherReduced
                    furtherReduced.push(existing);
                }
                return false;
            })) {
                //when surface is inside some of the existing
                //discard surface: no need to modify reduced;
                //do nothing
            }
            else {
                //when surface is not inside any of the existing;
                //add surface to furtherReduced;
                furtherReduced.push(surface);
                //replace reduced with furtherReduced;
                reduced = furtherReduced;
            }
        });

        //console.log('Circle reduced: ', reduced.length, ' from ', this.Surfaces.length);
        this.Surfaces = reduced;
        
    }

    public checkSubtractingSurfaces = (surface: DirectionalSurface3D2) => {
        let furtherReduced: DirectionalSurface3D2[] = [];

        if (this.SubtractingSurfaces.some(existing => {
            let delta = Math.acos(existing.NormalizedDirection.dotProduct(surface.NormalizedDirection));
            if (existing.ProjectionRadius > delta + surface.ProjectionRadius) {
                //surface is inside existing
                //there will be no need to modify reduced as surface won't be added to the furtherReduced
                return true;
            }
            if (surface.ProjectionRadius > delta + existing.ProjectionRadius) {
                //existing is inside surface;
                //keep surface and remove existing;
                //
            }
            else {
                //in this case, both surface and existing shall be added to the furtherReduced
                furtherReduced.push(existing);
            }
            return false;
        })) {
            //when surface is inside some of the existing
            //discard surface: no need to modify reduced;
            //do nothing
        }
        else {
            //when surface is not inside any of the existing;
            //add surface to furtherReduced;
            furtherReduced.push(surface);
            //replace reduced with furtherReduced;
            this.SubtractingSurfaces = furtherReduced;
        }
    }

    /**Algorithm that uses projection to reduce the number of surface*/
    public reduceByProjection = () => {
        //there is a better way to reduce them:
        //if the origin of Circle A is inside Circle B, and A does not intersect with B, then A is inside B.
        //the intersection of A and B can be determied by solving equation A and B. Because both A and B are on the surface of the same ball,
        //  so they must intersect if B can not cover A.
        // that is a stronger condition than the current one.

        let pBoxUnit = this.boxUnit; 
        let nBoxUnit = -this.boxUnit;

        let Xp: DirectionalSurface3D2[] = [];
        let Xn: DirectionalSurface3D2[] = [];
        let Yp: DirectionalSurface3D2[] = [];
        let Yn: DirectionalSurface3D2[] = [];
        let Zp: DirectionalSurface3D2[] = [];
        let Zn: DirectionalSurface3D2[] = [];

        let XpYpZp: DirectionalSurface3D2[] = [];
        let XpYpZn: DirectionalSurface3D2[] = [];
        let XpYnZp: DirectionalSurface3D2[] = [];
        let XpYnZn: DirectionalSurface3D2[] = [];
        let XnYpZp: DirectionalSurface3D2[] = [];
        let XnYpZn: DirectionalSurface3D2[] = [];
        let XnYnZp: DirectionalSurface3D2[] = [];
        let XnYnZn: DirectionalSurface3D2[] = [];

        let reduced: DirectionalSurface3D2[] = [];

        this.Surfaces.forEach(surface => {
            //Square Projections
            if (Cord.Xp.dotProduct(surface.Direction) < 0) { //Generate the projection for X+;
                surface.prXP = SquareProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit);
                if (surface.prXP) {
                    if (Xp.some(existing => existing.checkXp(surface))) return;
                    Xp.push(surface);
                }
            }
            if (Cord.Xn.dotProduct(surface.Direction) < 0) { //Generate the projection for X-;
                surface.prXN = SquareProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit);
                if (surface.prXN) {
                    if (Xn.some(existing => existing.checkXn(surface))) return;
                    Xn.push(surface);
                }
            }
            if (Cord.Yp.dotProduct(surface.Direction) < 0) { //Generate the projection for Y+;
                surface.prYP = SquareProjection.build(surface.Y, surface.Z, surface.X, surface.C, pBoxUnit);
                if (surface.prYP) {
                    if (Yp.some(existing => existing.checkYp(surface))) return;
                    Yp.push(surface);
                }
            }
            if (Cord.Yn.dotProduct(surface.Direction) < 0) { //Generate the projection for Y-;
                surface.prYN = SquareProjection.build(surface.Y, surface.Z, surface.X, surface.C, pBoxUnit);
                if (surface.prYN) {
                    if (Yn.some(existing => existing.checkYn(surface))) return;
                    Yn.push(surface);
                }
            }
            if (Cord.Zp.dotProduct(surface.Direction) < 0) { //Generate the projection for Z+;
                surface.prZP = SquareProjection.build(surface.Z, surface.X, surface.Y, surface.C, pBoxUnit);
                if (surface.prZP) {
                    if (Zp.some(existing => existing.checkZp(surface))) return;
                    Zp.push(surface);
                }
            }
            if (Cord.Zn.dotProduct(surface.Direction) < 0) { //Generate the projection for Z-;
                surface.prZN = SquareProjection.build(surface.Z, surface.X, surface.Y, surface.C, pBoxUnit);
                if (surface.prZN) {
                    if (Zn.some(existing => existing.checkZn(surface))) return;
                    Zn.push(surface);
                }
            }

            //let t = surface.prXPYPZN;
            //console.log('Test X: ', t.X * surface.X + pBoxUnit * surface.Y + nBoxUnit * surface.Z - surface.C);
            //console.log('Test Y: ', pBoxUnit * surface.X + t.Y * surface.Y + nBoxUnit * surface.Z - surface.C);
            //console.log('Test Z: ', pBoxUnit * surface.X + pBoxUnit * surface.Y + t.Z * surface.Z - surface.C);
            //Corner Projections
            if (Cord.XpYpZp.dotProduct(surface.Direction) < 0) {
                surface.prXPYPZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, pBoxUnit, pBoxUnit);
                if (surface.prXPYPZP) {
                    if (XpYpZp.some(existing => existing.checkXpYpZp(surface))) return;
                    XpYpZp.push(surface);
                }
            }
            if (Cord.XpYpZn.dotProduct(surface.Direction) < 0) {
                surface.prXPYPZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, pBoxUnit, nBoxUnit);
                if (surface.prXPYPZN) {
                    if (XpYpZn.some(existing => existing.checkXpYpZn(surface))) return;
                    XpYpZn.push(surface);
                }
            }
            if (Cord.XpYnZp.dotProduct(surface.Direction) < 0) {
                surface.prXPYNZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, nBoxUnit, pBoxUnit);
                if (surface.prXPYNZP) {
                    if (XpYnZp.some(existing => existing.checkXpYnZp(surface))) return;
                    XpYnZp.push(surface);
                }
            }
            if (Cord.XpYnZn.dotProduct(surface.Direction) < 0) {
                surface.prXPYNZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, nBoxUnit, nBoxUnit);
                if (surface.prXPYNZN) {
                    if (XpYnZn.some(existing => existing.checkXpYnZn(surface))) return;
                    XpYnZn.push(surface);
                }
            }
            if (Cord.XnYpZp.dotProduct(surface.Direction) < 0) {
                surface.prXNYPZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, pBoxUnit, pBoxUnit);
                if (surface.prXNYPZP) {
                    if (XnYpZp.some(existing => existing.checkXnYpZp(surface))) return;
                    XnYpZp.push(surface);
                }
            }
            if (Cord.XnYpZn.dotProduct(surface.Direction) < 0) {
                surface.prXNYPZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, pBoxUnit, nBoxUnit);
                if (surface.prXNYPZN) {
                    if (XnYpZn.some(existing => existing.checkXnYpZn(surface))) return;
                    XnYpZn.push(surface);
                }
            }
            if (Cord.XnYnZp.dotProduct(surface.Direction) < 0) {
                surface.prXNYNZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, nBoxUnit, pBoxUnit);
                if (surface.prXNYNZP) {
                    if (XnYnZp.some(existing => existing.checkXnYnZp(surface))) return;
                    XnYnZp.push(surface);
                }
            }
            if (Cord.XnYnZn.dotProduct(surface.Direction) < 0) {
                surface.prXNYNZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, nBoxUnit, nBoxUnit);
                if (surface.prXNYNZN) {
                    if (XnYnZn.some(existing => existing.checkXnYnZn(surface))) return;
                    XnYnZn.push(surface);
                }
            }
            reduced.push(surface);
        });
        console.log('Square reduced: ', reduced.length, ' from ', this.Surfaces.length);
        this.Surfaces = reduced;
    }
}
class DirectionalSurface3D2 {
    /**X = 2*px*/
    public X: number;
    /**Y = 2*py*/
    public Y: number;
    /**Z= 2*pz*/
    public Z: number;
    /**C = px^2 + py^2 + pz^2 + r^2 - R^2*/
    public C: number;
    /**{px, py, pz} * CrossPointFactor is the CrossPoint*/
    public Factor: number;
    /**The Centor the Crossing Surface*/
    public Origin: Vector3D;
    /**Direction facing to the Origin (Zero)*/
    public Direction: Vector3D;
    /**Center of the Atom*/
    public AtomCenter: Vector3D;
    /**Radius of the Atom*/
    public AtomRadius: number;
    /**
     * Determine if the point is a convex vectex.
     * @param TestPoint
     */
    public IsPositive(TestPoint: Vector3D): boolean {

        var left = this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z;
        var right = this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        var result = left >= right;
        //console.log('IsPositive:', result, left, right, this);
        return result;
        //return this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z >=
        //    this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        //return this.Direction.x * (TestPoint.x - this.Origin.x) + this.Direction.y * (TestPoint.y - this.Origin.y) + this.Direction.z * (TestPoint.z - this.Origin.z) >= 0.0;
    }
    static TryGetDirectionalSurface(CenterAtomRadius: number, DisplacementToCenterAtom: Vector3D,  SubtractAtomRadius: number, WaterRadius: number, options: SurfaceSearchOptions, hydrophilic: boolean): DirectionalSurface3D2|'overlapping' {
        //console.log('TryGetDirectionalSurface', SubtractCenter, SubtractRadius);
        //we assume the origin is zero;
        //from (x^2 + y^2 + z^2 == r^2 and (x-px)^2 + (y-py)^2 + (z-pz)^2 ==R^2)
        //we can get 2*px*x + 2*py*y + 2*pz*z == px^2 + py^2 + pz^2 + r^2 - R^2
        // X = 2*px Y = 2*py Z= 2*pz C = px^2 + py^2 + pz^2 + r^2 - R^2
        //therefore 


        let CenterRadius: number = (CenterAtomRadius + WaterRadius) * (hydrophilic ? options.hydrophobicFactor : options.hydrophobicFactor);
        var SubtractRadius: number = (SubtractAtomRadius + WaterRadius) * options.hydrophobicFactor;
        var pXYZsquare = DisplacementToCenterAtom.lengthSquared;
        if (pXYZsquare == 0) return 'overlapping';

        //var dis = SubtractCenter.multiplyBy(-1);;
        if (DisplacementToCenterAtom.length > CenterRadius + SubtractRadius) return null;

        var ds3D = new DirectionalSurface3D2();
        ds3D.X = 2.0 * DisplacementToCenterAtom.x;
        ds3D.Y = 2.0 * DisplacementToCenterAtom.y;
        ds3D.Z = 2.0 * DisplacementToCenterAtom.z;
        ds3D.C = pXYZsquare + CenterRadius * CenterRadius - SubtractRadius * SubtractRadius;
        ds3D.AtomCenter = DisplacementToCenterAtom;
        ds3D.AtomRadius = SubtractAtomRadius;
        // then the center of the surface (crossed by the line from Zero to the Subtract point has a common factor:
        // (px^2 + py^2 + pz^2 + r^2 - R^2)/(2 * (px^2 + py^2 + pz^2))
        var CrossPointFactor = ds3D.C / 2 / pXYZsquare;
        ds3D.Factor = CrossPointFactor;
        // {px, py, pz} * CrossPointFactor is the CrossPoint
        ds3D.Origin = DisplacementToCenterAtom.multiplyBy(CrossPointFactor);
        //Make the direction facing to the Origin (Zero);
        ds3D.Direction = DisplacementToCenterAtom.multiplyBy(-1);

        //Radius projection methods to reduce number of surface
        ds3D.NormalizedDirection = ds3D.Direction.base;
        ds3D.ProjectionRadius = Math.acos(ds3D.Origin.length / CenterRadius);
        return ds3D;
    }
    public isInSurface(point: Vector3D): boolean {
        return Math.abs(point.x * this.X + point.y * this.Y + point.z * this.Z - this.C) < 1e-10;
    }
    public toString(): string {
        return this.X + ',' + this.Y + ',' + this.Z + ',' + this.C + ',' + this.Origin.toString() + ',' + this.Direction.toString();
    }
    public multiplyAsVector3D(multiplier: number): Vector3D {
        return new Vector3D(this.X * multiplier, this.Y * multiplier, this.Z * multiplier);
    }
    /*
     * This calculates the direct of the shared edge
     */
    public orthogonalWith = (that: DirectionalSurface3D2): Vector3D => {
        var both = new Vector3D(
            this.Y * that.Z - this.Z * that.Y,
            this.Z * that.X - this.X * that.Z,
            this.X * that.Y - this.Y * that.X
        );
        var bLength = both.length;
        if (bLength == 0) throw 'host and target vectors are in the same direction.';
        both.divide(bLength);
        return both;
    }

    /**Radius projection*/
    public ProjectionRadius: number;
    /**Normallized Direction that can be used to calculated Cos[Delta] by DotProduct*/
    public NormalizedDirection: Vector3D;

    /**Direction of X+*/
    public prXP: SquareProjection;
    /**Direction of X-*/
    public prXN: SquareProjection;
    /**Direction of Y+*/
    public prYP: SquareProjection;
    /**Direction of Y-*/
    public prYN: SquareProjection;
    /**Direction of Z+*/
    public prZP: SquareProjection;
    /**Direction of Z-*/
    public prZN: SquareProjection;
    /**Corner of X+ Y+ Z+*/
    public prXPYPZP: CornerProjection;
    /**Corner of X+ Y+ Z-*/
    public prXPYPZN: CornerProjection;
    /**Corner of X+ Y- Z+*/
    public prXPYNZP: CornerProjection;
    /**Corner of X+ Y- Z-*/
    public prXPYNZN: CornerProjection;
    /**Corner of X- Y+ Z+*/
    public prXNYPZP: CornerProjection;
    /**Corner of X- Y+ Z-*/
    public prXNYPZN: CornerProjection;
    /**Corner of X- Y- Z+*/
    public prXNYNZP: CornerProjection;
    /**Corner of X- Y- Z-*/
    public prXNYNZN: CornerProjection;

    /**Check prXp*/
    public checkXp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXP;
        let other = surface.prXP;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
    }
    /**Check prXn*/
    public checkXn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXN;
        let other = surface.prXN;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
    }
    /**Check prYp*/
    public checkYp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prYP;
        let other = surface.prYP;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
    }
    /**Check prYn*/
    public checkYn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prYN;
        let other = surface.prYN;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
    }
    /**Check prZp*/
    public checkZp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prZP;
        let other = surface.prZP;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
    }
    /**Check prZn*/
    public checkZn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prZN;
        let other = surface.prZN;
        //if all of mine is less than other, then other is not passed;
        return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
    }
    /**Check prXPYPZP*/
    public checkXpYpZp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXPYPZP;
        let other = surface.prXPYPZP;
        //if all of mine is less than other, then other is not passed;
        return (mine.X < other.X && mine.Y < other.Y && mine.Z < other.Z);
    }
    /**Check prXPYPZP*/
    public checkXpYpZn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXPYPZN;
        let other = surface.prXPYPZN;
        //if all of mine is less than other, then other is not passed;
        return (mine.X < other.X && mine.Y < other.Y && mine.Z > other.Z);
    }
    /**Check prXPYNZP*/
    public checkXpYnZp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXPYNZP;
        let other = surface.prXPYNZP;
        //if all of mine is less than other, then other is not passed;
        return (mine.X < other.X && mine.Y > other.Y && mine.Z < other.Z);
    }
    /**Check prXPYPZP*/
    public checkXpYnZn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXPYNZN;
        let other = surface.prXPYNZN;
        //if all of mine is less than other, then other is not passed;
        return (mine.X < other.X && mine.Y > other.Y && mine.Z > other.Z);
    }
    /**Check prXNYPZP*/
    public checkXnYpZp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXNYPZP;
        let other = surface.prXNYPZP;
        //if all of mine is less than other, then other is not passed;
        return (mine.X > other.X && mine.Y < other.Y && mine.Z < other.Z);
    }
    /**Check prXNYPZN*/
    public checkXnYpZn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXNYPZN;
        let other = surface.prXNYPZN;
        //if all of mine is less than other, then other is not passed;
        return (mine.X > other.X && mine.Y < other.Y && mine.Z > other.Z);
    }
    /**Check prXNYNZP*/
    public checkXnYnZp = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXNYNZP;
        let other = surface.prXNYNZP;
        //if all of mine is less than other, then other is not passed;
        return (mine.X > other.X && mine.Y > other.Y && mine.Z < other.Z);
    }
    /**Check prXNYNZN*/
    public checkXnYnZn = (surface: DirectionalSurface3D2): boolean => {
        let mine = this.prXNYNZN;
        let other = surface.prXNYNZN;
        //if all of mine is less than other, then other is not passed;
        return (mine.X > other.X && mine.Y > other.Y && mine.Z > other.Z);
    }

}
class Cord {
    static Xp = new Vector3D(1, 0, 0);
    static Xn = new Vector3D(-1, 0, 0);
    static Yp = new Vector3D(0, 1, 0);
    static Yn = new Vector3D(0, -1, 0);
    static Zp = new Vector3D(0, 0, 1);
    static Zn = new Vector3D(0, 0, -1);

    static XpYpZp = new Vector3D(1, 1, 1);
    static XpYpZn = new Vector3D(1, 1, -1);
    static XpYnZp = new Vector3D(1, -1, 1);
    static XpYnZn = new Vector3D(1, -1, -1);
    static XnYpZp = new Vector3D(-1, 1, 1);
    static XnYpZn = new Vector3D(-1, 1, -1);
    static XnYnZp = new Vector3D(-1, -1, 1);
    static XnYnZn = new Vector3D(-1, -1, -1);
}
class SquareProjection {
    public PP: number;
    public PN: number; 
    public NP: number;
    public NN: number;
    /**Build a projection:
    * x = (C -/+ boxUnit*Y -/+ boxUnit*Z)/X
    * The input should be in order X: YZ, Y:ZX, Z:XY
    */
    static build = (X: number, Y: number, Z: number, C: number, boxUnit: number): SquareProjection => {
        if (X == 0) return undefined;
        let sp = new SquareProjection();
        sp.PP = (C - boxUnit * Y - boxUnit * Z) / X;
        sp.PN = (C - boxUnit * Y + boxUnit * Z) / X;
        sp.NP = (C + boxUnit * Y - boxUnit * Z) / X;
        sp.NN = (C + boxUnit * Y + boxUnit * Z) / X;
        return sp;
    }
}

class CornerProjection {
    public X: number;
    public Y: number;
    public Z: number;
    static build = (X: number, Y: number, Z: number, C: number, boxUnitX: number, boxUnitY:number, boxUnitZ:number): CornerProjection => {
        if (X == 0 || Y == 0 || Z == 0) return undefined;
        let cp = new CornerProjection();
        cp.X = (C - boxUnitY * Y - boxUnitZ * Z) / X;
        if ((boxUnitX > 0 && cp.X > boxUnitX) || (boxUnitX < 0 && cp.X < boxUnitX)) return undefined;
        cp.Y = (C - boxUnitZ * Z - boxUnitX * X) / Y;
        if ((boxUnitY > 0 && cp.Y > boxUnitY) || (boxUnitY < 0 && cp.Y < boxUnitY)) return undefined;
        cp.Z = (C - boxUnitX * X - boxUnitY * Y) / Z;
        if ((boxUnitZ > 0 && cp.Z > boxUnitZ) || (boxUnitZ < 0 && cp.Z < boxUnitZ)) return undefined;
        return cp;
    }
}

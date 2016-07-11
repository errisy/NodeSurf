var PolyhedronBuilder2 = (function () {
    function PolyhedronBuilder2(center, atomRadius, waterRadius, options, hydrophilic) {
        var _this = this;
        this.Surfaces = [];
        /**The collection for subtracting surfaces*/
        this.SubtractingSurfaces = [];
        this.TrySubtract = function (subtractAtomPosition, subtractAtomRadius) {
            var sur = DirectionalSurface3D2.TryGetDirectionalSurface(_this.AtomRadius, subtractAtomPosition.subtract(_this.Center), subtractAtomRadius, _this.WaterRadius, _this.options, _this.hydrophilic);
            //if (sur) this.Surfaces.push(sur);
            if (typeof sur == 'string')
                return false;
            //the surface should be checked here
            //if the surface is not inside any of others, it will be added to the SubtractingSurfaces;
            if (sur)
                _this.checkSubtractingSurfaces(sur);
            return true;
        };
        this.IsEmpty = function (isDebugging) {
            //this is where we can add additional optimization codes
            //var Vertices: Vector3D[] = [];
            //var count = 0;
            //put all SubtractingSurfaces into Surfaces;
            _this.SubtractingSurfaces.forEach(function (surface) { return _this.Surfaces.push(surface); });
            var boxUnit = _this.boxUnit;
            var point = _this.Surfaces.someCombinationCheck2(3, function (item1, item2) { return Edge.isOutOfBoxByRad(item1, item2, boxUnit); }, function (com) {
                //this may not be any advantage. solving vertex and determine whether it is greater than the boxUnit should be faster.
                //if (Edge.isOutOfBoxByRad(com[0], com[2], boxUnit)) return false;
                //if (Edge.isOutOfBoxByRad(com[1], com[2], boxUnit)) return false;
                var p = Vertex.TryGetVertex(com[0], com[1], com[2]);
                if (p) {
                    if ((Math.abs(p.x) <= (boxUnit)) && (Math.abs(p.y) <= (boxUnit)) && (Math.abs(p.z) <= (boxUnit)) && (p.length >= boxUnit)) {
                        if (_this.Surfaces.every(function (surf) {
                            if (com.indexOf(surf) > -1)
                                return true;
                            return surf.IsPositive(p);
                        }))
                            return p;
                    }
                }
                return false;
            });
            //theoreticall we should be able to make a 'water molecule' at the position of the point;
            //here we check if that's correct:
            if (point)
                _this.FoundPoint = point;
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
        };
        /**Algorithm that uses circle project to reduce the number of surface*/
        this.reduceByCircle = function () {
            // the distance from Origin to Center of the chord (OC) can be used to calculate the sweeping radius
            // OC/boxUnit = Cos[Radius]
            //how to tell if the center of another circle is inside one cirlce or not?
            // OC1 OC2
            // Use the direction, the Cos[Delta] can be worked out
            // Cos[Delta] = DotProduct[Direction(OC1), Direction(OC2)]
            // if Cos[Delta] < Cos[Radius1] then OC2 is inside OC1
            //how to tell if the whole another circle is inside one circle or not?
            // Delta < Radius1 And Delta + Radius2 > Radius1
            var reduced = [];
            _this.Surfaces.forEach(function (surface) {
                var furtherReduced = [];
                if (reduced.some(function (existing) {
                    var delta = Math.acos(existing.NormalizedDirection.dotProduct(surface.NormalizedDirection));
                    if (existing.ProjectionRadius > delta + surface.ProjectionRadius) {
                        //surface is inside existing
                        //there will be no need to modify reduced as surface won't be added to the furtherReduced
                        return true;
                    }
                    if (surface.ProjectionRadius > delta + existing.ProjectionRadius) {
                    }
                    else {
                        //in this case, both surface and existing shall be added to the furtherReduced
                        furtherReduced.push(existing);
                    }
                    return false;
                })) {
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
            _this.Surfaces = reduced;
        };
        this.checkSubtractingSurfaces = function (surface) {
            var furtherReduced = [];
            if (_this.SubtractingSurfaces.some(function (existing) {
                var delta = Math.acos(existing.NormalizedDirection.dotProduct(surface.NormalizedDirection));
                if (existing.ProjectionRadius > delta + surface.ProjectionRadius) {
                    //surface is inside existing
                    //there will be no need to modify reduced as surface won't be added to the furtherReduced
                    return true;
                }
                if (surface.ProjectionRadius > delta + existing.ProjectionRadius) {
                }
                else {
                    //in this case, both surface and existing shall be added to the furtherReduced
                    furtherReduced.push(existing);
                }
                return false;
            })) {
            }
            else {
                //when surface is not inside any of the existing;
                //add surface to furtherReduced;
                furtherReduced.push(surface);
                //replace reduced with furtherReduced;
                _this.SubtractingSurfaces = furtherReduced;
            }
        };
        /**Algorithm that uses projection to reduce the number of surface*/
        this.reduceByProjection = function () {
            //there is a better way to reduce them:
            //if the origin of Circle A is inside Circle B, and A does not intersect with B, then A is inside B.
            //the intersection of A and B can be determied by solving equation A and B. Because both A and B are on the surface of the same ball,
            //  so they must intersect if B can not cover A.
            // that is a stronger condition than the current one.
            var pBoxUnit = _this.boxUnit;
            var nBoxUnit = -_this.boxUnit;
            var Xp = [];
            var Xn = [];
            var Yp = [];
            var Yn = [];
            var Zp = [];
            var Zn = [];
            var XpYpZp = [];
            var XpYpZn = [];
            var XpYnZp = [];
            var XpYnZn = [];
            var XnYpZp = [];
            var XnYpZn = [];
            var XnYnZp = [];
            var XnYnZn = [];
            var reduced = [];
            _this.Surfaces.forEach(function (surface) {
                //Square Projections
                if (Cord.Xp.dotProduct(surface.Direction) < 0) {
                    surface.prXP = SquareProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit);
                    if (surface.prXP) {
                        if (Xp.some(function (existing) { return existing.checkXp(surface); }))
                            return;
                        Xp.push(surface);
                    }
                }
                if (Cord.Xn.dotProduct(surface.Direction) < 0) {
                    surface.prXN = SquareProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit);
                    if (surface.prXN) {
                        if (Xn.some(function (existing) { return existing.checkXn(surface); }))
                            return;
                        Xn.push(surface);
                    }
                }
                if (Cord.Yp.dotProduct(surface.Direction) < 0) {
                    surface.prYP = SquareProjection.build(surface.Y, surface.Z, surface.X, surface.C, pBoxUnit);
                    if (surface.prYP) {
                        if (Yp.some(function (existing) { return existing.checkYp(surface); }))
                            return;
                        Yp.push(surface);
                    }
                }
                if (Cord.Yn.dotProduct(surface.Direction) < 0) {
                    surface.prYN = SquareProjection.build(surface.Y, surface.Z, surface.X, surface.C, pBoxUnit);
                    if (surface.prYN) {
                        if (Yn.some(function (existing) { return existing.checkYn(surface); }))
                            return;
                        Yn.push(surface);
                    }
                }
                if (Cord.Zp.dotProduct(surface.Direction) < 0) {
                    surface.prZP = SquareProjection.build(surface.Z, surface.X, surface.Y, surface.C, pBoxUnit);
                    if (surface.prZP) {
                        if (Zp.some(function (existing) { return existing.checkZp(surface); }))
                            return;
                        Zp.push(surface);
                    }
                }
                if (Cord.Zn.dotProduct(surface.Direction) < 0) {
                    surface.prZN = SquareProjection.build(surface.Z, surface.X, surface.Y, surface.C, pBoxUnit);
                    if (surface.prZN) {
                        if (Zn.some(function (existing) { return existing.checkZn(surface); }))
                            return;
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
                        if (XpYpZp.some(function (existing) { return existing.checkXpYpZp(surface); }))
                            return;
                        XpYpZp.push(surface);
                    }
                }
                if (Cord.XpYpZn.dotProduct(surface.Direction) < 0) {
                    surface.prXPYPZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, pBoxUnit, nBoxUnit);
                    if (surface.prXPYPZN) {
                        if (XpYpZn.some(function (existing) { return existing.checkXpYpZn(surface); }))
                            return;
                        XpYpZn.push(surface);
                    }
                }
                if (Cord.XpYnZp.dotProduct(surface.Direction) < 0) {
                    surface.prXPYNZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, nBoxUnit, pBoxUnit);
                    if (surface.prXPYNZP) {
                        if (XpYnZp.some(function (existing) { return existing.checkXpYnZp(surface); }))
                            return;
                        XpYnZp.push(surface);
                    }
                }
                if (Cord.XpYnZn.dotProduct(surface.Direction) < 0) {
                    surface.prXPYNZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, pBoxUnit, nBoxUnit, nBoxUnit);
                    if (surface.prXPYNZN) {
                        if (XpYnZn.some(function (existing) { return existing.checkXpYnZn(surface); }))
                            return;
                        XpYnZn.push(surface);
                    }
                }
                if (Cord.XnYpZp.dotProduct(surface.Direction) < 0) {
                    surface.prXNYPZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, pBoxUnit, pBoxUnit);
                    if (surface.prXNYPZP) {
                        if (XnYpZp.some(function (existing) { return existing.checkXnYpZp(surface); }))
                            return;
                        XnYpZp.push(surface);
                    }
                }
                if (Cord.XnYpZn.dotProduct(surface.Direction) < 0) {
                    surface.prXNYPZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, pBoxUnit, nBoxUnit);
                    if (surface.prXNYPZN) {
                        if (XnYpZn.some(function (existing) { return existing.checkXnYpZn(surface); }))
                            return;
                        XnYpZn.push(surface);
                    }
                }
                if (Cord.XnYnZp.dotProduct(surface.Direction) < 0) {
                    surface.prXNYNZP = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, nBoxUnit, pBoxUnit);
                    if (surface.prXNYNZP) {
                        if (XnYnZp.some(function (existing) { return existing.checkXnYnZp(surface); }))
                            return;
                        XnYnZp.push(surface);
                    }
                }
                if (Cord.XnYnZn.dotProduct(surface.Direction) < 0) {
                    surface.prXNYNZN = CornerProjection.build(surface.X, surface.Y, surface.Z, surface.C, nBoxUnit, nBoxUnit, nBoxUnit);
                    if (surface.prXNYNZN) {
                        if (XnYnZn.some(function (existing) { return existing.checkXnYnZn(surface); }))
                            return;
                        XnYnZn.push(surface);
                    }
                }
                reduced.push(surface);
            });
            console.log('Square reduced: ', reduced.length, ' from ', _this.Surfaces.length);
            _this.Surfaces = reduced;
        };
        this.Center = center;
        this.AtomRadius = atomRadius;
        this.WaterRadius = waterRadius;
        this.hydrophilic = hydrophilic;
        this.boxUnit = (atomRadius + waterRadius) * (hydrophilic ? options.hydrophobicFactor : options.hydrophobicFactor);
        var boxUnit = this.boxUnit;
        this.options = options;
        this.Surfaces.push(set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = -1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 1.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = -1.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = 1.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = -1.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
            ds.NormalizedDirection = ds.Direction.base;
            ds.ProjectionRadius = 0;
        }));
    }
    PolyhedronBuilder2.prototype.toString = function () {
        var lines = [];
        lines.push('PolyhedronBuilder Start:\r\n');
        lines.push('Center,' + this.Center.toString() + '\r\n');
        lines.push('Radius,' + this.AtomRadius + '\r\n');
        this.Surfaces.forEach(function (surface) { return lines.push(surface.toString() + '\r\n'); });
        lines.push('End PolyhedronBuilder\r\n');
        return lines.join('');
    };
    PolyhedronBuilder2.Zero = new Vector3D();
    return PolyhedronBuilder2;
}());
var DirectionalSurface3D2 = (function () {
    function DirectionalSurface3D2() {
        var _this = this;
        /*
         * This calculates the direct of the shared edge
         */
        this.orthogonalWith = function (that) {
            var both = new Vector3D(_this.Y * that.Z - _this.Z * that.Y, _this.Z * that.X - _this.X * that.Z, _this.X * that.Y - _this.Y * that.X);
            var bLength = both.length;
            if (bLength == 0)
                throw 'host and target vectors are in the same direction.';
            both.divide(bLength);
            return both;
        };
        /**Check prXp*/
        this.checkXp = function (surface) {
            var mine = _this.prXP;
            var other = surface.prXP;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
        };
        /**Check prXn*/
        this.checkXn = function (surface) {
            var mine = _this.prXN;
            var other = surface.prXN;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
        };
        /**Check prYp*/
        this.checkYp = function (surface) {
            var mine = _this.prYP;
            var other = surface.prYP;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
        };
        /**Check prYn*/
        this.checkYn = function (surface) {
            var mine = _this.prYN;
            var other = surface.prYN;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
        };
        /**Check prZp*/
        this.checkZp = function (surface) {
            var mine = _this.prZP;
            var other = surface.prZP;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN < other.NN && mine.NP < other.NP && mine.PN < other.PN && mine.PP < other.PP);
        };
        /**Check prZn*/
        this.checkZn = function (surface) {
            var mine = _this.prZN;
            var other = surface.prZN;
            //if all of mine is less than other, then other is not passed;
            return (mine.NN > other.NN && mine.NP > other.NP && mine.PN > other.PN && mine.PP > other.PP);
        };
        /**Check prXPYPZP*/
        this.checkXpYpZp = function (surface) {
            var mine = _this.prXPYPZP;
            var other = surface.prXPYPZP;
            //if all of mine is less than other, then other is not passed;
            return (mine.X < other.X && mine.Y < other.Y && mine.Z < other.Z);
        };
        /**Check prXPYPZP*/
        this.checkXpYpZn = function (surface) {
            var mine = _this.prXPYPZN;
            var other = surface.prXPYPZN;
            //if all of mine is less than other, then other is not passed;
            return (mine.X < other.X && mine.Y < other.Y && mine.Z > other.Z);
        };
        /**Check prXPYNZP*/
        this.checkXpYnZp = function (surface) {
            var mine = _this.prXPYNZP;
            var other = surface.prXPYNZP;
            //if all of mine is less than other, then other is not passed;
            return (mine.X < other.X && mine.Y > other.Y && mine.Z < other.Z);
        };
        /**Check prXPYPZP*/
        this.checkXpYnZn = function (surface) {
            var mine = _this.prXPYNZN;
            var other = surface.prXPYNZN;
            //if all of mine is less than other, then other is not passed;
            return (mine.X < other.X && mine.Y > other.Y && mine.Z > other.Z);
        };
        /**Check prXNYPZP*/
        this.checkXnYpZp = function (surface) {
            var mine = _this.prXNYPZP;
            var other = surface.prXNYPZP;
            //if all of mine is less than other, then other is not passed;
            return (mine.X > other.X && mine.Y < other.Y && mine.Z < other.Z);
        };
        /**Check prXNYPZN*/
        this.checkXnYpZn = function (surface) {
            var mine = _this.prXNYPZN;
            var other = surface.prXNYPZN;
            //if all of mine is less than other, then other is not passed;
            return (mine.X > other.X && mine.Y < other.Y && mine.Z > other.Z);
        };
        /**Check prXNYNZP*/
        this.checkXnYnZp = function (surface) {
            var mine = _this.prXNYNZP;
            var other = surface.prXNYNZP;
            //if all of mine is less than other, then other is not passed;
            return (mine.X > other.X && mine.Y > other.Y && mine.Z < other.Z);
        };
        /**Check prXNYNZN*/
        this.checkXnYnZn = function (surface) {
            var mine = _this.prXNYNZN;
            var other = surface.prXNYNZN;
            //if all of mine is less than other, then other is not passed;
            return (mine.X > other.X && mine.Y > other.Y && mine.Z > other.Z);
        };
    }
    /**
     * Determine if the point is a convex vectex.
     * @param TestPoint
     */
    DirectionalSurface3D2.prototype.IsPositive = function (TestPoint) {
        var left = this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z;
        var right = this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        var result = left >= right;
        //console.log('IsPositive:', result, left, right, this);
        return result;
        //return this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z >=
        //    this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        //return this.Direction.x * (TestPoint.x - this.Origin.x) + this.Direction.y * (TestPoint.y - this.Origin.y) + this.Direction.z * (TestPoint.z - this.Origin.z) >= 0.0;
    };
    DirectionalSurface3D2.TryGetDirectionalSurface = function (CenterAtomRadius, DisplacementToCenterAtom, SubtractAtomRadius, WaterRadius, options, hydrophilic) {
        //console.log('TryGetDirectionalSurface', SubtractCenter, SubtractRadius);
        //we assume the origin is zero;
        //from (x^2 + y^2 + z^2 == r^2 and (x-px)^2 + (y-py)^2 + (z-pz)^2 ==R^2)
        //we can get 2*px*x + 2*py*y + 2*pz*z == px^2 + py^2 + pz^2 + r^2 - R^2
        // X = 2*px Y = 2*py Z= 2*pz C = px^2 + py^2 + pz^2 + r^2 - R^2
        //therefore 
        var CenterRadius = (CenterAtomRadius + WaterRadius) * (hydrophilic ? options.hydrophobicFactor : options.hydrophobicFactor);
        var SubtractRadius = (SubtractAtomRadius + WaterRadius) * options.hydrophobicFactor;
        var pXYZsquare = DisplacementToCenterAtom.lengthSquared;
        if (pXYZsquare == 0)
            return 'overlapping';
        //var dis = SubtractCenter.multiplyBy(-1);;
        if (DisplacementToCenterAtom.length > CenterRadius + SubtractRadius)
            return null;
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
    };
    DirectionalSurface3D2.prototype.isInSurface = function (point) {
        return Math.abs(point.x * this.X + point.y * this.Y + point.z * this.Z - this.C) < 1e-10;
    };
    DirectionalSurface3D2.prototype.toString = function () {
        return this.X + ',' + this.Y + ',' + this.Z + ',' + this.C + ',' + this.Origin.toString() + ',' + this.Direction.toString();
    };
    DirectionalSurface3D2.prototype.multiplyAsVector3D = function (multiplier) {
        return new Vector3D(this.X * multiplier, this.Y * multiplier, this.Z * multiplier);
    };
    return DirectionalSurface3D2;
}());
var Cord = (function () {
    function Cord() {
    }
    Cord.Xp = new Vector3D(1, 0, 0);
    Cord.Xn = new Vector3D(-1, 0, 0);
    Cord.Yp = new Vector3D(0, 1, 0);
    Cord.Yn = new Vector3D(0, -1, 0);
    Cord.Zp = new Vector3D(0, 0, 1);
    Cord.Zn = new Vector3D(0, 0, -1);
    Cord.XpYpZp = new Vector3D(1, 1, 1);
    Cord.XpYpZn = new Vector3D(1, 1, -1);
    Cord.XpYnZp = new Vector3D(1, -1, 1);
    Cord.XpYnZn = new Vector3D(1, -1, -1);
    Cord.XnYpZp = new Vector3D(-1, 1, 1);
    Cord.XnYpZn = new Vector3D(-1, 1, -1);
    Cord.XnYnZp = new Vector3D(-1, -1, 1);
    Cord.XnYnZn = new Vector3D(-1, -1, -1);
    return Cord;
}());
var SquareProjection = (function () {
    function SquareProjection() {
    }
    /**Build a projection:
    * x = (C -/+ boxUnit*Y -/+ boxUnit*Z)/X
    * The input should be in order X: YZ, Y:ZX, Z:XY
    */
    SquareProjection.build = function (X, Y, Z, C, boxUnit) {
        if (X == 0)
            return undefined;
        var sp = new SquareProjection();
        sp.PP = (C - boxUnit * Y - boxUnit * Z) / X;
        sp.PN = (C - boxUnit * Y + boxUnit * Z) / X;
        sp.NP = (C + boxUnit * Y - boxUnit * Z) / X;
        sp.NN = (C + boxUnit * Y + boxUnit * Z) / X;
        return sp;
    };
    return SquareProjection;
}());
var CornerProjection = (function () {
    function CornerProjection() {
    }
    CornerProjection.build = function (X, Y, Z, C, boxUnitX, boxUnitY, boxUnitZ) {
        if (X == 0 || Y == 0 || Z == 0)
            return undefined;
        var cp = new CornerProjection();
        cp.X = (C - boxUnitY * Y - boxUnitZ * Z) / X;
        if ((boxUnitX > 0 && cp.X > boxUnitX) || (boxUnitX < 0 && cp.X < boxUnitX))
            return undefined;
        cp.Y = (C - boxUnitZ * Z - boxUnitX * X) / Y;
        if ((boxUnitY > 0 && cp.Y > boxUnitY) || (boxUnitY < 0 && cp.Y < boxUnitY))
            return undefined;
        cp.Z = (C - boxUnitX * X - boxUnitY * Y) / Z;
        if ((boxUnitZ > 0 && cp.Z > boxUnitZ) || (boxUnitZ < 0 && cp.Z < boxUnitZ))
            return undefined;
        return cp;
    };
    return CornerProjection;
}());
//# sourceMappingURL=geometry2.js.map
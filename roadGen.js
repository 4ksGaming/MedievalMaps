/*
TODO:
        4-way intersections
        intersection fill adjacent segments
        fix min angle
        find second intersection of new road
        whole num of segments on road
 */
var mapSize = 700;
var roadNum = 10;
var minDist = 150;
var segmentDensity = 50;
var minAngle = 90;
var allSegments = new Array();
var allRoads = new Array();
$( document ).ready(function() {
    var c = document.getElementById("map");
    var map = c.getContext("2d");
    map.clearRect(0,0,mapSize,mapSize);
    allSegments = [];
    allRoads =[];

    var firstX = Math.floor(Math.random() * mapSize);
    var firstY = Math.floor(Math.random() * mapSize);
    var secondX = Math.floor(Math.random() * (mapSize - (minDist * 2)));
    var secondY = Math.floor(Math.random() * (mapSize - (minDist * 2)));
    //Handle going off edge? Is it necessary? I think the answer is no
    if(secondX > (firstX - minDist)){
        secondX+=100;
    }
    if(secondY > (firstY - minDist)){
        secondY+=100;
    }

    //map.moveTo(firstX, firstY);
    //map.lineTo(secondX , secondY);
    for(var i = 0; i < roadNum; i++) {
        console.log('\n\nRoad  ' + i);
        var road = new Road(map);
        allRoads.push(road);
        road.draw(map);
    }
    map.stroke();
});


class Road {
    //start;
    //end;
    //slope;
    //length;
    constructor(){//TODO implement this as a factory
        this.segments = [];
        if(allSegments.length === 0){
            this.start = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));
            do{
                this.end = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));
            }while(Point.distance(this.start, this.end) < minDist);
        }
        else {
            do {
                var seg = allSegments[Math.floor(Math.random() * allSegments.length)];
            }while(seg.left.content != undefined && seg.right.content != undefined)
            seg.right.content = new Intersection();
            seg.left.content = new Intersection();
            var parent = seg.road;

            var side = Math.floor(Math.random() * 2);//'Port' side is 0, 'Starboard' is 1
            console.log('side:' + side);
            var toEdge = -1;//All tbis is broken somehow
            var farPoint = new Point(seg.center.x, seg.center.y);
            while (((farPoint.x < 400) && (farPoint.x > 0)) && ((farPoint.y < 400) && (farPoint.y > 0))){
                toEdge++;
                farPoint.x += parent.segmentHeight;
                farPoint.y -= parent.segmentWidth;
            }

            console.log('toEdge: ' + toEdge);
            var dist = segmentDensity * (Math.floor(Math.random() * (toEdge - 2)) + 3);//TODO make 2 some exp
            console.log('dist: ' + dist);
            var angle = Math.floor(Math.random() * (180 - 2 * minAngle)) + minAngle;
            var absAngle = (parent.angle - (180 - angle)) * Math.PI / 180;
            var xDist = dist*Math.cos(absAngle);
            var yDist = dist*Math.sin(absAngle);
            this.start = new Point(seg.center.x, seg.center.y);
            this.end = new Point(seg.center.x - xDist, seg.center.y + yDist);
        }
        this.slope = (this.end.y - this.start.y) / (this.end.y - this.start.x);
        this.length = Point.distance(this.end, this.start);
        this.angle = Math.asin((this.start.y - this.end.y)/this.length) * 180 / Math.PI;
        this.generateSegments();
    }
    generateSegments(){
        this.segmentCount = this.length / segmentDensity;
        this.segmentWidth = (this.start.x - this.end.x) / this.length * segmentDensity;
        this.segmentHeight = (this.start.y - this.end.y) / this.length * segmentDensity;
        for (var i = 0; i < this.segmentCount; i++){
            var segPoint = new Point(this.start.x - i * this.segmentWidth, this.start.y - i * this.segmentHeight);
            var newSeg = (new Segment(segPoint, this, i));
            this.segments.push(newSeg);
            allSegments.push(newSeg);
        }
        console.log('width: ' + this.segmentWidth);
        console.log('height: ' + this.segmentHeight);
    }
    draw(map){
        map.moveTo(this.start.x, this.start.y);
        map.lineTo(this.end.x , this.end.y);
        var len = this.segments.length;
        for(var i = 0; i < len; i++){
            this.segments[i].draw(map);
        }

    }
}
class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    static distance(point1, point2){
        return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
    }
}
class Segment {
    //center;
    //road;
    //number;
    //left;
    //right;
    constructor(center, road, num){
        this.center = center;
        this.road = road;
        this.number = num;
        this.left = new Spot();
        this.right = new Spot();
    }
    draw(map){
        map.fillRect(this.center.x-2, this.center.y-2, 5, 5);
    }
}
class Spot {
    //content;
}
class Building {
    //size;
    //angle;
    //picute/shape?
}
class Intersection{
    //spot;
    //angle;
}
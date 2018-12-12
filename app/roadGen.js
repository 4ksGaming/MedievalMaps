/*
TODO:
        4-way intersections
        intersection fill adjacent segments
        whole num of segments on seed road
 */
var mapSize = 900;
var roadNum = 100;
var minDist = 100;
var segmentDensity = 40;
var minAngle = 90;
var overlapMax = 1/3;
var mouseOverRadius = 10;
var buildingChance = 1;
var allRoads = new Array();
var allSegments = new Array();
var allBuildings = new Array();
$( document ).ready(function() {
    var c = document.getElementById("map");
    var map = c.getContext("2d");
    map.clearRect(0,0,mapSize,mapSize);
    allSegments = [];
    allRoads =[];


    for(var i = 0; i < roadNum; i++) {
        console.log('Road  ' + i);
        var road = new Road();
        allRoads.push(road);
    }
    for(var i = 0; i < allSegments.length; i++){
       if(Math.random() <= buildingChance ) {
           allSegments[i].content = new Building();
           allBuildings.push(allSegments[i]);
       }
    }
    //for(var i = 0; i < roadNum; i++) {
    //    allRoads[i].draw(map);
    //}
    //map.stroke();

    function reOffset(){
        var BB=c.getBoundingClientRect();
        offsetX=BB.left;
        offsetY=BB.top;
    }
    var offsetX,offsetY;
    reOffset();
    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }

    draw();

    $("#map").mousemove(function(e){handleMouseMove(e);});

    function draw(){
        map.fillStyle = "#000000";
        for(var i = 0; i < roadNum; i++) {
            allRoads[i].draw(map);
        }
        map.stroke();
    }
    function handleMouseMove(e){
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX=parseInt(e.clientX-offsetX);
        mouseY=parseInt(e.clientY-offsetY);

        map.clearRect(0,0,mapSize,mapSize);
        draw();
        for(var i=0;i<allSegments.length;i++){
            var h=allSegments[i];
            var dx=mouseX-h.center.x;
            var dy=mouseY-h.center.y;
            if(dx*dx+dy*dy<mouseOverRadius*mouseOverRadius){
                map.font = "12px Arial";
                map.fillStyle = "#FF0000";
                map.fillRect(h.center.x - 7, h.center.y - 7, 156, 106);
                map.fillStyle = "#FFFFFF";
                map.fillRect(h.center.x - 4, h.center.y - 4, 150, 100);
                map.fillStyle = "#000000";
                map.fillText(h.content.label,h.center.x+11,h.center.y+11);
                break;
            }
        }

    }
});


class Road {
    constructor(){//TODO implement this as a factory
        this.segments = [];
        if(allSegments.length === 0){//TODO make this road more in the middle
            this.start = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));
            do{
                this.end = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));
            }while(Point.distance(this.start, this.end) < minDist);
            this.length = Point.distance(this.end, this.start);
            this.angle = Math.asin((this.start.y - this.end.y)/this.length) * 180 / Math.PI;
            this.generateSegments();
        }
        else {//TODO redo new roads until most segments are not over current segments
            do {
                do {
                    var seg = allSegments[Math.floor(Math.random() * allSegments.length)];
                } while (!seg.left.isOpen && !seg.right.isOpen)
                seg.right.content = new Intersection();
                seg.left.content = new Intersection();
                var parent = seg.road;

                var side = Math.floor(Math.random() * 2);//'Port' side is 0, 'Starboard' is 1
                var toEdge = -1;
                var farPoint = new Point(seg.center.x, seg.center.y);
                while (((farPoint.x < mapSize) && (farPoint.x > 0)) && ((farPoint.y < mapSize) && (farPoint.y > 0))) {

                    toEdge++;
                    if (side === 1) {
                        farPoint.x += parent.segmentHeight;
                        farPoint.y -= parent.segmentWidth;
                    } else {
                        farPoint.x -= parent.segmentHeight;
                        farPoint.y += parent.segmentWidth;
                    }
                }

                var dist = segmentDensity * (Math.floor(Math.random() * (toEdge - 2)) + 3) + 1;//TODO make 2 some exp
                var angle = Math.floor(Math.random() * (180 - 2 * minAngle)) + minAngle;
                var absAngle = (parent.angle - (180 - angle)) * Math.PI / 180;
                var xDist = dist * Math.cos(absAngle);
                var yDist = dist * Math.sin(absAngle);
                if (parent.start.x > parent.end.x) {
                    yDist *= -1;
                }
                this.start = new Point(seg.center.x, seg.center.y);
                if (side === 1) {
                    this.end = new Point(seg.center.x + xDist, seg.center.y - yDist);
                } else {
                    this.end = new Point(seg.center.x - xDist, seg.center.y + yDist);
                }
                this.length = Point.distance(this.end, this.start);
                this.angle = Math.asin((this.start.y - this.end.y)/this.length) * 180 / Math.PI;
            }while(!this.generateSegments())
        }
        this.slope = (this.end.y - this.start.y) / (this.end.y - this.start.x);
        this.pushSegmentsToAll();
    }
    generateSegments(){
        this.segments = [];
        this.segmentCount = this.length / segmentDensity;
        this.segmentWidth = (this.start.x - this.end.x) / this.length * segmentDensity;
        this.segmentHeight = (this.start.y - this.end.y) / this.length * segmentDensity;
        var overlap = 0;
        var nonOverlap = 0;
        for (var i = 0; i < this.segmentCount; i++){
            var segPoint = new Point(this.start.x - i * this.segmentWidth, this.start.y - i * this.segmentHeight);
            var newSeg = (new Segment(segPoint, this, i));
            this.segments.push(newSeg);
        }
        var oldSegLen = allSegments.length;
        for (var i = 0; i < this.segmentCount; i++) {
            var newSeg = this.segments[i];
            for (var j = 0; j < oldSegLen; j++) {
                var oldSeg = allSegments[j];
                if (Point.distance(newSeg.center, oldSeg.center) < 5) {
                    overlap++;
                    oldSeg.blockSides();
                    newSeg.blockSides();
                }
                else{
                    nonOverlap++;
                }

            }
        }
        if(overlap/nonOverlap > overlapMax){
           return false;
        }
        return true;


    }

    pushSegmentsToAll(){
        for (var i = 0; i < this.segmentCount; i++){
            allSegments.push(this.segments[i]);
        }
    }
    pushSegmentsToAll(){
        for (var i = 0; i < this.segmentCount; i++){
            allSegments.push(this.segments[i]);
        }
    }
    draw(map){
        map.moveTo(this.start.x, this.start.y);
        map.lineTo(this.end.x, this.end.y);
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
        var dist =  Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
        return dist;
    }
}
class Segment {
    constructor(center, road, num){
        this.center = center;
        this.road = road;
        this.number = num;
        this.left = new Spot();
        this.right = new Spot();
    }
    blockSides(allowBuild = false){
        this.left.isOpen = false;
        this.right.isOpen = false;
        if(allowBuild){
            this.right.markFree = true;
            this.left.markFree = true;
        }
    }
    blockAdj(allowBuild = false){
        if (this.number+1 < Math.floor(this.road.segmentCount - 1)){
            this.road.segments[this.number+1].blockSides(allowBuild);
        }
        if (this.number > 0){ this.road.segments[this.number-1].blockSides(allowBuild);}
    }

    draw(map){
        //if(this.left.isOpen) {
        //    map.fillRect(this.center.x - 2, this.center.y - 2, 11, 9);
        //}
        //else{
            map.fillRect(this.center.x - 2, this.center.y - 2, 5, 5);

        //}

    }
}
class Spot {
    //content;
    constructor() {
        this.isOpen = true;
        this.markFree = false;
    }

}
class Building {
    constructor() {
        this.label = '#' + allBuildings.length;
    }
}
class Intersection{
    //spot;
    //angle;
}
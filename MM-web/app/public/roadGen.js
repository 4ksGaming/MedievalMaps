/*
TODO:
    Abandoned buildings
    Building quilty
 */
//Variables used throughout, some to be used in sliders
var mapSize = 600;//Size of canvas map is being drawn in
var roadNum = 30;//Number of roads to generate TODO: Make this minRoads and MaxRoads
var minDist = 150;//Minimum length of a road
var segmentDensity = 30;//Distance between segments on a road
var minAngle = 90;//minimum angle of intersection between two roads
var overlapMax = 1/3;//Proportion of segments of new roads that are not intersections for it to be a valid new road
var mouseOverRadius = 15;//Mouse Over Radius of building tooltips
var buildingChance = 1;//Chance that there is a building on any given segments
var houseChance = 0.25;//Additional chance that a building will be a house. Setting to 0 means houses are as likely as any other building type

var allRoads = new Array();
var allSegments = new Array();
var allBuildings = new Array();
var buildingTypes = [
    'Butcher Shop',
    'Barracks',
    'Church',
    'Tavern',
    'Brothel',
    'Family House',
    'Blacksmith',
    'Town Hall',
    'Bank',
    'Bakery',
    'Jewelry Store',
    'Stables',
    'Apothecary',
    'Orphanage',
    'Schoolhouse',
    'House',
];

function genMap() {
    $(document).ready(function () {//Dont begin until html document is loaded
        var c = document.getElementById("map");
        var map = c.getContext("2d");
        map.beginPath();
        map.fillStyle = "#F9E4B7";
        map.fillRect(0, 0, mapSize, mapSize);
        map.closePath();


        segmentDensity = $("#segmentDensity").val();
        roadNum = $("#roadNum").val();
        minAngle = $("#minAngle").val();
        console.log(segmentDensity);

        allSegments = new Array();//Clear arrays of objects
        allRoads = new Array();
        allBuildings = new Array();


        for (var i = 0; i < roadNum; i++) {//Generates all the roads
            var road = new Road();
            if (road === false) {
                roadNum = allRoads.length - 1;
                break;
            }
            else {
                allRoads.push(road);
            }
        }

        for (var i = 0; i < allSegments.length; i++) {//Generates Buildings for each spot for them
            if (Math.random() <= buildingChance) {
                allSegments[i].content = new Building();
                allBuildings.push(allSegments[i]);
            }
        }

        function reOffset() {
            var BB = c.getBoundingClientRect();
            offsetX = BB.left;
            offsetY = BB.top;
        }

        var offsetX, offsetY;
        reOffset();
        window.onscroll = function (e) {
            reOffset();
        }
        window.onresize = function (e) {
            reOffset();
        }

        draw();

        $("#map").mousemove(function (e) {
            handleMouseMove(e);
        });

        $("#map").click(function (e) {
            handleClick(e);
        });

        function draw() {
            map.beginPath();
            map.fillStyle = "#000000";
            for (var i = 0; i < roadNum; i++) {
              if(allRoads[i].start != undefined)
                allRoads[i].draw(map);
            }
            map.stroke();
            for (var i = 0; i < allSegments.length; i++) {
                var h = allSegments[i];
                if (h.isClicked) {
                    map.font = "12px Arial";
                    map.fillStyle = "#654321";
                    map.fillRect(h.center.x - 7, h.center.y - 7, 106, 46);
                    map.fillStyle = "#FFFFFF";
                    map.fillRect(h.center.x - 4, h.center.y - 4, 100, 40);
                    map.fillStyle = "#000000";
                    map.fillText(h.content.label, h.center.x + 11, h.center.y + 11);
                    map.closePath();
                }
            }
            map.closePath();
        }

        function handleMouseMove(e) {
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();

            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            map.fillStyle = "#F9E4B7";
            map.fillRect(0, 0, mapSize, mapSize);
            draw();
            for (var i = 0; i < allSegments.length; i++) {
                var h = allSegments[i];
                var dx = mouseX - h.center.x;
                var dy = mouseY - h.center.y;
                if ((dx * dx + dy * dy < mouseOverRadius * mouseOverRadius)) {
                    map.font = "12px Arial";
                    map.fillStyle = "#654321";
                    map.fillRect(h.center.x - 7, h.center.y - 7, 106, 24);
                    map.fillStyle = "#FFFFFF";
                    map.fillRect(h.center.x - 4, h.center.y - 4, 100, 18);
                    map.fillStyle = "#000000";
                    map.fillText(h.content.label, h.center.x + 11, h.center.y + 11);
                    map.closePath();
                    break;
                }
            }

        }

        function handleClick(e) {
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();

            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);
            draw();
            for (var i = 0; i < allSegments.length; i++) {
                var h = allSegments[i];
                var dx = mouseX - h.center.x;
                var dy = mouseY - h.center.y;
                if (dx * dx + dy * dy < mouseOverRadius * mouseOverRadius) {
                    h.isClicked = !h.isClicked;
                    break;
                }
            }
        }

    });
}

class Road {
    constructor(){//TODO implement this as a factory

        //Generates road from two random points if first road
        if(allSegments.length === 0){//TODO make this road more in the middle
            this.start = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));

            do{//Ensures road meets the minimum length
                this.end = new Point(Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize));
            }while(Point.distance(this.start, this.end) < minDist);

            this.length = Point.distance(this.end, this.start);
            this.angle = Math.asin((this.start.y - this.end.y)/this.length) * 180 / Math.PI;
            this.generateSegments();
        }
        //Generates road from an intersection with existing road
        else {
            do {//All of this is redone until enough of the road isn't overtop existing road
                console.log('outer');

                var tries = 0;
                do {//Find a road segment that does not already have an intersection TODO: Fix infinite loop
                    console.log(tries);
                    if(tries++ > 150)
                        return false;
                    var seg = allSegments[Math.floor(Math.random() * allSegments.length)];
                } while (!seg.left.isOpen && !seg.right.isOpen)

                var parent = seg.road;//The old road that the new road will come off of

                var side = Math.floor(Math.random() * 2);//Picks a random side of old road to put new road on

                var toEdge = -1;//Distance from new intersection to edge of the map in approximately direction new road will go
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

                //Determines length of new road
                // -2 and +3 to make road longer than minimum length, + 1 to make road evenly divide into segments
                var dist = segmentDensity * (Math.floor(Math.random() * (toEdge - 2)) + 3) + 1;

                //Angle between old and new road in degrees
                var angle = Math.floor(Math.random() * (180 - 2 * minAngle)) + minAngle;

                //Absolute angle of new road in rads
                var absAngle = (parent.angle - (180 - angle)) * Math.PI / 180;

                //Breaks distance into x and y components to actually find coordinites of end of road
                var xDist = dist * Math.cos(absAngle);
                var yDist = dist * Math.sin(absAngle);

                //Not entirely sure why it needs this, but new road is reflected vertically sometimes without this
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
            }while(!this.generateSegments())//Redos all this until a sufficent number of new segments are not intersections
        }

        this.pushSegmentsToAll();
    }


    generateSegments(){
        this.segments = [];

        //How many segment swill be generated on the new road
        this.segmentCount = this.length / segmentDensity;

        //The horizontal and vertical distance between each segment
        this.segmentWidth = (this.start.x - this.end.x) / this.length * segmentDensity;
        this.segmentHeight = (this.start.y - this.end.y) / this.length * segmentDensity;

        var overlap = 0;//Counts of how many segments overlap old segments, used ot determine if road has enough new segments
        var nonOverlap = 0;

        //Places all segments on the road
        for (var i = 0; i < this.segmentCount; i++){
            var segPoint = new Point(this.start.x - i * this.segmentWidth, this.start.y - i * this.segmentHeight);
            var newSeg = (new Segment(segPoint, this, i));
            this.segments.push(newSeg);
        }

        //Check all new segments against all old segments to check if they are intersections
        var oldSegLen = allSegments.length;
        for (var i = 0; i < this.segmentCount; i++) {
            var newSeg = this.segments[i];

            for (var j = 0; j < oldSegLen; j++) {
                var oldSeg = allSegments[j];
                var noOverlapped = true;

                //Consider points an intersection if they are too close together
                if (Point.distance(newSeg.center, oldSeg.center) < 5) {//TODO change 5 to some var/expression of vars
                    overlap++
                    noOverlapped = false;;
                    oldSeg.blockSides();//Block both segments from being used in a new intersection
                    newSeg.blockSides();
                    break;
                }

            }
            if(noOverlapped){
                nonOverlap++;
            }
        }

        if(overlap/nonOverlap > overlapMax){
           return false;
        }else {
            return true;
        }


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
        console.log(this);
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
        this.isClicked = false;
    }

    blockSides(){
        this.left.isOpen = false;
        this.right.isOpen = false;
    }

    draw(map){
        map.fillRect(this.center.x - 2, this.center.y - 2, 5, 5);

    }
}

class Spot {
    constructor() {
        this.isOpen = true;
    }
}

class Building {
    constructor() {
        var i = Math.floor(Math.random() * buildingTypes.length / (1 - houseChance));
        var j = Math.min(i, buildingTypes.length -1);
        this.type = buildingTypes[j];
        this.label = this.type;
    }
}

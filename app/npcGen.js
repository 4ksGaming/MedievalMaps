/*Kevin Ngo
 *NPC Generation for Medieval Maps
 *Version 0.2018.12.11.1
 */

var npcs = [];	//holds array of NPCs
var noRel = [];	//holds indexes on NPCs without relationships
var relationChance = 20;	//(1/x)chance that a new NPC has a relationship with existing NPCs 
var buildingList = [];	//list of buildings in map

var buildingJob = [];	//2d array of building names and jobs available 
//x is building name, y is occupations available in building
var age = ["teen", "adult", "elder"];	//ages available for "adults"
var demean = [];	//array of demeanors
var raceName = []; //2d array of race and names for those races
//x is race name, y is names for that race
var relationName = ["Friends with ", "Parent of ", "Sibling of ", "Cousin of ", "Significant other of "]	//list of possible relationships

class adultNPC{	//class for adult NPC generation
	constructor(id, job, age, dem, race, gender, name, rel){
  	this.id = id;	//NPC index
    this.job = job;	//generated from the job list for building
    this.age = age;	//generated from teen/adult/elder
    this.demeanor = dem;	//generated from list of demeanors
    this.race = race;	//generated from list of races
    this.gender = gender;	//male or female
    this.name = name;	//generated from name list for races
    this.relationship = rel;	//percent chance generated from list relationships and list of NPCs w/o relationships
  }
}

class childNPC{	//class for child NPC generation
	constructor(){
  	this.id = id;
    this.job = "youth";
    this.age = "Child";
    this.demeanor = dem;
    this.race = race;
    this.gender = gender;
    this.name = name;
    this.parent = parent;	//generate last (or if "parent" relationship is rolled for adult, select amongst list of children)
		//set as "orphan" by default, replace with parent name if rolled
  }
}

function npcGen(building) {
  let id = npcs.length;	//id
  let randInt = Math.floor(Math.random() * buildingJob.building.length);	//occupation gen
  let job = buildingJob[randInt];
  //insert child specific generation
  //insert adult specific generation
  
  randInt = Math.floor(Math.random() * age.length);	//age range gen
  let ageNPC = age[randInt];
  randInt = Math.floor(Math.random() * demean.length);	//demeanor gen
  let demeanor = demean[randInt];
  randInt = Math.floor(Math.random() * race.length);	//race gen
  let raceNPC = race[randInt];
  randInt = Math.floor(Math.random() * 2);	//gender gen
  let gender = "Male";	//temp gender
  let name = "temp";	//temp name
  for (let i = 0; i < race.length; i++){
  	while(race[i]!=raceNPC){
    	continue;
    }
    if (randInt == 0){
    gender = "Male";
    randInt = Math.floor(Math.random() * race.male.name.length);	//first name gen
    name = race.male.name[randInt]; 
    randInt = Math.floor(Math.random() * race.surname.length);	//surname gen
    name = name + race.surname[randInt];
    break;
    }
    else{
    gender = "Female";
    randInt = Math.floor(Math.random() * race.female.name.length);
    name = race.female.name[randInt];
    randInt = Math.floor(Math.random() * race.surname.length);	//surname gen
    name = name + race.surname[randInt];
    break;
    }
  }
  let relationship = "None";
  let relName = "None";
  if(noRel.length != 0){	//check if there would be anyone to pair with
  	randInt = Math.floor(Math.random() * relationChance);
  	if(randInt == 0){	//generate relationship
  		randInt = Math.floor(Math.random() * relationName.length);
    	
	  }
  	else{	//add id to no relationship pool
  		noRel.push(id);
  	}
  }
  else{
  	noRel.push(id);
  }
  
  
  
  let newNPC = new adultNPC(id, job, ageNPC, demeanor, raceNPC, gender, name);
  npcs.push(newNPC);
}

/* ============================================================
   PokéQuiz — Monde des Ombres · couche partagée
   Données, audio chiptune, particules, helpers, moteur de quiz
   ============================================================ */

/* ---------- décor commun (corners + particules + bouton son) ---------- */
(function decor(){
  function add(){
    if(!document.querySelector('.menu-corner')){
      ['tl','tr','bl','br'].forEach(p=>{const d=document.createElement('div');d.className='menu-corner '+p;d.innerHTML='&#10022;';document.body.appendChild(d);});
    }
    if(!document.getElementById('void-canvas')){
      const c=document.createElement('canvas');c.id='void-canvas';document.body.prepend(c);
    }
    if(!document.getElementById('sparkles')){
      const s=document.createElement('div');s.className='sparkles';s.id='sparkles';document.body.appendChild(s);
    }
    if(!document.getElementById('sound-toggle')){
      const b=document.createElement('button');b.className='sound-toggle';b.id='sound-toggle';b.title='Activer/couper le son';b.innerHTML='&#9834;';
      document.body.appendChild(b);
      b.addEventListener('click',()=>{const on=!Audio8.isEnabled();Audio8.setEnabled(on);b.innerHTML=on?'&#9834;':'&#128263;';b.style.opacity=on?'1':'.5';});
    }
    initParticles();
  }
  function initParticles(){
    const c=document.getElementById('void-canvas');if(!c)return;const x=c.getContext('2d');let P=[];
    function rs(){c.width=innerWidth;c.height=innerHeight;}rs();addEventListener('resize',rs);
    for(let i=0;i<110;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.2,vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15,a:Math.random()*.5+.1,col:Math.random()>.6?'#5a3fa0':Math.random()>.5?'#2aa8c4':'#c8a84b'});
    (function loop(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle=p.col;x.globalAlpha=p.a;x.fill();});x.globalAlpha=1;requestAnimationFrame(loop);})();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();

/* ============================================================
   AUDIO — synthé chiptune (mélodies ORIGINALES, Web Audio API)
   ============================================================ */
const Audio8=(function(){
  let ctx=null,master=null,enabled=true,loopTimer=null,playing=null;
  const N={C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,R:0};
  function init(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();master=ctx.createGain();master.gain.value=.16;master.connect(ctx.destination);}
  function tone(f,start,dur,type,vol){if(!f)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(vol||.5,start+.01);g.gain.exponentialRampToValueAtTime(.001,start+dur);o.connect(g);g.connect(master);o.start(start);o.stop(start+dur+.02);}
  const SONGS={
    distortion:{mood:"Monde Distorsion (mystérieux)",tempo:.16,
      lead:[["A3",1],["C4",1],["E4",1],["A4",1],["G4",1],["E4",1],["C4",2],["F3",1],["A3",1],["C4",1],["F4",1],["E4",1],["C4",1],["A3",2],["G3",1],["B3",1],["D4",1],["G4",1],["F4",1],["D4",1],["B3",2],["E4",1],["D4",1],["C4",1],["B3",1],["A3",2],["R",1]],
      bass:[["A3",2],["A3",2],["F3",2],["F3",2],["G3",2],["G3",2],["E3",2],["E3",2]]},
    route:{mood:"Route (exploration)",tempo:.13,
      lead:[["C5",1],["E5",1],["G5",1],["E5",1],["C5",1],["D5",1],["E5",2],["F5",1],["E5",1],["D5",1],["C5",1],["D5",2],["R",1],["G4",1],["A4",1],["B4",1],["C5",1],["D5",1],["E5",1],["C5",2],["G5",2],["R",1]],
      bass:[["C4",2],["G3",2],["A3",2],["F3",2],["C4",2],["G3",2],["C4",2],["G3",2]]},
    battle:{mood:"Combat (tension)",tempo:.11,
      lead:[["E4",1],["E4",1],["E5",1],["R",1],["E4",1],["C5",1],["B4",1],["A4",1],["G4",1],["A4",1],["B4",1],["C5",2],["D5",1],["E5",1],["F5",1],["E5",1],["D5",2]],
      bass:[["E3",1],["E3",1],["A3",1],["A3",1],["G3",1],["G3",1],["C4",1],["C4",1]]},
    town:{mood:"Village paisible",tempo:.18,
      lead:[["G4",2],["A4",1],["B4",1],["C5",2],["B4",1],["A4",1],["G4",2],["E4",2],["F4",1],["G4",1],["A4",2],["G4",2],["R",1],["C5",2],["B4",1],["G4",1],["A4",2],["F4",2]],
      bass:[["C4",2],["E3",2],["F3",2],["G3",2],["C4",2],["G3",2]]},
    legendary:{mood:"Pokémon Légendaire (épique)",tempo:.14,
      lead:[["A3",1],["E4",1],["A4",1],["B4",1],["C5",2],["B4",1],["A4",1],["E4",2],["F4",1],["A4",1],["C5",1],["D5",1],["E5",2],["D5",1],["C5",1],["B4",2],["A4",1],["G4",1],["A4",3]],
      bass:[["A3",1],["A3",1],["F3",1],["F3",1],["G3",1],["G3",1],["E3",1],["E3",1],["A3",2]]}
  };
  function playSong(name,loop){
    if(!enabled)return;init();if(ctx.state==='suspended')ctx.resume();
    const s=SONGS[name];if(!s)return;stopLoop();
    const t0=ctx.currentTime+.05,T=s.tempo;let t=t0;
    s.lead.forEach(([n,b])=>{tone(N[n],t,T*b*.95,'square',.5);t+=T*b;});
    const dur=t-t0;let tb=t0,total=0;s.bass.forEach(([n,b])=>total+=b);const u=dur/total;
    s.bass.forEach(([n,b])=>{tone(N[n],tb,u*b*.9,'triangle',.42);tb+=u*b;});
    playing=name;
    if(loop)loopTimer=setTimeout(()=>playSong(name,true),dur*1000);
  }
  function stopLoop(){if(loopTimer){clearTimeout(loopTimer);loopTimer=null;}playing=null;}
  function jingleGood(){if(!enabled)return;init();if(ctx.state==='suspended')ctx.resume();const t=ctx.currentTime;tone(N.C5,t,.08,'square',.5);tone(N.E5,t+.08,.08,'square',.5);tone(N.G5,t+.16,.18,'square',.5);}
  function jingleBad(){if(!enabled)return;init();if(ctx.state==='suspended')ctx.resume();const t=ctx.currentTime;tone(N.E4,t,.1,'sawtooth',.4);tone(N.C4,t+.1,.22,'sawtooth',.4);}
  function click(){if(!enabled)return;init();if(ctx.state==='suspended')ctx.resume();tone(660,ctx.currentTime,.05,'square',.28);}
  function setEnabled(v){enabled=v;if(!v)stopLoop();}
  function songMood(name){return SONGS[name]?SONGS[name].mood:"";}
  function songList(){return Object.keys(SONGS);}
  return {playSong,stopLoop,jingleGood,jingleBad,click,setEnabled,isEnabled:()=>enabled,nowPlaying:()=>playing,songMood,songList};
})();

/* ============================================================
   DONNÉES
   ============================================================ */
const TYPES=["Normal","Feu","Eau","Électrik","Plante","Glace","Combat","Poison","Sol","Vol","Psy","Insecte","Roche","Spectre","Dragon","Ténèbres","Acier","Fée"];

/* table d'efficacité offensive : type attaquant -> types contre lesquels il est SUPER efficace */
const SUPER_EFFECTIVE={
  "Normal":[], "Feu":["Plante","Glace","Insecte","Acier"], "Eau":["Feu","Sol","Roche"],
  "Électrik":["Eau","Vol"], "Plante":["Eau","Sol","Roche"], "Glace":["Plante","Sol","Vol","Dragon"],
  "Combat":["Normal","Glace","Roche","Ténèbres","Acier"], "Poison":["Plante","Fée"],
  "Sol":["Feu","Électrik","Poison","Roche","Acier"], "Vol":["Plante","Combat","Insecte"],
  "Psy":["Combat","Poison"], "Insecte":["Plante","Psy","Ténèbres"], "Roche":["Feu","Glace","Vol","Insecte"],
  "Spectre":["Psy","Spectre"], "Dragon":["Dragon"], "Ténèbres":["Psy","Spectre"],
  "Acier":["Glace","Roche","Fée"], "Fée":["Combat","Dragon","Ténèbres"]
};

function typeColor(t){const m={Normal:"#9099a1",Feu:"#e0603c",Eau:"#4f8fda","Électrik":"#e8c84f",Plante:"#5fbf57",Glace:"#6fd0d8",Combat:"#c44a4a",Poison:"#a868c0",Sol:"#d0a85a",Vol:"#7fafe0",Psy:"#e06a90",Insecte:"#9fb84a",Roche:"#b8a868",Spectre:"#7a5fb0",Dragon:"#6a5fd8","Ténèbres":"#6a5a55",Acier:"#7fa8b8","Fée":"#e8a0c8"};return m[t]||"#8a6fd0";}

/* 41 Pokémon : name, slug(EN pour Showdown), id(dex pour fallback), type, region, weak, moves, sig, lore */
const ROSTER=[
  {name:"Mimiqui",slug:"mimikyu",id:778,fav:true,type:["Spectre","Fée"],region:"Alola",weak:["Spectre","Acier"],moves:["Ombre Portée","Tour Rapide","Feu Follet","Étreinte"],sig:"Tour Rapide",lore:"Se cache sous un déguisement en tissu imitant Pikachu. D'une solitude extrême, il se déguise pour se faire des amis ; voir ce qu'il y a dessous serait fatal."},
  {name:"Nymphali",slug:"sylveon",id:700,fav:true,type:["Fée"],region:"Kalos",weak:["Poison","Acier"],moves:["Tonnerre de Fée","Câlinerie","Voile Aurore","Vibrato"],sig:"Tonnerre de Fée",lore:"Évolution Fée d'Évoli, obtenue par affection. Il enroule ses appendices rubanés autour du bras de son Dresseur et diffuse une aura apaisante."},
  {name:"Exagide",slug:"aegislash",id:681,fav:true,type:["Spectre","Acier"],region:"Kalos",weak:["Feu","Sol","Spectre","Ténèbres"],moves:["Lame Sainte","Bouclier Royal","Ombre Portée","Tête de Fer"],sig:"Bouclier Royal",lore:"Pokémon Épée Royale. Il alterne entre Forme Parade (défense) et Forme Assaut (attaque). On dit qu'il détecte ceux qui ont l'âme d'un roi."},
  {name:"Gallame",slug:"gallade",id:475,fav:true,type:["Psy","Combat"],region:"Sinnoh",weak:["Spectre","Vol","Fée"],moves:["Lame Sainte","Tranche Psycho","Close Combat","Danse-Lames"],sig:"Lame Sainte",lore:"Chevalier courtois qui transforme ses coudes en lames acérées. Il protège ceux qui lui sont chers et lit les pensées de son adversaire pour anticiper ses coups."},
  {name:"Dracaufeu",slug:"charizard",id:6,type:["Feu","Vol"],region:"Kanto",weak:["Roche","Eau","Électrik"],moves:["Lance-Flammes","Déflagration","Vol","Crocs Feu"],sig:"Déflagration",lore:"Crache un feu si chaud qu'il fait fondre presque tout. Sa flamme caudale s'intensifie quand il a vécu de rudes combats."},
  {name:"Rayquaza",slug:"rayquaza",id:384,type:["Dragon","Vol"],region:"Hoenn",weak:["Glace","Dragon","Fée","Roche"],moves:["Draco-Météore","Ouragan","Dracogriffe","Ascension"],sig:"Ascension",lore:"Vit dans la couche d'ozone depuis des centaines de millions d'années. Il apaise les conflits entre Groudon et Kyogre."},
  {name:"Pikachu",slug:"pikachu",id:25,type:["Électrik"],region:"Kanto",weak:["Sol"],moves:["Tonnerre","Vive-Attaque","Queue de Fer","Cage-Éclair"],sig:"Tonnerre",lore:"Stocke de l'électricité dans ses joues. Lorsque plusieurs se rassemblent, leur décharge peut provoquer des orages."},
  {name:"Évoli",slug:"eevee",id:133,type:["Normal"],region:"Kanto",weak:["Combat"],moves:["Vive-Attaque","Charge","Câlinerie","Morsure"],sig:"Vive-Attaque",lore:"Patrimoine génétique instable qui lui permet d'évoluer en de nombreuses formes selon son environnement."},
  {name:"Bulbizarre",slug:"bulbasaur",id:1,type:["Plante","Poison"],region:"Kanto",weak:["Feu","Psy","Vol","Glace"],moves:["Fouet Lianes","Tranch'Herbe","Vampigraine","Lance-Soleil"],sig:"Vampigraine",lore:"Possède une graine plantée sur le dos à la naissance, qui grandit en puisant l'énergie du soleil."},
  {name:"Salamèche",slug:"charmander",id:4,type:["Feu"],region:"Kanto",weak:["Eau","Sol","Roche"],moves:["Flammèche","Griffe","Crocs Feu","Lance-Flammes"],sig:"Flammèche",lore:"La flamme au bout de sa queue indique son humeur. Elle vacille quand il s'amuse, flambe quand il s'énerve."},
  {name:"Carapuce",slug:"squirtle",id:7,type:["Eau"],region:"Kanto",weak:["Plante","Électrik"],moves:["Pistolet à O","Repli","Hydrocanon","Morsure"],sig:"Pistolet à O",lore:"Sa carapace ne sert pas qu'à se protéger : sa forme arrondie et ses rainures réduisent la résistance dans l'eau."},
  {name:"Florizarre",slug:"venusaur",id:3,type:["Plante","Poison"],region:"Kanto",weak:["Feu","Psy","Vol","Glace"],moves:["Lance-Soleil","Vampigraine","Bomb-Beurk","Synthèse"],sig:"Lance-Soleil",lore:"La fleur sur son dos libère un parfum apaisant. Elle se pare de couleurs vives lorsqu'elle absorbe assez de lumière."},
  {name:"Tortank",slug:"blastoise",id:9,type:["Eau"],region:"Kanto",weak:["Plante","Électrik"],moves:["Hydrocanon","Surf","Laser Glace","Morsure"],sig:"Hydrocanon",lore:"Les canons de sa carapace tirent des jets d'eau capables de transpercer le béton à grande distance."},
  {name:"Mewtwo",slug:"mewtwo",id:150,type:["Psy"],region:"Kanto",weak:["Insecte","Spectre","Ténèbres"],moves:["Psyko","Aurasphère","Ball'Ombre","Plénitude"],sig:"Psyko",lore:"Créé par manipulation génétique à partir de Mew. Son cœur est aussi froid que ses pouvoirs psychiques sont dévastateurs."},
  {name:"Mew",slug:"mew",id:151,type:["Psy"],region:"Kanto",weak:["Insecte","Spectre","Ténèbres"],moves:["Psyko","Métronome","Vibra-Soul","Aéropique"],sig:"Métronome",lore:"On dit qu'il possède l'ADN de tous les Pokémon. Extrêmement rare, il n'apparaît qu'à de très rares élus."},
  {name:"Ronflex",slug:"snorlax",id:143,type:["Normal"],region:"Kanto",weak:["Combat"],moves:["Plaquage","Repos","Bâillement","Hyper Voix"],sig:"Repos",lore:"Ne fait que manger et dormir. Il lui faut 400 kg de nourriture par jour avant de s'endormir n'importe où."},
  {name:"Lucario",slug:"lucario",id:448,type:["Combat","Acier"],region:"Sinnoh",weak:["Feu","Combat","Sol"],moves:["Aurasphère","Close Combat","Vitesse Extrême","Os Barrage"],sig:"Aurasphère",lore:"Perçoit l'aura de tous les êtres vivants. Il peut ainsi lire dans les pensées et anticiper les mouvements à 1 km."},
  {name:"Dracolosse",slug:"dragonite",id:149,type:["Dragon","Vol"],region:"Kanto",weak:["Glace","Dragon","Fée","Roche"],moves:["Ouragan","Dracogriffe","Vitesse Extrême","Danse Draco"],sig:"Ouragan",lore:"Réputé bienveillant, il guide vers la côte les marins et les navires pris dans la tempête."},
  {name:"Ectoplasma",slug:"gengar",id:94,type:["Spectre","Poison"],region:"Kanto",weak:["Sol","Psy","Spectre","Ténèbres"],moves:["Ball'Ombre","Bomb-Beurk","Léchouille","Hypnose"],sig:"Ball'Ombre",lore:"Tapi dans l'ombre, il guette ses proies. On dit que le frisson soudain dans le dos signale sa présence."},
  {name:"Magicarpe",slug:"magikarp",id:129,type:["Eau"],region:"Kanto",weak:["Plante","Électrik"],moves:["Trempette","Charge","Plaquage"],sig:"Trempette",lore:"Réputé pour sa faiblesse et son inutilité. Pourtant, après bien des épreuves, il évolue en un monstre redoutable."},
  {name:"Léviator",slug:"gyarados",id:130,type:["Eau","Vol"],region:"Kanto",weak:["Électrik","Roche"],moves:["Cascade","Danse Draco","Plaquage","Hyper Voix"],sig:"Cascade",lore:"D'un tempérament féroce et destructeur, il est connu pour raser des villes entières lorsque sa colère s'éveille."},
  {name:"Aquali",slug:"vaporeon",id:134,type:["Eau"],region:"Kanto",weak:["Plante","Électrik"],moves:["Hydrocanon","Surf","Laser Glace","Bulles d'O"],sig:"Surf",lore:"Ses cellules ressemblant à celles de l'eau lui permettent de se fondre dans la surface et de devenir invisible."},
  {name:"Voltali",slug:"jolteon",id:135,type:["Électrik"],region:"Kanto",weak:["Sol"],moves:["Tonnerre","Cage-Éclair","Vive-Attaque","Dard-Nuée"],sig:"Cage-Éclair",lore:"Quand il est en colère ou effrayé, ses poils se hérissent comme des aiguilles qu'il projette sur l'ennemi."},
  {name:"Pyroli",slug:"flareon",id:136,type:["Feu"],region:"Kanto",weak:["Eau","Sol","Roche"],moves:["Lance-Flammes","Crocs Feu","Vive-Attaque","Boutefeu"],sig:"Boutefeu",lore:"Sa poche de feu interne peut atteindre 900 °C. Il y stocke l'air qu'il inhale pour cracher des flammes."},
  {name:"Métamorph",slug:"ditto",id:132,type:["Normal"],region:"Kanto",weak:["Combat"],moves:["Morphing"],sig:"Morphing",lore:"Capable de copier la structure cellulaire de n'importe quelle cible pour se transformer parfaitement en elle."},
  {name:"Tyranocif",slug:"tyranitar",id:248,type:["Roche","Ténèbres"],region:"Johto",weak:["Combat","Sol","Insecte","Acier","Eau","Plante","Fée"],moves:["Éboulement","Séisme","Vibrobscur","Danse Draco"],sig:"Éboulement",lore:"Si puissant qu'il peut faire s'effondrer des montagnes pour s'y bâtir un nid. Sa carapace résiste à tout."},
  {name:"Goupix",slug:"vulpix",id:37,type:["Feu"],region:"Kanto",weak:["Eau","Sol","Roche"],moves:["Flammèche","Feu Follet","Roue de Feu","Vive-Attaque"],sig:"Feu Follet",lore:"À la naissance il n'a qu'une queue blanche, qui se divise en six et se réchauffe à mesure qu'il grandit."},
  {name:"Feunard",slug:"ninetales",id:38,type:["Feu"],region:"Kanto",weak:["Eau","Sol","Roche"],moves:["Lance-Flammes","Feu Follet","Rayon Psy","Danse Flammes"],sig:"Danse Flammes",lore:"Doté de neuf queues et d'une vie quasi millénaire. La légende dit qu'il maudit quiconque ose toucher sa fourrure."},
  {name:"Noctali",slug:"umbreon",id:197,type:["Ténèbres"],region:"Johto",weak:["Combat","Insecte","Fée"],moves:["Vibrobscur","Morsure","Ball'Ombre","Repos"],sig:"Vibrobscur",lore:"Évolution d'Évoli liée à la lune. Ses anneaux brillent dans le noir et il crache un venin lorsqu'il est menacé."},
  {name:"Carchacrok",slug:"garchomp",id:445,type:["Dragon","Sol"],region:"Sinnoh",weak:["Glace","Dragon","Fée"],moves:["Dracogriffe","Séisme","Draco-Météore","Danse Draco"],sig:"Dracogriffe",lore:"File à la vitesse d'un jet. Ses écailles aérodynamiques fendent l'air et ses ailes lui font fendre les cieux."},
  {name:"Métalosse",slug:"metagross",id:376,type:["Acier","Psy"],region:"Hoenn",weak:["Feu","Sol","Spectre","Ténèbres"],moves:["Comète Poing","Psyko","Séisme","Plénitude"],sig:"Comète Poing",lore:"Né de la fusion de deux Métang, il possède quatre cerveaux : sa puissance de calcul dépasse celle d'un super-ordinateur."},
  {name:"Drattak",slug:"salamence",id:373,type:["Dragon","Vol"],region:"Hoenn",weak:["Glace","Dragon","Fée","Roche"],moves:["Draco-Météore","Lance-Flammes","Dracogriffe","Danse Draco"],sig:"Draco-Météore",lore:"À force de rêver de voler, il a fini par développer des ailes. Quand il s'emporte, il crache du feu en planant."},
  {name:"Absol",slug:"absol",id:359,type:["Ténèbres"],region:"Hoenn",weak:["Combat","Insecte","Fée"],moves:["Tranche-Nuit","Danse-Lames","Coup Bas","Lame de Roc"],sig:"Tranche-Nuit",lore:"Surnommé le Pokémon Désastre car il apparaît avant les catastrophes — à tort accusé de les provoquer."},
  {name:"Togekiss",slug:"togekiss",id:468,type:["Fée","Vol"],region:"Sinnoh",weak:["Électrik","Glace","Roche","Acier","Poison"],moves:["Lame d'Air","Éclat Magique","Aurasphère","Machination"],sig:"Éclat Magique",lore:"Évite les zones de conflit et de discorde. On dit qu'il n'apparaît que dans les pays en paix, en partageant ses dons."},
  {name:"Amphinobi",slug:"greninja",id:658,type:["Eau","Ténèbres"],region:"Kalos",weak:["Plante","Électrik","Combat","Insecte","Fée"],moves:["Shuriken de Glace","Hydrocanon","Tranche-Nuit","Ombre Portée"],sig:"Shuriken de Glace",lore:"Ninja aquatique d'une vitesse fulgurante. Il façonne des shurikens d'eau compressée et se fond dans son environnement."},
  {name:"Zoroark",slug:"zoroark",id:571,type:["Ténèbres"],region:"Unys",weak:["Combat","Insecte","Fée"],moves:["Vibrobscur","Tranche-Nuit","Lance-Flammes","Machination"],sig:"Vibrobscur",lore:"Maître de l'illusion, il peut créer des décors entiers pour tromper l'œil humain et protéger les siens."},
  {name:"Lokhlass",slug:"lapras",id:131,type:["Eau","Glace"],region:"Kanto",weak:["Combat","Roche","Plante","Électrik"],moves:["Laser Glace","Surf","Chant Mélodieux","Plaquage"],sig:"Laser Glace",lore:"Doux et intelligent, il transporte volontiers les gens sur son dos en traversant les mers en chantant."},
  {name:"Lugia",slug:"lugia",id:249,type:["Psy","Vol"],region:"Johto",weak:["Spectre","Ténèbres","Roche","Électrik","Glace"],moves:["Aéroblast","Psyko","Ultralaser","Plénitude"],sig:"Aéroblast",lore:"Gardien des mers, il sommeille au fond des abysses. Un seul battement de ses ailes peut déclencher une tempête de 40 jours."},
  {name:"Ho-Oh",slug:"ho-oh",id:250,type:["Feu","Vol"],region:"Johto",weak:["Eau","Électrik","Roche"],moves:["Feu Sacré","Aéropique","Rugissement","Danse Flammes"],sig:"Feu Sacré",lore:"Son plumage arc-en-ciel brille de sept couleurs selon l'angle. On dit qu'un bonheur éternel attend qui l'aperçoit."},
  {name:"Roucarnage",slug:"pidgeot",id:18,type:["Normal","Vol"],region:"Kanto",weak:["Électrik","Roche","Glace"],moves:["Cru-Aile","Tornade","Vive-Attaque","Ouragan"],sig:"Cru-Aile",lore:"Vole à Mach 2 à la recherche de proies. Ses ailes splendides et puissantes soulèvent de véritables bourrasques."},
  {name:"Alakazam",slug:"alakazam",id:65,type:["Psy"],region:"Kanto",weak:["Insecte","Spectre","Ténèbres"],moves:["Psyko","Téléport","Vibration Psy","Plénitude"],sig:"Psyko",lore:"Son QI dépasserait les 5000. Il se souvient de tout ce qui lui est arrivé depuis sa naissance et calcule plus vite qu'un ordinateur."}
];
const ALL_NAMES=ROSTER.map(p=>p.name);
const PLAYABLE=ROSTER.filter(p=>p.type);

/* banque musicale (faits, sûrs) */
const MUSIC_BANK=[
  {q:"Qui a composé la bande-son des tout premiers jeux Pokémon (Rouge/Vert/Bleu, 1996) ?",correct:"Junichi Masuda",wrong:["Koji Kondo","Nobuo Uematsu","Toby Fox"],fb:"Junichi Masuda, membre fondateur de Game Freak, a composé la musique des jeux d'origine — souvent avec très peu de mémoire disponible sur Game Boy."},
  {q:"Quelle ville de Kanto est célèbre pour son thème inquiétant et dissonant ?",correct:"Lavanville",wrong:["Bourg Palette","Carmin sur Mer","Azuria"],fb:"Le thème de Lavanville (Lavender Town) est resté culte pour son ambiance lugubre, en lien avec la Tour Pokémon et ses fantômes."},
  {q:"Quel créateur d'Undertale a composé un thème de combat pour Pokémon Épée et Bouclier ?",correct:"Toby Fox",wrong:["Junichi Masuda","Go Ichinose","Shota Kageyama"],fb:"Toby Fox, créateur d'Undertale, a composé un thème de combat pour Épée/Bouclier."},
  {q:"Quel petit jingle joue lorsqu'on soigne ses Pokémon ?",correct:"Le thème du Centre Pokémon",wrong:["Le thème d'arène","La fanfare de victoire","Le thème de la Route 1"],fb:"La courte mélodie du Centre Pokémon, qui accompagne le soin, est l'un des jingles les plus reconnaissables de la série."},
  {q:"Quel signal sonore se superpose à la musique quand les PV de votre Pokémon sont bas ?",correct:"Le bip d'alerte de PV faibles",wrong:["Le thème de la Ligue","Le thème du Vélo","Le générique de fin"],fb:"Le célèbre bip strident des PV dans le rouge a stressé des générations de joueurs."},
  {q:"Quelle activité possède un thème entraînant très apprécié à Kanto et Johto ?",correct:"Le Vélo",wrong:["La pêche","La capture","Le change d'objet"],fb:"Le thème du Vélo, rythmé et joyeux, est l'un des morceaux les plus appréciés des fans."},
  {q:"La fanfare jouée après une victoire de combat s'appelle communément… ?",correct:"La fanfare de victoire",wrong:["L'hymne de la Ligue","Le thème du Champion","La marche du Conseil 4"],fb:"Cette courte fanfare, jouée à la fin de chaque combat gagné, est un signal de récompense emblématique."},
  {q:"Quel adversaire bénéficie en général de la musique la plus épique d'un jeu Pokémon ?",correct:"Le Maître de la Ligue (Champion)",wrong:["Le premier dresseur Insecte","Un Pêcheur","Le vendeur de la Boutique"],fb:"Le combat contre le Maître de la Ligue est traditionnellement souligné par le thème le plus grandiose du jeu."},
  {q:"Sur quelle console les contraintes sonores des premiers thèmes étaient-elles les plus fortes ?",correct:"La Game Boy",wrong:["La Nintendo Switch","La Nintendo DS","La GameCube"],fb:"La Game Boy ne disposait que de quelques canaux audio, ce qui a façonné le style chiptune des premières musiques."},
  {q:"Quel studio développe les jeux Pokémon principaux et leurs musiques ?",correct:"Game Freak",wrong:["HAL Laboratory","Intelligent Systems","Square Enix"],fb:"Game Freak développe la série principale ; sa petite équipe maison signe la plupart des bandes-son."},
  {q:"Le thème de combat contre quel type d'adversaire est distinct de celui des dresseurs ?",correct:"Les Pokémon sauvages",wrong:["Les soigneuses","Les marchands","Les passants"],fb:"Les combats contre les Pokémon sauvages ont leur propre thème, différent des combats de dresseurs."},
  {q:"Quelle équipe maléfique de Kanto possède son propre thème menaçant ?",correct:"La Team Rocket",wrong:["La Team Galaxie","La Team Aqua","La Team Plasma"],fb:"La Team Rocket, antagoniste de la première génération, a droit à un thème reconnaissable dans ses repaires."},
  {q:"Comment qualifie-t-on le style sonore rétro des premières musiques Pokémon ?",correct:"Le chiptune (8-bit)",wrong:["L'orchestral symphonique","Le jazz be-bop","La synthwave"],fb:"Le chiptune désigne la musique générée par les puces sonores des vieilles consoles, au son typiquement 8-bit."},
  {q:"Quel élément musical accompagne souvent l'apparition d'un Pokémon légendaire ?",correct:"Un thème solennel et dramatique propre au légendaire",wrong:["Le jingle du Centre Pokémon","Le thème du Vélo","La musique du Casino"],fb:"Les légendaires ont fréquemment leur propre thème, plus grave, soulignant l'enjeu de la rencontre."},
  {q:"Les bandes-son modernes (Switch) utilisent davantage… ?",correct:"Des arrangements orchestraux/instrumentaux",wrong:["Uniquement du 8-bit pur","Du silence total","Des bruitages seuls"],fb:"Avec les consoles récentes, les musiques se sont enrichies d'arrangements orchestraux tout en gardant des clins d'œil chiptune."},
  {q:"Dans la plupart des jeux, quel lieu a une musique calme de petit village de départ ?",correct:"Le bourg natal du joueur",wrong:["La Ligue Pokémon","La grotte finale","Le repaire de l'équipe ennemie"],fb:"Le village de départ du héros a typiquement un thème paisible qui pose l'ambiance du début d'aventure."},
  {q:"Comment appelle-t-on le bref motif sonore qui retentit quand un Pokémon apparaît au combat ?",correct:"Le cri du Pokémon",wrong:["La fanfare de niveau","Le thème de la zone","Le bip de menu"],fb:"Chaque espèce possède un cri distinct ; sur Game Boy, ces cris étaient de courts effets sonores synthétisés."},
  {q:"Quel moment de jeu déclenche en général une courte fanfare ascendante de récompense ?",correct:"La montée de niveau / l'obtention d'un badge",wrong:["L'entrée dans une grotte","Le fait de marcher dans l'herbe","L'ouverture du sac"],fb:"Les fanfares ascendantes marquent les récompenses : montée de niveau, badge d'arène, objet rare obtenu."}
];

/* ============================================================
   HELPERS
   ============================================================ */
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const rand=a=>a[Math.floor(Math.random()*a.length)];
function otherNames(ex,n=3){return shuffle(ALL_NAMES.filter(x=>x!==ex)).slice(0,n);}
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function decodeHtml(s){const t=document.createElement("textarea");t.innerHTML=s;return t.value;}
function spriteHTML(p,silhouette){
  const ani="https://play.pokemonshowdown.com/sprites/ani/"+p.slug+".gif";
  const home="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/"+p.id+".png";
  const art="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"+p.id+".png";
  return '<img class="q-sprite'+(silhouette?" silhouette":"")+'" alt="'+escapeHtml(p.name)+'" src="'+ani+'" data-home="'+home+'" data-art="'+art+'" data-step="0" '+
    'onerror="var s=this.dataset.step;if(s===\'0\'){this.dataset.step=\'1\';this.src=this.dataset.home;}else if(s===\'1\'){this.dataset.step=\'2\';this.src=this.dataset.art;}else{this.style.display=\'none\';}">';
}
function spawnSparkles(el){
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,cont=document.getElementById("sparkles");if(!cont)return;
  for(let i=0;i<14;i++){const sp=document.createElement("div");sp.className="sparkle";const a=(i/14)*Math.PI*2,d=40+Math.random()*50;
    sp.style.cssText="left:"+cx+"px;top:"+cy+"px;--tx:"+Math.cos(a)*d+"px;--ty:"+Math.sin(a)*d+"px;background:"+(Math.random()>.5?"#c8a84b":"#4fcfea")+";animation-delay:"+Math.random()*.2+"s;";
    cont.appendChild(sp);setTimeout(()=>sp.remove(),1000);}
}

/* ============================================================
   MOTEUR DE QUIZ réutilisable
   GAME = { title, subtitle, ambiance, difficulties:[...], makeQuestion(), hints }
   difficulties: tableau de clés parmi DIFFS, ou objets custom
   ============================================================ */
const DIFFS={
  sprint:{key:"sprint",icon:"&#9889;",label:"Sprint",desc:"10 questions, rapide",n:10},
  defi:{key:"defi",icon:"&#128293;",label:"Défi",desc:"20 questions",n:20},
  marathon:{key:"marathon",icon:"&#128142;",label:"Marathon",desc:"50 questions",n:50},
  infini:{key:"infini",icon:"&#8734;",label:"Infini",desc:"Sans fin — joue jusqu'à abandonner",n:0,cls:"infinite"},
  survie:{key:"survie",icon:"&#10084;",label:"Survie",desc:"3 vies · 12s par question",n:0,lives:3,timer:12,cls:"survie"}
};

const Quiz=(function(){
  let G=null;
  let st={};
  let timerInt=null;

  function mount(gameConfig){
    G=gameConfig;
    G.difficulties=(G.difficulties||["sprint","defi","marathon","infini"]).map(d=>typeof d==="string"?DIFFS[d]:d);
    const app=document.getElementById("app");
    app.innerHTML=
      // start
      '<div id="q-start" class="screen active"><div class="start-wrap">'+
        '<p class="sec-title">'+(G.eyebrow||"Choisis ton épreuve")+'</p>'+
        '<h1 class="sec-head">'+G.title+'</h1>'+
        '<p class="sec-sub">'+(G.subtitle||"")+'</p>'+
        (G.intro||"")+
        '<div class="sep"></div>'+
        '<div class="mode-cards" id="q-modes"></div>'+
        '<a class="res-btn secondary" href="index.html">&#8592; Menu principal</a>'+
      '</div></div>'+
      // game
      '<div id="q-game" class="screen"><div class="game-wrap">'+
        '<div class="game-header">'+
          '<button class="back-btn" id="q-quit">&#8592; Quitter</button>'+
          '<div class="game-info" id="q-info"></div>'+
        '</div>'+
        '<div class="progress-wrap"><div class="progress-fill" id="q-progress" style="width:0%"></div></div>'+
        '<div id="q-area"></div>'+
      '</div></div>'+
      // results
      '<div id="q-results" class="screen"><div class="results-wrap">'+
        '<div class="orb"><span class="big" id="q-pct">0%</span><span class="sub">PRÉCISION</span></div>'+
        '<h2 class="res-title" id="q-rtitle"></h2><p class="res-flavor" id="q-rflavor"></p>'+
        '<div class="sep"></div>'+
        '<div class="res-break" id="q-break"></div>'+
        '<div class="res-btns">'+
          '<button class="res-btn primary" id="q-replay">Rejouer</button>'+
          '<button class="res-btn secondary" id="q-change">Changer de mode</button>'+
          '<a class="res-btn secondary" href="index.html">Menu</a>'+
        '</div>'+
      '</div></div>';

    const modes=document.getElementById("q-modes");
    G.difficulties.forEach(d=>{
      const c=document.createElement("div");c.className="mode-card"+(d.cls?(" "+d.cls):"");
      c.innerHTML='<span class="mi">'+d.icon+'</span><p class="mn">'+d.label+'</p><p class="md">'+d.desc+'</p>';
      c.addEventListener("click",()=>{Audio8.click();start(d);});
      modes.appendChild(c);
    });
    document.getElementById("q-quit").addEventListener("click",quit);
    document.getElementById("q-replay").addEventListener("click",()=>{Audio8.click();start(st.diff);});
    document.getElementById("q-change").addEventListener("click",()=>{Audio8.click();Audio8.stopLoop();showS("q-start");});
  }

  function showS(id){document.querySelectorAll("#app .screen").forEach(s=>s.classList.remove("active"));document.getElementById(id).classList.add("active");scrollTo(0,0);}

  function start(d){
    st={diff:d,total:d.n===0?Infinity:d.n,infinite:d.n===0,lives:d.lives||0,maxLives:d.lives||0,
        timer:d.timer||0,score:0,streak:0,best:0,i:0,wrong:0,answered:false,hintUsed:false};
    if(G.ambiance)Audio8.playSong(G.ambiance,true);
    showS("q-game");
    render();
  }

  function quit(){
    if(st.i>0){
      if(st.infinite||st.lives){ if(confirm("Terminer la partie et voir ton score ?")) return results(); return; }
      if(!confirm("Abandonner cette partie ? Tes progrès seront perdus."))return;
    }
    Audio8.stopLoop();showS("q-start");
  }

  function render(){
    clearTimer();
    st.answered=false;st.hintUsed=false;
    const q=G.makeQuestion(st);
    st.current=q;

    // header info
    const info=document.getElementById("q-info");
    let h="";
    h+='<div class="chip">QUESTION<span>'+(st.infinite?("&#8734; "+(st.i+1)):((st.i+1)+"/"+st.total))+'</span></div>';
    h+='<div class="chip">SCORE<span>'+st.score+'</span></div>';
    if(st.maxLives)h+='<div class="chip lives">VIES<span>'+("&#10084;".repeat(st.lives)||"—")+'</span></div>';
    if(st.timer)h+='<div class="chip timer">TEMPS<span id="q-time">'+st.timer+'</span></div>';
    if(st.streak>=3)h+='<div class="streak-badge">&#128293; '+st.streak+' série&#8201;!</div>';
    info.innerHTML=h;

    // progress
    const pg=document.getElementById("q-progress");
    if(st.infinite){pg.className="progress-fill";pg.style.width=((st.i%20)/20*100)+"%";}
    else{pg.className="progress-fill";pg.style.width=(st.i/st.total*100)+"%";}

    // body
    const answers=q.answers.map((a,i)=>'<button class="answer-btn" data-val="'+escapeHtml(a)+'"><span class="al">'+["A","B","C","D","E"][i]+'</span>'+escapeHtml(a)+'</button>').join("");
    const hintRow=(G.hints&&q.hint)?'<div class="hint-row"><button class="hint-btn" id="q-hint">&#128161; Indice</button></div><div class="hint-text" id="q-hinttext" style="display:none"></div>':"";
    document.getElementById("q-area").innerHTML=
      '<div class="q-card">'+(q.badge||"")+
        '<p class="q-tlabel">'+(q.tlabel||"")+'</p>'+
        '<p class="q-text">'+q.text+'</p>'+(q.media||"")+
      '</div>'+
      '<div class="answers-grid" id="q-answers">'+answers+'</div>'+hintRow+
      '<div class="feedback" id="q-feedback"></div>'+
      '<button class="next-btn" id="q-next"></button>';

    document.querySelectorAll("#q-answers .answer-btn").forEach(b=>b.addEventListener("click",()=>choose(b)));
    document.getElementById("q-next").addEventListener("click",next);
    if(G.hints&&q.hint){document.getElementById("q-hint").addEventListener("click",useHint);}
    if(q.onMounted)q.onMounted(q);
    if(st.timer)startTimer();
  }

  function startTimer(){
    let t=st.timer;const el=document.getElementById("q-time");
    const pg=document.getElementById("q-progress");pg.className="progress-fill timer";pg.style.width="100%";
    timerInt=setInterval(()=>{
      t--;if(el)el.textContent=t;pg.style.width=(t/st.timer*100)+"%";
      if(t<=0){clearTimer();timeout();}
    },1000);
  }
  function clearTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;}}

  function useHint(){
    if(st.answered||st.hintUsed)return;st.hintUsed=true;
    const ht=document.getElementById("q-hinttext");ht.style.display="block";ht.textContent=st.current.hint;
    document.getElementById("q-hint").disabled=true;Audio8.click();
  }

  function lockAnswers(){
    document.querySelectorAll("#q-answers .answer-btn").forEach(b=>{
      b.disabled=true;if(decodeHtml(b.dataset.val)===st.current.correct)b.classList.add("correct");
    });
  }

  function timeout(){
    if(st.answered)return;st.answered=true;
    lockAnswers();
    st.streak=0;st.wrong++;if(st.maxLives)st.lives--;
    const fb=document.getElementById("q-feedback");
    fb.className="feedback wrong";
    fb.innerHTML='<span class="fl">&#10022; Temps écoulé</span><span class="ft">'+st.current.fbw+'</span>';
    Audio8.jingleBad();
    finishTurn();
  }

  function choose(btn){
    if(st.answered)return;st.answered=true;clearTimer();
    const q=st.current;const ok=decodeHtml(btn.dataset.val)===q.correct;
    lockAnswers();
    const fb=document.getElementById("q-feedback");
    if(ok){
      btn.classList.add("correct");
      if(!st.hintUsed)st.score++;else st.score++; // l'indice n'enlève pas le point, juste la "perfection"
      st.streak++;st.best=Math.max(st.best,st.streak);
      fb.className="feedback correct";
      fb.innerHTML='<span class="fl">&#10022; Correct&#8201;!'+(st.hintUsed?" (avec indice)":"")+'</span><span class="ft">'+q.fbc+'</span>';
      Audio8.jingleGood();spawnSparkles(btn);
      const sp=document.querySelector("#q-area .q-sprite");if(sp){sp.classList.remove("silhouette");sp.classList.add("reveal");}
    }else{
      btn.classList.add("wrong");st.streak=0;st.wrong++;if(st.maxLives)st.lives--;
      fb.className="feedback wrong";
      fb.innerHTML='<span class="fl">&#10022; Incorrect</span><span class="ft">'+q.fbw+'</span>';
      Audio8.jingleBad();
      const sp=document.querySelector("#q-area .q-sprite");if(sp){sp.classList.remove("silhouette");}
    }
    finishTurn();
  }

  function finishTurn(){
    document.getElementById("q-info").querySelector(".chip span").innerHTML=st.infinite?("&#8734; "+(st.i+1)):((st.i+1)+"/"+st.total);
    const lv=document.querySelector("#q-info .lives span");if(lv)lv.innerHTML="&#10084;".repeat(st.lives)||"—";
    const nb=document.getElementById("q-next");
    if(st.maxLives&&st.lives<=0){nb.textContent="Game Over → résultats →";}
    else nb.textContent=(!st.infinite&&st.i+1>=st.total)?"Voir les résultats →":"Question suivante →";
    nb.style.display="block";
  }

  function next(){
    Audio8.click();
    if(st.maxLives&&st.lives<=0)return results();
    st.i++;
    if(!st.infinite&&st.i>=st.total)return results();
    render();
  }

  function results(){
    clearTimer();Audio8.stopLoop();
    const total=st.infinite?st.i:(st.maxLives?st.i+ (st.lives<=0?1:0):st.total);
    const answered=st.infinite?st.i:(st.maxLives? (st.score+st.wrong):st.total);
    const denom=Math.max(1,(st.score+st.wrong));
    const pct=Math.round(st.score/denom*100);
    document.getElementById("q-pct").textContent=pct+"%";
    const t=tier(pct);
    document.getElementById("q-rtitle").textContent=t[0];
    document.getElementById("q-rflavor").textContent=t[1];
    document.getElementById("q-break").innerHTML=
      '<div class="bi"><span class="num" style="color:var(--gira-teal-bright)">'+st.score+'</span><span class="lbl">Correct</span></div>'+
      '<div class="bi"><span class="num" style="color:#ff8080">'+st.wrong+'</span><span class="lbl">Raté</span></div>'+
      '<div class="bi"><span class="num" style="color:var(--gira-gold)">'+st.best+'</span><span class="lbl">Meilleure série</span></div>';
    showS("q-results");
  }
  function tier(p){
    if(p>=90)return ["Maître Pokémon","Giratina lui-même s'incline devant ta connaissance légendaire."];
    if(p>=70)return ["Dresseur Expert","Une maîtrise digne d'un Champion d'Arène."];
    if(p>=50)return ["Dresseur Confirmé","Continue ton voyage, la Ligue Pokémon t'attend."];
    if(p>=30)return ["Jeune Dresseur","Retourne t'entraîner — l'aventure ne fait que commencer."];
    return ["Néophyte du Vide","Giratina t'invite à explorer le Monde Distorsion davantage…"];
  }

  return {mount,DIFFS};
})();

/* badge helper pour les jeux à sprite */
function pkmnBadge(p,hidden){
  if(!p)return "";
  const c=typeColor(p.type[0]);
  return '<div class="q-badge" style="background:'+c+'22;color:'+c+';border:.5px solid '+c+'55;">'+(hidden?"? ? ?":escapeHtml(p.name))+'</div>';
}
function soundBadge(){return '<div class="q-badge" style="background:rgba(42,168,196,.13);color:var(--gira-teal-bright);border:.5px solid rgba(42,168,196,.4);">&#127925; Bande-son</div>';}
function typeBadge(label){return '<div class="q-badge" style="background:rgba(200,168,75,.13);color:var(--gira-gold);border:.5px solid rgba(200,168,75,.4);">&#9889; '+label+'</div>';}

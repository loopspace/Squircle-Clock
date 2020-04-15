var dtdiv;
var Cos = circleCos;

var ctx;
var manual;
var hide;

var circle;
var scaleFactor;

var stuff = 'original';
var numpts = 500;
var path = [];
var opath = [];
var ctrlPts = [];
var octrlPts = [];

for (var i = 0; i < numpts; i++) {
    path.push([0,0]);
    opath.push([0,0]);
}
for (var i = 0; i < 7; i++) {
    ctrlPts.push([0,0]);
    octrlPts.push([0,0]);
}

var pt = 0;

var pts = [
    [1,0],
    [3,0],
    [2,1],
    [1,2],
    [2,2],
    [0,1],
    [0,3],
    [1,2],
    [2,1],
    [2,2],
    [-1,-0],
    [-3,-0],
    [-2,-1],
    [-1,-2],
    [-2,-2],
    [-0,-1],
    [-0,-3],
    [-1,-2],
    [-2,-1]
]

function init() {

    var date = document.getElementById('date');
    var time = document.getElementById('time');
    dtdiv = document.getElementById('dateandtime');
    
    var btn = document.getElementById('clock');
    btn.addEventListener('click', function(e) {
	e.preventDefault();
	manual = false;
	renderClock();
    });

    var btn = document.getElementById('hide');
    btn.addEventListener('click', function(e) {
	e.preventDefault();
	hide = !hide;
	if (hide) {
	    e.target.textContent = 'Show construction';
	} else {
	    e.target.textContent = 'Hide construction';
	}
	renderClock();
    });

    
    date.addEventListener('change', function(e) {
	e.preventDefault();
	manual = true;
	renderClock();
    });
    time.addEventListener('change', function(e) {
	e.preventDefault();
	manual = true;
	renderClock();
    });

    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    window.addEventListener('resize', setSize);
    setSize();
    manual = false;
    renderClock(true);
}

window.addEventListener('load', init);

function setSize() {
    var h = ctx.canvas.height;
    var w = ctx.canvas.width;
    scaleFactor = Math.min(h,w)/30;
}

function setClock() {
    var d;
    if (manual) {
	var date = document.getElementById('date');
	var time = document.getElementById('time');
	var t;
	if (time.value && date.value) {
	    d = new Date(date.value + "T" + time.value);
	} else if (date.value) {
	    d = new Date(date.value + "T00:00");
	} else if (time.value) {
	    d = new Date(time.value)
	} else {
	    d = new Date();
	}
    } else {
	d = new Date();
    }

    return d;
}

function renderClock(force) {

    var d = setClock();

    dtdiv.textContent = d.toLocaleString();


    var tp = d.getMinutes()*60 + d.getSeconds() + d.getMilliseconds()/1000;
    tp %= 40;
    if (Math.floor(tp/10) > 0 && Math.floor(tp/10) < 3) {
	Cos = circleCos;
	circle = true;
    } else {
	Cos = squareCos;
	circle = false;
    }

    tp %= 20;
    
    var updatePath = false;
    if (force || (tp < pt)) {
	octrlPts = ctrlPts;
	ctrlPts = updateControls(d);
	updatePath = true;
	stuff = 'new';
    }

    if (pt <= 10 && tp > 10) {
	octrlPts = ctrlPts;
	updatePath = true;
    }

    if (updatePath) {
	opath = path;
	path = getPath(ctrlPts,numpts);
	createSVG(path,d);
    }

    pt = tp;

    tp %= 10;

    var c, pth;

    if (tp <= 2) {
	c = [];
	pth = [];
	for (var i = 0; i < ctrlPts.length; i++) {
	    c.push(cplxLerp(octrlPts[i], ctrlPts[i], tp/2));
	}
	for (var i = 0; i < path.length; i++) {
	    pth.push(cplxLerp(opath[i], path[i], tp/2));
	}
    } else {
	c = ctrlPts;
	pth = path;
    }
    
    clear(ctx);

    var h = ctx.canvas.height;
    var w = ctx.canvas.width;
    var r = Math.min(h,w)/30

    ctx.lineWidth = 2;
    ctx.strokeStyle = "gray";
    ctx.save();
    ctx.translate(w/2,h/2);

    if (!hide) {

    // Control points
    ctx.font = "14px \"Trebuchet MS\"";
    var tmc = ctx.measureText("c");

    var tmi;

    ctx.fillStyle = "#555";
    for (var i = 0; i < c.length; i++) {
	ctx.beginPath();
	ctx.arc(c[i][0], c[i][1], ctx.lineWidth * 2, 0, 2*Math.PI);
	ctx.fill();
	ctx.font = "14px \"Trebuchet MS\"";
	ctx.fillText("c",c[i][0] + ctx.lineWidth * 2, c[i][1]);
	ctx.font = "10px \"Trebuchet MS\"";
	tmi = ctx.measureText((i-3).toString());
	ctx.fillText((i-3).toString(),c[i][0] + ctx.lineWidth * 2 + tmc.width, c[i][1] + tmi.actualBoundingBoxAscent/2);
    }

    }

    // Path
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    ctx.moveTo(pth[pth.length-1][0], pth[pth.length-1][1]);
    
    for (var i = 0; i < pth.length; i++) {
	ctx.lineTo(pth[i][0], pth[i][1]);
    }
    ctx.stroke();

    if (!hide) {
    // Parameter for current point
    tp = Math.min(1,Math.max(0, .125*(tp-2)));
    
    // Epicycles
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#888";

    var p,u,w;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,0);
    for (var i = 0; i < 3; i++) {
	w = [Cos((i+1)*tp), Cos(.25 - (i+1)*tp)];
	u = cplxSum(cplxMult(cplxConj(w), c[2-i]), cplxMult(w, c[4+i]));
	ctx.lineTo(u[0],u[1]);
	ctx.translate(u[0], u[1]);
    }
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#aaa";
    ctx.save();
    for (var i = 0; i < 3; i++) {
	w = [Cos((i+1)*tp), Cos(.25 - (i+1)*tp)];
	u = cplxSum(cplxMult(cplxConj(w), c[2-i]), cplxMult(w, c[4+i]));
	ctx.beginPath();
	ctx.arc(u[0],u[1],3,0,2*Math.PI);
	ctx.fill();
	ctx.translate(u[0], u[1]);
    }
    ctx.restore();


    var a;
    ctx.save();
    for (var i = 0; i < 3; i++) {
	w = [Cos((i+1)*tp), Cos(.25 - (i+1)*tp)];
	u = cplxSum(cplxMult(cplxConj(w), c[2-i]), cplxMult(w, c[4+i]));

	if (circle) {
	    if (cplxLen(c[2-i]) > 0 && cplxLen(c[4+i]) > 0) {
		p = cplxNorm(cplxSum(cplxNorm(c[2-i]), cplxNorm(c[4+i])));
		if (p) {
		    a = Math.atan2(p[1], p[0]);
		} else {
		    a = Math.atan2(c[2-i][1], c[2-i][0]) + Math.PI/2;
		}
		ctx.save();
		ctx.rotate(a);

		if (Math.abs( cplxLen(c[2-i]) - cplxLen(c[4+i])) < ctx.lineWidth) {
		    ctx.beginPath();
		    ctx.moveTo(-cplxLen(c[2-i]) - cplxLen(c[4+i]), 0);
		    ctx.lineTo( cplxLen(c[2-i]) + cplxLen(c[4+i]), 0);
		    ctx.stroke();
		} else {
		    ctx.beginPath();
		    ctx.ellipse(0,0,cplxLen(c[2-i]) + cplxLen(c[4+i]),Math.abs(cplxLen(c[2-i]) - cplxLen(c[4+i])),0,0,2*Math.PI);
		    ctx.stroke();
		}

		ctx.restore();
	    } else {
		ctx.arc(0,0,Math.max(cplxLen(c[2-i]), cplxLen(c[4+i])),0,2*Math.PI);
	    }
	} else {
	    var ra,rb,rc,rd, rpt;
	    ra = c[2-i];
	    rb = [ra[1], -ra[0]];
	    rc = c[4+i];
	    rd = [-rc[1], rc[0]];
	    ctx.beginPath();
	    rpt =  cplxSum( cplxSum(ra, rb), cplxSum(rc, rd));
	    ctx.moveTo( rpt[0], rpt[1] );
	    rpt = cplxSum( cplxSum(ra, cplxNeg(rb)), cplxSum(rc, cplxNeg(rd)));
	    ctx.lineTo( rpt[0], rpt[1] );
	    rpt =  cplxNeg( cplxSum( cplxSum(ra, rb), cplxSum(rc, rd)) );
	    ctx.lineTo( rpt[0], rpt[1] );
	    rpt =  cplxSum( cplxSum(cplxNeg(ra), rb), cplxSum(cplxNeg(rc), rd));
	    ctx.lineTo( rpt[0], rpt[1] );
	    rpt =  cplxSum( cplxSum(ra, rb), cplxSum(rc, rd));
	    ctx.lineTo( rpt[0], rpt[1] );
	    ctx.stroke();
	    
	    
	}
	
	ctx.translate(u[0], u[1]);
    }
    ctx.restore();

    var ppt = getPoint(c,tp);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ppt[0], ppt[1], 6, 0, 2*Math.PI);
    ctx.fill();
    }
    ctx.restore();

    if (!manual) {
	// requestAnimationFrame seems to not work with saving the old state and lerping to the new one.
//	window.requestAnimationFrame(renderClock);
	window.setTimeout(renderClock,0);
    }
}

function updateControls(d) {
    var doy = getDOY(d);
    var hr = d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds(); // We're generating the controls for the next time segment
    
    // days of the year modulo 361
    doy %= 361;

    // decaseconds
    sec = Math.floor(sec/10) + min*6;

    // swap parity bit of seconds with am/pm parity of hours
    sec = sec - (sec%2) + Math.floor(hr/12);
    // reduce hours modulo 12
    hr %= 12;

    // Mungle up the seconds
    sec *= 127;
    doy += Math.floor(sec/361);
    doy *= 127;
    sec %= 361;
    doy %= 361;

    // array of control points, c[i] is c_{i-3}
    var c = [];
    for (var i =0; i < 7; i++) {
	c.push([0,0]);
    }

    // Sort out c_1
    c[4] = [1, hr%2];

    // Sort out c_{-1}
    hr = Math.floor(hr/2);
    c[2] = [Math.floor(hr/2)-1,hr%2];
    c[2] = cplxMult(c[2], c[4]);

    // c_2 and c_{-2} come from the decaseconds

    c[1] = pts[ sec% 19];
    c[5] = pts[ Math.floor(sec/19) ];

    // c_3 and c_{-3} from the day of the year

    c[0] = pts[ doy% 19];
    c[6] = pts[ Math.floor(doy/19) ];

    for (var i = 0; i < c.length; i++) {
	c[i] = [ c[i][0] * scaleFactor, c[i][1] * scaleFactor ];
    }
    
    return c;
}

function isLeapYear(d) {
    var year = d.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
function getDOY(d) {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = d.getMonth();
    var dn = d.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && isLeapYear(d)) dayOfYear++;
    return dayOfYear - 1;
};

function cplxMult(w,z) {
    var u = w[0],v = w[1],x = z[0],y = z[1];

    return [ u * x - v * y, u * y + v * x];
}

function cplxSum(w,z) {
    var u = w[0],v = w[1],x = z[0],y = z[1];

    return [ u + x, v + y];
}

function cplxConj(z) {
    var x = z[0], y = z[1];
    return [x, -y];
}

function cplxNeg(z) {
    var x = z[0], y = z[1];
    return [-x, -y];
}

function cplxLerp(w,z,t) {
    var u = w[0],v = w[1],x = z[0],y = z[1];

    return [ (1 - t)* u + t * x, (1 - t)*v + t* y];
}

function cplxLen(z) {
    var x = z[0], y = z[1];
    return Math.sqrt(x * x + y * y);
}

function cplxNorm(z) {
    var l = cplxLen(z);
    if (l == 0) {
	return false;
    } else {
	var x = z[0], y = z[1];
	return [x / l, y / l];
    }
}

function getPath(c,N) {
    var dt = 1/N;
    var points = [];
    
    for (var i = 0; i < N; i++) {
	points.push(getPoint(c, i*dt));
    }

    return points;
}

function getPoint(c,t) {
    var p,z;

    z = [Cos(t), Cos(.25 - t)];
    p = [0,0];

    p = cplxSum(p, cplxMult(c[4],z));
    p = cplxSum(p, cplxMult(c[2],cplxConj(z)));

    z = [Cos(2*t), Cos(.25 - 2*t)];
    p = cplxSum(p, cplxMult(c[5],z));
    p = cplxSum(p, cplxMult(c[1],cplxConj(z)));
    
    z = [Cos(3*t), Cos(.25 - 3*t)];
    p = cplxSum(p, cplxMult(c[6],z));
    p = cplxSum(p, cplxMult(c[0],cplxConj(z)));
    
    return p;
}

function circleCos(t) {
    return Math.cos(t*2*Math.PI);
}

function squareCos(t) {
    t -= Math.floor(t);
    return Math.min(1, Math.max(-1, Math.abs(8*t - 4) - 2));
}

function clear(c) {
    c.save();
    c.setTransform(1,0,0,1,0,0);
    c.clearRect(0,0, c.canvas.width, c.canvas.height);
    c.restore();
}

function createSVG(path,date) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width',ctx.canvas.width);
    svg.setAttribute('height',ctx.canvas.height);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");

    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    var h = ctx.canvas.height;
    var w = ctx.canvas.width;

    var d = [];
    for (var i = 0; i < path.length; i++) {
	d.push(path[i].join(" "));
    }
    p.setAttribute('d', "M " + d.join(" L "));
    p.setAttribute('stroke', '#222');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke-width', '2');
    p.setAttribute('transform', 'translate(' + w/2 + ' ' + h/2 + ')');

    svg.appendChild(p);

    var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x',w/2);
    t.setAttribute('y',h - 16);
    t.setAttribute('font-size', 16);
    t.setAttribute('text-anchor', 'middle');
    var telt = document.createTextNode(date.toLocaleString());
    t.appendChild(telt);
    svg.appendChild(t);
    
    var svgelt = document.getElementById("download");

    var svgAsXML = (new XMLSerializer).serializeToString(svg);
    
    svgelt.href = "data:image/svg+xml," + encodeURIComponent(svgAsXML);
    svgelt.download = "clock.svg";
}

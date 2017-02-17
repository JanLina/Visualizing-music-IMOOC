var size = 128, // 希望得到的音频频域的数据个数
	lis = $("#list li"),
	lisLength,
	i,
	j;
var box = $("#box")[0],
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d"),
	types = $("#type li"),
	line,
	typesLength,
	width,
	height,
	k,
	l,
	Dots = [];
box.appendChild(canvas);

var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});

function $(s) {
	return document.querySelectorAll(s);
}

function resize() {
	width = box.clientWidth;
	height = box.clientHeight;
	canvas.width = width;
	canvas.height = height;
	// 窗口高度改变，渐变样式改变
	line = ctx.createLinearGradient(0, 0, 0, height);
	line.addColorStop(0, "red");
	line.addColorStop(0.5, "yellow");
	line.addColorStop(1, "green");
	getDots();
}
resize();
window.onresize = resize;

function draw(arr) {
	var w = width / size,
		cw = w * 0.6,
		capH = cw > 10 ? 10 : cw,
		h,
		i,
		o,
		r,
		g;
	ctx.clearRect(0, 0, width, height);
	for(i = 0; i < size; i ++) {
		o = Dots[i];
		if(draw.type === "column") {
			h = arr[i] / 256 * height; // 柱条的高度
			ctx.fillStyle = line;
			ctx.fillRect(w * i, height - h, cw, h);
			// 下面的o.cap实际上是上一次调用draw时设置的
			ctx.fillRect(w * i, height - (o.cap + capH), cw, capH);
			o.cap = o.cap - 3;
			if(o.cap < 0) {
				o.cap = 0;
			}
			// 柱条与小帽的距离不小于40px，getDots()中将cap都初始化为0
			if(h > 0 && o.cap < h + 40) {
				o.cap = h + 40 > height - capH ? height - capH : h + 40;
			}
		}else if(draw.type === "dot") {
			ctx.beginPath();
			r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
			g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
			g.addColorStop(0, "#FFF");
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.x += o.dx; // 圆点移动
			o.x = o.x > width ? 0 : o.x;
		}
	}
}
draw.type = "column";

$("#volume")[0].onchange = function() {
	mv.changeVolume(this.value / this.max);
}
$("#volume")[0].onchange();

function random(m, n) {
	return Math.round(Math.random() * (n - m) + m);
}

function getDots() {
	var dx = random(1, 4),
		i,
		x,
		y,
		dx,
		color;
	Dots = [];
	Dots.dotMode = "random";
	for (i = 0; i < size; i ++) {
		x = random(0, width);
		y = random(0, height);
		dx = random(1, 4);
		color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ", 0)";
		Dots.push({
			x: x,
			y: y,
			dx: dx, // 随机移动速度
			dx2: dx,
			color: color,
			cap: 0 // 小帽的最底端
		});
	}
}

for (i = 0, lisLength = lis.length; i < lisLength; i ++) {
  	lis[i].onclick = function() {
  		for(j = 0; j < lisLength; j ++) {
  			lis[j].className = "";
  		}
  		this.className = "selected";
  		mv.play("/media/" + this.title); // 播放音频
  	}
}

for(k = 0, typesLength = types.length; k < typesLength; k ++) {
	types[k].onclick = function() {
		for(l = 0; l < typesLength; l ++) {
			types[l].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}

canvas.onclick = function() {
	var i;
	if(draw.type === "dot") {
		for(i = 0; i < size; i ++) {
			Dots.dotMode === "random" ? Dots[i].dx = 0 : Dots[i].dx = Dots[i].dx2;
		}
		Dots.dotMode = Dots.dotMode === "random" ? "static" : "random";
	}
}
function MusicVisualizer(obj) {
	this.source = null;

	this.count = 0;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2; // 用于分析得到频域
	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer;
	this.visualize(); // 一旦新对象被创建，就调用visualize方法进行可视化
}

MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext)();

MusicVisualizer.prototype.load = function(url, fun) {
	this.xhr.abort();
	var self = this;
	this.xhr.open("GET", url);
	this.xhr.responseType = "arraybuffer";
	this.xhr.onload = function() {
		fun(self.xhr.response);
	}
	this.xhr.send();
}
MusicVisualizer.prototype.decode = function(arraybuffer, fun) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
		fun(buffer);
	}, function(err) {
		console.log(err);
	});
}

// play包括加载、解码并播放音频
MusicVisualizer.prototype.play = function(url) {
	var n = ++this.count;
	var self = this;
	this.source && this.stop();
	this.load(url, function(arraybuffer) {
		if(n !== self.count) {
			return;
		}
		self.decode(arraybuffer, function(buffer) {
			if(n !== self.count) {
				return;
			}
			var bs = MusicVisualizer.ac.createBufferSource();  // 音频资源
			bs.connect(self.analyser);
			bs.buffer = buffer; // 音频资源数据存放在buffer属性中
			bs[bs.start ? "start" : "noteOn"](0);
			self.source = bs;
		})
	})
}
MusicVisualizer.prototype.stop = function() {
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}
MusicVisualizer.prototype.changeVolume = function(percent) {
	this.gainNode.gain.value = percent * percent;
}

// 根据传入MusicVisualizer对象的visualizer方法可视化音频
MusicVisualizer.prototype.visualize = function() {
	var arr = new Uint8Array(this.analyser.frequencyBinCount);

	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;

	var self = this;
	function v() {
		self.analyser.getByteFrequencyData(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}
# Visualizing-music-IMOOC
practice of webAudio API, canvas

简略：
从服务器获取到数据后，调用webAudio，webAudio负责播放音频和分析音频数据，并将分析后的数据传递给canvas，canvas将其可视化出来。

详细：
1、对从服务器获取到的“arraybuffer”类型的数据用AudioContext.decodeAudioData()进行解码，解码得到的数据赋值给BufferSourceNode的buffer属性；
2、调用BufferSourceNode的start()播放音频
3、analyser.getByteFrequencyData(arr)将分析音频的结果保存在数组arr
4、根据arr渲染页面

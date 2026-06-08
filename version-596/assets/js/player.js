(function () {
    function initVideoPlayer(sourceUrl, videoId, overlayId, stateId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var state = document.getElementById(stateId);
        var started = false;
        var hls = null;

        if (!video || !overlay || !sourceUrl) {
            return;
        }

        function setState(text) {
            if (state) {
                state.textContent = text || '';
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setState('点击视频区域继续播放');
                });
            }
        }

        function attachSource() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            setState('正在加载...');
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState('');
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                            setState('网络波动，正在重试...');
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            setState('播放恢复中...');
                        } else {
                            setState('视频加载失败，请稍后重试');
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                video.addEventListener('loadedmetadata', function () {
                    setState('');
                    playVideo();
                }, { once: true });
                video.addEventListener('error', function () {
                    setState('视频加载失败，请稍后重试');
                });
                video.load();
            } else {
                setState('视频加载失败，请更换浏览器重试');
            }
        }

        function hideOverlay() {
            overlay.classList.add('is-hidden');
        }

        overlay.addEventListener('click', function () {
            hideOverlay();
            attachSource();
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                hideOverlay();
                attachSource();
            }
        });

        video.addEventListener('play', hideOverlay);
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initVideoPlayer = initVideoPlayer;
}());

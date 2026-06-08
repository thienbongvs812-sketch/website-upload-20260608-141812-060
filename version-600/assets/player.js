(function () {
    function setVideo(video, streamUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        video.src = streamUrl;
                    }
                }
            });
            return;
        }

        video.src = streamUrl;
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("movie-play-button");
        var loaded = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function startPlayback() {
            button.classList.add("is-hidden");
            if (!loaded) {
                loaded = true;
                setVideo(video, streamUrl);
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };
})();

(function () {
    function attachVideo(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                autoStartLoad: true,
                maxBufferLength: 30
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function mount(videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hasAttached = false;
        if (!video) {
            return;
        }

        function startPlayback() {
            if (!hasAttached) {
                attachVideo(video, source);
                hasAttached = true;
            }
            video.controls = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.XFPlayer = {
        mount: mount
    };
}());

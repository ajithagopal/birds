
var videoDimention = {
    width: '',
    height: ''
}

window.birds = []
window.isBirdsNavigation_inProgress = false
var audioBirds = []
var birdAudio

const getData = function(params, callback) {
    var mainXHR = new XMLHttpRequest();
    mainXHR.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 304 || this.status == 206)) {
            callback(this.response);
        } 
        if(this.status == 404 || this.status == 500) {
            callback({'status': 'failed'});
        }
    }
    mainXHR.open(params.method, params.url);
    mainXHR.responseType = params.type;
    mainXHR.send();
}

$(document).ready(function(){

    var cWidth = document.body.clientWidth;

    if(cWidth < 500) {
        $("#mask circle").attr("r", 140)
        $("#mask #mask-circle-2").attr("cx", 220)
        $("#binoLines image").attr("x","-125").attr("y","-114").attr("width","470").attr("height","293.75")

    } else if(cWidth < 900) {
        $("#mask circle").attr("r", 180)
        $("#mask #mask-circle-2").attr("cx", 300)
        $("#binoLines image").attr("x","-153").attr("y","-150").attr("width","600").attr("height","375")
    }

    var prevScrollpos = window.scrollY;
    
    $(this).scroll(function() {
        if ($(this).scrollTop() >  100) {
            var currentScrollPos = window.scrollY;
            if (prevScrollpos > currentScrollPos) {
                $(".header").addClass("header-move");
                $(".header").css("transform", "translateY(0px)");
            } else {
                $(".header").css("transform", "translateY(-100px)");
            }
            prevScrollpos = currentScrollPos;

        } else if($(this).scrollTop() <= 10) {
            $(".header").removeClass("header-move");
        }
        prevScrollpos = window.scrollY;
    });

    $(".share-btn").click(function(){ 
        
        var sharetext = $("title").text();
        var shareurl = window.location.href;

        if (navigator.share && typeof sharetext != "undefined" && typeof shareurl != "undefined" && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            navigator.share({
                title: sharetext,
                text: sharetext,
                url: shareurl
            });
        } else {
            $(this).next(".share-list").toggle();
        }
    });   

    $(".birds-list-box .birds-list li").click(function(){ 
        $(".popup-box").addClass("show-popup");
        $("body").addClass("popup-showing")
    });
    
    $(".popup .popup-close, .popup-overlay").click(function(){ 
        $(".popup-box").removeClass("show-popup");
        $("body").removeClass("popup-showing")
    });

    videoDimention.width = $("#birds-intro-video").width()
    videoDimention.height = $("#birds-intro-video").height()

    $(".birds-hero-dark svg, .birds-hero-dark rect").attr("width", videoDimention.width+"px").attr("height", videoDimention.height+"px");

    window.canvas = document.getElementById("birdCanvas");
    window.canvas.width = 600;
    window.canvas.height = 150;

    window.ctx = canvas.getContext("2d");
    birdAudio = document.getElementById("birdAudio");

    $("#bird-player").click(function() {
        // $("#player-content").addClass("show-loading")
        let status = $(this).attr("data-status")
        playBirdAudio(status)
    })

    birdAudio.onended = () => {
        $("#bird-player").attr("data-status", "np")
        $("#bird-player").removeClass("active")
        $("#player-content").addClass("onpause")
    };

    birdAudio.onpause = () => {
        $("#bird-player").attr("data-status", "np")
        $("#bird-player").removeClass("active")
        $("#player-content").addClass("onpause")
    };

    birdAudio.onplay = () => {
        $("#bird-player").attr("data-status", "p")
        $("#bird-player").addClass("active")
        $("#player-content").removeClass("onpause")
    }
    



    //Get data
    getData({url: 'assets/js/birds.json', method: 'GET', type: 'json'}, (data) => {
        window.birds = data
        audioBirds = data.filter(item => {
            return item.hasOwnProperty('audio')
        })

        //Birds Quiz
        const quiz = new thPagination("birds-quiz-pagination", audioBirds.length, 5, 0)
        quiz.init(() => {
            setUpQuizQuestion(0)
        })

        showBirdsByCity('Chennai')

    })

    document.addEventListener("thPageNext", (e) => {
        setUpQuizQuestion(e.detail.item)
    })

    document.addEventListener("thPagePrevious", (e) => {
        setUpQuizQuestion(e.detail.item)
    })

    document.addEventListener("thPageGoto", (e) => {
        setUpQuizQuestion(e.detail.item)
    })

    $("#nav-tab button.nav-link").click(function() {
        $("#nav-tab button.nav-link").removeClass("active")
        var city = $(this).text()
        $(this).addClass("active")
        showBirdsByCity(city)
    })

});

function thPagination(targetID, totalItems, noOfIemsPerSet, currentItem = 0) {
    this.totalItems = totalItems
    this.noOfIemsPerSet = noOfIemsPerSet
    this.currentItem = currentItem
    this.targetElement = document.getElementById(targetID)
    this.prevBtn = document.createElement('button')
    this.nxtBtn = document.createElement('button')
    this.ul = document.createElement("ul")
    this.li = []
    this.case = 'go-next'

    this.createPrevButton = () => {
        this.prevBtn.classList.add("btn", "nav-btn", "previous", "disabled")
        this.prevBtn.innerText = "previous"
        this.targetElement.appendChild(this.prevBtn)
        this.prevBtn.addEventListener("click", this.previous)
    }

    this.createNext = () => {
        this.nxtBtn.classList.add("btn", "nav-btn", "next")
        this.nxtBtn.innerText = "next"
        this.targetElement.appendChild(this.nxtBtn)
        this.nxtBtn.addEventListener("click", this.next)
    }

    this.createItemNumber = () => {
        this.ul.classList.add("slide-numbers")
        this.li = []
        this.ul.innerHTML = ''
        
        if(this.case === 'go-next') {

            for(var i = this.currentItem; i < (this.currentItem + this.noOfIemsPerSet); i++) {

                if(i >= this.totalItems) {
                    return
                }

                this.li[i] = document.createElement('li')
                if(i == this.currentItem) {
                    this.li[i].classList.add("active")
                }
                this.li[i].innerText = i+1
                var tmp = this
                this.li[i].addEventListener("click", function() {
                    tmp.goTo(this.innerText)
                }, false)
                this.ul.appendChild(this.li[i])
            }

        } else if(this.case === 'go-prev') {
            let tempCurrent = (this.currentItem - this.noOfIemsPerSet) + 1

            for(var i = tempCurrent; i < (tempCurrent + this.noOfIemsPerSet); i++) {
    
                this.li[i] = document.createElement('li')

                if(i == this.currentItem) {
                    this.li[i].classList.add("active")
                }

                this.li[i].innerText = i+1
                
                var tmp = this
                this.li[i].addEventListener("click", function() {
                    tmp.goTo(this.innerText)
                }, false)

                this.ul.appendChild(this.li[i])
            }
        }
    }

    this.init = (callback) => {
        this.createPrevButton()
        this.createItemNumber()
        this.targetElement.appendChild(this.ul)
        this.createNext()
        callback.call(this.currentItem)
    }

    this.next = () => {
        this.currentItem++

        if((this.currentItem % this.noOfIemsPerSet) === 0) {
            this.case = 'go-next'
            this.createItemNumber()
        }

        document.dispatchEvent(
            new CustomEvent("thPageNext", {
                bubbles: true,
                detail: { item: this.currentItem },
            }),
        );

        this.li[this.currentItem]?.classList.add("active")
        this.li[this.currentItem - 1]?.classList.remove("active")

        if(this.currentItem > 0){
            this.prevBtn.classList.remove("disabled")
        }

        if(this.currentItem+1 === this.totalItems) {
            this.nxtBtn.classList.add("disabled")
        }

        return this.currentItem
    }

    this.previous = () => {
        
        let prev_Value = this.currentItem > 0 ? this.currentItem-- : 0

        if((this.currentItem % this.noOfIemsPerSet) === (this.noOfIemsPerSet-1)) {
            this.case = 'go-prev'
            this.createItemNumber()
        }

        document.dispatchEvent(
            new CustomEvent("thPagePrevious", {
                bubbles: true,
                detail: { item: this.currentItem },
            }),
        );

        this.li[prev_Value]?.classList.remove("active")
        this.li[prev_Value - 1]?.classList.add("active")

        if(this.currentItem === 0){
            this.prevBtn.classList.add("disabled")
        }

        if(this.currentItem < this.totalItems) {
            this.nxtBtn.classList.remove("disabled")
        }

        return prev_Value
    }

    this.goTo = (num) => {
        num = Number(num) - 1
        document.dispatchEvent(
            new CustomEvent("thPageGoto", {
                bubbles: true,
                detail: { item: num },
            }),
        );
        this.currentItem = num
        this.ul.querySelector("li.active")?.classList.remove("active")
        this.li[num]?.classList.add("active")
        return num
    }
}

function setUpQuizQuestion(index) {
    var current = audioBirds[index]
    var birdAudioElement = document.getElementById("birdAudio")
    birdAudioElement.setAttribute("data-src", `assets/audio/${current.audio}`)
    birdAudioElement.pause()

    $("#bird-player").addClass("active")
    playBirdAudio('np')

    var options = [index]

    function getRandomNumber(arr,limit){
        var randNumber = Math.floor(Math.random()*arr.length);
        if(options.indexOf(randNumber) !== -1){
            return getRandomNumber(arr,limit);
        } else {
            options.push(randNumber)
        }
        if(options.length < limit) {
            return getRandomNumber(arr,limit);
        }
    }

    getRandomNumber(audioBirds, 4)

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const rotateArray = function(nums, k) {
        for (let i = 0; i < k; i++) {
            nums.unshift(nums.pop());
        }
        return nums;
    }

    var optionsRotated = rotateArray(options, getRandomInt(100) % 4)

    var container = document.getElementById("quiz-cards-container")
    container.innerHTML = ""

    optionsRotated.forEach((optionIndex) => {
        let li = document.createElement("li")
        li.classList.add("quiz-card-item")

        if(optionIndex === index) {
            li.setAttribute("data-isans", "y")
        }

        let divPicture = document.createElement("div")
        divPicture.classList.add("picture")

        let img = document.createElement("img")
        // img.setAttribute("src", audioBirds[optionIndex].img1)
        img.setAttribute("src", `assets/images/raw/webp/${audioBirds[optionIndex].img1url}`)
        img.setAttribute("alt", audioBirds[optionIndex].bird)
        
        divPicture.appendChild(img)
        li.appendChild(divPicture)

        let divName = document.createElement("div")
        divName.classList.add("bird-detail")
        divName.innerText = audioBirds[optionIndex].bird

        li.appendChild(divName)
        li.addEventListener("click", function(e) {
            var isCorrect = this.getAttribute("data-isans")
            if(isCorrect) {
                this.classList.add("correct-ans", "correct")
            } else {
                this.classList.add("wrong")
                container.querySelector("li[data-isans='y']").classList.add("correct-ans", "correct")
            }
        })
        container.appendChild(li)
    })
    
    // $("#bird-player").trigger("click")
}

function showBirdsByCity(selectedCity) {

    if(window.isBirdsNavigation_inProgress) {
        return
    }

    window.isBirdsNavigation_inProgress = true
    document.getElementById("nav-tab").classList.add("preventClick")

    var allBirds = window.birds.filter((item) => {
        return item.city.indexOf(selectedCity) !== -1
    })

    var commonB = allBirds.filter((item) => {
        return item.category === "Common birds"
    })

    var migrantB = allBirds.filter((item) => {
        return item.category === "Migrant"
    })

    var commonCounter = 0, migrantCounter = 0;

    var migratoryUL = document.getElementById("birdsMigratory"), 
        commonUL = document.getElementById("birdsExisting"),
        migratoryTitle = document.getElementById("birdsMigratory-Title"),
        commonTitle = document.getElementById("birdsExisting-Title")

    migratoryUL.innerHTML = ""
    commonUL.innerHTML = ""

    if(commonB.length <= 0) {
        commonTitle.style.display = "none"
    } else {
        commonTitle.style.display = "block"
    }

    if(migrantB.length <= 0) {
        migratoryTitle.style.display = "none"
    } else {
        migratoryTitle.style.display = "block"
    }

    const createLI = (item) => {
        let li = document.createElement("li")
        li.classList.add("citywise-card-item")

        let divPicture = document.createElement("div")
        divPicture.classList.add("picture")

        let img = document.createElement("img")
        img.setAttribute("src", `assets/images/raw/webp/${(item.img1url ? item.img1url : item.img2url)}` )
        img.setAttribute("alt", item.bird)

        divPicture.appendChild(img)
        li.appendChild(divPicture)

        let divName = document.createElement("div")
        divName.classList.add("bird-name")
        divName.innerText = item.bird

        let birdClickElement = document.createElement("a")
        birdClickElement.classList.add("bird-click")
        birdClickElement.setAttribute("data-name", item.bird)

        li.appendChild(divName)
        li.appendChild(birdClickElement)

        birdClickElement.addEventListener('click', function(e) {

            let name = e.target.getAttribute("data-name")
            var selectedBird = window.birds.filter((item) => {
                return item.bird === name
            })

            if(selectedBird.length > 0) {
                $(".popup-box").addClass("show-popup")
                $("body").addClass("popup-showing")
                $(".popup-box .title").html(selectedBird[0]?.bird)
                $(".popup-box .interesting-fact .interesting-fact-info").html("")

                if(selectedBird[0].hasOwnProperty("city")) {
                    $(".popup-box .seen-in span").html(selectedBird[0].city.replaceAll(',',', '))
                }

                if(selectedBird[0].hasOwnProperty("when")) {
                    $(".popup-box .when").show()
                    $(".popup-box .when span").html(selectedBird[0].when)
                } else {
                    $(".popup-box .when").hide()
                }

                $(".popup-box .interesting-fact .interesting-fact-info").html(selectedBird[0]?.fact)

                if(selectedBird[0]?.thlink) {
                    $(".popup-box .interesting-fact .interesting-fact-info").append(`<a href="${selectedBird[0]?.thlink}" target="_blank">Read more</a>`)
                }

                if(selectedBird[0]?.img1) {
                    $(".popup-box img.top-img").attr("src", `assets/images/raw/webp/${selectedBird[0]?.img1url}`).attr("alt", selectedBird[0]?.bird)
                    $(".popup-box img.top-img").show()
                } else {
                    $(".popup-box img.top-img").hide()
                }

                if(selectedBird[0]?.img2) {
                    $(".popup-box img.interesting-fact-img").attr("src", `assets/images/raw/webp/${selectedBird[0]?.img2url}`).attr("alt", selectedBird[0]?.bird)
                    $(".popup-box img.interesting-fact-img").show()
                } else {
                    $(".popup-box img.interesting-fact-img").hide()
                }
            }
        })
        return li
    }

    const appendBird = () => {

        if(commonB[commonCounter]) {
            let getLI = createLI(commonB[commonCounter])
            commonUL.appendChild(getLI)
            commonCounter++
        }

        if(migrantB[migrantCounter]) {
            let getLI = createLI(migrantB[migrantCounter])
            migratoryUL.appendChild(getLI)
            migrantCounter++
        }

        if(commonCounter <= (commonB.length-1) || migrantCounter <= (migrantB.length-1)) {
            setTimeout(() => {
                appendBird()
            }, 250)
        } else {
            window.isBirdsNavigation_inProgress = false
            document.getElementById("nav-tab").classList.remove("preventClick")
        }

    }

    appendBird()

}

function playBirdAudio(status) {

    birdAudio.pause()

    if(status === 'np') {
        $("#bird-player").attr("data-status", "p")
        $("#bird-player").addClass("active")
        $("#player-content").addClass("show-loading").removeClass("onpause")

    } else {
        $("#bird-player").attr("data-status", "np")
        $("#bird-player").removeClass("active")
        // birdAudio.pause()
        return
    }

    let src = $("#birdAudio").attr("data-src")
    let prevSrc = document.getElementById("birdAudio").src.replace(/^\s+|\s+$/gm,'')

    getData({url: src, method: 'GET', type: 'blob'}, (data) => {
        if(data.hasOwnProperty('status')) {
            return
        }

        birdAudio.src = window.URL.createObjectURL(data);
        birdAudio.load();
        $("#player-content").removeClass("show-loading")
        
        if(prevSrc.indexOf('http') != -1) {
            birdAudio.play()
        } else {
            $("#bird-player").attr("data-status", "np")
            $("#bird-player").removeClass("active")
            $("#player-content").addClass("onpause")
            return
        }

        var context = new (window.AudioContext || window.webkitAudioContext)();
        var src = context.createMediaElementSource(birdAudio);
        var analyser = context.createAnalyser();

        src.connect(analyser);
        analyser.connect(context.destination);
    
        analyser.fftSize = 256;
    
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
    
        var WIDTH = window.canvas.width;
        var HEIGHT = window.canvas.height;
    
        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;
    
        function renderFrame() {
            requestAnimationFrame(renderFrame);
            x = 0;
            analyser.getByteFrequencyData(dataArray);
    
            window.ctx.fillStyle = "#FFFFFF";
            window.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
            for (var i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                
                var r = barHeight + (25 * (i/bufferLength));
                var g = 250 * (i/bufferLength);
                var b = 50;
        
                window.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                window.ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
                x += barWidth + 1;
            }
        }
    
        if(prevSrc.indexOf('http') != -1) {
            birdAudio.play();
        }
        renderFrame();

    })
}

$(document).mouseup(function(e) {
    var container = $(".share-btn");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".share-list").slideUp();
    }
});


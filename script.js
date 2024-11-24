let songs
let currFolder;

//--------------function to print the current time for each song playing-------------
function secondsToMinutes(seconds)
{
    // Handle invalid input (NaN or negative numbers)
    if (isNaN(seconds) || seconds < 0) 
        return "00:00";
    
    const minutes = Math.floor(seconds/60)
    const remainingSeconds = Math.floor(seconds%60)
    const formattedMinutes = String(minutes).padStart(2,'0')
    const formattedSeconds = String(remainingSeconds).padStart(2,'0')

    return `${formattedMinutes}:${formattedSeconds}`;
}


//--------------functions to return the songs from the songs directory----------------
async function getSongs(folder)
{
    currFolder = folder
    //fetch the songs
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    // console.log(as);
    //take out the songs from href and push in array
    songs = []

    for(let ind=0; ind<as.length; ind++)
    {
        const element = as[ind]
        //taking the songs
        if(element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${folder}/`)[1])    ///songs k baad wala le liya
    }


    //show all the songs from the  playlist
    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songul.innerHTML = "";  //to make the list of song blank

    
    //putting name of the songs in the Song Library in left side
    for(const song of songs){
        songul.innerHTML = songul.innerHTML + 
        `<li>
          <img class="invert" src="Images/SVG/music.svg" alt="music" />
          <div class="songinfo">
                <div> ${song.replaceAll("%20", " ")}</div>
                <div></div>
          </div>
          <div class="playNow">
                <span>Play Now</span>
                <img class="invert" src="Images/SVG/pause.svg" alt="">
          </div>
         
        </li>`
    }

    //attach an event listner to each song
    const nodeList = document.querySelector(".songList").getElementsByTagName("li");    //selects the "li" inside class "songList"
    //create an array
    const array = Array.from(nodeList)
    //printing the elements of array
    array.forEach(e=>{
        //getting all the song names on mouse click and playing the song
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());    //function to play music
        })
    })

    return songs
}


let currentSong = new Audio();
  
//----------------function to play music------------------
const playMusic = (track, pause=false)=>{
    //setting the global variable source as the track source clicked
    currentSong.src = `/${currFolder}/`+track;

    if(!pause)
    {
        currentSong.play()
        //change the svg from pause to play
         play.src = "Images/SVG/play.svg" 
    }    
    
    const songInfoElement = document.querySelector(".currentSongInfo");
    songInfoElement.innerHTML = decodeURI(track);
    
    // document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00:00"
}



//---------------function to display the names of the Album----------------
async function displayAlbums() {
    //fetch the songs
    let a = await fetch(`http://127.0.0.1:5500/songs`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors) //creating an array of all anchor tags
    // console.log(array);
    for(let ind=0; ind<array.length;ind++)
    {
        const e = array[ind]

        //taking only the anchors having "/songs/" in href
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-1)[0];    //getting the song folder name

            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)  //getting the info in the song folder
            let response = await a.json();
            // console.log(response);
            
            //adding cards inside card containers
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${response.folder}" class="card">
              <div class="play">
                <div class="play-circle">
                  <img src="Images/SVG/playbutton.svg" alt="playbutton" />
                </div>
              </div>
              <img src="/songs/${folder}/cover.png" alt="songsImg" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e);
        e.addEventListener("click", async(item)=>{
            console.log("fetching songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            //play the first song on when clicked on a card
            console.log(songs);
            playMusic(songs[0])
        })
    })
}

async function  main()
{
    //async function returns promise
    await getSongs("songs/Hindi")
    // console.log(songs);
    playMusic(songs[0], true)   //to play the first music 
   

    //display all the albumns on the page
    displayAlbums();
    

    //attach an event listner to next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused)
        {
            currentSong.play();
            play.src = "Images/SVG/play.svg"
        }
        else
        {
            currentSong.pause();
            play.src = "Images/SVG/pause.svg"
        }
    })

    //listen for time update event, (the change in timing when the song plays)
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        
        //update the current song time
        document.querySelector(".songtime").innerHTML = 
        `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    //for the seek bar
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        const seekMovement = e.offsetX / e.target.getBoundingClientRect().width;
        // console.log(seekMovement);

        //move the seek bar on click
        document.querySelector(".circle").style.left = seekMovement*100 + "%";
        
        //change the current song time
        currentSong.currentTime = (currentSong.duration)*seekMovement;

    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener to close the hamburger
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //add event listener for previous and next
    prev.addEventListener("click", ()=>{
        //getting the index of the current song in "songs" array
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        //play the next index song
        let len = songs.length
        if(index - 1 >= 0)
            playMusic(songs[(index-1)]);

    })

    next.addEventListener("click", ()=>{
        // console.log(currentSong);
        // console.log(currentSong.src.split("/").slice(-1)[0]);  //the last part of the currentsong
        
        //getting the index of the current song in "songs" array
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        //play the next index song
        let len = songs.length
        if(index + 1 < len)
            playMusic(songs[(index+1)]);
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        let vol = parseInt(e.target.value)/100;
        currentSong.volume = vol;
        let flag=true;
        
        //change the svg to mute when volume is 0
        if(vol == 0)
            document.querySelector("#vol").src  = "Images/SVG/mute.svg"
        else
            document.querySelector("#vol").src  = "Images/SVG/volume.svg"
    })

    
    let currVol;
    //add an event to mute the song on clicking volume button
    document.querySelector(".volume>img").addEventListener("click", e=>{
        // console.log("mute button clicked");
        //incase of music is playing, mute it
        if(e.target.src.endsWith("volume.svg"))
        {
            currVol = currentSong.volume;
            currentSong.volume=0;   //mute the song
            e.target.src = "Images/SVG/mute.svg"
        }
        else
        {
            currentSong.volume=currVol;   //mute the song
            e.target.src = "Images/SVG/volume.svg"
        }
        
    })    
}   


main()
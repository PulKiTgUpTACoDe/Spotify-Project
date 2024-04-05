let currentSong = new Audio();
let songs;
let isShuffleActivated = false;
let currentFolder;
let repeatSong = false;
let lastPlayedSong = null;
// Get the songs

async function getSongs(folder) {
  currentFolder = folder;

  // Fetch songs from the server
  let response = await fetch(`http://127.0.0.1:3000/Songs/${folder}/`);
  let htmlContent = await response.text();

  // Parse the HTML content to extract song names
  let div = document.createElement("div");
  div.innerHTML = htmlContent;
  let links = div.getElementsByTagName("a");

  songs = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    if (link.href.endsWith(".mp3")) {
      let songName = link.href
        .split(`${currentFolder}`)[1]
        .split(".mp3")[0]
        .replaceAll("-", " ")
        .replaceAll("/", "");
      songs.push(songName);
    }
  }

  // Add songs to the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <div class="musicIcon"></div>
        <div class="songInfo">
          <span>${decodeURI(song)}</span>
        </div>
        <span class="playNow">Play Now</span>
        <div class="playSong"></div>
      </li>`;
  }

  // Add eventListener to each song in the playlist

  let songListItems = document.querySelector(".songList").getElementsByTagName("li");

  for (const listItem of songListItems) {
    listItem.addEventListener("click", () => {
      let music = listItem.querySelector(".songInfo span").innerHTML.trim();

      // Reset color of all songs
      for (const item of songListItems) {
        item.style.color = "rgba(98, 98, 98, 1)";
        item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
      }
      playMusic(music.replaceAll(" ", "-"), false);

      listItem.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
      listItem.style.color = "green";
    });
  }

  return songs;
}

// Function for song time
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Convert to string and pad with leading zeros if necessary
  let minutesString = minutes < 10 ? "0" + minutes : minutes.toString();
  let secondsString =
    remainingSeconds < 10
      ? "0" + remainingSeconds
      : remainingSeconds.toString();

  return minutesString + ":" + secondsString;
}

// Play the clicked music
function playMusic(music, pause = true) {
  let playMusicButton = document.querySelector(".playMusicButton");

  // Check if the requested song is the same as the currently playing song
  if (currentSong.src.includes(music)) {
    // Toggle play/pause
    if (currentSong.paused) {
      currentSong
        .play()
        .then(() => {
          playMusicButton.style.backgroundImage =
            "url(Icons/icons8-pause-button-50.png)";
        })
        .catch((error) => console.error("Failed to play:", error));
    } else {
      currentSong.pause();
      playMusicButton.style.backgroundImage = "url(Icons/icons8-play-50.png)";
    }
  } else {
    // Load the new song
    currentSong.src = `Songs/${currentFolder}` + music + ".mp3";

    if (!pause) {

      // Play the new song only if pause is false
      currentSong
        .play()
        .then(() => {
          playMusicButton.style.backgroundImage =
            "url(Icons/icons8-pause-button-50.png)";
        })
        .catch((error) => console.error("Failed to play:", error));
    }
    lastPlayedSong  = music;
  }

  document.querySelector(".Info").innerHTML = music.replaceAll("-", " ");
  document.querySelector(".Time").innerHTML = "00:00 / 00:00";
}

// Function to handle previous and next buttons

function attachNextPreviousListeners() {
  let songListItems = document
    .querySelector(".songList")
    .getElementsByTagName("li");
  let randomSong;
  let previousButton = document.querySelector(".previous");
  previousButton.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      let currentSrc = currentSong.src;
      let currentIndex = songs.findIndex((song) =>
        currentSrc.includes(song.replaceAll(" ", "-"))
      );

      if (currentIndex !== -1) {
        let previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[previousIndex].replaceAll(" ", "-"), false);

        // Reset color of all songs
        for (const item of songListItems) {
          item.style.color = "rgba(98, 98, 98, 1)";
          item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
        }

        // Set color of the current playing song to green
        songListItems[previousIndex].style.color = "green";
        songListItems[previousIndex].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
      }
    }
  });

  let nextButton = document.querySelector(".next");
  nextButton.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      let currentSrc = currentSong.src;
      let currentIndex = songs.findIndex((song) =>
        currentSrc.includes(song.replaceAll(" ", "-"))
      );
      if (currentIndex !== -1) {
        if (isShuffleActivated) {
          let randomSongIndex = Math.floor(Math.random() * songs.length - 1);
          randomSong = songs[randomSongIndex].replaceAll(" ", "-");
          playMusic(randomSong.replaceAll(" ", "-"), false);
          // Reset color of all songs
          for (const item of songListItems) {
            item.style.color = "rgba(98, 98, 98, 1)";
            item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
          }

          // Set color of the current playing song to green
          songListItems[randomSongIndex].style.color = "green";
          songListItems[randomSongIndex].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
        } 
        else {
          let nextIndex = (currentIndex + 1) % songs.length;
          playMusic(songs[nextIndex].replaceAll(" ", "-"), false);

          // Reset color of all songs
          for (const item of songListItems) {
            item.style.color = "rgba(98, 98, 98, 1)";
            item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
          }
          // Set color of the current playing song to green
          songListItems[nextIndex].style.color = "green";
          songListItems[nextIndex].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
        }
      }
    }
  });
}

function handleNextSong(){
  let songListItems = document
    .querySelector(".songList")
    .getElementsByTagName("li");
  if (songs && songs.length > 0) {
    let currentSrc = currentSong.src;
    let currentIndex = songs.findIndex((song) =>
      currentSrc.includes(song.replaceAll(" ", "-"))
    );
    if (currentIndex !== -1) {
      if (isShuffleActivated) {
        let randomSongIndex = Math.floor(Math.random() * songs.length - 1);
        playMusic(songs[randomSongIndex].replaceAll(" ", "-"), false);
        randomSong = songs[randomSongIndex].replaceAll(" ", "-");
        // Reset color of all songs
        for (const item of songListItems) {
          item.style.color = "rgba(98, 98, 98, 1)";
          item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
        }
        // Set color of the current playing song to green
        songListItems[randomSongIndex].style.color = "green";
        songListItems[randomSongIndex].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
      } else {
        let nextIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[nextIndex].replaceAll(" ", "-"), false);

        // Reset color of all songs
        for (const item of songListItems) {
          item.style.color = "rgba(98, 98, 98, 1)";
          item.querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-playMusic-50.png)";
        }

        // Set color of the current playing song to green
        songListItems[nextIndex].style.color = "green";
        songListItems[nextIndex].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
      }
    }
  }
};

// Function for displaying the playlists in the main window

async function DisplayAlbums() {
  let response = await fetch(`http://127.0.0.1:3000/Songs`);
  let htmlContent = await response.text();
  let div = document.createElement("div");
  div.innerHTML = htmlContent;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");

  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Songs/")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`);
      let response = await a.json();
      let currentExt;

      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
        <div class="play play-icon"></div>
        <img src="/Songs/${folder}/cover.${response.ext}" alt="" />
        <h2 class="font-family">${response.title}</h2>
        <p class="font-family">${response.description}</p>
      </div>`;
    }
  }

  // Load a playlist whenever a card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    let songListItems = document
      .querySelector(".songList")
      .getElementsByTagName("li");

    e.addEventListener("click", async (item) => {
      let clickedFolder = item.currentTarget.dataset.folder;
      songs = await getSongs(`${clickedFolder}/`);
      if (songs && songs.length > 0) {

        // Play the first song from the clicked folder
        playMusic(songs[0].replaceAll(" ", "-"), false); 
        songListItems[0].style.color = "green";
        songListItems[0].querySelector(".playSong").style.backgroundImage = "url(Icons/icons8-green-pause-button-50.png)";
      } else {
        console.log("No songs found in this folder.");
      }
    });
  });
}

// Main function
(async function main() {
  await getSongs("ncs/"); // get the songs

  attachNextPreviousListeners();

  playMusic(songs[0].replaceAll(" ", "-"), true); // Always be ready to play the first song
  // Display all the albums on the main page
  DisplayAlbums();

  // Attach event listeners to play, next, and previous buttons
  document.querySelector(".playMusicButton").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.querySelector(".playMusicButton").style.backgroundImage =
        "url(Icons/icons8-pause-button-50.png)";
      
    } else {
      currentSong.pause();
      document.querySelector(".playMusicButton").style.backgroundImage =
        "url(Icons/icons8-play-50.png)";
    }
  });

  // Get time update of the current song

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".Time").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to the seekbar

  let seekbar = document.querySelector(".seekbar");
  seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listeners to the hamburger and cross icons

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0% ";
  });

  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add event listener to the shuffle button

  let ran = document.querySelector(".shuffle");
  ran.addEventListener("click", () => {
    isShuffleActivated = !isShuffleActivated; // Toggle shuffle mode
    if (isShuffleActivated == true) {
      ran.style.backgroundImage = "url(Icons/icons8-green-shuffle-60.png)";
    } else {
      ran.style.backgroundImage = "url(Icons/icons8-shuffle-60.png)";
    }
  });

  // Add event listener to the repeat button

let repeat = document.querySelector(".repeat");
  repeat.addEventListener("click", ()=>{
    repeatSong = !repeatSong;
    if(repeatSong) {
      repeat.style.backgroundImage = "url(Icons/icons8-repeat-green-60.png)";
      currentSong.loop = true;
    }
    else{
      repeat.style.backgroundImage = "url(Icons/icons8-repeat-60.png)";
      currentSong.loop = false;
    }
  })

  // Add event listener to the volume control

  let currentVolume;
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentVolume = e.target.value;
      currentSong.volume = (currentVolume / 100).toFixed(1);
    });

  let v = document.querySelector(".volume").getElementsByTagName("img")[0];
  let zeroVolume = false;

  v.addEventListener("click", () => {
    zeroVolume = !zeroVolume;
    if (zeroVolume) {
      v.style.backgroundImage = "url(Icons/icons8-no-audio-50.png)";
      currentVolume = currentSong.volume; // Store the current volume before muting
      currentSong.volume = 0;
      document.querySelector(".range").style.display = "none";
    } else {
      v.style.backgroundImage = "url(Icons/icons8-volume-50.png)";
      document.querySelector(".range").style.display = "flex";
      currentSong.volume = currentVolume; // Restore the previous volume
    }
  });

  if(!repeatSong){
    currentSong.addEventListener("ended", handleNextSong);
  }
})()
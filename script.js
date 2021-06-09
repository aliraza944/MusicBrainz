// to delay an api call
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let search;
let params;

let recordingsData = [];

let everythingObj = {
  resluts: 0,
  artistName: [],
  songTitle: [],
  albumTitle: [],
  songLength: [],

  albumId: [],
};
//store my data into global state to be axcessable
const error = document.getElementById("error");
const baseUrl = "https://musicbrainz.org/ws/2/";
const searchBar = document.getElementById("searchBar");
const modal = document.getElementById("myModal");
const mango = document.getElementById("mango");
const submitBtn = document.getElementById("submit");
const artistTable = document.getElementById("artistTable");
const searchResults = document.getElementById("searchResults");
const spinner = document.getElementById("spinner");
const tableBody = document.getElementById("tbody");
// data to show on modal

const covers = document.getElementById("covers");
const modalTitle = document.getElementById("modalTitle");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const albumName = document.getElementById("albumName");
const genres = document.getElementById("genres");
const songLength = document.getElementById("songLength");
const note = document.getElementById("note");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
const modalClose = document.getElementById("modalClose");
// When the user clicks on <span> (x), close the modal
function emptyModal() {
  songTitle.innerHTML = "";
  artistName.innerHTML = "";
  albumName.innerHTML = "";
  genres.innerHTML = "";
  songLength.innerHTML = "";
  note.innerHTML = "";
  covers.innerHTML = "";
}

span.onclick = function () {
  modal.style.display = "none";
  emptyModal();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    emptyModal();
  }
};
modalClose.onclick = function () {
  modal.style.display = "none";
  emptyModal();
};

submitBtn.addEventListener("click", getData);

// get search data from the api
async function getData() {
  everythingObj = {
    resluts: 0,
    artistName: [],
    songTitle: [],
    albumTitle: [],
    songLength: [],
    releaseId: [],
    albumId: [],
  };
  searchResults.innerHTML = "";
  tableBody.innerHTML = "";
  search = searchBar.value;
  params = mango.value;
  let url;
  let data;
  switch (params) {
    case "everything":
      data = await fetchAPI(
        `${baseUrl}recording/?query=artistname:${search}ANDrelease:${search}ANDrecording:${search}&limit=100&dismax=true&fmt=json`
      );

      break;
    case "artist":
      url = `${baseUrl}recording/?query=artistname:${search}&fmt=json`;
      data = await fetchAPI(url);
      console.log(data);

      break;
    case "album":
      url = `${baseUrl}recording/?query=release:${search}&dismax=true&limit=100&fmt=json`;
      data = await fetchAPI(url);

      break;
    case "track":
      url = `${baseUrl}recording/?query=name:${search}&dismax=true&limit=100&fmt=json`;
      data = await fetchAPI(url);

      break;
  }

  destructApi(data);

  displayTable(everythingObj);
} //end function getData

// to destruture the api data

const destructApi = (recordings) => {
  // push the artist search result to my everythingObj
  recordings.map((record) => {
    // to check if the items exits then push it in the everythingObj
    if (record && record.releases && record.releases[0]) {
      const { "release-group": album } = record.releases[0];
      const { "artist-credit": credit } = record;

      everythingObj.artistName.push(credit[0].name);
      everythingObj.songTitle.push(record.title);
      everythingObj.songLength.push(record.length);
      everythingObj.releaseId.push(record.releases[0].id);

      everythingObj.albumTitle.push(album.title);
      everythingObj.albumId.push(album.id);
      everythingObj.resluts = everythingObj.artistName.length;
    }
  }); //end map function
};

// the function to display the table
const displayTable = (everythingObj) => {
  searchResults.innerText = `Search Results: ${everythingObj.resluts}`;

  let tr = "";

  for (let i = 0; i < Object.keys(everythingObj.artistName).length; i++) {
    const tr = document.createElement("tr");

    tr.innerHTML = `<tr>
    <td>${i}</td>
    <td>${everythingObj.artistName[i]}</td>
    <td>${everythingObj.songTitle[i]}</td>
    <td>${everythingObj.albumTitle[i]}</td>
    <td tabindex=${everythingObj.albumId[i]} index=${i} release=${everythingObj.releaseId[i]} onclick="viewDetails(this);"><input type="button" name='ali' value="Info"></input></td>
    </tr>`;
    tableBody.appendChild(tr);
  }
};

async function viewDetails(e) {
  modal.style.display = "block";
  await displayModal(
    e.getAttribute("tabindex"),
    e.getAttribute("index"),
    e.getAttribute("release")
  );
}

// function to get data to display for the modal

async function fetchAPI(url, offset = 0) {
  try {
    const query = `${url}&offset=${offset}`;
    const response = await fetch(query);
    const res = await response.json();
    recordingsData = res.recordings;

    console.log(res.recordings);
    if (res.recordings.length < 1) {
      spinner.style.display = "none";
      return recordingsData;
    } else {
      // await delay(1100);
      spinner.style.display = "block";

      return recordingsData.concat(
        await fetchAPI(url, (offset = offset + 100))
      );
    }
  } catch (error) {
    spinner.style.display = "none";
    if (error) error.innerHTML = `<h1>something went wrong</h1>`;
  }
}

async function modalDataFetch(url) {
  try {
    const response = await fetch(url);
    const res = await response.json();
    return res;
  } catch (error) {
    if (error) error.innerHTML = `<h1>something went wrong</h1>`;
  }
}

// displayModal function

async function displayModal(albumcover, index, release) {
  console.log(release);
  const url = ` https://musicbrainz.org/ws/2/release-group/${albumcover}?inc=ratings+genres&fmt=json`;
  const res = await modalDataFetch(url);

  let minutes = 0;
  let seconds = 0;
  // convert seconds on to minutes

  if (everythingObj.songLength[index]) {
    minutes = Math.floor(everythingObj.songLength[index] / 60000);
    seconds = ((everythingObj.songLength[index] % 60000) / 1000).toFixed(2);
  }
  console.log(res);

  //  modal title
  modalTitle.innerHTML = `<h5>${everythingObj.artistName[index]}- <span id='data'>${everythingObj.songTitle[index]}</span></h5>`;
  //song title
  songTitle.innerHTML = `<h5>Title- <span id='data'>${everythingObj.songTitle[index]}</span></h5>`;
  //artist name
  artistName.innerHTML = `<h5>Artis- <span id='data'>${everythingObj.artistName[index]}</span></h5>`;
  // album name
  albumName.innerHTML = `<h5>Album- <span id='data'>${everythingObj.albumTitle[index]}</span></h5>`;
  // check if the genres property exits
  if (res.genres.length != 0) {
    genres.innerHTML = `<h5>Genres- <span id='data'>${res.genres[0].name}</span></h5>`;
  } else {
    genres.innerHTML = `<h5>Genres-</h5>`;
  }
  // songLength
  songLength.innerHTML = `<h5>Length- <span id='data'>${parseInt(
    minutes
  )} : ${parseInt(seconds)}</span></h5>`;
  // rating value

  if (res.rating.value != null) {
    for (i = 0; i < parseInt(res.rating.value); i++) {
      const p = document.createElement("span");
      p.innerHTML = `<i class="far fa-star"></i>`;
      note.appendChild(p);
    }
  } else {
    note.innerHTML = `<span id="data">Not Rated</span>`;
  }
  const urlPoster = `http://coverartarchive.org/release/${release}`;
  //delay(2000);
  const imageData = await modalDataFetch(urlPoster);
  console.log(imageData);

  displayImage(imageData);
}
// displayImage
const displayImage = (imageData) => {
  let nextImage;
  if (imageData && imageData.images) {
    for (let i = 0; i < imageData.images.length; i++) {
      nextImage = i + 1;
      const img = document.createElement("img");

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "row";
      if (nextImage === imageData.images.length) {
        imageWrapper.innerHTML = `<div class="col"><img class="mt-3" src=${imageData.images[i].image} alt="" /></div>`;

        covers.appendChild(imageWrapper);
      } else {
        imageWrapper.innerHTML = `<div class="col"><img class="mt-3" src=${imageData.images[i].image} alt="" /></div><div class="col"><img class="mt-3" src=${imageData.images[nextImage].image} alt="" /></div>`;

        covers.appendChild(imageWrapper);
      }
      i = nextImage;
    }
  } else {
    covers.innerHTML = `<h1>image not found</h1>`;
  }
};

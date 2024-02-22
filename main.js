// Get current year for copyright 
document.querySelector('footer span').textContent = new Date().getFullYear();

const apiKey = '43eae635dcbcff26c69c1f2ffb2ed2a2';

// Get movie posters for the carousel
const movieCarousel = document.getElementsByClassName('carousel');
let randomPage = Math.floor(Math.random() * 50) + 1;

// Function to get random movie IDs
function getRandomMovieIds(movieList, count) {
    const shuffledMovies = movieList.sort(() => 0.5 - Math.random());
    return shuffledMovies.slice(0, count).map(movie => movie.id);
}

// Fetch popular movies
fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&include_adult=false&include_video=false&language=en-US&with_original_language
=en&page=${randomPage}&sort_by=vote_count.desc`)
    .then(response => response.json())
    .then(data => {
        // Extract random movie IDs from the list, with the number of movies being the total in the list 
        const randomMovieIds = getRandomMovieIds(data.results, data.length);

        // Fetch movie details for each random ID
        randomMovieIds.forEach(movieId => {
            fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`)
                .then(response => response.json())
                .then(movieData => {
                    let posterUrl = `https://image.tmdb.org/t/p/original${movieData.poster_path}`;
                    // Construct IMDb page URL
                    let imdbPageUrl = `https://www.imdb.com/title/${movieData.imdb_id}/`;

                    // Create an anchor element for the IMDb page
                    let imdbLink = document.createElement('a');
                    imdbLink.href = imdbPageUrl;
                    imdbLink.target = '_blank'; // Open in a new tab

                    // Create an image element for each movie poster
                    let moviePoster = document.createElement('img');
                    moviePoster.src = posterUrl;
                    moviePoster.alt = movieData.title;
                    moviePoster.classList.add('moviePoster');

                    // Append the movie poster to the anchor
                    imdbLink.appendChild(moviePoster);

                    // Append the anchor to the carousel
                    for (let i = 0; i < movieCarousel.length; i++) {
                        movieCarousel[i].appendChild(imdbLink.cloneNode(true));
                    }
                })
                .catch(error => console.error(`Error fetching movie details for ID ${movieId}:`, error));
        });
    })
    .catch(error => console.error('Error fetching popular movies:', error));


// Only allow number input for number of movies 
document.querySelector('div form h3 span input').addEventListener('keydown', validateNumberInput);

function validateNumberInput(event) {
    if (!/[0-9\b]/.test(event.key) && event.key.length === 1){
        event.preventDefault();
    }
}

// Get references to the elements
let inputElement = document.querySelector('div form h3 span input');
const movieList = document.querySelector('ol');
let oldNumOfMovies = 0;

// Listen for the input event on the input element
inputElement.addEventListener('input', createMovieList);

function createMovieList() {
    // Get the user input value
    let numberOfMovies = parseInt(inputElement.value);
    document.getElementById('findMovieNameLink').classList.remove('hidden');

    if (numberOfMovies > oldNumOfMovies) {
        for (let i = 1; i <= (numberOfMovies - oldNumOfMovies); i++) {

            // Create input boxes
            let listItem = document.createElement('li');
            listItem.innerHTML = `<input class='movieNameInput' list='movieOptions'  type='search' placeholder='Movie Name' autocomplete="off" id='doNotAutoComplete'>`;

            movieList.appendChild(listItem);
        }
    }

    else if (inputElement.value === '') {
        movieList.innerHTML = ''
        document.getElementById('findMovieNameLink').classList.add('hidden');
    }

    else if (numberOfMovies < oldNumOfMovies) {
        for (let i = 1; i <= (oldNumOfMovies - numberOfMovies); i++) {
            movieList.removeChild(movieList.lastChild);
        }
    }

    else {
        for (let i = 1; i <= (numberOfMovies); i++) {
             // Create input boxes
             let listItem = document.createElement('li');
             listItem.innerHTML = `<input class='movieNameInput' list='movieOptions'  type='search' placeholder='Movie Name' autocomplete="off" id='doNotAutoComplete'>`;
 
             movieList.appendChild(listItem);
        }
    }

    oldNumOfMovies = numberOfMovies


    // Get reference to the inputted movie names 
    inputtingListElements = document.querySelectorAll('li');

    // Array to store movie IDs
    let movieNamesAndID = [];
 
    // Assuming you want to add an event listener to each li element
    inputtingListElements.forEach(li => {
        li.addEventListener('input', createMovieDropdown);
    });

    function createMovieDropdown(event) {

        let userInput = event.target.value;
    
        // Fetch inputted movie
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${userInput}&include_adult=false&include_video=false&language=en-US&page=1`)
        .then(response => response.json())
        .then(data => {
            // Get the original titles of the movies and ids and place them into an array 
            
            movieNamesAndID = data.results.map(movie => `${movie.id}\u200B${movie.original_title}\u200B${movie.title}`);
            
            updateDropdownOptions();
        })
        .catch(error => console.error('Error fetching the movie names:', error));
    }

    // Update the dropdown menues

    function updateDropdownOptions() {
        let datalist = document.getElementById('movieOptions');
        datalist.innerHTML = ''; // Clear previous options

        // Create options for each movie ID
        movieNamesAndID.forEach(movieName => {
            let option = document.createElement('option');
            option.value = movieName.split('\u200B').pop() + '\u2063' + `                                                                                                                                                                       ${movieName.split('\u200B')[0]}` + '\u2063';
            datalist.appendChild(option);
        });
        
    }

    //Movie dictionary to hold sharing data
    movieShareDict = {}

    // Add an event listener to each li element to check for movie input
    inputtingListElements.forEach((li, index) => {
        li.addEventListener('input', createMovieDescription.bind(null, index));
    });

    function createMovieDescription(index, event) {
    
        let userInput = event.target.value;
        let currentListInput = event.target.parentNode  
    
        if (userInput.slice(-1) === '\u2063') {

            while (currentListInput.childElementCount > 1) {
                currentListInput.removeChild(currentListInput.lastChild)
            }
            
            event.target.value = userInput.trim();

            let movieID = parseInt(userInput.split('\u2063')[1].trim())

              
            fetch(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}`)
            .then(response => response.json())
            .then(movieData => {

                 let movieTitle = document.createElement('h2')
                 movieTitle.innerText = (movieData.title)

                 let tagLine = document.createElement('h3')
                 tagLine.innerText = (movieData.tagline)

                 let movieDescription = document.createElement('p')
                 movieDescription.innerText = (movieData.overview)

                 let userRating = document.createElement('p')
                 userRating.innerText = (movieData.vote_average + '/10')

                 let moviePoster = document.createElement('img');
                 moviePoster.src = `https://image.tmdb.org/t/p/original${movieData.poster_path}`;
                 moviePoster.alt = movieData.title
                 moviePoster.classList.add('moviePoster');
                
                 let imdbLink = document.createElement('a');   
                 imdbLink.href = `https://www.imdb.com/title/${movieData.imdb_id}/`;
                 imdbLink.target = '_blank'; 
                 imdbLink.appendChild(moviePoster);
    
                 let movieTralierBox = document.createElement('iframe')
                 movieTralierBox.id = 'youtube-player';
                 movieTralierBox.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"

                 fetch(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}`)
                 .then(response => response.json())
                 .then(movieData => {

                        let trailerID = null;
                    
                        for (let video of movieData.results) {
                            if (video.type === 'Trailer' && video.site === 'YouTube') {
                                trailerID = video.key;
                                movieTralierBox.src=`https://www.youtube-nocookie.com/embed/${trailerID}`   
                                break;
                            }
                        }

                        let movieDetailsDiv = document.createElement('div')
                        let listOfThingsToAdd = []
             
                        if (trailerID !== null) {
                            let moviePosterandTrailerDiv = document.createElement('div')

                            moviePosterandTrailerDiv.appendChild(imdbLink)
                            moviePosterandTrailerDiv.appendChild(movieTralierBox)
                            moviePosterandTrailerDiv.classList.add('iframeDiv')
                            listOfThingsToAdd = [movieTitle, tagLine, movieDescription, userRating, moviePosterandTrailerDiv]
                        }

                        else {
                            listOfThingsToAdd = [movieTitle, tagLine, movieDescription, userRating, imdbLink]
                        }
                        
                        if (Object.keys(movieShareDict).length !== 0 && Object.keys(movieShareDict).length === index + 1) {

                            let indexToRemove = 0;
                        
                            for (let key of Object.keys(movieShareDict)) {

                                if (index === indexToRemove) {
                                    console.log(key)
                                    console.log(movieTitle.innerText)
                                    valToReplace = movieShareDict[key]
                                    delete movieShareDict[key]
                                    movieShareDict[movieTitle.innerText] = valToReplace
                                    break
                                }
    
                                indexToRemove += 1;
                            }                    
                           
                        } 
                        
                        else {
                            movieShareDict[movieTitle.innerText] = [tagLine.innerText, movieDescription.innerText, userRating.innerText, imdbLink.href];
                        }
                                        
                        listOfThingsToAdd.forEach(element => {
                            movieDetailsDiv.appendChild(element)
                        })

                        currentListInput.appendChild(movieDetailsDiv)

                    })

            })
            .catch(err => console.error(err));

         
        }

    }
}


function shareFunction() {
    let emailAddress = "";
    let subject = "My movie rankings!";
    let body = ''
    console.log(movieShareDict)

    for (let key of Object.keys(movieShareDict)) {
        let moveiTitleText = key
        let movieTitleTagLineText = 'Movie Tagline: ' + movieShareDict[key][0]
        let movieDescriptionText = 'Movie Description: ' + movieShareDict[key][1]
        let movieRatingText = 'Movie Rating: ' + movieShareDict[key][2]
        let movieIMDBLink = 'Movie IMDB Link: ' + movieShareDict[key][3]
        body += moveiTitleText + `\n\n    1.${movieTitleTagLineText}` + `\n\n    2.${movieDescriptionText}` + `\n\n    3.${movieRatingText}` +`\n\n    4.${movieIMDBLink}\n\n`
    }

    let mailtoLink = "mailto:" + encodeURIComponent(emailAddress) +
                     "?subject=" + encodeURIComponent(subject) +
                     "&body=" + encodeURIComponent(body);

    window.open(mailtoLink, "_blank");
}
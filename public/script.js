
/**
 *  -- Make Content for the 'Home' page. Put in a carousel that contains demo and info about the website
 *     and what it can do.
 * 
 *  -- Make it so that the cards are left hand aligned, spacing between them is fine. 
 * 
 *  -- try to make it so that the color theme can cycle through all 6 possibilities,  
 * 
 *  -- Plan how to handle filter functionality. will need it to query the server for themes that fit the
 *     criteria (colors, dates, titles) *in the future possibly add search feature function. Will need to 
 *     calculate and bin the color values "if rgb 'b' values is greater than other than = blue"
 * 
 *  -- Think about adding in a new page for the themes (independent pages). There should be work done before this 
 *     step is crossed. There will need to be more data points about the themes, such as what style sheet is associated
 *     with that theme, description (this will need to be something we add when saving a theme, and alos a function to 
 *     edit description/ notes on it). On this page the user should be able to edit the description/notes, there
 *     should also be a function to download it in pdf form (will need research first). 
*/

//************************************ Functions and Code After DOM Loaded ****************************************/
/** 
 *  Below is the code that will run after the DOM is loaded, there is also some function under it that can be called
 *  at any moment that is used within this DOM code. 
 */
//*****************************************************************************************************************/
document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------ Initial Colors Declaration --------------------------------
  /**
   * This is a declaration of the initialized colors of the website and this value is critical 
   * to several areas in the code. This statement might not look like much, but lemme tell ya 
   * poor soul that may read this someday, if you remove these two lines of code, have fun 
   * trying to find what caused the site to crumble like a nutra-grain bar. However, these 
   * comments might be the first thing you read as you start to look into the meet and potatoes
   * so have fun, enjoy the organization and management of the code. :) 
   */ 
  //-------------------------------------------------------------------------------------------
  const colors = localStorage.getItem('colors');
  const styles1 = "/styles.css";
  const styles2 = "/styles2.css";
  const styles3 = "/styles3.css";
  var styleCounter = 0;
  var currentTheme; 
  var themePageTheme;
  const themeData = JSON.parse(sessionStorage.getItem('themeData'));
  if (themeData) {
    console.log('Theme Data:', themeData); // Or use it to display in the page
    // For example, you could set background colors or text based on themeData
  } else {
    console.log('No theme data found.');
  }
  setStyleSheets();

  //-------------------------------------------------------------------------------------------

  // ------------------------------- Statement to Cycle Colors --------------------------------
  /**
   *  The code below is for cycling through the color themes for a given theme. It will take
   *  the colors that are already present in the local storage and shift them one spot over in
   *  order to create a new theme. It will first create an event listener and from there it will
   *  get the colors from local storage on click. If the colors object is null it will do nothing 
   *  if it's not null it will create a new object with the new colors shifting one place up in
   *  the ordering. From here it will set the new object to the colors storage in the local storage
   *  before calling the function 'applyColors' and passing the new color object to it. 
   */
  //-------------------------------------------------------------------------------------------
  var counter = 0;
  var newColors;
  var cycleColorsBtn = document.getElementById('shiftColorsBtn');
  if(cycleColorsBtn){
    cycleColorsBtn.addEventListener('click', async => {
      const colors = localStorage.getItem('colors');
      if (colors) {
        var oldColors = JSON.parse(colors);
        if(counter <= 3){
          newColors = {
            color1: oldColors.color2,
            color2: oldColors.color3,
            color3: oldColors.color1
          };
          console.log(counter);
          console.log(colors);
        }
        else if (counter >= 4){
          newColors = {
            color1: oldColors.color3,
            color2: oldColors.color1,
            color3: oldColors.color2,
          };
          console.log(counter);
          console.log(colors);
          if(counter == 6){
            counter = 0;
          }
        }
        counter++;
        localStorage.setItem('colors', JSON.stringify(newColors));
        applyColors(newColors);
      }
    });
  }
  //-------------------------------------------------------------------------------------------

  // ------------------------ Button Function to Generate New Colors --------------------------
  /**
   *  The code snippet below ties to the button with the id 'generateNewThemeBtn' on the page
   *  and will make sure it's valid before creating an event listener for the button click. If
   *  the button is clicked it will then call the function 'fetchAndStoreColors' which will 
   *  generate a new color theme for the site. 
   */
  //-------------------------------------------------------------------------------------------
  const generateNewTheme = document.getElementById('generateNewThemeBtn');
  if(generateNewTheme){
    generateNewTheme.addEventListener('click', async => {
        fetchAndStoreColors();
    });
  }
  //-------------------------------------------------------------------------------------------

  // --------------------------------- Code for User Sign Up ----------------------------------
  /**
   *  The code below is used for user sign up. It first creates an event listener for the form
   *  submission. Once submitted it takes the in the values of the username, password, first name, 
   *  last name, email, and phone number that the user gives us. From there it will send a 'POST' 
   *  request to the server. The server will either respond with success or failure. From there 
   *  it will either send a message saying the account was made, otherwise it will send a red
   *  message saying that there was an issue creating the account. 
   * 
   *  --- The next thing that this needs is a way to directly log the user in after creating an
   *      account and send them to the home page. 
   */
  //-------------------------------------------------------------------------------------------
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const firstName = document.getElementById('firstname').value.trim();
      const lastName = document.getElementById('lastname').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            password, 
            firstName, 
            lastName, 
            email, 
            phone 
          }),
        });
        const result = await response.json();
        const message = document.getElementById('signupMessage');
        if (response.status === 201) {
          message.style.color = 'green';
          message.textContent = result.message;
          handleLogin(username, password, 'index.html');
        } else {
          message.style.color = 'red';
          message.textContent = result.message;
        }
      } catch (error) {
        console.error('Error during sign up:', error);
      }
    });
  }
//-------------------------------------------------------------------------------------------

// ------------------------ Code for User Log Up From Login Page-----------------------------
/**
 *  Below is the code used to handle user actions on the login page. It will be initalized to 
 *  show the login form. If the user enters in their username and password and hits login,
 *  they are either going to be omitted entry into the site or a message saying invalid 
 *  creditials. If the user hits 'forgot password?' the login form will disappear and the 
 *  form asking them to enter in their email will be displayed. From here they can either 
 *  hit the cancel button which will take them back to the login form, or enter their email 
 *  and hit send. If they send their email it will console log the email and return them back
 *  to the login page. 
 * 
 *  -- This will need to be changed once the site is active and there is a valid website email
 *     which can send the entered email a link to reset password. 
 */
//-------------------------------------------------------------------------------------------
  const loginForm = document.getElementById('loginForm');
  const resetPassForm = document.getElementById('forgotPassForm');
  const forgotPassBtn = document.getElementById('forgotPass');
  const resetPassBtn = document.getElementById('resetPass');
  const cancelResetBtn = document.getElementById('cancelForm');
  const loginFooter = document.getElementById('loginFooter');
  if(loginFooter){
    loginFooter.style.bottom = '0 !important';
    loginFooter.style.left = '0 !important';
    loginFooter.style.position = 'absolute';
  }
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      handleLogin(username, password, 'index.html');
    });
    if(forgotPassBtn){
      forgotPassBtn.addEventListener('click', () => {
        console.log('new func works');
        loginForm.style.display = 'none';
        resetPassForm.style.display = 'block';
        applyColors(colors);
      })
    }
  }
  if(resetPassForm){
    if(resetPassBtn){
      resetPassBtn.addEventListener('click', () => {
        const email = document.getElementById('email');
        console.log(email.value);
        resetPassForm.style.display = 'none';
        loginForm.style.display = 'block';
        applyColors(colors);
      })
    }
    if(cancelResetBtn){
      cancelResetBtn.addEventListener('click', () => {
        resetPassForm.style.display = 'none';
        loginForm.style.display = 'block';
        applyColors(colors);
      });
    }
  }
  //-------------------------------------------------------------------------------------------
  
  // --------------------------------- Code for User Log Up -----------------------------------
  /**
   *  This function is used to handle the logging in for user on the site. This function is used 
   *  in both the login page and the sign-up page. It takes in the user's username and password, 
   *  from there it will send 'POST' request to the server, if the server responds with a 201 
   *  stating success then the page will be redirected by the url that is passed to the page, if
   *  the request failed it will then throw an error. 
   * 
   * @param {*} username - the user's username used in the login 'POST' request 
   * @param {*} password - the user's password used in the login 'POST' request
   * @param {*} url - the page that the site will redirect to if the user login was successful. 
   */
  //-------------------------------------------------------------------------------------------
  async function handleLogin(username, password, url){
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      const message = document.getElementById('loginMessage');
      if (response.status === 200) {
        localStorage.setItem('token', result.token);
        window.location.href = url;
      } else {
        message.style.color = 'red';
        message.textContent = result.message;
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
  //-------------------------------------------------------------------------------------------

  // ----------------------------- Function for Apply Color Theme -----------------------------
  /**
   *  The function takes in colors from the caller. It will then use these colors to set the 
   *  theme of the website. It will first set teh background color to 'color3' and the color to
   *  'color2'. Afterwards it will set the nav bar to 'color1', the header to 'color2'. From
   *  here it will set the color themes for the buttons on the nav bar and the rest of the buttons
   *  on the site. 
   */
  //-------------------------------------------------------------------------------------------
  function applyColors(colors) {
    console.log(colors);
    document.body.style.backgroundColor = colors.color3;
    document.body.style.color = colors.color2;
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.style.backgroundColor = colors.color1;
    }
    const header = document.querySelector('.header');
    if (header) {
      header.style.color = colors.color2;
    }
    const footer = document.querySelector(".footer");
    if(footer){
      footer.style.backgroundColor = colors.color1;
    }
    const saveThemeFormDiv = document.getElementById("saveThemeFormDiv");
    if(saveThemeFormDiv){
      console.log("HERE");
      saveThemeFormDiv.style.backgroundColor = colors.color1;
    }
    if(window.location.href == window.location.origin + '/login.html'){
      const loginBtn = document.getElementById('loginButton');
      loginBtn.style.backgroundColor = colors.color1;
      loginBtn.style.color = colors.color2;
      const forgotPass = document.getElementById('forgotPass');
      if(forgotPass){
        forgotPass.style.backgroundColor = colors.color3;
        forgotPass.style.color = colors.color2;
      }
      const resetPassBtn = document.getElementById('resetPass');
      if(resetPassBtn){
        resetPassBtn.style.backgroundColor = colors.color1;
        resetPassBtn.style.color = colors.color2;
      }
      const cancelResetForm = document.getElementById('cancelForm');
      if(cancelResetBtn){
        cancelResetBtn.style.backgroundColor = colors.color3;
        cancelResetBtn.style.color = colors.color2;
      }
    }
    if(window.location.href == window.location.origin + '/signup.html'){
      const signUpbtn = document.getElementById('signupButton');
      signUpbtn.style.backgroundColor = colors.color1;
      signUpbtn.style.color = colors.color2;
      var inputs = document.querySelectorAll("input");
      inputs.forEach(input => {
        input.style.backgroundColor = colors.color1;
      })
    }
    const isLikedTheme = document.getElementById('isLiked');
    if(isLikedTheme){
      isLikedTheme.style.color = colors.color2;
    }
    const themeDescription = document.getElementById('themeDescription');
    if(themeDescription){
      themeDescription.style.color = colors.color2;
    }
    const download = document.getElementById('downloadPDF');
    if(download){
      download.style.color = colors.color2;
      download.style.backgroundColor = colors.color1;
    }
    const navButtons = document.querySelectorAll('.navButton');
    navButtons.forEach(button => {
      button.style.border = '0px solid transparent';
      button.style.borderLeft = '0px solid transparent';
      button.style.borderRight = '0px solid transparent';
      button.style.borderTop = '0px solid transparent';
      button.style.color = colors.color2;
    });
    const pagebuttons = document.querySelectorAll('.pageButton');
    pagebuttons.forEach(button => {
      button.style.border = `2px solid ${colors.color1}`;
      button.style.color = colors.color2;
      button.style.backgroundColor = colors.color1;
    });
    const aboutDiv = document.querySelectorAll(".aboutDivs");
    aboutDiv.forEach(div => {
      div.style.backgroundColor = colors.color1;
    });
    const deleteBTNs = document.querySelectorAll('.deleteThemeBtn');
    deleteBTNs.forEach(deleteBTN => {
      deleteBTN.style.backgroundColor = "rgb(240, 101, 119)";
    });
    const setThemeBtns = document.querySelectorAll('.setThemeBtn');
    setThemeBtns.forEach(setThemeBtn => {
      setThemeBtn.style.backgroundColor = "rgb(160, 237, 111)";
    });    
  }
  //-------------------------------------------------------------------------------------------

  // ------------------------------ Get and Set New Color Theme -------------------------------
  /**
   *  This function will call the 'get-colors' call to the server, from there if the response is
   *  not 'ok' it will then throw the error that the network didn't respond with ok and will dump
   *  out the issue to the console. If the response is 'ok' it will then set the response data to
   *  the varible 'colors'. From there it will set the colors data in the local storage as a JSON
   *  string. After that is done it will call the 'applyColors' function and pass the colors to it. 
   *  If it couldn't succeed in the try block it will then catch the error and print it out to the
   *  console. 
   */
  //-------------------------------------------------------------------------------------------
  async function fetchAndStoreColors() {
    try {
      const response = await fetch('/get-colors');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const colors = await response.json();
      localStorage.setItem('colors', JSON.stringify(colors));
      applyColors(colors);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  }
  //-------------------------------------------------------------------------------------------

  // ------------------------------- Shift Themes Functionality -------------------------------
  /**
   *  This the functionality to switch between different style themes for the website. It creates
   *  variables for the stylesheet 'link' elements found in the html pages, and the button that 
   *  will be used for cycling themes. IF the conuter == 0 then it will set the themes to 'styles1'
   *  otherwise it will call cycleThemes() which will set 'currentTheme' to what the theme should
   *  be switched to. 
   */
  //-------------------------------------------------------------------------------------------
  function setStyleSheets(){
    const styleHref = document.querySelectorAll('#styleSheet');
    const shiftThemesBtn = document.getElementById('shiftThemesBtn');
    if(styleCounter == 0){
      cycleTheme();
      styleHref.forEach( style => {
        style.href = window.location.origin + styles1;
      });
    }
    if(shiftThemesBtn){
      shiftThemesBtn.addEventListener('click', () => {
        cycleTheme();
        styleHref.forEach( style => {
          style.href = window.location.origin + currentTheme;
        });
      });
    }
  }
  //-------------------------------------------------------------------------------------------

  // --------------------------------- Get Cached Color Theme ---------------------------------
  /**
   * The function below will get the stored colors in the local storage. From there it will check
   * to make sure that the colors object is not null, if not null it will then return the colors
   * as a parsed JSON object. If the colors are null it will console log the error statement and 
   * return null. 
   */
  //-------------------------------------------------------------------------------------------
  function getStoredColors() {
    const storedColors = localStorage.getItem('colors');
    if (storedColors) {
      try {
        return JSON.parse(storedColors);
      } catch (e) {
        console.error('Error parsing stored colors:', e);
        return null;
      }
    }
    return null;
  }
  //-------------------------------------------------------------------------------------------

  // ------------------------- Function for Initializing Site Theme ---------------------------
  /**
   *  This function calls 'getStoredColors' and sets them to the variable 'colors'. If colors is 
   *  not null it will then call 'applyColors' and pass the colors to that function. If 'colors' 
   *  is null it will then run 'fetchAndStoreColors' in order to generate a new color theme. 
   */
  //-------------------------------------------------------------------------------------------
  function initializeColors() {
    const colors = getStoredColors();
    if (colors) {
      applyColors(colors);
    } else {
      fetchAndStoreColors();
    }
  }
  //-------------------------------------------------------------------------------------------

  // --------------------------- Initialize Colors When Site Loads ----------------------------
  /**
   *  Below is a statement that calls the function "initializeColors" which sets the colors on
   *  the page when the site is loaded for the first time. 
   */
  //-------------------------------------------------------------------------------------------
  initializeColors();
  //-------------------------------------------------------------------------------------------

  // ----------------------- Statement to dynamically load saved themes -----------------------
  /**
   *  The code here constantly checks if the page that is laoded is 'dashboard.html' and if so 
   *  it will then the function 'fetchSavedThemes' which will then show the user their saved 
   *  themes or it will display a message letting the user know they have no saved themes. 
   */
  //-------------------------------------------------------------------------------------------
  if (window.location.pathname.endsWith('dashboard.html')) {
    fetchSavedThemes();
  }
  //-------------------------------------------------------------------------------------------

  //------------------------------------ Filter Themes ----------------------------------------
  /**
   *  This is the code to filters the user's saved themes. It creates all the objects tied to 
   *  thier associated elements in the form. It will first check if the filters button is valid
   *  before making a event listener for when it is clicked. If clicked it will then show the 
   *  form which contains a title (Filters) and three buttons. the first button will be used to
   *  set the theme, for now it just console logs that it works. The second button will be used 
   *  to reset the filters, lastly the third button is used to close the form. 
   * 
   *  -- This will need more work, need to style this better but that won't be done until we 
   *     know what fields will be in the filters (color, liked, etc). There will also need to 
   *     be handling of apply, since we already have all the user's themes via "getThemes" we 
   *     can take that, then apply the fitlers to the values given back by that function. 
   */
  //-------------------------------------------------------------------------------------------
  const resetFiltersBtn = document.getElementById('removeFilter');
  const filterThemeModal = document.getElementById('filterThemeModal');
  const filterBtn = document.getElementById('filterThemeBtn');
  const applyFiltersBtn = document.getElementById('applyFilters');
  const closeFiltersBtn = document.getElementById("cancelFilter");
  if(filterBtn){
    filterBtn.addEventListener('click', () => {
      console.log("WORkS"); 
      if(filterThemeModal){
        filterThemeModal.style.display = 'block';
        if(applyFiltersBtn){
          applyFiltersBtn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Applied works");
          });
        }
        if(resetFiltersBtn){
          resetFiltersBtn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Reset Works");
          });
        }
        if(closeFiltersBtn){
          closeFiltersBtn.addEventListener('click', (event) => {
            event.preventDefault();
            filterThemeModal.style.display = 'none';
            console.log("Well you'll know if this works");
          });
        }
      }
    });
  }
  //-------------------------------------------------------------------------------------------

  // ----------------------------- Function to Save Current Theme -----------------------------
  /**
   *  The code below connects a variable to a button that is used to save the current theme. 
   *  It sets a function for when the button is clicked and once clicked it will sent a 'POST' 
   *  request to the server to save the theme. Once it saved the theme it calls 'fecthSavedThemes'
   *  which then displays the new updated themes for that user. 
   */
  //-------------------------------------------------------------------------------------------
  const saveThemeBtn = document.getElementById('saveThemeBtn');
  const themeModal = document.getElementById('themeModal');
  const themeForm = document.getElementById('themeForm');
  if (saveThemeBtn) {
    saveThemeBtn.addEventListener('click', () => {
      themeModal.style.display = 'block';
    });
  }
  if(themeForm){
    themeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const themeName = document.getElementById('themeName').value;
      const description = document.getElementById('themeDescription').value;
      const colors = getStoredColors();
      const liked = false;
      if (!colors) {
        alert('No colors available to save.');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = 'login.html';
        return;
      }
      if (!themeName) {
        const date = Date.now();
        themeName = `Default ${date}`;
      }
      if(!description){
        description = "add a description";
      }
      try {
        const response = await fetch('/save-color', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: themeName, description, colors, liked }), 
        });
        console.log(JSON.stringify({ name: themeName, description, colors, liked }));
        const result = await response.json();
        if (response.status === 201) {
          console.log(result.message);
          fetchSavedThemes();
          themeModal.style.display = 'none';
          themeForm.reset();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    });
  }
  //-------------------------------------------------------------------------------------------

  // ----------------------- Function to Fetch and Display Saved Themes -----------------------
  /**
   *  This function fetches the saved themes for the user. It first checks if the token the user
   *  has is valid, if not sending them back to the login page. If it passes that check it will 
   *  then make a request to the serer for the saved themes for that user. Once the response has
   *  come back it will then clear the div that the content will be added to. Then it will create a 
   *  card for each saved theme. From there it will add them to the main div that will hold the
   *  cards for the user to see. In this there is also functions to like a theme, with this it will
   *  make a put request that will be sent to the server and it will set the boolean value in the
   *  object to 'true', and set the text content to the 'likeTheme' button to a filled in heart
   *  rather than a transparent one. 
   */
  //-------------------------------------------------------------------------------------------
  async function fetchSavedThemes() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const response = await fetch('/get-saved-colors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.status === 200) {
        const savedThemesDiv = document.getElementById('savedThemes');
        savedThemesDiv.innerHTML = '';

        if (result.savedColors.length === 0) {
          savedThemesDiv.textContent = 'No saved color schemes yet.';
          return;
        }
        console.log(result.savedColors);
        result.savedColors.forEach((theme, index) => {
          const themeDiv = document.createElement('div');
          themeDiv.className = 'theme';
          themeDiv.id = theme.name;
          const name = theme.name;
          const themePageButton = document.createElement('button');
          if(themePageButton){
            themePageButton.className = 'themePageBtn';
            themePageButton.addEventListener('click', async () => {
              const themeData = await getThemeData(name, token);
              if (themeData) {
              sessionStorage.setItem('themeData', JSON.stringify(themeData));
              window.location.href = '/theme.html';
          }
            })
          }
          const colorBox = document.createElement('div');
          colorBox.className = 'color-box';
          colorBox.style.backgroundColor = theme.color3;
          colorBox.style.border = `10px solid ${theme.color1}`;
          colorBox.style.padding = '20px';
          const titleH3 = document.createElement('h3');
          titleH3.textContent = theme.name;
          if(theme.name.length >= 15){
            titleH3.style.fontSize = '0.9rem';
          }
          titleH3.style.color = theme.color2;
          titleH3.style.textAlign = 'center';
          colorBox.appendChild(titleH3);
          const setTheme = document.createElement('button');
          setTheme.textContent = "↑";
          setTheme.className = "setThemeBtn";
          setTheme.style.backgroundColor = "rgb(160, 237, 111)";
          setTheme.style.borderRadius = '3px';
          setTheme.addEventListener('click', () => {
            const themeColors = {
              color1: theme.color1,
              color2: theme.color2,
              color3: theme.color3,
            };
            localStorage.setItem('colors', JSON.stringify(themeColors));
            applyColors(themeColors);
          });
          const likeTheme = document.createElement('button');
          var isliked = theme.liked; 
          if(isliked == true){
            likeTheme.textContent = '♥';
          }
          else{
            likeTheme.textContent = "♡";
          }
          likeTheme.className = "likeThemeBtn";
          likeTheme.style.borderRadius = '3px';
          likeTheme.style.backgroundColor = "rgb(245, 245, 240)";
          likeTheme.addEventListener('click', async () => {
            if(isliked == true){
              const token = localStorage.getItem('token');
              likeTheme.textContent = "♡";
              updateLikeStatus(theme.name, token, false);
              isliked = false;
            }
            else {
              likeTheme.textContent = '♥'; 
              updateLikeStatus(theme.name, token, true);
              isliked = true;
            }
          });
          const deleteTheme = document.createElement('button');
          deleteTheme.textContent = "✕";
          deleteTheme.className = "deleteThemeBtn";
          deleteTheme.style.backgroundColor = "rgb(240, 101, 119)";
          deleteTheme.style.borderRadius = '3px';
          deleteTheme.addEventListener('click', async () => {
            console.log(theme);
            try {
              const response = await fetch(`/delete-theme/${encodeURIComponent(theme.name)}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (response.ok) {
                const result = await response.json();
                console.log(result);
                themeDiv.remove();
              } else {
                const result = await response.json();
                alert(`Error: ${result.message}`);
              }
            } catch (error) {
              console.error('Error deleting theme:', error);
              alert('Error deleting theme');
            }
          });
          themeDiv.appendChild(themePageButton);
          if(themePageButton){
            themePageButton.appendChild(colorBox);
          } else {
            themeDiv.appendChild(colorBox);
          }
          themeDiv.appendChild(setTheme);
          themeDiv.appendChild(likeTheme);
          themeDiv.appendChild(deleteTheme);
          savedThemesDiv.appendChild(themeDiv);
        });
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error fetching saved themes:', error);
    }
  }
  //-------------------------------------------------------------------------------------------

  //----------------------------- Function for Getting Theme Data -----------------------------
  /**
   *  Below is code to get the data for the theme that is passed to the function and then it
   *  sets the characteristics for the theme page. It first processes a 'GET' request that gets
   *  the data for the theme that corresponds to the that is passed to it. 
   */
  //-------------------------------------------------------------------------------------------
  async function getThemeData(name, token) {
    try {
      const response = await fetch(`/get-theme/${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        console.error(`Error fetching theme data: ${error.message}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Fetch error: ${error.message}`);
      return null;
    }
  }
  //-------------------------------------------------------------------------------------------

  //--------------------------------------- Theme Page ----------------------------------------
  /**
   *  Below is the code used for the theme page for a given theme. If will run if the window
   *  location ends with '/theme.html'. It will create objects for each element on the page 
   *  that it will alter, from here it will then change the title to the one passed back from
   *  'getThemeData()', it will also set the 'isLiked' boolean button, and time that the theme
   *  that the theme was saved. There are three boxes that are used to display the theme colors 
   *  and it will set these boxes to those colors. The last things it will do is set the link 
   *  href and show the link, and set the description for the theme. The user can click on the 
   *  edit link button and change the url for that theme. They can also change the description 
   *  by clicking on the description box, saving it by clicking away. 
   */
  //-------------------------------------------------------------------------------------------
  if(window.location.href == window.location.origin + '/theme.html'){
    const themePgTitle = document.getElementById('themeTitle');
    const isLiked = document.getElementById('isLiked');
    const downloadBtn = document.getElementById('downloadPDF');
    const savetime = document.getElementById('timestamp');
    const themePgColor1 = document.getElementById('color1Box');
    const themePgColor2 = document.getElementById('color2Box');
    const themePgColor3 = document.getElementById('color3Box');
    const descriptionBtn = document.getElementById('editDescription');
    const themePgDescription = document.getElementById('themeDescription');
    if(themePgTitle){
      themePgTitle.textContent = themeData.name;
    }
    var themeLiked;
    var token = localStorage.getItem('token');
    var isliked = themeData.liked; 
    if(isliked == true){
        isLiked.textContent = '♥';
        themeLiked = true;
    }
    else{
        isLiked.textContent = "♡";
        themeLiked = false;
    }
    isLiked.addEventListener('click', async () => {
      if(themeLiked == true){
        const token = localStorage.getItem('token');
        isLiked.textContent = "♡";
        updateLikeStatus(themeData.name, token, false);
        themeLiked = false;
      }
      else {
        isLiked.textContent = '♥'; 
        updateLikeStatus(themeData.name, token, true);
        themeLiked = true;
      }
    });
    if (savetime) {
      const date = new Date(themeData.timestamp);
      const options = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      };
      savetime.textContent = date.toLocaleString('en-US', options);
    }
    if(downloadBtn){
      downloadBtn.addEventListener('click', () => {
        downloadPDF(themeData); 
      });
    }
    if(themePgColor1){
      themePgColor1.style.backgroundColor = themeData.color1;
      themePgColor1.textContent = themeData.color1;
      themePgColor1.style.color = 'transparent';
      themePgColor1.addEventListener('mouseenter', () => {
        themePgColor1.style.color = themeData.color3;
      });
      
      themePgColor1.addEventListener('mouseleave', () => {
        themePgColor1.style.color = 'transparent';
      });
    }
    if(themePgColor2){
      themePgColor2.style.backgroundColor = themeData.color2;
      themePgColor2.textContent = themeData.color2;
      themePgColor2.style.color = 'transparent';
      themePgColor2.addEventListener('mouseenter', () => {
        themePgColor2.style.color = themeData.color1;
      });
      
      themePgColor2.addEventListener('mouseleave', () => {
        themePgColor2.style.color = 'transparent';
      });
    }
    if(themePgColor3){
      themePgColor3.style.backgroundColor = themeData.color3;
      themePgColor3.textContent = themeData.color3;
      themePgColor3.style.color = 'transparent';
      themePgColor3.addEventListener('mouseenter', () => {
        themePgColor3.style.color = themeData.color2;
      });
      themePgColor3.addEventListener('mouseleave', () => {
        themePgColor3.style.color = 'transparent';
      });
    }
    if(descriptionBtn){
      descriptionBtn.style.backgroundColor = colors.color2;
    }
    if(themePgDescription){
      themePgDescription.textContent = themeData.description;
    }
  }
  //-------------------------------------------------------------------------------------------

  //-------------------------------- Code to Edit Description ---------------------------------
  /**
   *  Below is code used to edit the description of a theme. It creates an instane of the button
   *  for editting, then creates a click event listener. From here it will remove the description
   *  and shows an input field containing the old description (if user has to change something). 
   *  Then once the user has clicked away it will close the input field. It will then pass the
   *  data back to the server where it will set the description of the specified theme, if this 
   *  returns back success it will return the description box with the new description, else
   *  it will be the old description. 
   */
  //-------------------------------------------------------------------------------------------
  const editDescriptionBtn = document.getElementById('editDescription');
  if (editDescriptionBtn) {
    editDescriptionBtn.addEventListener('click', () => {
      const descriptionValue = document.getElementById('themeDescription');
      const descriptionInput = document.getElementById('descriptionInput');
      if (descriptionValue && descriptionInput) {
        const oldDescription = descriptionValue.textContent;
        descriptionValue.style.display = 'none';
        
        descriptionInput.style.display = 'block';
        descriptionInput.value = oldDescription;
        descriptionInput.focus();
        
        descriptionInput.addEventListener('blur', () => {
          const token = localStorage.getItem('token');
          const description = descriptionInput.value;
          if(updateDescription(themeData.name, token, description)){
            descriptionValue.textContent = description;
          } else{
            descriptionValue.textContent = oldDescription;
          }
          descriptionInput.style.display = 'none';
          descriptionValue.style.display = 'block';
        }, { once: true }); 
      }
    });
  }
  //-------------------------------------------------------------------------------------------



  function downloadPDF(data){
    console.log(`This will later download the data about the theme named '${data.name}'`);
  }



  // ------------------------ Function Helper for Cycling StyleSheets -------------------------
  /**
   *  This is a helper function used in setStyleSheet(). It takes a look at the counter value
   *  and will fit into one of the four conditions which will decide what stylesheet to link to
   *  the currentTheme variable. The last 'else' statement is used for initialization, will set
   *  the theme to the first theme. 
   */
  //-------------------------------------------------------------------------------------------
  function cycleTheme(){
    if(styleCounter == 1){
      currentTheme = styles2;
      styleCounter++;
    } else if(styleCounter == 2){
      currentTheme = styles3;
      styleCounter++;
    } else if(styleCounter == 3){
      currentTheme = styles1;
      styleCounter = 1;
    } else {
      console.log("counter init increment");
      styleCounter++;
    }
  }
  //-------------------------------------------------------------------------------------------

  //--------------------------------- Like Theme ----------------------------------------------
  /**
   *  This function is used to like a theme. It takes in the request parameters such as the 
   *  theme name, user token, and like status to set it to. From there it makes a request to
   *  the back end server that will either set the value in 'users.json' or send back error. 
   */
  //-------------------------------------------------------------------------------------------
  async function updateLikeStatus(themeName, token, liked) {
    try {
      const response = await fetch(`/like-theme/${encodeURIComponent(themeName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ liked }), 
      });
      const result = await response.json();
      if (response.status === 200) {
        console.log(`Theme ${themeName} ${liked ? 'liked' : 'disliked'} successfully!`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error liking theme:', error);
    }
  }
//-------------------------------------------------------------------------------------------

async function updateDescription(themeName, token, description){
  try{
    const response = await fetch(`/update-description/${encodeURIComponent(themeName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ description })
    });
    const result = await response.json();
    if(response.status === 200){
      console.log(`Theme ${themeName} description updates successfully`);
      return true;
    } else{
      console.log(`Theme ${themeName }`)
      return false;
    }
  } catch (error){
    console.error("Error updating Description:", error);
    return false;
  }
}

});
//*****************************************************************************************************************/

// -------------------------------- Functions for Navigation --------------------------------
/**
 *  The functions below are used for navigation on the site. There is methods for moving to
 *  the main page, dashbaord, login, signup, and about page
 */
//-------------------------------------------------------------------------------------------
function currentUrlCheck(page){
  const url = window.location.href;
  const target = window.location.origin + page;
  return url == target;
}
function redirectHome(){
  if(!currentUrlCheck('/index.html')){
    window.location.href = '/index.html';
  }
  checkUserStatus();
}
function redirectLogout(){
  localStorage.removeItem('token');
  redirectHome(); 
  checkUserStatus();
}
function redirectSignUp(){
  if(!currentUrlCheck('/signup.html')){
    window.location.href = "/signup.html";
    checkUserStatus();
  }
}
function redirectAbout(){
  if(!currentUrlCheck('/about.html')){
    window.location.href = "/about.html";
    checkUserStatus();
  }
}
function redirectLogin(){
  if(!currentUrlCheck('/login.html')){
    window.location.href = "/login.html";
    checkUserStatus();
  }
}
function redirectDashboard(){
  if(isAuthenticated()){
    if(!currentUrlCheck('/dashboard.html')){
      window.location.href = "/dashboard.html";
      checkUserStatus();
      fetchSavedThemes();
    }
  }
  else{
    window.location.href ="/login.html";
    checkUserStatus();
  }
}
//-------------------------------------------------------------------------------------------

// ---------------------- Functions for Controlling Nav Button Display ----------------------
/**
 *  The functions below are used to control what buttons in the nav bar are seen by the user 
 *  at a given moment. if the user has a valid token that it will just show them the 'logout' 
 *  button. If the user doesn't have a valid token it will show them a button to login and a
 *  button for signing up. 
 */
//-------------------------------------------------------------------------------------------
function isAuthenticated(){
  const token = localStorage.getItem('token');
  return !!token;
}
function checkUserStatus() {
  const isLoggedIn = isAuthenticated();
  const loginLi = document.getElementById('login').parentElement;
  const signupLi = document.getElementById('signup').parentElement;
  const logoutLi = document.getElementById('logout').parentElement;

  if (isLoggedIn) {
    loginLi.style.display = 'none';
    signupLi.style.display = 'none';
    logoutLi.style.display = 'block';
  } else {
    logoutLi.style.display = 'none';
    loginLi.style.display = 'block';
    signupLi.style.display = 'block';
  }
}
window.addEventListener('load', checkUserStatus);
//-------------------------------------------------------------------------------------------

//--------------------------- Function for Closing Save Theme Form --------------------------
/**
 *  This function is used to close the 'save theme' form. It creates an instance of that div
 *  and then ensures that it exists and is so it will set the display to 'none' so that it 
 *  disappears. 
 */
//-------------------------------------------------------------------------------------------
function closeForm(){
  const saveThemeForm = document.getElementById('themeModal');
  if(saveThemeForm){
    saveThemeForm.style.display = 'none';
  }
}
//-------------------------------------------------------------------------------------------





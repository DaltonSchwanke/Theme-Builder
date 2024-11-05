const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const saltRounds = 10;
const JWT_SECRET = 'my_secret';



//-------------------------------- Navigation for Backend -----------------------------------
/**
 *  This serves as the backend navigation for the website and routes the incoming requests to 
 *  the correct function that it is looking for. There is paths to sign up, login, get colors,
 *  save colors, get the saved colors, delete a theme, and like a theme. 
 */
//-------------------------------------------------------------------------------------------
const requestListener = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  if (pathname === '/signup' && req.method === 'POST') {
    handleSignup(req, res);
  } else if (pathname === '/login' && req.method === 'POST') {
    handleLogin(req, res);
  } else if (pathname === '/get-colors' && req.method === 'GET') {
    handleGetColors(req, res);
  } else if (pathname === '/save-color' && req.method === 'POST') {
    handleSaveColor(req, res);
  } else if (pathname === '/get-saved-colors' && req.method === 'GET') {
    handleGetSavedColors(req, res);
  } else if (pathname.startsWith('/delete-theme') && req.method === 'DELETE'){
    handleDeleteSavedColors(req, res);
  } else if (pathname.startsWith('/like-theme') && req.method === 'PUT') {
    handleLikeTheme(req, res);
  } else if (pathname.startsWith('/update-description') && req.method === 'PUT'){
    handleUpdateDescription(req, res);
  } else if (pathname.startsWith('/update-link') && req.method === 'PUT'){
    handleUpdateLink(req, res);
  }else if (pathname.startsWith('/get-theme') && req.method === 'GET'){
    handleThemeData(req, res);
  } else {
    let filePath = path.join(__dirname, '../public', pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);
    if (!ext) {
      filePath += '.html';
    }
    const normalizedPath = path.normalize(filePath);
    const publicPath = path.join(__dirname, '../public');
    if (!normalizedPath.startsWith(publicPath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    const contentType = getContentType(path.extname(normalizedPath));
    fs.readFile(normalizedPath, (err, content) => {
      if (err) {
        fs.readFile(path.join(__dirname, '../public', '404.html'), (err404, content404) => {
          if (err404) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found', 'utf-8');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content404, 'utf-8');
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
};
//-------------------------------------------------------------------------------------------

//---------------------------- Code to start server listening -------------------------------
/**
 *  The code below serves as the listener for the backend. It sets the port to '3000' and then
 *  if console.logs that the port is not active. 
 */
//-------------------------------------------------------------------------------------------
const PORT = 4000;
const server = http.createServer(requestListener);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//-------------------------------------------------------------------------------------------

//--------------------------------------- Get Content Type ----------------------------------
/**
 *  This code is used in the navigation code. It will take a look at the file path to decipher
 *  what type of content is being passed back and it will only allow the types below. 
 */
//-------------------------------------------------------------------------------------------
function getContentType(ext) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
//-------------------------------------------------------------------------------------------

//--------------------------------------- Sign Up -------------------------------------------
/**
 *  The function below is used to handle user sign ups. It first takes in the request data and 
 *  then it convert it to a string. From there it will hash the password using Bcrypt and 10 
 *  rounds of salt. Following that it will then check to see if the user already exists, if
 *  not it will psuh in a new object into 'user.json' creating a new account before sending 
 *  back success (200). 
 */
//-------------------------------------------------------------------------------------------
function handleSignup(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const user = JSON.parse(body);
    console.log(user);
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error hashing password' }));
      } else {
        fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
          let users = [];
          if (!err && data) users = JSON.parse(data);
          const existingUser = users.find(u => u.username === user.username);
          if (existingUser) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User already exists' }));
          } else {
            users.push({ 
              username: user.username,
              password: hash, 
              firstName: user.firstName, 
              lastName: user.lastName, 
              email: user.email,
              phone: user.phone, 
              savedColors: [] });
            fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
              } else {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User created' }));
              }
            });
          }
        });
      }
    });
  });
}
//-------------------------------------------------------------------------------------------

//------------------------------------------ Login ------------------------------------------
/**
 *  This function takes in the request data (username, passord) and will then parse the data 
 *  before quering for that tuple in 'users.json'. If there is a match that comes back it will
 *  then sign a token for that account and the secret token value and sets the experiation for
 *  it to a hour long. Lastly it will send back the success allowing the person into the
 *  account. 
 */
//-------------------------------------------------------------------------------------------
function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const credentials = JSON.parse(body);
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
      } else {
        const users = JSON.parse(data);
        const user = users.find(u => u.username === credentials.username);
        if (user) {
          bcrypt.compare(credentials.password, user.password, (err, result) => {
            if (result) {
              const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '3h' });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Login successful', token }));
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Invalid credentials' }));
            }
          });
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
      }
    });
  });
}
//-------------------------------------------------------------------------------------------

//----------------------------------- Get Colors (API) --------------------------------------
/**
 *  This function will get new colors and is used in the front end under 'generate new theme'
 *  It will first create the post data object that will send back the new colors to the front
 *  end when completed. After that it will create a 'POST' request to send to the api to get 
 *  new colors. If it comes back successful it will parse the colors and take the first three
 *  colors it gets back. From there convert them to hex from rgb before setting them in a new 
 *  object. Lastly it will stringify the data before sending it back to the front end. 
 */
//-------------------------------------------------------------------------------------------
function handleGetColors(req, res) {
  const postData = JSON.stringify({ model: "default" });

  const options = {
    hostname: 'colormind.io',
    port: 80, // Change to 443 for HTTPS
    path: '/api/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const protocol = options.port === 443 ? https : http;
  const apiReq = protocol.request(options, apiRes => {
    let data = '';
    apiRes.on('data', chunk => {
      data += chunk;
    });
    apiRes.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        const palette = parsedData.result;
        const selectedColors = palette.slice(0, 3).map(rgb => rgbToHex(rgb));
        const colors = {
          color1: selectedColors[0],
          color2: selectedColors[1],
          color3: selectedColors[2],
        };
        console.log(colors);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(colors));
      } catch (error) {
        console.error('Error parsing Colormind response:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Failed to parse colors' }));
      }
    });
  });
  apiReq.on('error', error => {
    console.error('Error fetching colors from Colormind:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Failed to fetch colors' }));
  });
  apiReq.write(postData);
  apiReq.end();
}
//-------------------------------------------------------------------------------------------

//------------------------- Function to convert rgb to hex ----------------------------------
/**
 *  This function below takes in an rgb value and then converts it to hex before returning it.
 *  The function is used in handleGetColors().
 */
//-------------------------------------------------------------------------------------------
function rgbToHex(rgb) {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
//-------------------------------------------------------------------------------------------

//------------------------------------ Check Token ------------------------------------------
/**
 *  The function below is used to authenticate a user token. Once the token is sent from the
 *  function call, it will then send it through the verify function. If it is authenticated it 
 *  will return the user or null. 
 */
//-------------------------------------------------------------------------------------------
function authenticateToken(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Access token missing' }));
    return null;
  }
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid or expired token' }));
    return null;
  }
}
//-------------------------------------------------------------------------------------------

//---------------------------------------- Save Color ---------------------------------------
/**
 *  This will first check to see if the user is valid and logged in using the function 
 *  'authenticateToken()' if it comes back null it will return. Otherwise it will check to see 
 *  if it contains the right type of data. From here it will check to make sure that the 'liked'
 *  data field is a boolean. If it all matches what it expects then it will create a new color
 *  object before pushing it into 'users.json' under the specified user object. 
 */
//-------------------------------------------------------------------------------------------
function handleSaveColor(req, res) {
  const user = authenticateToken(req, res);
  if (!user) return;
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let colorScheme;
    try {
      colorScheme = JSON.parse(body);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      return;
    }
    if (
      !colorScheme.colors || 
      typeof colorScheme.colors !== 'object' || 
      !colorScheme.colors.color1 || 
      !colorScheme.colors.color2 || 
      !colorScheme.colors.color3
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid color scheme data' }));
      return;
    }
    if (typeof colorScheme.liked !== 'boolean') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "'liked' field must be a boolean" }));
      return;
    }
    const link = "Have a website that uses this link? Add it here";
    const themeDescription = colorScheme.description;
    const themeName = colorScheme.name || `default ${Date.now()}`;
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
        return;
      }
      let users = JSON.parse(data);
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      if (!users[userIndex].savedColors) {
        users[userIndex].savedColors = [];
      }
      const colorSchemeToSave = {
        ...colorScheme.colors,
        name: themeName,
        description: themeDescription,
        liked: colorScheme.liked,
        timestamp: new Date().toISOString(),
        url: link
      };
      users[userIndex].savedColors.push(colorSchemeToSave);
      fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Failed to save color scheme' }));
        } else {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Color scheme saved successfully' }));
        }
      });
    });
  });
}
//-------------------------------------------------------------------------------------------



//---------------------------------- Get Saved Colors ---------------------------------------
/**
 *  The function below is used to get the saved colors for the user. It firstly authenticate 
 *  the token that is given in the requrst. If the user is authenticated it will then query 
 *  that user in 'user.json' and then if the user is found then it will then send back either
 *  the user's saved themes or an empty object. 
 */
//-------------------------------------------------------------------------------------------
function handleGetSavedColors(req, res) {
  const user = authenticateToken(req, res);
  if (!user) return;
  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    } else {
      const users = JSON.parse(data);
      const foundUser = users.find(u => u.username === user.username);
      if (!foundUser) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      const savedColors = foundUser.savedColors || [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ savedColors }));
    }
  });
}
//-------------------------------------------------------------------------------------------



//------------------------------------- Delete Theme ----------------------------------------
/**
 *  This fucntion deletes the theme that is associated with the theme name that is passed
 *  as a parameter. It first checks if the user is authenticated before taking the themeName
 *  and decoding it. It then gets the user's index in 'users.json' and then deleted the theme
 *  that has the name that matches the one passed in.  
 */
//-------------------------------------------------------------------------------------------
function handleDeleteSavedColors(req, res) {
  const user = authenticateToken(req, res);
  if(!user) return;

  const themeName = decodeURIComponent(req.url.split('/').pop());  // Extract and decode the theme name from the URL

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
      return;
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
      return;
    }

    const userIndex = users.findIndex(u => u.username === user.username);
    if (userIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
      return;
    }

    const savedColors = users[userIndex].savedColors;
    if (!savedColors) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
      return;
    }

    // Find the index of the theme to delete by its name
    const themeIndex = savedColors.findIndex(theme => theme.name === themeName);
    if (themeIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
      return;
    }

    // Remove the theme
    savedColors.splice(themeIndex, 1);

    fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Theme deleted successfully' }));
      }
    });
  });
}
//-------------------------------------------------------------------------------------------

//---------------------------------------- Like Theme ---------------------------------------
/**
 *  The function below is the function to like a theme. And lemme tell ya I am so happy this 
 *  feature exists in this site, without it I think I would've just created a mess of non 
 *  sense and theme oblivion worth less than the amount of piss I producted since the time I 
 *  started this comment. However, here is how it works. It first checks if the user is 
 *  authenticated, if so continue. It then pops the top off the url and takes the themeName.
 *  It then checks if the like variable is boolean, if the user is valid or not, and then 
 *  then sets the theme's like field to true, or false whichever value is passed. If that 
 *  didn't work then it would write back error to the front end, or success.  
 */
//-------------------------------------------------------------------------------------------
function handleLikeTheme(req, res) {
  const user = authenticateToken(req, res);
  if (!user) return;
  const themeName = decodeURIComponent(req.url.split('/').pop()); 
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let requestBody;
    try {
      requestBody = JSON.parse(body);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      return;
    }
    if (typeof requestBody.liked !== 'boolean') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "'liked' field must be a boolean" }));
      return;
    }
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
        return;
      }
      let users = JSON.parse(data);
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      const themeIndex = users[userIndex].savedColors.findIndex(theme => theme.name === themeName);
      if (themeIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Theme not found' }));
        return;
      }
      users[userIndex].savedColors[themeIndex].liked = requestBody.liked;
      fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Failed to update theme' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Theme updated successfully' }));
        }
      });
    });
  });
}
//-------------------------------------------------------------------------------------------

//--------------------------------- Update Theme Description --------------------------------
//-------------------------------------------------------------------------------------------
function handleUpdateDescription(req, res){
  const user = authenticateToken(req, res);
  if(!user) return;
  const themeName = decodeURIComponent(req.url.split('/').pop());
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let requestBody;
    try {
      requestBody = JSON.parse(body);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      return;
    }
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
        return;
      }
      let users;
      try {
        users = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing JSON data:", error.message , ' Data: ', data);
        users = [];
      }
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      const themeIndex = users[userIndex].savedColors.findIndex(theme => theme.name === themeName);
      if (themeIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Theme not found' }));
        return;
      }
      users[userIndex].savedColors[themeIndex].description = requestBody.description;
      fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Failed to update theme description' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Theme description updated successfully' }));
        }
      });
    });
  });
}
//-------------------------------------------------------------------------------------------

//------------------------------------- Update URL Link -------------------------------------
/**
 *  This is the function for handling updating the user's theme link. 
 */
//-------------------------------------------------------------------------------------------
function handleUpdateLink(req, res){
  const user = authenticateToken(req, res);
  if(!user) return;
  const themeName = decodeURIComponent(req.url.split('/').pop());
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let requestBody;
    try {
      requestBody = JSON.parse(body);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      return;
    }
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
        return;
      }
      let users;
      try {
        users = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing JSON data:", error.message , ' Data: ', data);
        users = [];
      }
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      const themeIndex = users[userIndex].savedColors.findIndex(theme => theme.name === themeName);
      if (themeIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Theme not found' }));
        return;
      }
      users[userIndex].savedColors[themeIndex].url = requestBody.link;
      fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Failed to update theme link' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Theme link updated successfully' }));
        }
      });
    });
  });
}
//-------------------------------------------------------------------------------------------


//------------------------------------- Get Theme Data --------------------------------------
/**
 *  Below is the function to handle getting theme data. It will take in the theme name, and
 *  the user's token. It will check if they are valid, if so then it will parse the data and 
 *  then find the user's account information. From there it will look for the theme that
 *  matches the given one. If there is a match it will then send back that theme's data. 
 */
//-------------------------------------------------------------------------------------------
function handleThemeData(req, res) {
  const user = authenticateToken(req, res);
  if (!user) return; 
  const themeName = decodeURIComponent(req.url.split('/').pop());
  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
    let users;
    try {
      users = JSON.parse(data);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Error parsing users.json' }));
    }
    const userIndex = users.findIndex(u => u.username === user.username);
    if (userIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'User not found' }));
    }
    const theme = users[userIndex].savedColors.find(theme => theme.name === themeName);
    if (!theme) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Theme not found' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(theme));
  });
}
//-------------------------------------------------------------------------------------------

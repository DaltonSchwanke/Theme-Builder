# Theme-Builder.
Theme-Builder is a proof of concept for a larger project that is built using vanilla javascript and Node.js. It is used to create fun and unique color themes for websites. It allows users to sign up or login and from there they can access a dashboard page that will allow them to generate new themes from an API call to colormind.io which will send back three colors that are then assigned to page content. The user can then cycle the three colors to swap the positions of the colors (primary, secondary, and tertiary). User's can also save themes and give them names. Once saved it will display a new card on the page showing the saved theme. If a user clicks on a card it will take them to a theme specific page that shows more theme data such as date saved, description, and hex values. User's can also like themes which in theory would be used to filter the saved themes. There is also more card functionality, there is a button to like/dislike, set theme that will set the page to have that color theme, and delete which will remove the color theme. There are two other navigatable pages, home and about. Both contain dummy data for now that serves as placeholders. 

To Run Projects:
1. Clone the repository

2. In command prompt or terminal navigate to the folder 'server'

3. Run "node index.js"
